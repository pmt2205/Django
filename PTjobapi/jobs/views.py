from django.db import transaction
from rest_framework import viewsets, permissions, generics, parsers, decorators, status
from .models import Industry, Company, Job, Application, Follow, Review, Notification, ChatRoom, Message, User, CandidateProfile
from rest_framework.decorators import action
from rest_framework.response import Response
from jobs import serializers, paginators
from .perms import IsEmployer, IsCandidate, has_been_accepted


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method == 'PATCH':
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'phone', 'address']:
                    setattr(u, k, v)
                elif k == 'password':
                    u.set_password(v)
            u.save()
        return Response(serializers.UserSerializer(u).data)

class IndustryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Industry.objects.filter(active=True)
    serializer_class = serializers.IndustrySerializer

class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Company.objects.filter(active=True)
    serializer_class = serializers.CompanySerializer
    pagination_class = paginators.ItemPaginator

    @action(methods=['post'], detail=False, permission_classes=[IsEmployer])
    def register(self, request):
        user = request.user

        if hasattr(user, 'company') and user.company is not None:
            return Response({'error': 'You already have a registered company.'}, status=400)

        serializer = serializers.CompanySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            company = serializer.save()
            return Response(serializers.CompanySerializer(company, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], detail=False, permission_classes=[IsEmployer])
    def update_info(self, request):
        user = request.user

        if not hasattr(user, 'company') or user.company is None:
            return Response({'error': 'Bạn chưa đăng ký công ty.'}, status=status.HTTP_400_BAD_REQUEST)

        company = user.company

        allowed_fields = ['name', 'description', 'address']
        for field in allowed_fields:
            if field in request.data:
                setattr(company, field, request.data[field])

        company.save()
        return Response(serializers.CompanySerializer(company, context={'request': request}).data)

class JobViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Job.objects.filter(active=True)
    permission_classes = [permissions.AllowAny]
    pagination_class = paginators.ItemPaginator

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.JobDetailSerializer
        elif self.action == 'create_job':
            return serializers.JobCreateSerializer
        return serializers.JobSerializer

    def get_queryset(self):
        queryset = Job.objects.filter(active=True)
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(title__icontains=q)

        industry_id = self.request.query_params.get('industry_id')
        if industry_id:
            queryset = queryset.filter(industry_id=industry_id)

        salary_from = self.request.query_params.get('salary_from')
        if salary_from:
            queryset = queryset.filter(salary_from__gte=salary_from)

        salary_to = self.request.query_params.get('salary_to')
        if salary_to:
            queryset = queryset.filter(salary_to__lte=salary_to)

        job_type = self.request.query_params.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type)

        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)

        company_id = self.request.query_params.get('company_id')  # thêm dòng này
        if company_id:
            queryset = queryset.filter(company_id=company_id)  # thêm dòng này

        return queryset

    @action(detail=False, methods=['post'], permission_classes=[IsEmployer])
    @transaction.atomic
    def create_job(self, request):
        if request.user.company.status != 'approved':
            return Response(
                {"error": "You can only create a job if your company is approved."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = serializers.JobCreateSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save(company=request.user.company)

            # Tạo thông báo cho các candidate đã theo dõi công ty này
            followers = Follow.objects.filter(company=request.user.company, active=True)
            notifications = []
            for follow in followers:
                message = f"Công ty {request.user.company.name} vừa đăng tuyển vị trí '{job.title}'. Hãy ứng tuyển ngay!"
                notifications.append(Notification(
                    user=follow.candidate,
                    message=message,
                    is_read=False,
                ))
            Notification.objects.bulk_create(notifications)

            return Response(serializers.JobDetailSerializer(job, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get'], url_path='applications',
            permission_classes=[permissions.IsAuthenticated, IsEmployer])
    def get_applications(self, request, pk=None):
        job = self.get_object()

        # Chỉ cho phép xem nếu job thuộc công ty của employer
        if request.user.company != job.company:
            return Response({'error': 'You do not have permission to view applications for this job.'}, status=403)

        apps = job.application_set.filter(active=True)
        data = serializers.ApplicationSerializer(apps, many=True).data
        return Response(data)

#sửa
class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Application.objects.filter(active=True)
    serializer_class = serializers.ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    # ✅ GET /applications/ (danh sách ứng tuyển của user)
    def list(self, request):
        if hasattr(request.user, 'candidateprofile'):
            apps = Application.objects.filter(candidate=request.user, active=True)
        elif hasattr(request.user, 'company'):
            apps = Application.objects.filter(job__company=request.user.company, active=True)
        else:
            apps = Application.objects.none()
        serializer = self.get_serializer(apps, many=True)
        return Response(serializer.data)

    # ✅ GET /applications/<id>/
    def retrieve(self, request, pk=None):
        try:
            app = Application.objects.get(pk=pk, active=True)
        except Application.DoesNotExist:
            return Response({'error': 'Không tìm thấy'}, status=status.HTTP_404_NOT_FOUND)

        return Response(self.serializer_class(app).data)

    # ✅ POST /applications/apply/
    @action(methods=['post'], detail=False, permission_classes=[IsCandidate])
    def apply(self, request):
        if not hasattr(request.user, 'candidateprofile'):
            return Response({'error': 'Bạn cần tạo hồ sơ ứng viên trước'}, status=400)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        job_id = request.data.get('job')
        job = Job.objects.filter(pk=job_id, active=True).first()
        if not job:
            return Response({'error': 'Công việc không tồn tại'}, status=404)

        if Application.objects.filter(job=job, candidate=request.user).exists():
            return Response({'error': 'Bạn đã ứng tuyển công việc này'}, status=400)

        application = serializer.save(
            job=job,
            candidate=request.user,
            status='applied'
        )
        return Response(self.get_serializer(application).data, status=201)

    # ✅ PATCH /applications/<id>/
    def partial_update(self, request, pk=None):
        try:
            app = Application.objects.select_related('job__company').get(pk=pk, active=True)
        except Application.DoesNotExist:
            return Response({'error': 'Không tìm thấy'}, status=status.HTTP_404_NOT_FOUND)

        # Chỉ employer của công ty đó mới được sửa
        if not hasattr(request.user, 'company') or app.job.company != request.user.company:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        valid_statuses = [c[0] for c in Application.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': 'Trạng thái không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        app.status = new_status
        app.save()
        return Response(self.serializer_class(app).data)

class CandidateProfileViewSet(viewsets.GenericViewSet):
    queryset = CandidateProfile.objects.filter(active=True)
    serializer_class = serializers.CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]
    parser_classes = [parsers.MultiPartParser]

    def get_object(self):
        return self.request.user.candidateprofile

    @action(detail=False, methods=['get', 'put', 'post'])
    def me(self, request):
        try:
            profile = request.user.candidateprofile
        except CandidateProfile.DoesNotExist:
            if request.method == 'GET':
                return Response(
                    {'detail': 'Profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            profile = None

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method == 'POST':
            if profile:
                return Response(
                    {'detail': 'Profile already exists. Use PUT to update.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        elif request.method == 'PUT':
            if not profile:
                return Response(
                    {'detail': 'Profile not found. Create profile first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

# sửa lại trong python
class FollowViewSet(viewsets.GenericViewSet,
                    generics.ListAPIView,
                    generics.CreateAPIView,
                    generics.DestroyAPIView):

    serializer_class = serializers.FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='status/(?P<company_id>[^/.]+)')
    def follow_status(self, request, company_id=None):
        candidate = request.user
        is_following = Follow.objects.filter(candidate=candidate, company_id=company_id, active=True).exists()
        return Response({'is_following': is_following})

    def get_queryset(self):
        return Follow.objects.filter(candidate=self.request.user, active=True)

    def perform_create(self, serializer):
        candidate = self.request.user
        company = serializer.validated_data['company']
        if Follow.objects.filter(candidate=candidate, company=company, active=True).exists():
            raise serializers.ValidationError("Bạn đã theo dõi công ty này.")
        serializer.save(candidate=candidate)


    def destroy(self, request, pk=None):
        try:
            follow = Follow.objects.get(id=pk, candidate=request.user, active=True)
        except Follow.DoesNotExist:
            return Response({'detail': 'Không tìm thấy theo dõi này.'}, status=status.HTTP_404_NOT_FOUND)
        follow.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


    @action(detail=False, methods=['get'], url_path='followers')
    def get_followers(self, request):
        if not hasattr(request.user, 'company'):
            return Response({'detail': 'Bạn không phải nhà tuyển dụng.'}, status=status.HTTP_403_FORBIDDEN)

        followers_qs = Follow.objects.filter(company=request.user.company, active=True).select_related('candidate')
        users = [f.candidate for f in followers_qs]
        serializer = serializers.UserSerializer(users, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(parent__isnull=True).order_by('-created_date')

    def perform_create(self, serializer):
        user = self.request.user
        company_id = self.request.data.get('company')
        parent_id = self.request.data.get('parent')

        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Công ty không tồn tại.")

        # Nếu là phản hồi
        if parent_id:
            parent = Review.objects.filter(id=parent_id).first()
            if not parent:
                raise serializers.ValidationError("Phản hồi không hợp lệ.")
            if parent.candidate == user or parent.company.user == user:
                serializer.save(candidate=user, company=parent.company, parent=parent)
                return
            else:
                raise serializers.ValidationError("Bạn không được phản hồi đánh giá này.")

        # Nếu là đánh giá chính
        if user.role != 'candidate':
            raise serializers.ValidationError("Chỉ ứng viên mới có thể đánh giá công ty.")
        if not has_been_accepted(user, company):
            raise serializers.ValidationError("Bạn chưa từng được nhận vào làm tại công ty này.")

        serializer.save(candidate=user, company=company)

    # ✅ Tạo action phản hồi đánh giá
    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        parent_review = self.get_object()
        user = request.user
        content = request.data.get('content')

        if not content:
            return Response({"detail": "Nội dung phản hồi không được để trống."}, status=400)

        if parent_review.candidate != user and parent_review.company.user != user:
            return Response({"detail": "Bạn không được phản hồi đánh giá này."}, status=403)

        reply = Review.objects.create(
            candidate=user if user.role == 'candidate' else None,  # nếu employer thì None
            company=parent_review.company,
            parent=parent_review,
            content=content,
            rating=None
        )
        serializer = self.get_serializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, active=True)


class ChatRoomViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(active=True).filter(employer=user) | ChatRoom.objects.filter(candidate=user)


class MessageViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = serializers.MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return Message.objects.filter(room_id=room_id)
        return Message.objects.none()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
