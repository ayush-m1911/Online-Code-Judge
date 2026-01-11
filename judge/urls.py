from django.urls import path
from .views import ProblemListView, ProblemDetailView, SubmitSolutionView
urlpatterns = [
    path('problems/', ProblemListView.as_view(), name='problem-list'),
    path('problems/<int:pk>/', ProblemDetailView.as_view(), name='problem-detail'),
    path('submit/', SubmitSolutionView.as_view(), name='submit-solution'),
]