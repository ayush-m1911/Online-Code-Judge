from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Problem(models.Model):
    DIFFICULTY_CHOICES = (
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    constraints = models.TextField(blank=True, null=True)
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='Easy'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    topic = models.CharField(max_length=50, blank=True)
    def __str__(self):
        return self.title

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField()
    expected_output = models.TextField()
    is_sample = models.BooleanField(default=False)

    def __str__(self):
        return f"TestCase for {self.problem.title}"

class Submission(models.Model):
    LANGUAGE_CHOICES = [
        ('PY', 'Python'),
        ('CPP', 'C++'), 
        ('JAVA', 'Java'), 
    ]
    VERDICT_CHOICES = [
         ('PENDING', 'Pending'),
        ('AC', 'Accepted'),
        ('WA', 'Wrong Answer'),
        ('TLE', 'Time Limit Exceeded'),
        ('RE', 'Runtime Error'),
        ('CE', 'Compilation Error'),
    ]

    user = models.ForeignKey(User,  on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
    verdict = models.CharField(max_length=10, choices=VERDICT_CHOICES, default='PENDING')
    execution_time = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.user.username} - {self.verdict}"
