from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse

from jobs.models import Company, Industry, Job,CandidateProfile, Application,Follow, Review, Notification,ChatRoom, Message, User
from django.urls import path

class MyAdminSite(admin.AdminSite):
    site_header = 'Job PT'

    def get_urls(self):
        return [path('job-stats/', self.job_stats),] +super().get_urls()

    def job_stats(self, request):
        stats = Industry.objects.annotate(job_count=Count('job__id')).values('id', 'name', 'job_count')
        return TemplateResponse(request, 'admin/stats.html', {
            'stats' : stats
        })



admin_site = MyAdminSite(name='Job')


admin_site.register(Industry)
admin_site.register(Job)
admin_site.register(Company)
admin_site.register(CandidateProfile)
admin_site.register(Application)
admin_site.register(Follow)
admin_site.register(Review)
admin_site.register(Notification)
admin_site.register(ChatRoom)
admin_site.register(Message)
admin_site.register(User)

