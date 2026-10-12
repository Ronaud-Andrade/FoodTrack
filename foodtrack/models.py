from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser

# Este arquivo define os modelos do banco de dados do projeto.
# Cada classe aqui representa uma tabela e os campos dela.
# O Django usa essas classes para criar/migrar o schema do banco automaticamente.

class Restaurante(models.Model):
    # Representa cada estabelecimento/empresa que usa o sistema.
    nome = models.CharField(max_length=150)
    cnpj = models.CharField(max_length=18, unique=True)

    # Define como o objeto será exibido no admin e em mensagens do sistema.
    def __str__(self):
        return self.nome

class Usuario(AbstractUser):
    # Extende o usuário padrão do Django para incluir dados específicos do sistema.
    # O Django já fornece username, password, is_staff, is_superuser, etc.
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    perfil = models.CharField(max_length=50)
    # O usuário nativo do Django guarda a senha com hash e já traz segurança básica.

    # null=True e blank=True são usados para permitir que o superusuário seja criado sem restaurante.
    # Usuários comuns devem estar vinculados a um restaurante; isso é validado em clean() e save().
    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        related_name='usuarios',
        null=True,
        blank=True
    )

    class Meta:
        # Mantém o rótulo padrão do AbstractUser para o painel administrativo.
        verbose_name = 'user'
        verbose_name_plural = 'users'
        constraints = [
            # Restrição no banco para garantir integridade mesmo quando os dados forem atualizados
            # por caminhos que não passam pelo método save(), como QuerySet.update().
            # Só é permitido restaurante nulo para superusuários.
            models.CheckConstraint(
                condition=models.Q(is_superuser=True) | models.Q(restaurante__isnull=False),
                name='usuario_restaurante_nulo_apenas_superuser',
                violation_error_message='Usuários que não são superusuários precisam estar atrelados a um restaurante.',
            ),
        ]

    def clean(self):
        # Este método é chamado por formulários e pelo admin antes de salvar.
        # Ele garante que regras de negócio sejam validadas antes do registro.
        super().clean()
        self.validar_restaurante()

    def validar_restaurante(self):
        # Superusuário pode existir sem restaurante.
        # Qualquer usuário normal precisa ter um restaurante associado.
        if not self.is_superuser and self.restaurante_id is None:
            raise ValidationError({
                'restaurante': 'Usuários que não são superusuários precisam estar atrelados a um restaurante.',
            })

    def save(self, *args, **kwargs):
        # create_superuser e alguns fluxos de criação podem ignorar o método clean().
        # Então a validação também acontece aqui para evitar inconsistência no banco.
        self.validar_restaurante()
        super().save(*args, **kwargs)

    def __str__(self):
        # Exibe o nome de usuário no painel e em logs.
        return self.username


class Alimento(models.Model):
    # Cada registro representa um produto/ingrediente cadastrado para um restaurante.
    nome = models.CharField(max_length=150)
    categoria = models.CharField(max_length=60)
    medida = models.CharField(max_length=50)

    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        # Cria um acesso reverso para encontrar todos os alimentos de um restaurante.
        # Exemplo: restaurante.alimentos.all()
        related_name='alimentos'
    )

    def __str__(self):
        return self.nome


class Estoque(models.Model):
    # Registra a quantidade atual de um alimento em um ponto de armazenamento.
    qntd_atual = models.IntegerField()
    entrada = models.DateField()
    saida = models.DateField(null=True, blank=True)
    localizacao = models.CharField(max_length=150)
    validade = models.DateField(null=True, blank=True)

    # Relacionamento com o alimento: um estoque pertence a um único alimento.
    alimento = models.ForeignKey(
        Alimento,
        on_delete=models.CASCADE,
        # Permite acessar todos os registros de estoque de um alimento.
        # Exemplo: alimento.estoques.all()
        related_name='estoques'
    )

    def __str__(self):
        # Exibe o nome do alimento seguido da quantidade disponível.
        return f'{self.alimento.nome} - {self.qntd_atual}'


class Desperdicio(models.Model):
    # Guarda os registros de alimentos perdidos ou descartados.
    descricao = models.CharField(max_length=300)
    quantidade = models.IntegerField()
    data = models.DateField()

    # Cada desperdício está ligado ao estoque relacionado ao item.
    estoque = models.ForeignKey(
        Estoque,
        on_delete=models.CASCADE,
        related_name='desperdicio'
    )

    # Também registra quem fez o registro, para auditoria e controle.
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='desperdicio'
    )

    def __str__(self):
        return f'{self.descricao} - {self.quantidade}'