from datetime import date

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import SAFE_METHODS, AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from .consultas import alertas_de_validade, ordem_de_utilizacao, proximos_do_vencimento, relatorio_desperdicio
from .escopo import filtrar_por_restaurante
from .models import Alimento, Desperdicio, Estoque, Restaurante, Usuario
from .serializers import (
    AlimentoSerializer,
    DesperdicioSerializer,
    EstoqueSerializer,
    RestauranteSerializer,
    UsuarioSerializer,
)

AGRUPAMENTOS_RELATORIO = ('motivo', 'alimento', 'categoria', 'dia')


class ExigeVinculo(BasePermission):
    """Usuário comum só usa a API se já estiver ligado a um restaurante.

    Superusuário passa mesmo sem empresa: é assim que o createsuperuser existe.
    """

    message = 'Sua conta precisa estar vinculada a um restaurante.'

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.restaurante_id is not None


class GestaoEscreve(BasePermission):
    """Consulta é de quem está no restaurante. Gravar cadastro é de proprietário ou gerente."""

    message = 'Somente proprietário ou gerente pode alterar este recurso.'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.perfil in (Usuario.Perfil.PROPRIETARIO, Usuario.Perfil.GERENTE)


class SomenteSuperusuarioEscreve(BasePermission):
    """Consultar restaurante é de quem está logado. Gravar é só do superusuário."""

    message = 'Somente superusuários podem gerenciar restaurantes.'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_superuser


class TokenRespostaSerializer(serializers.Serializer):
    token = serializers.CharField()


class ObterTokenView(ObtainAuthToken):
    """Troca usuário e senha pela chave enviada em Authorization."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        responses={200: TokenRespostaSerializer},
        auth=[],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class SaudeSerializer(serializers.Serializer):
    status = serializers.CharField()


class MotivoOpcaoSerializer(serializers.Serializer):
    valor = serializers.CharField()
    rotulo = serializers.CharField()


class AlertaValidadeSerializer(serializers.Serializer):
    situacao = serializers.CharField()
    mensagem = serializers.CharField()
    dias_restantes = serializers.IntegerField()
    estoque = serializers.IntegerField()
    alimento = serializers.CharField()
    validade = serializers.DateField()
    localizacao = serializers.CharField()
    quantidade_atual = serializers.DecimalField(max_digits=10, decimal_places=3)


class GrupoRelatorioSerializer(serializers.Serializer):
    chave = serializers.CharField()
    rotulo = serializers.CharField()
    registros = serializers.IntegerField()
    quantidade = serializers.CharField()
    percentual = serializers.CharField()


class RelatorioDesperdicioSerializer(serializers.Serializer):
    data_inicio = serializers.DateField(allow_null=True)
    data_fim = serializers.DateField(allow_null=True)
    agrupar = serializers.CharField()
    total_registros = serializers.IntegerField()
    quantidade_total = serializers.CharField()
    grupos = GrupoRelatorioSerializer(many=True)


class EncerrarSessaoView(APIView):
    """Apaga o token de quem está autenticado."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SaudeView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = SaudeSerializer

    @extend_schema(auth=[], responses={200: SaudeSerializer})
    def get(self, request):
        return Response({'status': 'ok'})


def ler_data(nome, valor):
    if not valor:
        return None
    try:
        return date.fromisoformat(valor)
    except ValueError:
        raise ValidationError({nome: 'Use a data no formato AAAA-MM-DD.'}) from None


def ler_inteiro(nome, valor):
    if valor in (None, ''):
        return None
    try:
        return int(valor)
    except (TypeError, ValueError):
        raise ValidationError({nome: 'Informe um número inteiro.'}) from None


def ler_dias(valor):
    if valor in (None, ''):
        return None
    dias = ler_inteiro('dias', valor)
    if dias < 0 or dias > 365:
        raise ValidationError({'dias': 'Informe um número de 0 a 365.'})
    return dias


class RestauranteViewSet(ModelViewSet):
    queryset = Restaurante.objects.all()
    serializer_class = RestauranteSerializer
    permission_classes = [IsAuthenticated, ExigeVinculo, SomenteSuperusuarioEscreve]

    def get_queryset(self):
        # pk = o próprio restaurante do usuário. Superusuário vê todos.
        return filtrar_por_restaurante(
            Restaurante.objects.all(), self.request.user, 'pk'
        ).order_by('nome')


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, ExigeVinculo, GestaoEscreve]

    @extend_schema(responses={200: UsuarioSerializer})
    @action(detail=False, methods=['get'])
    def me(self, request):
        return Response(self.get_serializer(request.user).data)

    def get_queryset(self):
        qs = Usuario.objects.select_related('restaurante')
        if not self.request.user.is_superuser:
            qs = qs.filter(is_superuser=False)
        return filtrar_por_restaurante(qs, self.request.user, 'restaurante').order_by('username')

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise PermissionDenied('Você não pode excluir o próprio usuário.')
        instance.delete()


class AlimentoViewSet(ModelViewSet):
    queryset = Alimento.objects.all()
    serializer_class = AlimentoSerializer
    permission_classes = [IsAuthenticated, ExigeVinculo, GestaoEscreve]

    def get_queryset(self):
        # Alimento guarda a foreign key do restaurante direto.
        qs = Alimento.objects.select_related('restaurante')
        return filtrar_por_restaurante(qs, self.request.user, 'restaurante').order_by('nome')


