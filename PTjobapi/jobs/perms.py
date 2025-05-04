from rest_framework import permissions

class IsEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'employer'

class IsCandidate(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'candidate'
