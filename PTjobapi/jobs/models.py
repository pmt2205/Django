from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Quản trị viên'),
        ('employer', 'Nhà tuyển dụng'),
        ('candidate', 'Ứng viên'),
    ]

    avatar = CloudinaryField(null=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, null=True)
    address = models.TextField(null=True)
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Company(BaseModel):
    STATUS_CHOICES = [
        ('pending', 'Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('rejected', 'Từ chối'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    tax_code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    address = models.TextField()
    # website = models.URLField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    verification_documents = CloudinaryField(null=True, blank=True)

    def __str__(self):
        return self.name

class CompanyImage(models.Model):
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField()


class Industry(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Job(BaseModel):
    JOB_TYPE_CHOICES = [
        ('part_time', 'Bán thời gian'),
        ('full_time', 'Toàn thời gian'),
        ('freelance', 'Freelance'),
    ]

    SALARY_TYPE_CHOICES = [
        ('hourly', 'Theo giờ'),
        ('daily', 'Theo ngày'),
        ('monthly', 'Theo tháng'),
        ('project', 'Theo dự án'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    industry = models.ForeignKey(Industry, on_delete=models.PROTECT)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    job_type = models.CharField(max_length=10, choices=JOB_TYPE_CHOICES)
    salary_type = models.CharField(max_length=10, choices=SALARY_TYPE_CHOICES)
    salary_from = models.DecimalField(max_digits=12, decimal_places=2)
    salary_to = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)  # Cho Google Maps
    longitude = models.FloatField(null=True, blank=True)  # Cho Google Maps
    deadline = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} at {self.company.name}"

    class Meta:
        ordering = ['-created_date']



class CandidateProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cv = models.FileField(upload_to='cvs/', null=True, blank=True)
    skills = models.TextField(null=True, blank=True)
    experience = models.TextField(null=True, blank=True)
    education = models.TextField(null=True, blank=True)
    verification_documents = models.FileField(upload_to='verification_docs/', null=True, blank=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class Application(BaseModel):
    STATUS_CHOICES = [
        ('applied', 'Đã ứng tuyển'),
        ('viewed', 'Đã xem'),
        ('interview', 'Phỏng vấn'),
        ('accepted', 'Đã nhận'),
        ('rejected', 'Từ chối'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='applied')
    cv_custom = models.FileField(upload_to='cvs_custom/', null=True, blank=True)
    cover_letter = models.TextField(null=True, blank=True)
    applied_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'candidate')

    def __str__(self):
        return f"{self.candidate.username} applied for {self.job.title}"


class Follow(BaseModel):
    candidate = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    company = models.ForeignKey(Company, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('candidate', 'company')

    def __str__(self):
        return f"{self.candidate.username} follows {self.company.name}"


class Review(BaseModel):
    candidate = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='reviews')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField()
    rating = models.IntegerField(null=True, blank=True)  # Từ 1 đến 5 sao, nếu là phản hồi thì có thể không cần rating
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')


class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"Notification for {self.user.username}"


class ChatRoom(BaseModel):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    employer = models.ForeignKey(User, related_name='employer_chats', on_delete=models.CASCADE)
    candidate = models.ForeignKey(User, related_name='candidate_chats', on_delete=models.CASCADE)
    room_id = models.CharField(max_length=255, unique=True)  # ID phòng chat từ Firebase

    class Meta:
        unique_together = ('employer', 'candidate', 'job')

    def __str__(self):
        return f"Chat between {self.employer.username} and {self.candidate.username}"


class Message(BaseModel):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} in {self.room}"