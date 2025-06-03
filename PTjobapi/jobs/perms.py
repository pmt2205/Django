from rest_framework import permissions
from .models import Application, Job


class IsEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'employer'

class IsCandidate(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'candidate'

def has_been_accepted(candidate, company):
    return Application.objects.filter(
        candidate=candidate,
        status='accepted',
        job__company=company
    ).exists()