import requests
import logging
import math

logger = logging.getLogger(__name__)

def haversine_distance(lat1, lon1, lat2, lon2):
           
    R = 3958.8                         
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 +        math.cos(phi1) * math.cos(phi2) *        math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def fetch_osrm_route(start_coords, end_coords):
           
    lat1, lon1 = start_coords["lat"], start_coords["lng"]
    lat2, lon2 = end_coords["lat"], end_coords["lng"]

    url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=true"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data and data.get("routes"):
                route = data["routes"][0]
                geometry = route["geometry"]["coordinates"]                     
                                                               
                leaflet_coords = [[pt[1], pt[0]] for pt in geometry]
                distance_meters = route["distance"]
                duration_seconds = route["duration"]
                
                distance_miles = distance_meters * 0.000621371
                duration_hours = duration_seconds / 3600.0
                
                instructions = []
                for leg in route.get("legs", []):
                    for step in leg.get("steps", []):
                        name = step.get("name", "")
                        maneuver = step.get("maneuver", {}).get("type", "")
                        modifier = step.get("maneuver", {}).get("modifier", "")
                        inst_text = f"{maneuver.title()} {modifier} onto {name}" if name else f"{maneuver.title()} {modifier}"
                        instructions.append(inst_text)

                return leaflet_coords, distance_miles, duration_hours, instructions
    except Exception as e:
        logger.error(f"OSRM Route API failed: {e}")

    logger.warning("OSRM API failed. Falling back to straight line distance at 55 mph.")
    distance_miles = haversine_distance(lat1, lon1, lat2, lon2)
    duration_hours = distance_miles / 55.0
    leaflet_coords = [[lat1, lon1], [lat2, lon2]]
    instructions = [f"Head straight from source to destination ({distance_miles:.1f} miles)."]
    
    return leaflet_coords, distance_miles, duration_hours, instructions

def get_trip_routing(current, pickup, dropoff):
           
    leg1_coords, leg1_dist, leg1_dur, leg1_inst = fetch_osrm_route(current, pickup)
                              
    leg2_coords, leg2_dist, leg2_dur, leg2_inst = fetch_osrm_route(pickup, dropoff)

    total_miles = leg1_dist + leg2_dist
    
    combined_geometry = leg1_coords + leg2_coords[1:] if leg2_coords else leg1_coords

    return {
        "leg1": {
            "distance_miles": leg1_dist,
            "duration_hours": leg1_dur,
            "coords": leg1_coords,
            "instructions": leg1_inst
        },
        "leg2": {
            "distance_miles": leg2_dist,
            "duration_hours": leg2_dur,
            "coords": leg2_coords,
            "instructions": leg2_inst
        },
        "total_miles": total_miles,
        "combined_geometry": combined_geometry
    }