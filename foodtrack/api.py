from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS, AllowAny, BasePermission, IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .escopo import filtrar_por_restaurante
from .models import Alimento, Desperdicio, Estoque, Restaurante, Usuario
from .serializers import (
    AlimentoSerializer,
    DesperdicioSerializer,
    EstoqueSerializer,
    RestauranteSerializer,
    UsuarioSerializer,
)


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
    permission_classes = [IsAuthenticated, ExigeVinculo]

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
    permission_classes = [IsAuthenticated, ExigeVinculo]

    def get_queryset(self):
        # Alimento guarda a foreign key do restaurante direto.
        qs = Alimento.objects.select_related('restaurante')
        return filtrar_por_restaurante(qs, self.request.user, 'restaurante').order_by('nome')


class EstoqueViewSet(ModelViewSet):
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer
    permission_classes = [IsAuthenticated, ExigeVinculo]

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

    def get_queryset(self):
        # A empresa do desperdício é a do alimento daquele estoque.
        qs = Desperdicio.objects.select_related('estoque__alimento__restaurante', 'usuario')
        return filtrar_por_restaurante(
            qs, self.request.user, 'estoque__alimento__restaurante'
        ).order_by('-data', '-pk')
