from django.contrib import admin
from .models import (Usuario, Restaurante,
                      Desperdicio, Estoque,
                      Alimento) 

# Register your models here.
@admin.register(Desperdicio)
class DesperdicioAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'motivo', 'quantidade', 'data', 'estoque', 'usuario')


@admin.register(Estoque)
class EstoqueAdmin(admin.ModelAdmin):
    list_display = (
        'alimento',
        'qntd_atual',
        'entrada',
        'saida',
        'localizacao',
        'lote',
        'validade',
        'custo_unitario',
    )


@admin.register(Alimento)
class AlimentoAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'categoria',
        'medida',
        'fornecedor',
        'estoque_minimo',
        'restaurante',
    )


admin.site.register(Usuario)
admin.site.register(Restaurante)