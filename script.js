// Frontend JavaScript that connects to backend

const API_URL = "http://localhost:5000/api";

let map;
let markers = {};
let updateInterval = 5 * 60; // 5 minutes in seconds
let timerInterval;

// Initialize
async function init() {
    await initData();
    initMap();
    startUpdateTimer();
    await updateData();
}

// Initialize with backend data
async function initData() {
    try {
        const response = await fetch(`${API_URL}/init`);
        const data = await response.json();
        console.log("Data initialized:", data.message);
    } catch (error) {
        console.error("Failed to initialize:", error);
    }
}

// Initialize map
function initMap() {
    map = L.map('map').setView([13.0827, 80.2707], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

// Load data from backend
async function loadData() {
    try {
        const [pointsRes, missionsRes] = await Promise.all([
            fetch(`${API_URL}/points`),
            fetch(`${API_URL}/missions`)
        ]);
        
        const pointsData = await pointsRes.json();
        const missionsData = await missionsRes.json();
        
        return {
            points: pointsData.points || [],
            missions: missionsData.missions || []
        };
    } catch (error) {
        console.error("Error loading data:", error);
        return { points: [], missions: [] };
    }
}

// Update UI with data
async function updateUI() {
    const data = await loadData();
    updateMapMarkers(data.points);
    updatePendingMissions(data.points);
    updateActiveMissions(data.missions);
    updateStats(data);
}

// Update map markers
function updateMapMarkers(points) {
    // Clear old markers
    Object.values(markers).forEach(marker => {
        if (marker) map.removeLayer(marker);
    });
    markers = {};
    
    // Add new markers
    points.forEach(point => {
        if (!point.assigned) {
            addMarker(point);
        }
    });
}

function addMarker(point) {
    const color = getSeverityColor(point.severity);
    
    const marker = L.circleMarker([point.lat, point.lng], {
        radius: 15,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.8
    }).addTo(map);
    
    marker.bindPopup(`
        <strong>${point.name}</strong><br>
        Severity: <b style="color:${color}">${point.severity.toUpperCase()}</b><br>
        Water: ${point.water_level}%<br>
        Rain: ${point.rainfall}mm<br>
        Wind: ${point.wind_speed}km/h
    `);
    
    markers[point.id] = marker;
}

// Update pending missions list
function updatePendingMissions(points) {
    const container = document.getElementById('pending-missions');
    const pending = points.filter(p => !p.assigned);
    
    if (pending.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;">No pending missions</p>';
        return;
    }
    
    container.innerHTML = pending.map(point => `
        <div class="mission-card ${point.severity}">
            <div class="mission-header">
                <div class="mission-location">${point.name}</div>
                <div class="mission-severity severity-${point.severity}">
                    ${point.severity.toUpperCase()}
                </div>
            </div>
            <div class="mission-coords">
                📍 ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}
            </div>
            <div class="mission-actions">
                <button class="action-btn ngo" onclick="assignMission('${point.id}', 'ngo')">
                    NGO
                </button>
                <button class="action-btn ndrf" onclick="assignMission('${point.id}', 'ndrf')">
                    NDRF
                </button>
            </div>
        </div>
    `).join('');
}

// Update active missions list
function updateActiveMissions(missions) {
    const container = document.getElementById('active-missions');
    const active = missions.filter(m => !m.completed);
    
    if (active.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;">No active missions</p>';
        return;
    }
    
    container.innerHTML = active.map(mission => `
        <div class="active-mission-card">
            <div class="active-mission-header">
                <div class="mission-location">${mission.location}</div>
                <div class="mission-agency">${mission.agency}</div>
            </div>
            <div class="mission-transport">
                ${getTransport(mission.severity)}
            </div>
            <div class="mission-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${mission.severity}" style="width: ${mission.progress || 0}%"></div>
                </div>
            </div>
            <button class="complete-btn" onclick="completeMission('${mission.id}')">
                Complete Mission
            </button>
        </div>
    `).join('');
}

// Update statistics
function updateStats(data) {
    const red = data.points.filter(p => p.severity === 'red').length;
    const orange = data.points.filter(p => p.severity === 'orange').length;
    const yellow = data.points.filter(p => p.severity === 'yellow').length;
    
    document.getElementById('red-count').textContent = red;
    document.getElementById('orange-count').textContent = orange;
    document.getElementById('yellow-count').textContent = yellow;
    document.getElementById('active-count').textContent = data.missions.filter(m => !m.completed).length;
}

// Assign mission (call backend)
async function assignMission(pointId, agency) {
    try {
        const response = await fetch(`${API_URL}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ point_id: pointId, agency: agency })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ Mission assigned to ${agency.toUpperCase()}`);
            await updateUI();
        } else {
            alert(`❌ Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Assignment error:", error);
        alert("❌ Failed to assign mission");
    }
}

// Complete mission (call backend)
async function completeMission(missionId) {
    try {
        const response = await fetch(`${API_URL}/complete/${missionId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Mission completed!');
            await updateUI();
        }
    } catch (error) {
        console.error("Completion error:", error);
        alert("❌ Failed to complete mission");
    }
}

// Update data from backend
async function updateData() {
    try {
        await fetch(`${API_URL}/update`, { method: 'POST' });
        await updateUI();
    } catch (error) {
        console.error("Update error:", error);
    }
}

// Start update timer
function startUpdateTimer() {
    let seconds = updateInterval;
    
    timerInterval = setInterval(() => {
        seconds--;
        
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        document.getElementById('update-timer').textContent = 
            `${minutes}:${secs.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            updateData();
            seconds = updateInterval;
        }
    }, 1000);
}

// Helper functions
function getSeverityColor(severity) {
    switch(severity) {
        case 'red': return '#ef4444';
        case 'orange': return '#f97316';
        case 'yellow': return '#eab308';
    }
}

function getTransport(severity) {
    switch(severity) {
        case 'red': return '🚁 Helicopter';
        case 'orange': return '🚤 Boat';
        case 'yellow': return '🚚 Truck';
    }
}

// Initialize on page load
window.onload = init;

// Make functions available globally
window.assignMission = assignMission;
window.completeMission = completeMission;
