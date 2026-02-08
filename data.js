// Chennai disaster locations (50+ points across Chennai)
const CHENNAI_LOCATIONS = [
    // North Chennai (15 points)
    { name: "Tondiarpet", lat: 13.121, lng: 80.256, area: "North", floodRisk: "high" },
    { name: "Royapuram", lat: 13.111, lng: 80.290, area: "North", floodRisk: "high" },
    { name: "Washermanpet", lat: 13.114, lng: 80.267, area: "North", floodRisk: "medium" },
    { name: "Moolakadai", lat: 13.099, lng: 80.247, area: "North", floodRisk: "low" },
    { name: "Manali", lat: 13.167, lng: 80.256, area: "North", floodRisk: "medium" },
    { name: "Madhavaram", lat: 13.148, lng: 80.230, area: "North", floodRisk: "low" },
    { name: "Red Hills", lat: 13.178, lng: 80.181, area: "North", floodRisk: "medium" },
    { name: "Korukkupet", lat: 13.117, lng: 80.278, area: "North", floodRisk: "high" },
    { name: "MKB Nagar", lat: 13.107, lng: 80.285, area: "North", floodRisk: "medium" },
    { name: "Vyasarapadi", lat: 13.124, lng: 80.261, area: "North", floodRisk: "low" },
    { name: "Thiruvottiyur", lat: 13.158, lng: 80.299, area: "North", floodRisk: "high" },
    { name: "Athipattu", lat: 13.187, lng: 80.220, area: "North", floodRisk: "medium" },
    { name: "Kavaraipettai", lat: 13.195, lng: 80.195, area: "North", floodRisk: "low" },
    { name: "Ponneri", lat: 13.317, lng: 80.194, area: "North", floodRisk: "medium" },
    { name: "Minjur", lat: 13.279, lng: 80.258, area: "North", floodRisk: "low" },
    
    // Central Chennai (15 points)
    { name: "Egmore", lat: 13.079, lng: 80.262, area: "Central", floodRisk: "medium" },
    { name: "Nungambakkam", lat: 13.060, lng: 80.240, area: "Central", floodRisk: "low" },
    { name: "T. Nagar", lat: 13.042, lng: 80.234, area: "Central", floodRisk: "high" },
    { name: "Mylapore", lat: 13.034, lng: 80.270, area: "Central", floodRisk: "medium" },
    { name: "Triplicane", lat: 13.057, lng: 80.277, area: "Central", floodRisk: "high" },
    { name: "Chintadripet", lat: 13.074, lng: 80.268, area: "Central", floodRisk: "medium" },
    { name: "Chepauk", lat: 13.063, lng: 80.287, area: "Central", floodRisk: "high" },
    { name: "Kodambakkam", lat: 13.051, lng: 80.220, area: "Central", floodRisk: "low" },
    { name: "West Mambalam", lat: 13.034, lng: 80.220, area: "Central", floodRisk: "medium" },
    { name: "Aminjikarai", lat: 13.067, lng: 80.229, area: "Central", floodRisk: "low" },
    { name: "Kilpauk", lat: 13.081, lng: 80.243, area: "Central", floodRisk: "medium" },
    { name: "Purasawalkam", lat: 13.090, lng: 80.258, area: "Central", floodRisk: "high" },
    { name: "Perambur", lat: 13.115, lng: 80.240, area: "Central", floodRisk: "medium" },
    { name: "Vepery", lat: 13.082, lng: 80.259, area: "Central", floodRisk: "low" },
    { name: "Park Town", lat: 13.082, lng: 80.274, area: "Central", floodRisk: "medium" },
    
    // South Chennai (20 points)
    { name: "Adyar", lat: 13.007, lng: 80.257, area: "South", floodRisk: "high" },
    { name: "Besant Nagar", lat: 12.999, lng: 80.267, area: "South", floodRisk: "medium" },
    { name: "Thiruvanmiyur", lat: 12.985, lng: 80.259, area: "South", floodRisk: "high" },
    { name: "Indira Nagar", lat: 13.023, lng: 80.248, area: "South", floodRisk: "low" },
    { name: "Kotturpuram", lat: 13.015, lng: 80.245, area: "South", floodRisk: "medium" },
    { name: "Guindy", lat: 13.008, lng: 80.220, area: "South", floodRisk: "low" },
    { name: "Saidapet", lat: 13.021, lng: 80.227, area: "South", floodRisk: "medium" },
    { name: "Velachery", lat: 12.979, lng: 80.221, area: "South", floodRisk: "high" },
    { name: "Perungudi", lat: 12.971, lng: 80.240, area: "South", floodRisk: "high" },
    { name: "Taramani", lat: 12.985, lng: 80.240, area: "South", floodRisk: "medium" },
    { name: "Medavakkam", lat: 12.918, lng: 80.197, area: "South", floodRisk: "low" },
    { name: "Mogappair", lat: 13.070, lng: 80.180, area: "South", floodRisk: "medium" },
    { name: "Nanganallur", lat: 12.984, lng: 80.191, area: "South", floodRisk: "low" },
    { name: "Pallavaram", lat: 12.968, lng: 80.151, area: "South", floodRisk: "medium" },
    { name: "Chromepet", lat: 12.952, lng: 80.142, area: "South", floodRisk: "high" },
    { name: "Tambaram", lat: 12.925, lng: 80.106, area: "South", floodRisk: "low" },
    { name: "Chengalpattu", lat: 12.699, lng: 79.977, area: "South", floodRisk: "medium" },
    { name: "Maraimalai Nagar", lat: 12.790, lng: 80.007, area: "South", floodRisk: "low" },
    { name: "Kelambakkam", lat: 12.799, lng: 80.231, area: "South", floodRisk: "high" },
    { name: "Kovalam", lat: 12.791, lng: 80.253, area: "South", floodRisk: "medium" }
];

// Severity colors
const SEVERITY_COLORS = {
    'red': '#ef4444',
    'orange': '#f97316',
    'yellow': '#eab308'
};

// Transport types
const TRANSPORT_TYPES = {
    'red': '🚁 Helicopter',
    'orange': '🚤 Boat',
    'yellow': '🚚 Truck'
};
