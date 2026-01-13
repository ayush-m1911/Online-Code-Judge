from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Problem, Submission, TestCase
from .serializers import ProblemSerializer, SubmissionSerializer
from .utils import run_code, run_cpp_code, run_java_code
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
        if self.request.user.is_authenticated:
         submission = serializer.save(user=self.request.user)
        else:
         submission = serializer.save(user=None)

        testcases = TestCase.objects.filter(problem=submission.problem)
        all_passed = True
        total_time = 0

        for tc in testcases:

            # Python
            if submission.language == "PY":
                output, error, exec_time = run_code(
                    submission.code, tc.input_data
                )

            # C++
            elif submission.language == "CPP":
                output, error, exec_time = run_cpp_code(
                    submission.code, tc.input_data
                )
            # Java
            elif submission.language == "JAVA":
                output, error, exec_time = run_java_code(
                    submission.code, tc.input_data
                )
            else:
                submission.verdict = "RE"
                submission.error_message = "Unsupported language"
                submission.save()
                return

            # Time Limit
            if error == "TLE":
                submission.verdict = "TLE"
                submission.error_message = "Time Limit Exceeded"
                submission.save()
                return

            # Compilation Error (C++)
            if submission.language in ["CPP","JAVA"] and error and "error:" in error.lower():
                submission.verdict = "CE"
                submission.error_message = error
                submission.save()
                return

            # Runtime Error
            if error:
                submission.verdict = "RE"
                submission.error_message = error
                submission.save()
                return

            # Wrong Answer
            if output.strip() != tc.expected_output.strip():
                submission.verdict = "WA"
                submission.save()
                return

            if exec_time:
                total_time += exec_time

        # All test cases passed
        submission.verdict = "AC"
        submission.execution_time = round(total_time, 4)
        submission.save()