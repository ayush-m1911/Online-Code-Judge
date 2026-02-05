from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Problem, Submission, TestCase
from .serializers import ProblemSerializer, SubmissionSerializer
from .utils import run_code, run_cpp_code, run_java_code
from rest_framework.response import Response

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
    
    

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission = serializer.save(user=request.user)

        testcases = TestCase.objects.filter(problem=submission.problem)

        total_time = 0

        for tc in testcases:

            if submission.language == "PY":
                output, error, exec_time = run_code(submission.code, tc.input_data)

            elif submission.language == "CPP":
                output, error, exec_time = run_cpp_code(submission.code, tc.input_data)

            elif submission.language == "JAVA":
                output, error, exec_time = run_java_code(submission.code, tc.input_data)

            else:
                submission.verdict = "RE"
                submission.error_message = "Unsupported language"
                submission.save()
                return Response(SubmissionSerializer(submission).data)

            if error == "TLE":
                submission.verdict = "TLE"
                submission.error_message = "Time Limit Exceeded"
                submission.save()
                return Response(SubmissionSerializer(submission).data)

            if submission.language in ["CPP", "JAVA"] and error and "error:" in error.lower():
                submission.verdict = "CE"
                submission.error_message = error
                submission.save()
                return Response(SubmissionSerializer(submission).data)

            if error:
                submission.verdict = "RE"
                submission.error_message = error
                submission.save()
                return Response(SubmissionSerializer(submission).data)

            user_output = (output or "").strip()
            expected_output = (tc.expected_output or "").strip()
            if user_output != expected_output:
                submission.verdict = "WA"
                submission.failed_input = tc.input_data
                submission.failed_expected_output = tc.expected_output
                submission.failed_user_output = output
                submission.save()
                return Response(SubmissionSerializer(submission).data)

            if exec_time:
                total_time += exec_time

        submission.verdict = "AC"
        submission.execution_time = round(total_time, 4)
        submission.save()

        return Response(SubmissionSerializer(submission).data)
