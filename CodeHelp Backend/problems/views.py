from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Post, Comment, Problem, Submission, Category
from .serializers import (
    PostSerializer,
    CommentSerializer,
    ProblemModelSerializer,
    SubmissionModelSerializer,
    SubmissionCreateSerializer,
    CategoryModelSerializer,
    UserRegistrationSerializer
)
from .service import run_submission, run_code_with_input


class UserRegistrationAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategoryModelSerializer
    permission_classes = [IsAdminOrReadOnly]

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        if is_many and len(request.data) > 100:
            return Response({'detail': 'Максимум 100 категорий за раз.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemModelSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Submission.objects.all()
        return Submission.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        input_serializer = SubmissionCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        problem = get_object_or_404(Problem, id=data['problem'])

        submission = Submission.objects.create(
            problem=problem,
            user=request.user,
            code=data['code'],
            language=data['language'],
            status='Pending'
        )

        status_res, message = run_submission(submission)
        submission.status = status_res
        submission.status_details = message
        submission.save()

        return Response(SubmissionModelSerializer(submission).data, status=status.HTTP_201_CREATED)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.annotate(comments_count=Count('comments')).prefetch_related('likes').order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if post.likes.filter(pk=user.pk).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({'liked': liked, 'likes_count': post.total_likes})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.prefetch_related('replies').select_related('author')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            depth = int(self.request.query_params.get('depth', 1))
            depth = max(0, min(depth, 3))
        except (ValueError, TypeError):
            depth = 1
        context['reply_depth'] = depth
        return context


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_problems(request):
    query = request.query_params.get('q', '')
    difficulty = request.query_params.get('difficulty', '')

    problems = Problem.objects.all()
    if query:
        problems = problems.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
    if difficulty:
        problems = problems.filter(difficulty=difficulty)

    serializer = ProblemModelSerializer(problems, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_stats(request):
    user = request.user
    submissions = Submission.objects.filter(user=user)
    total = submissions.count()
    accepted = submissions.filter(status='Accepted').count()
    by_language = (
        submissions.values('language')
        .annotate(count=Count('id'))
    )
    return Response({
        'total_submissions': total,
        'accepted': accepted,
        'acceptance_rate': round(accepted / total * 100, 1) if total else 0,
        'by_language': list(by_language),
    })


class ProblemDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        problem = get_object_or_404(Problem, pk=pk)
        data = ProblemModelSerializer(problem).data
        data['total_submissions'] = problem.submissions.count()
        data['accepted_submissions'] = problem.submissions.filter(status='Accepted').count()
        return Response(data)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined,
            'is_staff': user.is_staff,
        })

    def put(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })


class RunCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '')
        language = request.data.get('language', 'python')
        stdin = request.data.get('stdin', '')

        if not code.strip():
            return Response({'error': 'Код пустой'}, status=status.HTTP_400_BAD_REQUEST)

        success, output = run_code_with_input(code, language, stdin)
        return Response({'success': success, 'output': output})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TokenError:
            return Response({'detail': 'Токен недействителен или уже использован.'}, status=status.HTTP_400_BAD_REQUEST)