from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from django.conf.urls.static import static
from django.conf import settings



router = DefaultRouter()
router.register('industries', IndustryViewSet, basename='industries')
router.register('jobs', JobViewSet, basename='jobs')
router.register('users', UserViewSet, basename='users')
router.register('applications', ApplicationViewSet, basename='applications')
router.register('companies', CompanyViewSet, basename='companies')
router.register('candidates', CandidateProfileViewSet, basename='candidates')
router.register('follows', FollowViewSet, basename='follows')
router.register('reviews', ReviewViewSet, basename='reviews')
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('chatrooms', ChatRoomViewSet, basename='chatrooms')
router.register('messages', MessageViewSet, basename='messages')

urlpatterns = [
    path('', include(router.urls)),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)