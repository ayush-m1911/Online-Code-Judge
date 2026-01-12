from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Problem, Submission, TestCase
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
            testcases = TestCase.objects.filter(problem=submission.problem)
            all_passed = True
            total_time=0
            for tc in testcases:
                output, error, exec_time = run_code(submission.code, tc.input_data)
                if error == "TLE":
                    submission.verdict = 'TLE'
                    submission.error_message = "Time Limit Exceeded"
                    submission.save()
                    return 
                if error:
                    submission.verdict = 'RE'
                    submission.error_message = error
                    submission.save()
                    return
                if output is None or output.strip() != tc.expected_output.strip():
                    submission.verdict = 'WA'
                    submission.save()
                    return 
                    
               
            
            submission.verdict = 'AC'
            submission.execution_time = round(total_time,4)
            submission.save()