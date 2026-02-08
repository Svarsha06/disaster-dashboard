class ChennaiDisasterSystem {
    constructor() {
        this.map = null;
        this.markers = {};
        this.disasterPoints = [];
        this.pendingMissions = [];
        this.activeMissions = [];
        this.completedMissions = [];
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.nextUpdate = Date.now() + this.updateInterval;
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.initDisasterPoints();
        this.updateUI();
        this.startTimers();
    }
    
    initMap() {
        // Create map centered on Chennai
        this.map = L.map('map').setView([13.0827, 80.2707], 11);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add water bodies
        this.addWaterBodies();
    }
    
    addWaterBodies() {
        // Adyar River
        L.polygon([
            [13.04, 80.25], [13.06, 80.27], [13.08, 80.29]
        ], {
            color: '#1d4ed8',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 1
        }).addTo(this.map);
        
        // Cooum River
        L.polygon([
            [13.06, 80.26], [13.07, 80.27], [13.08, 80.28]
        ], {
            color: '#1d4ed8',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 1
        }).addTo(this.map);
        
        // Buckingham Canal
        L.polygon([
            [12.98, 80.28], [13.00, 80.27], [13.02, 80.26]
        ], {
            color: '#1d4ed8',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 1
        }).addTo(this.map);
    }
    
    generateSensorData(location) {
        // Simulate ESP32 sensor readings
        const floodRisk = location.floodRisk;
        const baseWater = floodRisk === 'high' ? 0.6 : floodRisk === 'medium' ? 0.4 : 0.2;
        const baseRain = floodRisk === 'high' ? 50 : floodRisk === 'medium' ? 30 : 10;
        
        return {
            waterLevel: baseWater + Math.random() * 0.3,
            rainfall: baseRain + Math.random() * 20,
            windSpeed: 20 + Math.random() * 40,
            timestamp: new Date().toISOString()
        };
    }
    
    calculateSeverity(sensorData, floodRisk) {
        const waterLevel = sensorData.waterLevel;
        const rainfall = sensorData.rainfall;
        const windSpeed = sensorData.windSpeed;
        
        let score = 0;
        
        if (waterLevel > 0.8) score += 40;
        else if (waterLevel > 0.6) score += 30;
        else if (waterLevel > 0.4) score += 20;
        else if (waterLevel > 0.2) score += 10;
        
        if (rainfall > 70) score += 30;
        else if (rainfall > 50) score += 20;
        else if (rainfall > 30) score += 15;
        else if (rainfall > 10) score += 5;
        
        if (windSpeed > 60) score += 20;
        else if (windSpeed > 40) score += 15;
        else if (windSpeed > 25) score += 10;
        
        if (floodRisk === 'high') score += 10;
        else if (floodRisk === 'medium') score += 5;
        
        if (score >= 60) return 'red';
        if (score >= 40) return 'orange';
        if (score >= 20) return 'yellow';
        
        return null;
    }
    
    initDisasterPoints() {
        // Create 15-20 initial disaster points (random selection)
        const locations = [...CHENNAI_LOCATIONS];
        const randomLocations = [];
        
        // Pick 20 random locations
        for (let i = 0; i < 20; i++) {
            const randomIndex = Math.floor(Math.random() * locations.length);
            randomLocations.push(locations[randomIndex]);
            locations.splice(randomIndex, 1);
        }
        
        randomLocations.forEach(location => {
            const sensorData = this.generateSensorData(location);
            const severity = this.calculateSeverity(sensorData, location.floodRisk);
            
            if (severity) {
                const disasterPoint = {
                    id: Date.now() + Math.random(),
                    location: location.name,
                    coordinates: { lat: location.lat, lng: location.lng },
                    severity: severity,
                    sensorData: sensorData,
                    area: location.area,
                    timestamp: new Date().toISOString(),
                    assignedTo: null
                };
                
                this.disasterPoints.push(disasterPoint);
                this.pendingMissions.push(disasterPoint);
                this.addMapMarker(disasterPoint);
            }
        });
    }
    
    addMapMarker(disasterPoint) {
        const severity = disasterPoint.severity;
        const color = SEVERITY_COLORS[severity];
        
        // Create pulsing circle marker
        const marker = L.circleMarker(
            [disasterPoint.coordinates.lat, disasterPoint.coordinates.lng],
            {
                radius: 15,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            }
        ).addTo(this.map);
        
        // Add popup
        marker.bindPopup(`
            <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: ${color}">${disasterPoint.location}</h3>
                <p style="margin: 5px 0;"><strong>Severity:</strong> ${severity.toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Water Level:</strong> ${(disasterPoint.sensorData.waterLevel * 100).toFixed(1)}%</p>
                <p style="margin: 5px 0;"><strong>Rainfall:</strong> ${disasterPoint.sensorData.rainfall.toFixed(1)} mm</p>
                <p style="margin: 5px 0;"><strong>Wind:</strong> ${disasterPoint.sensorData.windSpeed.toFixed(1)} km/h</p>
            </div>
        `);
        
        this.markers[disasterPoint.id] = marker;
    }
    
    assignMission(disasterPointId, agency) {
        const pointIndex = this.pendingMissions.findIndex(p => p.id == disasterPointId);
        if (pointIndex === -1) return;
        
        const disasterPoint = this.pendingMissions[pointIndex];
        
        // Remove from pending
        this.pendingMissions.splice(pointIndex, 1);
        
        // Add to active missions
        const mission = {
            id: Date.now() + Math.random(),
            pointId: disasterPoint.id,
            location: disasterPoint.location,
            severity: disasterPoint.severity,
            assignedTo: agency,
            transport: TRANSPORT_TYPES[disasterPoint.severity],
            startTime: Date.now(),
            progress: 0
        };
        
        this.activeMissions.push(mission);
        
        // Update marker style
        const marker = this.markers[disasterPoint.id];
        if (marker) {
            marker.setStyle({
                fillOpacity: 0.3,
                color: '#94a3b8'
            });
        }
        
        this.updateUI();
    }
    
    completeMission(missionId) {
        const missionIndex = this.activeMissions.findIndex(m => m.id == missionId);
        if (missionIndex === -1) return;
        
        const mission = this.activeMissions[missionIndex];
        
        // Remove from active
        this.activeMissions.splice(missionIndex, 1);
        
        // Add to completed
        this.completedMissions.push(mission);
        
        // Remove marker from map
        const marker = this.markers[mission.pointId];
        if (marker) {
            this.map.removeLayer(marker);
            delete this.markers[mission.pointId];
        }
        
        this.updateUI();
    }
    
    updateDisasterPoints() {
        // Update existing points
        this.disasterPoints.forEach(point => {
            if (!point.assignedTo) {
                point.sensorData = this.generateSensorData({
                    floodRisk: point.sensorData.waterLevel > 0.6 ? 'high' : 
                              point.sensorData.waterLevel > 0.4 ? 'medium' : 'low'
                });
                
                const newSeverity = this.calculateSeverity(point.sensorData, 
                    point.sensorData.waterLevel > 0.6 ? 'high' : 
                    point.sensorData.waterLevel > 0.4 ? 'medium' : 'low');
                
                if (newSeverity !== point.severity) {
                    point.severity = newSeverity;
                    
                    // Update marker color
                    const marker = this.markers[point.id];
                    if (marker) {
                        marker.setStyle({
                            fillColor: SEVERITY_COLORS[newSeverity]
                        });
                    }
                }
            }
        });
        
        // Add 1-2 new random disaster points
        if (Math.random() < 0.3) {
            const availableLocations = CHENNAI_LOCATIONS.filter(loc => 
                !this.disasterPoints.some(p => p.location === loc.name)
            );
            
            if (availableLocations.length > 0) {
                const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
                const sensorData = this.generateSensorData(randomLocation);
                const severity = this.calculateSeverity(sensorData, randomLocation.floodRisk);
                
                if (severity) {
                    const disasterPoint = {
                        id: Date.now() + Math.random(),
                        location: randomLocation.name,
                        coordinates: { lat: randomLocation.lat, lng: randomLocation.lng },
                        severity: severity,
                        sensorData: sensorData,
                        area: randomLocation.area,
                        timestamp: new Date().toISOString(),
                        assignedTo: null
                    };
                    
                    this.disasterPoints.push(disasterPoint);
                    this.pendingMissions.push(disasterPoint);
                    this.addMapMarker(disasterPoint);
                }
            }
        }
        
        this.nextUpdate = Date.now() + this.updateInterval;
        this.updateUI();
    }
    
    updateUI() {
        // Update counts
        const redCount = this.disasterPoints.filter(p => p.severity === 'red' && !p.assignedTo).length;
        const orangeCount = this.disasterPoints.filter(p => p.severity === 'orange' && !p.assignedTo).length;
        const yellowCount = this.disasterPoints.filter(p => p.severity === 'yellow' && !p.assignedTo).length;
        
        document.getElementById('red-count').textContent = redCount;
        document.getElementById('orange-count').textContent = orangeCount;
        document.getElementById('yellow-count').textContent = yellowCount;
        document.getElementById('active-count').textContent = this.activeMissions.length;
        document.getElementById('completed-count').textContent = this.completedMissions.length;
        
        // Update pending missions list
        const pendingContainer = document.getElementById('pending-missions');
        pendingContainer.innerHTML = this.pendingMissions.map(point => `
            <div class="mission-item ${point.severity}">
                <div class="mission-location">${point.location}</div>
                <div class="mission-severity severity-${point.severity}">
                    ${point.severity.toUpperCase()}
                </div>
                <div class="mission-coords">
                    ${point.coordinates.lat.toFixed(4)}, ${point.coordinates.lng.toFixed(4)}
                </div>
                <div class="mission-actions">
                    <button class="action-btn ngo" onclick="system.assignMission('${point.id}', 'NGO')">
                        <i class="fas fa-hands-helping"></i> NGO
                    </button>
                    <button class="action-btn ndrf" onclick="system.assignMission('${point.id}', 'NDRF')">
                        <i class="fas fa-shield-alt"></i> NDRF
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update active missions list
        const activeContainer = document.getElementById('active-missions');
        activeContainer.innerHTML = this.activeMissions.map(mission => {
            const elapsed = Date.now() - mission.startTime;
            const progress = Math.min(100, (elapsed / 30000) * 100); // 30 seconds for demo
            
            return `
                <div class="active-mission-card">
                    <div class="mission-header">
                        <div class="mission-location">${mission.location}</div>
                        <div class="mission-transport">${mission.transport}</div>
                    </div>
                    <div class="mission-coords">
                        Assigned to: <strong>${mission.assignedTo}</strong>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${mission.severity}" style="width: ${progress}%"></div>
                    </div>
                    <button class="complete-btn" onclick="system.completeMission('${mission.id}')">
                        <i class="fas fa-check"></i> Mission Completed
                    </button>
                </div>
            `;
        }).join('');
        
        // Update time and date
        const now = new Date();
        document.getElementById('datetime').textContent = 
            now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        
        // Update next update timer
        const timeLeft = Math.max(0, this.nextUpdate - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        document.getElementById('next-update').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startTimers() {
        // Update progress every second
        setInterval(() => {
            this.updateUI();
        }, 1000);
        
        // Update disaster points every 30 seconds (for demo)
        setInterval(() => {
            this.updateDisasterPoints();
        }, 30000);
        
        // Random weather updates
        setInterval(() => {
            const weatherTypes = ['Normal', 'Heavy Rain', 'Cyclone Alert', 'Flood Warning'];
            const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            document.getElementById('weather-status').textContent = randomWeather;
        }, 15000);
    }
}

// Initialize the system
const system = new ChennaiDisasterSystem();

// Make system globally available
window.system = system;
