import logging

logger = logging.getLogger(__name__)

def calculate_hos_timeline(current_loc, pickup_loc, dropoff_loc, leg1_dist, leg1_dur, leg2_dist, leg2_dur, current_cycle_used):
           
    remaining_cycle = 70.0 - float(current_cycle_used)
    
    driving_since_reset = 0.0
    duty_since_reset = 0.0
    driving_since_break = 0.0
    cycle_used_this_trip = 0.0
    
    total_miles_driven = 0.0
    miles_since_last_fuel = 0.0

    activities = []
    warnings = []

    current_time_minutes = 480 

    activities.append({
        "status": "off_duty",
        "duration_minutes": 480,
        "label": "Off Duty",
        "location": current_loc,
        "description": "Pre-trip rest period"
    })

    def add_activity(status, duration_mins, label, location, description=""):
        nonlocal current_time_minutes, remaining_cycle, cycle_used_this_trip
        activities.append({
            "status": status,
            "duration_minutes": int(duration_mins),
            "label": label,
            "location": location,
            "description": description
        })
        current_time_minutes += int(duration_mins)
                            
        if status in ["driving", "on_duty_not_driving"]:
            hours = duration_mins / 60.0
            remaining_cycle -= hours
            cycle_used_this_trip += hours

    def insert_10h_rest(location):
        nonlocal driving_since_reset, duty_since_reset, driving_since_break
        add_activity("off_duty", 600, "10-Hour Off-Duty Rest", location, "Mandatory HOS rest period")
        driving_since_reset = 0.0
        duty_since_reset = 0.0
        driving_since_break = 0.0

    def insert_30m_break(location):
        nonlocal driving_since_break, duty_since_reset
        add_activity("off_duty", 30, "30-Minute Break", location, "Mandatory 8-hour driving limit break")
        driving_since_break = 0.0
        duty_since_reset += 30.0

    def insert_34h_restart(location):
        nonlocal remaining_cycle, driving_since_reset, duty_since_reset, driving_since_break
        add_activity("off_duty", 2040, "34-Hour Restart", location, "Reset 70-hour cycle limit")
        remaining_cycle = 70.0
        driving_since_reset = 0.0
        duty_since_reset = 0.0
        driving_since_break = 0.0

    remaining_leg1_mins = leg1_dur * 60.0
    leg1_speed = leg1_dist / leg1_dur if leg1_dur > 0 else 55.0

    if remaining_cycle <= 0:
        warnings.append("70-Hour cycle fully depleted at start. Inserting a 34-hour restart.")
        insert_34h_restart(current_loc)

    while remaining_leg1_mins > 0:
                          
        limit_driving = (11.0 * 60.0) - driving_since_reset
        limit_duty = (14.0 * 60.0) - duty_since_reset
        limit_break = (8.0 * 60.0) - driving_since_break
        limit_cycle = remaining_cycle * 60.0

        if limit_cycle <= 0:
            warnings.append("70-Hour cycle limits reached. Triggering a 34-hour restart.")
            insert_34h_restart(current_loc)
            continue

        slice_mins = min(remaining_leg1_mins, limit_driving, limit_duty, limit_break, limit_cycle)

        slice_miles = (slice_mins / 60.0) * leg1_speed
        miles_to_fuel = 1000.0 - miles_since_last_fuel

        if slice_miles > miles_to_fuel:
                                                                       
            fuel_slice_mins = (miles_to_fuel / leg1_speed) * 60.0
            slice_mins = min(slice_mins, fuel_slice_mins)

        slice_miles = (slice_mins / 60.0) * leg1_speed
        add_activity("driving", slice_mins, "Driving to Pickup", current_loc, f"Driving segment ({slice_miles:.1f} miles)")
        
        driving_since_reset += slice_mins
        duty_since_reset += slice_mins
        driving_since_break += slice_mins
        total_miles_driven += slice_miles
        miles_since_last_fuel += slice_miles
        remaining_leg1_mins -= slice_mins

        if miles_since_last_fuel >= 1000.0:
                                                       
            if duty_since_reset + 30.0 > 14.0 * 60.0:
                insert_10h_rest(current_loc)
            add_activity("on_duty_not_driving", 30, "Fuel Stop", current_loc, "Fueling vehicle (30 min)")
                                                                               
            driving_since_break = 0.0
            duty_since_reset += 30.0
            miles_since_last_fuel = 0.0

        if remaining_leg1_mins > 0:
            if driving_since_reset >= 11.0 * 60.0 or duty_since_reset >= 14.0 * 60.0:
                insert_10h_rest(current_loc)
            elif driving_since_break >= 8.0 * 60.0:
                insert_30m_break(current_loc)

    if duty_since_reset + 60.0 > 14.0 * 60.0:
        insert_10h_rest(pickup_loc)

    add_activity("on_duty_not_driving", 60, "Pickup", pickup_loc, "Loading cargo (1 hour)")
    duty_since_reset += 60.0
    driving_since_break = 0.0                                                                       

    remaining_leg2_mins = leg2_dur * 60.0
    leg2_speed = leg2_dist / leg2_dur if leg2_dur > 0 else 55.0

    while remaining_leg2_mins > 0:
        limit_driving = (11.0 * 60.0) - driving_since_reset
        limit_duty = (14.0 * 60.0) - duty_since_reset
        limit_break = (8.0 * 60.0) - driving_since_break
        limit_cycle = remaining_cycle * 60.0

        if limit_cycle <= 0:
            warnings.append("70-Hour cycle limits reached. Triggering a 34-hour restart.")
            insert_34h_restart(pickup_loc)
            continue

        slice_mins = min(remaining_leg2_mins, limit_driving, limit_duty, limit_break, limit_cycle)

        slice_miles = (slice_mins / 60.0) * leg2_speed
        miles_to_fuel = 1000.0 - miles_since_last_fuel

        if slice_miles > miles_to_fuel:
            fuel_slice_mins = (miles_to_fuel / leg2_speed) * 60.0
            slice_mins = min(slice_mins, fuel_slice_mins)

        slice_miles = (slice_mins / 60.0) * leg2_speed
        add_activity("driving", slice_mins, "Driving to Dropoff", pickup_loc, f"Driving segment ({slice_miles:.1f} miles)")

        driving_since_reset += slice_mins
        duty_since_reset += slice_mins
        driving_since_break += slice_mins
        total_miles_driven += slice_miles
        miles_since_last_fuel += slice_miles
        remaining_leg2_mins -= slice_mins

        if miles_since_last_fuel >= 1000.0:
            if duty_since_reset + 30.0 > 14.0 * 60.0:
                insert_10h_rest(pickup_loc)
            add_activity("on_duty_not_driving", 30, "Fuel Stop", pickup_loc, "Fueling vehicle (30 min)")
            driving_since_break = 0.0
            duty_since_reset += 30.0
            miles_since_last_fuel = 0.0

        if remaining_leg2_mins > 0:
            if driving_since_reset >= 11.0 * 60.0 or duty_since_reset >= 14.0 * 60.0:
                insert_10h_rest(pickup_loc)
            elif driving_since_break >= 8.0 * 60.0:
                insert_30m_break(pickup_loc)

    if duty_since_reset + 60.0 > 14.0 * 60.0:
        insert_10h_rest(dropoff_loc)

    add_activity("on_duty_not_driving", 60, "Delivery", dropoff_loc, "Unloading cargo (1 hour)")
    duty_since_reset += 60.0
    driving_since_break = 0.0

    total_trip_mins = current_time_minutes
    final_day_mins_used = total_trip_mins % 1440
    if final_day_mins_used > 0:
        remaining_day_mins = 1440 - final_day_mins_used
        add_activity("off_duty", remaining_day_mins, "Off Duty", dropoff_loc, "End of trip rest")

    stops = []
    current_time_tracker = 480                           
    
    for act in activities[1:]:
        dur = act["duration_minutes"]
        if act["label"] in ["Pickup", "Delivery", "Fuel Stop", "30-Minute Break", "10-Hour Off-Duty Rest", "34-Hour Restart"]:
                         
            day_num = (current_time_tracker // 1440) + 1
            hour_val = (current_time_tracker % 1440) // 60
            min_val = (current_time_tracker % 1440) % 60
            time_str = f"Day {day_num} {hour_val:02d}:{min_val:02d}"

            stop_type = "break"
            if act["label"] == "Pickup":
                stop_type = "pickup"
            elif act["label"] == "Delivery":
                stop_type = "delivery"
            elif act["label"] == "Fuel Stop":
                stop_type = "fuel"
            elif act["label"] == "10-Hour Off-Duty Rest":
                stop_type = "rest"
            elif act["label"] == "34-Hour Restart":
                stop_type = "rest"

            stops.append({
                "type": stop_type,
                "label": act["label"],
                "location": act["location"],
                "time": time_str,
                "duration_minutes": dur,
                "status": act["status"]
            })
        current_time_tracker += dur

    if remaining_cycle < 0:
        warnings.append(f"70-Hour cycle would exceed limits by {-remaining_cycle:.2f} hours. A 34-hour restart was suggested or simulated to clear this limit.")

    compliance_status = "Compliant" if not warnings else "Warning"

    return activities, stops, warnings, compliance_status, cycle_used_this_trip