from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from apps.consolidated.authentication import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CookieTokenLogoutView,
)

@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/v1/', include('apps.consolidated.urls')),
    path('api/v1/auth/csrf/', csrf_view, name='csrf'),
    path('api/v1/auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/logout/', CookieTokenLogoutView.as_view(), name='token_logout'),
]