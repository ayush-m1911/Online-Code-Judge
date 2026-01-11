from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Problem, Submission
from .serializers import ProblemSerializer, SubmissionSerializer
from .utils import run_code
# Create your views here.

class ProblemListView(generics.ListAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.AllowAny]

class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.AllowAny]

class SubmitSolutionView(generics.CreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        submission = serializer.save(user=self.request.user)

        if submission.language == 'PY':
            output, error, exec_time = run_code(submission.code, "")
            if error:
                submission.verdict = 'RE'
                submission.error_message = error
            else:
               submission.verdict = 'AC' 
               submission.execution_time = exec_time
        submission.save()