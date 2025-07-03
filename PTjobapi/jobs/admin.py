from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.db.models.functions import TruncMonth
from django.utils.dateformat import DateFormat
from jobs.models import Company, Industry, Job,CandidateProfile, Application,Follow, Review, Notification,ChatRoom, Message, User, CompanyImage
from django.urls import path


class MyAdminSite(admin.AdminSite):
    site_header = 'Job PT - Thống kê'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('job-stats/', self.admin_view(self.job_stats_dashboard), name='job-stats'),
        ]
        return custom_urls + urls

    def job_stats_dashboard(self, request):
        # Thống kê việc làm theo tháng
        job_stats = (
            Job.objects
            .annotate(month=TruncMonth('created_date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        job_labels = [DateFormat(item['month']).format('Y-m') for item in job_stats]
        job_data = [item['count'] for item in job_stats]

        # Ứng viên theo tháng đăng ký
        candidate_stats = (
            User.objects.filter(role='candidate')
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        candidate_labels = [DateFormat(item['month']).format('Y-m') for item in candidate_stats]
        candidate_data = [item['count'] for item in candidate_stats]

        # Nhà tuyển dụng theo tháng đăng ký
        employer_stats = (
            User.objects.filter(role='employer')
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        employer_labels = [DateFormat(item['month']).format('Y-m') for item in employer_stats]
        employer_data = [item['count'] for item in employer_stats]

        # Số lượng việc làm theo ngành nghề
        industry_stats = (
            Industry.objects
            .annotate(job_count=Count('job'))
            .values('name', 'job_count')
            .order_by('-job_count')
        )

        # Tổng số việc làm, ứng viên, nhà tuyển dụng để dùng trong biểu đồ tooltip
        job_total = sum(job_data)
        candidate_total = sum(candidate_data)
        employer_total = sum(employer_data)

        return TemplateResponse(request, 'admin/stats.html', {
            'job_labels': job_labels,
            'job_data': job_data,
            'candidate_labels': candidate_labels,
            'candidate_data': candidate_data,
            'employer_labels': employer_labels,
            'employer_data': employer_data,
            'industry_stats': industry_stats,
            'job_total': job_total,
            'candidate_total': candidate_total,
            'employer_total': employer_total,
        })

class CompanyImageInline(admin.TabularInline):  # hoặc admin.StackedInline
    model = CompanyImage

class CompanyAdmin(admin.ModelAdmin):
    inlines = [CompanyImageInline]
admin_site = MyAdminSite(name='Job')


admin_site.register(Industry)
admin_site.register(Job)
admin_site.register(Company, CompanyAdmin)
admin_site.register(CandidateProfile)
admin_site.register(Application)
admin_site.register(Follow)
admin_site.register(Review)
admin_site.register(Notification)
admin_site.register(ChatRoom)
admin_site.register(Message)
admin_site.register(User)

