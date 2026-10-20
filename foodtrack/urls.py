from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.permissions import AllowAny
from rest_framework.routers import DefaultRouter

from .api import (
    AlimentoViewSet,
    DesperdicioViewSet,
    EstoqueViewSet,
    ObterTokenView,
    RestauranteViewSet,
    UsuarioViewSet,
)

router = DefaultRouter()
router.register('restaurantes', RestauranteViewSet, basename='api-restaurante')
router.register('usuarios', UsuarioViewSet, basename='api-usuario')
router.register('alimentos', AlimentoViewSet, basename='api-alimento')
router.register('estoques', EstoqueViewSet, basename='api-estoque')
router.register('desperdicios', DesperdicioViewSet, basename='api-desperdicio')

documentacao_publica = {
    'permission_classes': [AllowAny],
    'authentication_classes': [],
}

urlpatterns = [
    path('token/', ObterTokenView.as_view(), name='api-token'),
    path('schema/', SpectacularAPIView.as_view(**documentacao_publica), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema', **documentacao_publica), name='swagger'),
    path('docs/', SpectacularRedocView.as_view(url_name='schema', **documentacao_publica), name='apidocs'),
    path('', include(router.urls)),
]
