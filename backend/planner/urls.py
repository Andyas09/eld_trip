from django.urls import path
from planner.views import TripPlanView

urlpatterns = [
    path('trip-plan/', TripPlanView.as_view(), name='trip-plan'),
]