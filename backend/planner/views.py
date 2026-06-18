from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

from planner.services.geocoding_service import geocode_location
from planner.services.routing_service import get_trip_routing
from planner.services.hos_calculator import calculate_hos_timeline
from planner.services.log_generator import generate_daily_logs

logger = logging.getLogger(__name__)

class TripPlanView(APIView):
           
    def post(self, request):
        data = request.data
        
        current_loc = data.get("current_location")
        pickup_loc = data.get("pickup_location")
        dropoff_loc = data.get("dropoff_location")
        current_cycle_used_raw = data.get("current_cycle_used")

        if not current_loc or not pickup_loc or not dropoff_loc:
            return Response(
                {"error": "All locations (current, pickup, dropoff) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            current_cycle_used = float(current_cycle_used_raw)
            if not (0 <= current_cycle_used <= 70):
                raise ValueError()
        except (TypeError, ValueError):
            return Response(
                {"error": "Current cycle used must be a number between 0 and 70."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            current_coords = geocode_location(current_loc)
            pickup_coords = geocode_location(pickup_loc)
            dropoff_coords = geocode_location(dropoff_loc)
        except ValueError as ve:
            return Response(
                {"error": str(ve)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        except Exception as e:
            logger.error(f"Geocoding error: {e}")
            return Response(
                {"error": "Internal geocoding service error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            route_data = get_trip_routing(current_coords, pickup_coords, dropoff_coords)
        except Exception as e:
            logger.error(f"Routing error: {e}")
            return Response(
                {"error": f"Failed to compute route: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            leg1_dist = route_data["leg1"]["distance_miles"]
            leg1_dur = route_data["leg1"]["duration_hours"]
            leg2_dist = route_data["leg2"]["distance_miles"]
            leg2_dur = route_data["leg2"]["duration_hours"]

            activities, stops, warnings, compliance_status, cycle_used_this_trip = calculate_hos_timeline(
                current_coords["name"],
                pickup_coords["name"],
                dropoff_coords["name"],
                leg1_dist,
                leg1_dur,
                leg2_dist,
                leg2_dur,
                current_cycle_used
            )
        except Exception as e:
            logger.error(f"HOS Calculation error: {e}")
            return Response(
                {"error": f"Failed to calculate Hours of Service timeline: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            daily_logs = generate_daily_logs(activities)
        except Exception as e:
            logger.error(f"Daily log generation error: {e}")
            return Response(
                {"error": f"Failed to generate daily logs: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        instructions = []
        instructions.append(f"Start trip from {current_coords['name']}.")
        
        if route_data["leg1"]["instructions"]:
            instructions.extend(route_data["leg1"]["instructions"][:3])                                     
        instructions.append(f"Driving to pickup location at {pickup_coords['name']} ({leg1_dist:.1f} miles).")
        instructions.append(f"Performing pickup for 1 hour.")

        if route_data["leg2"]["instructions"]:
            instructions.extend(route_data["leg2"]["instructions"][:3])
        instructions.append(f"Driving to dropoff location at {dropoff_coords['name']} ({leg2_dist:.1f} miles).")
        instructions.append(f"Performing delivery for 1 hour.")

        remaining_cycle = 70.0 - current_cycle_used - cycle_used_this_trip
        if remaining_cycle < 0:
            remaining_cycle = 0.0

        estimated_days = len(daily_logs)
        total_duration_hours = sum(act["duration_minutes"] for act in activities) / 60.0

        response_payload = {
            "summary": {
                "total_miles": round(route_data["total_miles"], 1),
                "total_duration_hours": round(total_duration_hours, 1),
                "current_cycle_used": current_cycle_used,
                "remaining_cycle": round(remaining_cycle, 1),
                "estimated_days": estimated_days,
                "hos_status": compliance_status
            },
            "locations": {
                "current": current_coords,
                "pickup": pickup_coords,
                "dropoff": dropoff_coords
            },
            "route_geometry": route_data["combined_geometry"],
            "stops": stops,
            "instructions": instructions,
            "daily_logs": daily_logs,
            "warnings": warnings
        }

        return Response(response_payload, status=status.HTTP_200_OK)