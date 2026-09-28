from django.contrib import admin
from .models import (Usuario, Restaurante,
                      Desperdicio, Estoque,
                      Alimento) 

# Register your models here.
admin.site.register(Usuario)
admin.site.register(Restaurante)
admin.site.register(Desperdicio)
admin.site.register(Estoque)
admin.site.register(Alimento)