from rest_framework import serializers
from .models import Category, Problem, Submission, Post, Comment
from django.contrib.auth.models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class CategorySimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)


class SubmissionCreateSerializer(serializers.Serializer):
    problem = serializers.IntegerField()
    code = serializers.CharField()
    language = serializers.CharField()


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
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author_username', 'text', 'parent', 'replies', 'created_at']

    def get_replies(self, obj):
        depth = self.context.get('reply_depth', 1)
        if depth <= 0:
            return []
        if obj.replies.exists():
            child_context = {**self.context, 'reply_depth': depth - 1}
            return CommentSerializer(obj.replies.all(), many=True, context=child_context).data
        return []


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    likes_count = serializers.IntegerField(source='total_likes', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        exclude = ['likes'] 
        read_only_fields = ['author', 'created_at']