class EstoqueViewSet(ModelViewSet):
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer
    permission_classes = [IsAuthenticated, ExigeVinculo, GestaoEscreve]

    @extend_schema(parameters=[OpenApiParameter('dias', int, description='Substitui os dias de alerta do restaurante.')])
    @action(detail=False, methods=['get'], url_path='proximos-vencimento')
    def proximos_vencimento(self, request):
        dias = ler_dias(request.query_params.get('dias'))
        return Response(proximos_do_vencimento(request.user, date.today(), dias))

    @action(detail=False, methods=['get'], url_path='ordem-utilizacao')
    def ordem_utilizacao(self, request):
        return Response(ordem_de_utilizacao(request.user))

    def get_queryset(self):
        # Estoque não tem restaurante. O filtro sobe para alimento__restaurante.
        qs = Estoque.objects.select_related('alimento__restaurante')
        return filtrar_por_restaurante(
            qs, self.request.user, 'alimento__restaurante'
        ).order_by('-entrada', 'alimento__nome')


class DesperdicioViewSet(ModelViewSet):
    queryset = Desperdicio.objects.all()
    serializer_class = DesperdicioSerializer
    permission_classes = [IsAuthenticated, ExigeVinculo]

    @extend_schema(responses={200: MotivoOpcaoSerializer(many=True)})
    @action(detail=False, methods=['get'])
    def motivos(self, request):
        return Response([
            {'valor': valor, 'rotulo': rotulo}
            for valor, rotulo in Desperdicio.Motivo.choices
        ])

    def get_queryset(self):
        # A empresa do desperdício é a do alimento daquele estoque.
        qs = Desperdicio.objects.select_related('estoque__alimento__restaurante', 'usuario')
        qs = filtrar_por_restaurante(
            qs, self.request.user, 'estoque__alimento__restaurante'
        )
        parametros = self.request.query_params
        inicio = ler_data('data_inicio', parametros.get('data_inicio'))
        fim = ler_data('data_fim', parametros.get('data_fim'))
        if inicio is not None:
            qs = qs.filter(data__gte=inicio)
        if fim is not None:
            qs = qs.filter(data__lte=fim)
        motivo = parametros.get('motivo')
        if motivo:
            if motivo not in Desperdicio.Motivo.values:
                raise ValidationError({'motivo': 'Motivo desconhecido.'})
            qs = qs.filter(motivo=motivo)
        usuario = ler_inteiro('usuario', parametros.get('usuario'))
        if usuario is not None:
            qs = qs.filter(usuario_id=usuario)
        estoque = ler_inteiro('estoque', parametros.get('estoque'))
        if estoque is not None:
            qs = qs.filter(estoque_id=estoque)
        return qs.order_by('-data', '-pk')


class AlertaValidadeView(APIView):
    permission_classes = [IsAuthenticated, ExigeVinculo]
    serializer_class = AlertaValidadeSerializer

    @extend_schema(parameters=[OpenApiParameter('dias', int)], responses={200: AlertaValidadeSerializer(many=True)})
    def get(self, request):
        dias = ler_dias(request.query_params.get('dias'))
        return Response(alertas_de_validade(request.user, date.today(), dias))


class RelatorioDesperdicioView(APIView):
    permission_classes = [IsAuthenticated, ExigeVinculo]
    serializer_class = RelatorioDesperdicioSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter('data_inicio', str),
            OpenApiParameter('data_fim', str),
            OpenApiParameter('agrupar', str, enum=list(AGRUPAMENTOS_RELATORIO)),
        ],
        responses={200: RelatorioDesperdicioSerializer},
    )
    def get(self, request):
        agrupar = request.query_params.get('agrupar') or 'motivo'
        if agrupar not in AGRUPAMENTOS_RELATORIO:
            raise ValidationError({'agrupar': 'Use motivo, alimento, categoria ou dia.'})
        return Response(relatorio_desperdicio(
            request.user,
            ler_data('data_inicio', request.query_params.get('data_inicio')),
            ler_data('data_fim', request.query_params.get('data_fim')),
            agrupar,
        ))


class ConfiguracaoRestauranteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurante
        fields = ['id', 'nome', 'dias_alerta_validade']
        read_only_fields = ['id', 'nome']


class ConfiguracaoRestauranteView(APIView):
    permission_classes = [IsAuthenticated, ExigeVinculo, GestaoEscreve]

    def restaurante_alvo(self, request):
        if request.user.is_superuser:
            informado = request.query_params.get('restaurante')
            if informado:
                return get_object_or_404(Restaurante, pk=informado)
            if request.user.restaurante_id:
                return request.user.restaurante
            raise ValidationError({'restaurante': 'Informe o restaurante.'})
        return request.user.restaurante

    @extend_schema(responses={200: ConfiguracaoRestauranteSerializer})
    def get(self, request):
        return Response(ConfiguracaoRestauranteSerializer(self.restaurante_alvo(request)).data)

    @extend_schema(
        request=ConfiguracaoRestauranteSerializer,
        responses={200: ConfiguracaoRestauranteSerializer},
    )
    def patch(self, request):
        restaurante = self.restaurante_alvo(request)
        serializer = ConfiguracaoRestauranteSerializer(restaurante, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
