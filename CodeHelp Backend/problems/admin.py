# admin.py
from django.contrib import admin
from .models import Category, Problem, TestCase, Submission, Post, Comment

admin.site.register(Category)
admin.site.register(TestCase)
admin.site.register(Submission)
admin.site.register(Post)
admin.site.register(Comment)

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'category', 'created_by')
    list_filter = ('difficulty', 'category')
    search_fields = ('title',)