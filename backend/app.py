from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import random
import time
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Store data in memory
disaster_data = {
    "points": [],
    "missions": [],
    "last_update": datetime.now().isoformat()
}

# Chennai locations
CHENNAI_LOCATIONS = [
    {"name": "Marina Beach", "lat": 13.0545, "lng": 80.2833},
    {"name": "Central Station", "lat": 13.0827, "lng": 80.2707},
    {"name": "Anna Nagar", "lat": 13.0866, "lng": 80.2100},
    {"name": "T. Nagar", "lat": 13.0418, "lng": 80.2341},
    {"name": "Adyar", "lat": 13.0067, "lng": 80.2566},
    {"name": "Velachery", "lat": 12.9792, "lng": 80.2210}
]

def generate_disaster_point(location):
    """Generate fake ESP32 sensor data"""
    severity = random.choice(["red", "orange", "yellow"])
    
    # Simulate sensor readings
    water_level = {
        "red": random.randint(80, 100),
        "orange": random.randint(60, 79),
        "yellow": random.randint(40, 59)
    }[severity]
    
    rainfall = {
        "red": random.randint(70, 120),
        "orange": random.randint(50, 69),
        "yellow": random.randint(30, 49)
    }[severity]
    
    return {
        "id": f"point_{int(time.time())}_{random.randint(1000, 9999)}",
        "name": location["name"],
        "lat": location["lat"],
        "lng": location["lng"],
        "severity": severity,
        "water_level": water_level,
        "rainfall": rainfall,
        "wind_speed": random.randint(20, 60),
        "timestamp": datetime.now().isoformat(),
        "assigned": False
    }

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/api/points')
def get_points():
    """Get all disaster points"""
    return jsonify({
        "points": disaster_data["points"],
        "last_update": disaster_data["last_update"],
        "count": len(disaster_data["points"])
    })

@app.route('/api/missions')
def get_missions():
    """Get all missions"""
    return jsonify({
        "missions": disaster_data["missions"],
        "count": len(disaster_data["missions"])
    })

@app.route('/api/assign', methods=['POST'])
def assign_mission():
    """Assign a mission to NGO/NDRF"""
    data = request.json
    point_id = data.get("point_id")
    agency = data.get("agency")
    
    # Find the point
    point = next((p for p in disaster_data["points"] if p["id"] == point_id), None)
    
    if not point:
        return jsonify({"error": "Point not found"}), 404
    
    # Remove from points list
    disaster_data["points"] = [p for p in disaster_data["points"] if p["id"] != point_id]
    
    # Create mission
    mission = {
        "id": f"mission_{int(time.time())}",
        "point_id": point_id,
        "location": point["name"],
        "severity": point["severity"],
        "agency": agency.upper(),
        "start_time": datetime.now().isoformat(),
        "progress": 0,
        "completed": False
    }
    
    disaster_data["missions"].append(mission)
    
    return jsonify({
        "success": True,
        "message": f"Mission assigned to {agency.upper()}",
        "mission": mission
    })

@app.route('/api/complete/<mission_id>', methods=['POST'])
def complete_mission(mission_id):
    """Complete a mission"""
    mission = next((m for m in disaster_data["missions"] if m["id"] == mission_id), None)
    
    if not mission:
        return jsonify({"error": "Mission not found"}), 404
    
    mission["completed"] = True
    mission["end_time"] = datetime.now().isoformat()
    mission["progress"] = 100
    
    # Remove from active missions
    disaster_data["missions"] = [m for m in disaster_data["missions"] if m["id"] != mission_id]
    
    return jsonify({
        "success": True,
        "message": "Mission completed",
        "mission": mission
    })

@app.route('/api/update', methods=['POST'])
def update_points():
    """Update disaster points"""
    # Keep only unassigned points
    disaster_data["points"] = [p for p in disaster_data["points"] if not p.get("assigned")]
    
    # Update existing points
    for point in disaster_data["points"]:
        # Simulate sensor changes
        point["water_level"] = max(0, min(100, point["water_level"] + random.randint(-5, 5)))
        point["rainfall"] = max(0, point["rainfall"] + random.randint(-3, 3))
        point["timestamp"] = datetime.now().isoformat()
    
    # Add new random points (30% chance)
    if random.random() < 0.3:
        location = random.choice(CHENNAI_LOCATIONS)
        new_point = generate_disaster_point(location)
        disaster_data["points"].append(new_point)
    
    disaster_data["last_update"] = datetime.now().isoformat()
    
    return jsonify({
        "success": True,
        "message": "Data updated",
        "points_count": len(disaster_data["points"])
    })

@app.route('/api/init')
def init_data():
    """Initialize with some disaster points"""
    disaster_data["points"] = []
    disaster_data["missions"] = []
    
    # Create 3-5 initial disaster points
    num_points = random.randint(3, 5)
    for _ in range(num_points):
        location = random.choice(CHENNAI_LOCATIONS)
        point = generate_disaster_point(location)
        disaster_data["points"].append(point)
    
    return jsonify({
        "success": True,
        "message": f"Initialized with {len(disaster_data['points'])} points",
        "points": disaster_data["points"]
    })

@app.route('/health')
def health():
    return jsonify(status="OK", message="Chennai Disaster Management System is running")

if __name__ == '__main__':
    print("🚀 Starting Chennai Disaster Management System...")
    print("🌐 Server running at http://localhost:5000")
    print("📊 Open http://localhost:5000 in your browser")
    app.run(debug=True, port=5000)
