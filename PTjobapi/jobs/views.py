from rest_framework import viewsets, permissions, generics, parsers, decorators, status
from .models import Industry, Company, Job, Application, Follow, Review, Notification, ChatRoom, Message, User, CandidateProfile
from rest_framework.decorators import action
from rest_framework.response import Response
from jobs import serializers
from .perms import IsEmployer, IsCandidate


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]


    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes = [permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name']:
                    setattr(u, k, v)
                elif k.__eq__('password'):
                    u.set_password(v)

            u.save()

        return Response(serializers.UserSerializer(u).data)

class IndustryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Industry.objects.filter(active=True)
    serializer_class = serializers.IndustrySerializer

class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Company.objects.filter(active=True)
    serializer_class = serializers.CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=False, permission_classes=[IsEmployer])
    def register(self, request):
        user = request.user

        if hasattr(user, 'company') and user.company is not None:
            return Response({'error': 'You already have a registered company.'}, status=400)

        serializer = serializers.CompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save(user=user)
            return Response(serializers.CompanySerializer(company).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Job.objects.filter(active=True)
    permission_classes = [permissions.AllowAny]

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

        return queryset

    @action(detail=False, methods=['post'], permission_classes=[IsEmployer])
    def create_job(self, request):
        if request.user.company.status != 'approved':
            return Response(
                {"error": "You can only create a job if your company is approved."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = serializers.JobCreateSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save(company=request.user.company)
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


class ApplicationViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Application.objects.filter(active=True)
    serializer_class = serializers.ApplicationSerializer  # Sử dụng serializer đã sửa
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['post'], detail=False, permission_classes=[IsCandidate])
    def apply(self, request):
        try:
            if not hasattr(request.user, 'candidateprofile'):
                return Response(
                    {'error': 'Bạn cần tạo hồ sơ ứng viên trước'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            job_id = request.data.get('job')
            try:
                job = Job.objects.get(pk=job_id, active=True)
            except Job.DoesNotExist:
                return Response(
                    {'error': 'Công việc không tồn tại'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if Application.objects.filter(job=job, candidate=request.user).exists():
                return Response(
                    {'error': 'Bạn đã ứng tuyển công việc này'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            application = serializer.save(
                job=job,
                candidate=request.user,
                status='applied'
            )
            return Response(
                self.get_serializer(application).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

class FollowViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Follow.objects.filter(active=True)
    serializer_class = serializers.FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)

class ReviewViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Review.objects.filter(active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)

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
