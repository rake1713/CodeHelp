from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CategoryViewSet,
    ProblemViewSet,
    SubmissionViewSet,
    PostViewSet,
    CommentViewSet,
    UserRegistrationAPIView,
    LogoutView,
    UserProfileView,
    ProblemDetailView,
    search_problems,
    my_stats,
)

router = DefaultRouter()

router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'problems', ProblemViewSet, basename='problem')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationAPIView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('problems/<int:pk>/detail/', ProblemDetailView.as_view(), name='problem-detail'),
    path('problems/search/', search_problems, name='problem-search'),
    path('stats/', my_stats, name='my-stats'),
]