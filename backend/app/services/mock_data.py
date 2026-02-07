from datetime import datetime, timedelta
from typing import List, Dict
import random

class MockDataService:
    """Generates realistic mock data for West Bengal flood predictions"""
    
    # West Bengal locations with realistic coordinates
    LOCATIONS = [
        {
            "id": "pred_ganges_kolkata_001",
            "name": "Kolkata Metropolitan Area",
            "basin": "Ganges-Hooghly",
            "lat": 22.5726,
            "lon": 88.3639,
            "severity": "HIGH",
            "risk": 0.87
        },
        {
            "id": "pred_teesta_jalpaiguri_002",
            "name": "Jalpaiguri District",
            "basin": "Teesta",
            "lat": 26.5167,
            "lon": 88.7167,
            "severity": "CRITICAL",
            "risk": 0.95
        },
        {
            "id": "pred_damodar_asansol_003",
            "name": "Asansol-Durgapur Region",
            "basin": "Damodar",
            "lat": 23.6739,
            "lon": 86.9524,
            "severity": "MODERATE",
            "risk": 0.42
        },
        {
            "id": "pred_hooghly_howrah_004",
            "name": "Howrah District",
            "basin": "Ganges-Hooghly",
            "lat": 22.5958,
            "lon": 88.2636,
            "severity": "HIGH",
            "risk": 0.78
        },
        {
            "id": "pred_torsa_coochbehar_005",
            "name": "Cooch Behar District",
            "basin": "Torsa",
            "lat": 26.3250,
            "lon": 89.4500,
            "severity": "MODERATE",
            "risk": 0.55
        },
        {
            "id": "pred_bhagirathi_murshidabad_006",
            "name": "Murshidabad District",
            "basin": "Bhagirathi",
            "lat": 24.1751,
            "lon": 88.2803,
            "severity": "LOW",
            "risk": 0.28
        },
        {
            "id": "pred_sundarbans_southday24_007",
            "name": "South 24 Parganas (Sundarbans)",
            "basin": "Coastal",
            "lat": 21.8079,
            "lon": 88.7614,
            "severity": "CRITICAL",
            "risk": 0.92
        },
        {
            "id": "pred_mahananda_malda_008",
            "name": "Malda District",
            "basin": "Mahananda",
            "lat": 25.0096,
            "lon": 88.1410,
            "severity": "MODERATE",
            "risk": 0.48
        },
        {
            "id": "pred_damodar_bankura_009",
            "name": "Bankura District",
            "basin": "Damodar",
            "lat": 23.2324,
            "lon": 87.0715,
            "severity": "LOW",
            "risk": 0.22
        },
        {
            "id": "pred_rupnarayan_westmidnapore_010",
            "name": "West Midnapore",
            "basin": "Rupnarayan",
            "lat": 22.4292,
            "lon": 87.3200,
            "severity": "MODERATE",
            "risk": 0.51
        }
    ]
    
    @staticmethod
    def get_current_predictions() -> Dict:
        """Generate current predictions for all locations"""
        now = datetime.utcnow()
        
        predictions = []
        for loc in MockDataService.LOCATIONS:
            # Calculate time-based risk variations
            time_horizons = MockDataService._generate_time_horizons(loc["risk"])
            
            # Generate driving factors based on severity
            driving_factors = MockDataService._generate_driving_factors(loc["severity"])
            
            prediction = {
                "id": loc["id"],
                "location": {
                    "name": loc["name"],
                    "basin": loc["basin"],
                    "center": {
                        "lat": loc["lat"],
                        "lon": loc["lon"]
                    }
                },
                "current": {
                    "riskScore": loc["risk"],
                    "severityClass": loc["severity"],
                    "influenceRadius": MockDataService._calculate_radius(loc["risk"]),
                    "timeToPeak": MockDataService._calculate_time_to_peak(loc["risk"]),
                    "confidence": round(random.uniform(0.82, 0.95), 2)
                },
                "forecast": {
                    "peakDischarge": MockDataService._calculate_discharge(loc["risk"]),
                    "maxWaterDepth": round(loc["risk"] * 6.0, 1),
                    "affectedAreaEstimate": round(loc["risk"] * 250.0, 1),
                    "floodDuration": int(loc["risk"] * 60)
                },
                "timeHorizons": time_horizons,
                "drivingFactors": driving_factors,
                "simulationAvailable": True,
                "hasHistoricalData": random.choice([True, False])
            }
            predictions.append(prediction)
        
        return {
            "metadata": {
                "modelVersion": "v2.3.1",
                "lastUpdated": now.isoformat() + "Z",
                "nextUpdate": (now + timedelta(hours=6)).isoformat() + "Z",
                "forecastCycle": f"IMD_{now.strftime('%Y%m%d_%H')}",
                "coverageArea": "West Bengal",
                "totalLocations": len(predictions)
            },
            "predictions": predictions
        }
    
    @staticmethod
    def _generate_time_horizons(base_risk: float) -> Dict:
        """Generate risk progression over time"""
        return {
            "6h": {
                "riskScore": round(max(0.0, base_risk - 0.22), 2),
                "severityClass": MockDataService._risk_to_severity(base_risk - 0.22),
                "timeToPeak": MockDataService._calculate_time_to_peak(base_risk) + 6
            },
            "12h": {
                "riskScore": round(max(0.0, base_risk - 0.09), 2),
                "severityClass": MockDataService._risk_to_severity(base_risk - 0.09),
                "timeToPeak": MockDataService._calculate_time_to_peak(base_risk)
            },
            "24h": {
                "riskScore": base_risk,
                "severityClass": MockDataService._risk_to_severity(base_risk),
                "timeToPeak": max(-6, MockDataService._calculate_time_to_peak(base_risk) - 12)
            },
            "72h": {
                "riskScore": round(max(0.0, base_risk - 0.35), 2),
                "severityClass": MockDataService._risk_to_severity(base_risk - 0.35),
                "timeToPeak": max(-54, MockDataService._calculate_time_to_peak(base_risk) - 60)
            }
        }
    
    @staticmethod
    def _generate_driving_factors(severity: str) -> Dict:
        """Generate realistic driving factors based on severity"""
        factor_ranges = {
            "LOW": {"rainfall": (20, 60), "discharge": (5000, 15000), "saturation": (0.3, 0.5)},
            "MODERATE": {"rainfall": (60, 120), "discharge": (15000, 30000), "saturation": (0.5, 0.7)},
            "HIGH": {"rainfall": (120, 200), "discharge": (30000, 50000), "saturation": (0.7, 0.9)},
            "CRITICAL": {"rainfall": (200, 350), "discharge": (50000, 80000), "saturation": (0.9, 0.99)}
        }
        
        ranges = factor_ranges.get(severity, factor_ranges["MODERATE"])
        
        factors = {
            "rainfall24h": round(random.uniform(*ranges["rainfall"]), 1),
            "upstreamDischarge": round(random.uniform(*ranges["discharge"]), 0),
            "soilSaturation": round(random.uniform(*ranges["saturation"]), 2)
        }
        
        # Add coastal tide for coastal areas
        if random.random() > 0.7:
            factors["tideLevel"] = round(random.uniform(1.5, 3.2), 1)
        
        # Add reservoir release for dam areas
        if random.random() > 0.8:
            factors["reservoirRelease"] = round(random.uniform(200, 800), 0)
        
        # Add slope instability for hilly areas
        if severity in ["HIGH", "CRITICAL"] and random.random() > 0.6:
            factors["slopeInstability"] = True
        
        return factors
    
    @staticmethod
    def _calculate_radius(risk: float) -> float:
        """Calculate influence radius based on risk"""
        return round(3000 + (risk * 10000), 0)
    
    @staticmethod
    def _calculate_time_to_peak(risk: float) -> int:
        """Calculate time to peak flooding"""
        return int(24 - (risk * 18))
    
    @staticmethod
    def _calculate_discharge(risk: float) -> float:
        """Calculate peak discharge"""
        return round(10000 + (risk * 70000), 0)
    
    @staticmethod
    def _risk_to_severity(risk: float) -> str:
        """Convert risk score to severity class"""
        if risk >= 0.85:
            return "CRITICAL"
        elif risk >= 0.6:
            return "HIGH"
        elif risk >= 0.3:
            return "MODERATE"
        else:
            return "LOW"
    
    @staticmethod
    def get_simulation_frames(prediction_id: str) -> Dict:
        """Generate simulation frame data for a prediction"""
        # Find the location
        location = next((loc for loc in MockDataService.LOCATIONS if loc["id"] == prediction_id), None)
        if not location:
            return None
        
        risk = location["risk"]
        peak_depth = round(risk * 6.0, 1)
        peak_area = round(risk * 250.0, 1)
        
        # Generate frames (0h, 6h, 12h, 18h, 24h, 36h, 48h)
        frames = []
        time_points = [0, 6, 12, 18, 24, 36, 48]
        
        for i, time_offset in enumerate(time_points):
            # Calculate water level progression (rises then falls)
            if time_offset <= 18:
                water_level = (time_offset / 18) * 1.0
            else:
                water_level = max(0, 1.0 - ((time_offset - 18) / 30))
            
            depth = round(water_level * peak_depth, 1)
            area = round(water_level * peak_area, 1)
            
            frame = {
                "timeOffset": time_offset,
                "timeLabel": f"T+{time_offset}h" if time_offset > 0 else "T+0h (Now)",
                "timestamp": (datetime.utcnow() + timedelta(hours=time_offset)).isoformat() + "Z",
                "waterLevel": round(water_level, 2),
                "depth": depth,
                "affectedArea": area,
                "imageUrl": f"https://cdn.yourapp.com/simulations/{prediction_id}/frame_{time_offset:02d}.png",
                "thumbnailUrl": f"https://cdn.yourapp.com/simulations/{prediction_id}/thumb_{time_offset:02d}.png",
            }
            
            if time_offset == 18:
                frame["isPeak"] = True
                frame["timeLabel"] += " (Peak)"
            
            frames.append(frame)
        
        # Calculate bounds (roughly ±0.15 degrees around center)
        bounds = {
            "west": round(location["lon"] - 0.15, 4),
            "south": round(location["lat"] - 0.15, 4),
            "east": round(location["lon"] + 0.15, 4),
            "north": round(location["lat"] + 0.15, 4)
        }
        
        return {
            "predictionId": prediction_id,
            "location": {
                "name": location["name"],
                "basin": location["basin"]
            },
            "simulation": {
                "source": f"LISFLOOD_v4.2_scenario_{location['basin'].lower().replace('-', '_')}_{datetime.utcnow().strftime('%Y%m%d')}",
                "resolution": "500m",
                "totalDuration": 48,
                "frameCount": len(frames),
                "recommendedFPS": 1
            },
            "bounds": bounds,
            "frames": frames,
            "legend": {
                "depthScale": [
                    {"depth": 0.0, "color": "#FFFFFF00", "label": "No flood"},
                    {"depth": 0.5, "color": "#B3E5FC", "label": "0.5m"},
                    {"depth": 1.0, "color": "#4FC3F7", "label": "1m"},
                    {"depth": 2.0, "color": "#0288D1", "label": "2m"},
                    {"depth": 3.0, "color": "#01579B", "label": "3m"},
                    {"depth": 5.0, "color": "#1A237E", "label": "5m+"}
                ]
            },
            "metadata": {
                "peakFrame": 3,
                "peakDepth": peak_depth,
                "peakArea": peak_area,
                "recessionTime": 30
            }
        }
    
    @staticmethod
    def get_alerts() -> Dict:
        """Generate alert messages from predictions"""
        alerts = []
        now = datetime.utcnow()
        
        # Generate alerts for HIGH and CRITICAL severity locations
        for loc in MockDataService.LOCATIONS:
            if loc["severity"] in ["HIGH", "CRITICAL"]:
                alert = {
                    "id": f"alert_{len(alerts) + 1:03d}",
                    "predictionId": loc["id"],
                    "type": "FLOOD_WARNING",
                    "severity": loc["severity"],
                    "title": f"{loc['name']} - {'Critical Flood Alert' if loc['severity'] == 'CRITICAL' else 'Severe Flood Warning'}",
                    "description": MockDataService._generate_alert_description(loc),
                    "issuedAt": now.isoformat() + "Z",
                    "validUntil": (now + timedelta(hours=48)).isoformat() + "Z",
                    "affectedRegions": MockDataService._get_affected_regions(loc["name"]),
                    "actions": MockDataService._get_safety_actions(loc["severity"])
                }
                alerts.append(alert)
        
        return {"alerts": alerts}
    
    @staticmethod
    def _generate_alert_description(location: Dict) -> str:
        """Generate alert description"""
        time_to_peak = MockDataService._calculate_time_to_peak(location["risk"])
        depth = round(location["risk"] * 6.0, 1)
        
        if location["severity"] == "CRITICAL":
            return f"Extreme flood conditions predicted in {location['name']}. Peak flooding expected in {time_to_peak} hours with water depth up to {depth} meters. Immediate evacuation advised for riverside areas."
        else:
            return f"High flood risk predicted in {location['name']}. Peak flooding expected in {time_to_peak} hours with water depth up to {depth} meters."
    
    @staticmethod
    def _get_affected_regions(location_name: str) -> List[str]:
        """Get affected sub-regions"""
        region_map = {
            "Kolkata Metropolitan Area": ["North Kolkata", "Salt Lake", "Park Street", "Howrah"],
            "Jalpaiguri District": ["Jalpaiguri Town", "Mainaguri", "Mal", "Nagrakata"],
            "Howrah District": ["Howrah City", "Uluberia", "Shyampur", "Bagnan"],
            "South 24 Parganas (Sundarbans)": ["Gosaba", "Basanti", "Kultali", "Patharpratima"],
        }
        return region_map.get(location_name, [location_name])
    
    @staticmethod
    def _get_safety_actions(severity: str) -> List[str]:
        """Get safety action recommendations"""
        if severity == "CRITICAL":
            return [
                "Evacuate low-lying areas immediately",
                "Do not cross flooded bridges or roads",
                "Contact local disaster management authorities",
                "Move to designated evacuation shelters"
            ]
        else:
            return [
                "Move to higher ground if in low-lying areas",
                "Avoid travel through flooded roads",
                "Keep emergency supplies ready",
                "Monitor updates from local authorities"
            ]
    
    @staticmethod
    def get_severity_levels() -> Dict:
        """Get severity level configuration"""
        return {
            "severityLevels": [
                {
                    "class": "LOW",
                    "color": "#4CAF50",
                    "riskRange": [0.0, 0.3],
                    "heatmapOpacity": 0.3,
                    "description": "Minor flooding possible in isolated areas"
                },
                {
                    "class": "MODERATE",
                    "color": "#FF9800",
                    "riskRange": [0.3, 0.6],
                    "heatmapOpacity": 0.5,
                    "description": "Moderate flooding expected, stay alert"
                },
                {
                    "class": "HIGH",
                    "color": "#FF5722",
                    "riskRange": [0.6, 0.85],
                    "heatmapOpacity": 0.7,
                    "description": "Severe flooding likely, prepare to evacuate"
                },
                {
                    "class": "CRITICAL",
                    "color": "#D32F2F",
                    "riskRange": [0.85, 1.0],
                    "heatmapOpacity": 0.9,
                    "description": "Extreme flood conditions, evacuate immediately"
                }
            ]
        }
    
    @staticmethod
    def get_hydrograph(prediction_id: str) -> Dict:
        """Generate hydrograph time series data"""
        location = next((loc for loc in MockDataService.LOCATIONS if loc["id"] == prediction_id), None)
        if not location:
            return None
        
        base_discharge = MockDataService._calculate_discharge(location["risk"])
        now = datetime.utcnow()
        
        # Generate forecast points (every 6 hours for 48 hours)
        forecast = []
        for i in range(9):
            hours = i * 6
            timestamp = now + timedelta(hours=hours)
            
            # Discharge rises to peak at 18h, then falls
            if hours <= 18:
                discharge = base_discharge * 0.7 + (base_discharge * 0.3 * (hours / 18))
            else:
                discharge = base_discharge - (base_discharge * 0.3 * ((hours - 18) / 30))
            
            forecast.append({
                "timestamp": timestamp.isoformat() + "Z",
                "discharge": round(discharge, 0)
            })
        
        # Generate observed points (last 3 hours)
        observed = []
        for i in range(4):
            hours = -3 + i
            timestamp = now + timedelta(hours=hours)
            discharge = base_discharge * 0.7 + random.uniform(-2000, 2000)
            
            observed.append({
                "timestamp": timestamp.isoformat() + "Z",
                "discharge": round(discharge, 0)
            })
        
        return {
            "predictionId": prediction_id,
            "gaugeStation": f"{location['name']}_Station",
            "river": location["basin"].split("-")[0],
            "forecast": forecast,
            "observed": observed,
            "warningLevels": {
                "low": round(base_discharge * 0.5, 0),
                "medium": round(base_discharge * 0.7, 0),
                "high": round(base_discharge * 0.85, 0),
                "critical": round(base_discharge * 1.0, 0)
            }
        }

mock_service = MockDataService()
