from rest_framework import serializers
from .models import Problem, TestCase, Submission

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_sample']

class ProblemSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Problem
        fields = ['id', 'title', 'description', 'constraints', 'created_at', 'test_cases']

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'user', 'problem', 'code', 'language', 'verdict', 'execution_time', 'error_message', 'submitted_at']
        read_only_fields = ['user','verdict', 'execution_time', 'error_message', 'submitted_at']