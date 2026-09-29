from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Restaurante(models.Model):
    nome = models.CharField(max_length=150)
    cnpj = models.CharField(max_length=18, unique=True)

    #Definir o nome do objeto
    def __str__(self):
        return self.nome

class Usuario(AbstractUser): #Alterando o models do user nativo

    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    perfil = models.CharField(max_length=50)
    #O user nativo do django possui password com hash

    # null=True e blank=True ficam só para o createsuperuser, que não pede restaurante.
    # Usuário comum não pode gravar sem restaurante: validar_restaurante() e a constraint barram isso.
    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        related_name='usuarios',
        null=True,
        blank=True
    )

    class Meta:
        # Mantém o rótulo padrão do AbstractUser.
        verbose_name = 'user'
        verbose_name_plural = 'users'
        constraints = [
            # A mesma regra no banco, para valer também em caminhos que não chamam save()
            # (por exemplo, QuerySet.update). Restaurante nulo só é aceito se is_superuser=True.
            models.CheckConstraint(
                condition=models.Q(is_superuser=True) | models.Q(restaurante__isnull=False),
                name='usuario_restaurante_nulo_apenas_superuser',
                violation_error_message='Usuários que não são superusuários precisam estar atrelados a um restaurante.',
            ),
        ]

    def clean(self):
        # Formulários (admin e ModelForm) passam por aqui antes de gravar.
        super().clean()
        self.validar_restaurante()

    def validar_restaurante(self):
        # Superusuário pode ficar sem restaurante.
        # Qualquer outro usuário precisa da chave preenchida.
        if not self.is_superuser and self.restaurante_id is None:
            raise ValidationError({
                'restaurante': 'Usuários que não são superusuários precisam estar atrelados a um restaurante.',
            })

    def save(self, *args, **kwargs):
        # createsuperuser e Usuario.objects.create() não chamam clean().
        # A checagem aqui cobre esses caminhos antes de gravar.
        self.validar_restaurante()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
    

class Alimento(models.Model):
    nome = models.CharField(max_length=150)
    categoria = models.CharField(max_length=60)
    medida = models.CharField(max_length=50)

    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        #Cria um atalho reverso para acessar o objeto de alimentos por meio de restaurante
        related_name='alimentos'
    )

    def __str__(self):
        return self.nome

class Estoque(models.Model):
    qntd_atual = models.IntegerField()
    entrada = models.DateField()
    saida = models.DateField(null=True, blank=True)
    localizacao = models.CharField(max_length=150)

    #Chave de Alimento
    alimento = models.ForeignKey(
        Alimento,
        on_delete=models.CASCADE,
        #Cria um atalho reverso para acessar o objeto de estoque por meio de alimentos
        related_name='estoques' 
    )

    def __str__(self):
        #Nome do alimento - quantidade atual
        return f'{self.alimento.nome} - {self.qntd_atual}'

class Desperdicio(models.Model):
    descricao = models.CharField(max_length=300)
    quantidade = models.IntegerField()
    data = models.DateField()

    estoque = models.ForeignKey(
        Estoque,
        on_delete=models.CASCADE,
        related_name='desperdicio'
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="desperdicio"
    )

    def __str__(self):
        return f'{self.descricao} - {self.quantidade}'