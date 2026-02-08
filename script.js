

// Chennai Disaster Management System

// Chennai locations data
const chennaiLocations = [
    { name: 'Marina Beach', lat: 13.0545, lng: 80.2833 },
    { name: 'Central Station', lat: 13.0827, lng: 80.2707 },
    { name: 'Anna Nagar', lat: 13.0866, lng: 80.2100 },
    { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
    { name: 'Adyar', lat: 13.0067, lng: 80.2566 },
    { name: 'Velachery', lat: 12.9792, lng: 80.2210 },
    { name: 'Koyambedu', lat: 13.0713, lng: 80.2026 },
    { name: 'Porur', lat: 13.0356, lng: 80.1581 }
];




// Disaster points storage
let disasterPoints = [];
let pendingMissions = [];
let activeMissions = [];
let updateTimer = 300; // 5 minutes in seconds

// Map initialization
let map;
let markers = {};

// Initialize the system
function init() {
    initMap();
    generateDisasterPoints();
    updateUI();
    startUpdateTimer();
    startESP32Integration();
}

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([13.0827, 80.2707], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    // Add Chennai water bodies
    L.polygon([
        [13.04, 80.25],
        [13.06, 80.27],
        [13.08, 80.29]
    ], {
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 0.2
    }).addTo(map);
}

// Generate random disaster points
function generateDisasterPoints() {
    disasterPoints = [];
    
    chennaiLocations.forEach(location => {
        if (Math.random() > 0.5) { // 50% chance of disaster
            const severity = getRandomSeverity();
            const point = {
                id: Date.now() + Math.random(),
                ...location,
                severity: severity,
                waterLevel: getWaterLevel(severity),
                rainfall: getRainfall(severity),
                timestamp: new Date().toLocaleTimeString()
            };
            
            disasterPoints.push(point);
            pendingMissions.push(point);
            addMapMarker(point);
        }
    });
}

function getRandomSeverity() {
    const rand = Math.random();
    if (rand < 0.3) return 'red';
    if (rand < 0.6) return 'orange';
    return 'yellow';
}

function getWaterLevel(severity) {
    switch(severity) {
        case 'red': return (80 + Math.random() * 20).toFixed(1);
        case 'orange': return (60 + Math.random() * 20).toFixed(1);
        case 'yellow': return (40 + Math.random() * 20).toFixed(1);
    }
}

function getRainfall(severity) {
    switch(severity) {
        case 'red': return (70 + Math.random() * 30).toFixed(1);
        case 'orange': return (50 + Math.random() * 20).toFixed(1);
        case 'yellow': return (30 + Math.random() * 20).toFixed(1);
    }
}

function getTransport(severity) {
    switch(severity) {
        case 'red': return '🚁 Helicopter';
        case 'orange': return '🚤 Boat';
        case 'yellow': return '🚚 Truck';
    }
}

// Add marker to map
function addMapMarker(point) {
    const color = getSeverityColor(point.severity);
    
    const marker = L.circleMarker([point.lat, point.lng], {
        radius: 15,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.8
    }).addTo(map);
    
    // Add popup
    marker.bindPopup(`
        <strong>${point.name}</strong><br>
        Severity: <b style="color:${color}">${point.severity.toUpperCase()}</b><br>
        Water Level: ${point.waterLevel}%<br>
        Rainfall: ${point.rainfall}mm
    `);
    
    markers[point.id] = marker;
}

function getSeverityColor(severity) {
    switch(severity) {
        case 'red': return '#ef4444';
        case 'orange': return '#f97316';
        case 'yellow': return '#eab308';
    }
}

// Update UI
function updateUI() {
    updatePendingMissions();
    updateActiveMissions();
    updateStats();
}

// Update pending missions list
function updatePendingMissions() {
    const container = document.getElementById('pending-missions');
    
    if (pendingMissions.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;">No pending missions</p>';
        return;
    }
    
    container.innerHTML = pendingMissions.map(mission => `
        <div class="mission-card ${mission.severity}">
            <div class="mission-header">
                <div class="mission-location">${mission.name}</div>
                <div class="mission-severity severity-${mission.severity}">
                    ${mission.severity.toUpperCase()}
                </div>
            </div>
            <div class="mission-coords">
                📍 ${mission.lat.toFixed(4)}, ${mission.lng.toFixed(4)}
            </div>
            <div class="mission-actions">
                <button class="action-btn ngo" onclick="assignMission(${mission.id}, 'NGO')">
                    NGO
                </button>
                <button class="action-btn ndrf" onclick="assignMission(${mission.id}, 'NDRF')">
                    NDRF
                </button>
            </div>
        </div>
    `).join('');
}

// Update active missions list
function updateActiveMissions() {
    const container = document.getElementById('active-missions');
    
    // Filter out missions that are marked for removal
    const activeFiltered = activeMissions.filter(m => !m.markedForRemoval);
    
    if (activeFiltered.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;">No active missions</p>';
        return;
    }
    
    container.innerHTML = activeFiltered.map(mission => {
        const progress = mission.progress || 0;
        const isCompleted = progress >= 100;
        
        return `
            <div class="active-mission-card">
                <div class="active-mission-header">
                    <div class="mission-location">${mission.location}</div>
                    <div class="mission-agency">${mission.agency}</div>
                </div>
                <div class="mission-transport">
                    ${getTransport(mission.severity)}
                </div>
                <div class="mission-progress">
                    <div class="progress-label">Rescue Progress: ${Math.round(progress)}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill ${mission.severity}" style="width: ${progress}%"></div>
                    </div>
                </div>
                ${isCompleted ? '<div class="mission-completed">✅ Mission Completed!</div>' : ''}
                <button class="complete-btn" onclick="completeMission('${mission.id}')" ${isCompleted ? 'disabled' : ''}>
                    ${isCompleted ? 'Mission Complete' : 'Complete Mission'}
                </button>
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStats() {
    const red = disasterPoints.filter(p => p.severity === 'red').length;
    const orange = disasterPoints.filter(p => p.severity === 'orange').length;
    const yellow = disasterPoints.filter(p => p.severity === 'yellow').length;
    
    // Count only missions not marked for removal and not completed
    const activeCount = activeMissions.filter(m => !m.markedForRemoval && m.progress < 100).length;
    
    document.getElementById('red-count').textContent = red;
    document.getElementById('orange-count').textContent = orange;
    document.getElementById('yellow-count').textContent = yellow;
    document.getElementById('active-count').textContent = activeCount;
}

// Assign mission to NGO or NDRF
function assignMission(pointId, agency) {
    const mission = pendingMissions.find(m => m.id === pointId);
    
    if (!mission) return;
    
    // Remove from pending
    pendingMissions = pendingMissions.filter(m => m.id !== pointId);
    
    // Add to active
    const activeMission = {
        id: Date.now() + Math.random(),
        location: mission.name,
        severity: mission.severity,
        agency: agency,
        progress: 0,
        startTime: new Date(),
        markedForRemoval: false
    };
    
    activeMissions.push(activeMission);
    
    // Update marker style
    const marker = markers[pointId];
    if (marker) {
        marker.setStyle({
            fillOpacity: 0.3,
            color: '#94a3b8'
        });
    }
    
    updateUI();
    showNotification(`✅ Mission assigned to ${agency}`);
}

// Complete a mission
function completeMission(missionId) {
    // Find the mission
    const missionIndex = activeMissions.findIndex(m => m.id === missionId);
    
    if (missionIndex !== -1) {
        // Mark for removal
        activeMissions[missionIndex].markedForRemoval = true;
        
        // Get mission details for notification
        const mission = activeMissions[missionIndex];
        
        // Remove from active missions after 1 second
        setTimeout(() => {
            activeMissions.splice(missionIndex, 1);
            updateUI();
            showNotification(`✅ Mission completed at ${mission.location}!`);
        }, 1000);
    }
}

// Show temporary notification
function showNotification(message) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Start update timer
function startUpdateTimer() {
    setInterval(() => {
        updateTimer--;
        
        const minutes = Math.floor(updateTimer / 60);
        const seconds = updateTimer % 60;
        
        document.getElementById('update-timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update every 5 minutes
        if (updateTimer <= 0) {
            updateDisasterPoints();
            updateTimer = 300;
        }
    }, 1000);
}

// Update disaster points (simulate ESP32 data)
function updateDisasterPoints() {
    // Update existing points
    disasterPoints.forEach(point => {
        if (!activeMissions.find(m => m.location === point.name)) {
            point.waterLevel = (parseFloat(point.waterLevel) + (Math.random() - 0.5) * 5).toFixed(1);
            point.rainfall = (parseFloat(point.rainfall) + (Math.random() - 0.5) * 3).toFixed(1);
            point.timestamp = new Date().toLocaleTimeString();
            
            // Update marker if exists
            const marker = markers[point.id];
            if (marker) {
                marker.setPopupContent(`
                    <strong>${point.name}</strong><br>
                    Severity: <b style="color:${getSeverityColor(point.severity)}">${point.severity.toUpperCase()}</b><br>
                    Water Level: ${point.waterLevel}%<br>
                    Rainfall: ${point.rainfall}mm<br>
                    Updated: ${point.timestamp}
                `);
            }
        }
    });
    
    // Occasionally add new points
    if (Math.random() > 0.7) {
        const location = chennaiLocations[Math.floor(Math.random() * chennaiLocations.length)];
        
        if (!disasterPoints.find(p => p.name === location.name)) {
            const severity = getRandomSeverity();
            const point = {
                id: Date.now() + Math.random(),
                ...location,
                severity: severity,
                waterLevel: getWaterLevel(severity),
                rainfall: getRainfall(severity),
                timestamp: new Date().toLocaleTimeString()
            };
            
            disasterPoints.push(point);
            pendingMissions.push(point);
            addMapMarker(point);
        }
    }
    
    updateUI();
}

// Start mission progress simulation
async function startESP32Integration() {
    setInterval(async () => {
        try {
            const response = await fetch('/data');  // Your Flask endpoint
            const espData = await response.json();
            
            // Apply ESP32 water level to your existing disaster points
            chennaiLocations.forEach(location => {
                const severity = espData.water < 25 ? 'red' : 
                               espData.water < 50 ? 'orange' : 'yellow';
                
                // Update your existing points with LIVE ESP32 data
                const pointIndex = disasterPoints.findIndex(p => p.name === location.name);
                if(pointIndex > -1) {
                    disasterPoints[pointIndex].severity = severity;
                    disasterPoints[pointIndex].waterLevel = espData.water.toFixed(1);
                }
            });
            
            updateUI();  // Your existing function
        } catch(e) {
            console.log('ESP32 offline - using simulation');
        }
    }, 3000);
}

// Initialize on page load
window.onload = init;

// Make functions available globally
window.assignMission = assignMission;
window.completeMission = completeMission;
