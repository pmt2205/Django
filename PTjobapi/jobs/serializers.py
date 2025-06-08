from rest_framework import serializers
from .models import (
    User, Company, Industry, Job,
    CandidateProfile, Application,
    Follow, Review, Notification,
    ChatRoom, Message, CompanyImage
)


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ['id', 'name']

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'image') and instance.image:
            data['image'] = instance.image.url
        return data

class CompanyImageSerializer(ItemSerializer):
    class Meta:
        model = CompanyImage
        fields = ['image']

class CompanySerializer(ItemSerializer):
    images = CompanyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'name', 'tax_code', 'address', 'images', 'description', 'status', 'user']
        read_only_fields = ['user']


    def create(self, validated_data):
        request = self.context.get('request')
        images = request.FILES.getlist('images')

        if len(images) < 3:
            raise serializers.ValidationError({"images": "Vui lòng cung cấp ít nhất 3 hình ảnh."})

        user = request.user
        company = Company.objects.create(user=user, **validated_data)

        for img in images:
            CompanyImage.objects.create(company=company, image=img)

        return company

class JobSerializer(ItemSerializer):
    company = CompanySerializer(read_only=True)
    industry = IndustrySerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'industry',
            'time_type', 'salary_from',
            'salary_to', 'location', 'created_date'
        ]

class JobDetailSerializer(JobSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self, job):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return job.application_set.filter(candidate=request.user).exists()
        return False

    class Meta:
        model = Job
        fields = JobSerializer.Meta.fields + [
            'description', 'requirements', 'deadline', 'welfare'
            'latitude', 'longitude', 'is_featured', 'liked'
        ]

class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'requirements', 'welfare',
            'salary_from', 'salary_to', 'time_type',
            'location', 'deadline', 'industry',
            'is_featured', 'latitude', 'longitude'
        ]

class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError("Không được phép đăng ký vai trò quản trị viên.")
        return value

    def create(self, validated_data):
        try:
            data = validated_data.copy()
            u = User(**data)
            u.set_password(u.password)
            u.save()
            return u
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.cv:
            data['cv'] = instance.cv.url
        if instance.verification_documents:
            data['verification_documents'] = instance.verification_documents.url
        return data

    class Meta:
        model = CandidateProfile
        fields = ['id', 'user', 'cv', 'skills', 'experience', 'education', 'verification_documents']
        extra_kwargs = {
            'cv': {'required': False},
            'verification_documents': {'required': False}
        }


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    candidate = UserSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()  # Sửa cách khai báo

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'candidate', 'status',
            'cover_letter', 'applied_date', 'status_display'
        ]
        extra_kwargs = {
            'status': {'read_only': True}
        }

    def get_status_display(self, obj):
        """Tự động lấy giá trị hiển thị của status"""
        return obj.get_status_display()

# 9. FollowSerializer (theo dõi công ty)
class FollowSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['company'] = CompanySerializer(instance.company).data
        return data

    class Meta:
        model = Follow
        fields = ['id', 'candidate', 'company']
        extra_kwargs = {
            'candidate': {'read_only': True}  # ✅ Không cần write_only, chỉ read_only là đủ
        }




# 10. ReviewSerializer (đánh giá)
class ReviewSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'candidate', 'company', 'content', 'rating', 'parent', 'created_date', 'replies']
        read_only_fields = ['candidate']

    def get_replies(self, obj):
        return ReviewSerializer(obj.replies.all(), many=True).data

# 11. NotificationSerializer
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'link', 'created_date']



# 12. MessageSerializer
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'content', 'timestamp']
        extra_kwargs = {
            'room': {'write_only': True}
        }

class ChatRoomSerializer(serializers.ModelSerializer):
    employer = UserSerializer(read_only=True)
    candidate = UserSerializer(read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'room_id', 'employer', 'candidate', 'job']
