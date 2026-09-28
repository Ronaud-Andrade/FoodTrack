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

    #Chaves dos relacionamentos
    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        related_name='usuarios',
        null=True,
        blank=True
    )



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

    def __self__(self):
        #Nome do alimento - Quantidade atual
        return f'{self.alimento.nome} - {self.quantidade_atual}' 

class Desperdicio(models.Model):
    descricao = models.CharField(300)
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