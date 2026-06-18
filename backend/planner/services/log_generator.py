import datetime
import logging

logger = logging.getLogger(__name__)

def generate_daily_logs(activities, start_date_str="2026-06-16"):
           
    try:
        start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except Exception:
        start_date = datetime.date(2026, 6, 16)

    daily_buckets = []
    current_day_activities = []
    current_day_minutes = 0

    for act in activities:
        rem_duration = act["duration_minutes"]
        
        while rem_duration > 0:
            space_left_in_day = 1440 - current_day_minutes
            if rem_duration <= space_left_in_day:
                                              
                current_day_activities.append({
                    "status": act["status"],
                    "duration_minutes": rem_duration,
                    "label": act["label"],
                    "location": act["location"],
                    "description": act.get("description", ""),
                    "start_min_in_day": current_day_minutes,
                    "end_min_in_day": current_day_minutes + rem_duration
                })
                current_day_minutes += rem_duration
                rem_duration = 0
            else:
                                  
                current_day_activities.append({
                    "status": act["status"],
                    "duration_minutes": space_left_in_day,
                    "label": act["label"],
                    "location": act["location"],
                    "description": act.get("description", ""),
                    "start_min_in_day": current_day_minutes,
                    "end_min_in_day": 1440
                })
                                                 
                daily_buckets.append(current_day_activities)
                current_day_activities = []
                current_day_minutes = 0
                rem_duration -= space_left_in_day

    if current_day_activities:
        daily_buckets.append(current_day_activities)

    daily_logs = []
    
    for i, bucket in enumerate(daily_buckets):
        day_date = start_date + datetime.timedelta(days=i)
        date_str = day_date.strftime("%Y-%m-%d")

        totals_min = {
            "off_duty": 0,
            "sleeper_berth": 0,
            "driving": 0,
            "on_duty_not_driving": 0
        }
        
        day_activities = []
        remarks = []
        
        from_loc = bucket[0]["location"] if bucket else "Unknown"
        to_loc = bucket[-1]["location"] if bucket else "Unknown"
        
        is_en_route = False
        driving_locs = []
        for act in bucket:
            status = act["status"]
            totals_min[status] += act["duration_minutes"]
            
            sh = act["start_min_in_day"] // 60
            sm = act["start_min_in_day"] % 60
            eh = act["end_min_in_day"] // 60
            em = act["end_min_in_day"] % 60
            
            day_activities.append({
                "start": f"{sh:02d}:{sm:02d}",
                "end": f"{eh:02d}:{em:02d}",
                "status": status,
                "label": act["label"],
                "location": act["location"],
                "description": act["description"],
                "start_min": act["start_min_in_day"],
                "end_min": act["end_min_in_day"]
            })
            
            time_str = f"{sh:02d}:{sm:02d}"
            if act["label"] == "Pickup":
                remarks.append(f"{time_str} Pickup at {act['location']}")
            elif act["label"] == "Delivery":
                remarks.append(f"{time_str} Delivery at {act['location']}")
            elif act["label"] == "Fuel Stop":
                remarks.append(f"{time_str} Fuel Stop at {act['location']}")
            elif act["label"] == "30-Minute Break":
                remarks.append(f"{time_str} Took 30-Minute Break")
            elif act["label"] == "10-Hour Off-Duty Rest":
                remarks.append(f"{time_str} Started 10-Hour Off-Duty Rest at {act['location']}")
            elif act["label"] == "34-Hour Restart":
                remarks.append(f"{time_str} Started 34-Hour Restart at {act['location']}")
            elif act["label"] == "Driving to Pickup" and act["start_min_in_day"] == 480 and i == 0:
                remarks.append(f"{time_str} Started trip from {act['location']}")
            
            if "Driving" in act["label"]:
                is_en_route = True
                driving_locs.append(act["location"])

        if is_en_route and to_loc == from_loc:
                                                                           
            if "Pickup" in [a["label"] for a in bucket]:
                to_loc = "En route to Pickup"
            else:
                to_loc = "En route to Destination"

        totals_hours = {k: round(v / 60.0, 2) for k, v in totals_min.items()}
                                    
        miles_today = 0.0
        for act in bucket:
            if act["status"] == "driving" and "(" in act["description"]:
                try:
                    parts = act["description"].split("(")
                    if len(parts) > 1:
                        mile_part = parts[1].replace(" miles)", "")
                        miles_today += float(mile_part)
                except Exception:
                    pass
        
        sum_hours = sum(totals_hours.values())
        if abs(sum_hours - 24.0) > 0.05:
                                                                      
            diff = 24.0 - sum_hours
            totals_hours["off_duty"] = round(totals_hours["off_duty"] + diff, 2)

        daily_logs.append({
            "day": i + 1,
            "date": date_str,
            "from": from_loc,
            "to": to_loc,
            "total_miles": round(miles_today, 1),
            "activities": day_activities,
            "totals": totals_hours,
            "remarks": remarks
        })

    return daily_logs