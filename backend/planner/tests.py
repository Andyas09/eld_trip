from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from planner.services.geocoding_service import geocode_location
from planner.services.hos_calculator import calculate_hos_timeline
from planner.services.log_generator import generate_daily_logs

class TripPlanTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_geocoding_fallback(self):
                                                                                        
        chicago = geocode_location("Chicago, IL")
        self.assertEqual(chicago["lat"], 41.8781)
        self.assertEqual(chicago["lng"], -87.6298)

    def test_geocoding_with_coordinates_and_name(self):
        result = geocode_location("-6.2146, 106.8451 || Special Capital Region of Jakarta, Java, Indonesia")
        self.assertEqual(result["lat"], -6.2146)
        self.assertEqual(result["lng"], 106.8451)
        self.assertEqual(result["name"], "Special Capital Region of Jakarta, Java, Indonesia")

    def test_hos_calculator_compliant(self):
                                                                                    
        activities, stops, warnings, compliance, cycle_used = calculate_hos_timeline(
            "Chicago, IL", "St. Louis, MO", "Dallas, TX",
            300.0, 5.5, 600.0, 11.0, 20.0
        )
        self.assertTrue(len(activities) > 0)
        self.assertEqual(compliance, "Compliant")
        self.assertEqual(len(warnings), 0)

    def test_log_generator_24_hours(self):
                                                                      
        activities, _, _, _, _ = calculate_hos_timeline(
            "Chicago, IL", "St. Louis, MO", "Dallas, TX",
            300.0, 5.5, 600.0, 11.0, 20.0
        )
        daily_logs = generate_daily_logs(activities)
        self.assertTrue(len(daily_logs) >= 2)
        for log in daily_logs:
                                                
            sum_hours = sum(log["totals"].values())
            self.assertAlmostEqual(sum_hours, 24.0, places=1)

    def test_api_view_success(self):
                                                                  
        url = reverse('trip-plan')
        data = {
            "current_location": "Chicago, IL",
            "pickup_location": "St. Louis, MO",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": 20
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("summary", response.data)
        self.assertIn("daily_logs", response.data)
        self.assertEqual(response.data["summary"]["hos_status"], "Compliant")

    def test_api_view_validation_error(self):
                                                                              
        url = reverse('trip-plan')
        data = {
            "current_location": "Chicago, IL",
            "pickup_location": "St. Louis, MO",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": 80                     
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)