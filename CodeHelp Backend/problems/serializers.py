from rest_framework import serializers
from .models import Category, Problem, Submission, Post, Comment
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует.')
        return value.lower()

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )


class CategorySimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)


class SubmissionCreateSerializer(serializers.Serializer):
    problem = serializers.IntegerField()
    code = serializers.CharField(max_length=65536)
    language = serializers.ChoiceField(choices=['python', 'cpp', 'java'])


class CategoryModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProblemModelSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Problem
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']


class SubmissionModelSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'problem', 'problem_title', 'username', 'code', 'language', 'status', 'status_details', 'created_at']
        read_only_fields = ['user', 'status', 'status_details', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    replies = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author_username', 'text', 'parent', 'replies', 'created_at', 'updated_at', 'is_edited']
        read_only_fields = ['author', 'created_at', 'updated_at']

    def validate(self, attrs):
        parent = attrs.get('parent')
        post = attrs.get('post')
        if parent and post and parent.post_id != post.id:
            raise serializers.ValidationError({'parent': 'Родительский комментарий принадлежит другому посту.'})
        return attrs

    def get_replies(self, obj):
        depth = self.context.get('reply_depth', 1)
        if depth <= 0:
            return []
        if obj.replies.exists():
            child_context = {**self.context, 'reply_depth': depth - 1}
            return CommentSerializer(obj.replies.all(), many=True, context=child_context).data
        return []

    def get_is_edited(self, obj):
        if obj.updated_at and obj.created_at:
            time_difference = obj.updated_at - obj.created_at
            return time_difference.total_seconds() > 1
        return False


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    likes_count = serializers.IntegerField(source='total_likes', read_only=True)
    comments_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'author_username', 'category', 'created_at', 'likes_count', 'comments_count']
        read_only_fields = ['author', 'created_at']