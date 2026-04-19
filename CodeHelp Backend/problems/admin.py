from django.contrib import admin
from .models import Category, Problem, TestCase, Submission, Post, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'category', 'created_by')
    list_filter = ('difficulty', 'category')
    search_fields = ('title',)


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'problem', 'is_hidden')
    list_filter = ('is_hidden', 'problem')
    search_fields = ('problem__title',)


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'problem', 'language', 'status', 'created_at')
    list_filter = ('status', 'language')
    search_fields = ('user__username', 'problem__title')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('title', 'author__username')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post', 'parent', 'created_at')
    list_filter = ('post',)
    search_fields = ('author__username', 'text')
