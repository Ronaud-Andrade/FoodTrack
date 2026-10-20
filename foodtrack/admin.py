from django.contrib import admin
from .models import (Usuario, Restaurante,
                      Desperdicio, Estoque,
                      Alimento) 

# Register your models here.
@admin.register(Desperdicio)
class DesperdicioAdmin(admin.ModelAdmin):
    list_display = ('motivo', 'descricao', 'quantidade', 'data', 'estoque', 'usuario')


@admin.register(Estoque)
class EstoqueAdmin(admin.ModelAdmin):
    list_display = (
        'alimento',
        'quantidade_atual',
        'entrada',
        'saida',
        'localizacao',
        'validade',
    )


@admin.register(Alimento)
class AlimentoAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'categoria',
        'medida',
        'restaurante',
    )


admin.site.register(Usuario)


@admin.register(Restaurante)
class RestauranteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cnpj', 'dias_alerta_validade')