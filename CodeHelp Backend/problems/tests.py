from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Category, Problem, TestCase as DBTestCase, Submission, Post, Comment

class CodeHelpAPITests(APITestCase):
    def setUp(self):
        """Этот метод запускается ПЕРЕД каждым тестом. Подготавливаем данные."""
        self.admin = User.objects.create_superuser(username='admin', password='adminpass')
        self.student = User.objects.create_user(username='student', password='studentpass')

        resp_admin = self.client.post('/api/login/', {'username': 'admin', 'password': 'adminpass'})
        self.admin_token = resp_admin.data['access']
        
        resp_student = self.client.post('/api/login/', {'username': 'student', 'password': 'studentpass'})
        self.student_token = resp_student.data['access']

        self.admin_auth = {'HTTP_AUTHORIZATION': f'Bearer {self.admin_token}'}
        self.student_auth = {'HTTP_AUTHORIZATION': f'Bearer {self.student_token}'}

        self.category = Category.objects.create(name="Алгоритмы", description="База")
        self.problem = Problem.objects.create(
            title="A+B",
            description="Сумма чисел",
            difficulty="Easy",
            category=self.category,
            created_by=self.admin
        )

        self.test_case = DBTestCase.objects.create(
            problem=self.problem, 
            input_data="2\n3", 
            expected_output="5"
        )


    def test_user_registration(self):
        data = {'username': 'newuser', 'email': 'new@mail.com', 'password': 'newpass123'}
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_login(self):
        data = {'username': 'student', 'password': 'studentpass'}
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


    def test_student_cannot_create_category(self):
        data = {'name': 'Новая Категория'}
        response = self.client.post('/api/categories/', data, **self.student_auth)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_category(self):
        data = {'name': 'Новая Категория'}
        response = self.client.post('/api/categories/', data, **self.admin_auth)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_anyone_can_get_problems_list(self):
        response = self.client.get('/api/problems/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


    def test_successful_python_submission(self):
        code = "import sys\nlines = sys.stdin.read().split()\nprint(int(lines[0]) + int(lines[1]))"
        data = {
            'problem': self.problem.id,
            'language': 'python',
            'code': code
        }
        response = self.client.post('/api/submissions/', data, **self.student_auth)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'Accepted')

    def test_wrong_answer_python_submission(self):
        data = {
            'problem': self.problem.id,
            'language': 'python',
            'code': "print(10)" 
        }
        response = self.client.post('/api/submissions/', data, **self.student_auth)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'Wrong Answer')

    def test_students_only_see_their_submissions(self):
        self.client.post('/api/submissions/', {'problem': self.problem.id, 'language': 'python', 'code': 'print(1)'}, **self.student_auth)
        
        User.objects.create_user(username='hacker', password='123')
        resp_hacker = self.client.post('/api/login/', {'username': 'hacker', 'password': '123'})
        hacker_auth = {'HTTP_AUTHORIZATION': f'Bearer {resp_hacker.data["access"]}'}
        
        response = self.client.get('/api/submissions/', **hacker_auth)
        self.assertEqual(len(response.data), 0) 

    def test_create_post_and_comment(self):
        post_data = {'title': 'Помогите', 'content': 'Как решить?', 'category': self.category.id}
        resp_post = self.client.post('/api/posts/', post_data, **self.student_auth)
        self.assertEqual(resp_post.status_code, status.HTTP_201_CREATED)
        post_id = resp_post.data['id']

        comment_data = {'post': post_id, 'text': 'Попробуй так...'}
        resp_comment = self.client.post('/api/comments/', comment_data, **self.admin_auth)
        self.assertEqual(resp_comment.status_code, status.HTTP_201_CREATED)