let map = L.map('map', { attributionControl: false }).setView([30, 70], 5);

// Add base layers
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 22 });
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{ maxZoom: 19 });

let baselayers = {
    'OSM': osm,
    'Satellite': satellite
};

// Add base layers to the control
L.control.layers(baselayers).addTo(map);

// Define a custom icon (if you want custom icons for your points)
let customIcon = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fa-solid fa-location-dot" aria-hidden="true" style="font-size: 24px; color: black;"></i>', // Customize icon size and color
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});


// Initialize the marker cluster group
// Create a marker cluster group
let markerClusterGroup = L.markerClusterGroup();

// Fetch the GeoJSON file
fetch('points.geojson')
.then(response => response.json())
.then(data => {
    let points = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: customIcon });  // Add custom icon for each point
        }
    });

    // Add the GeoJSON points to the marker cluster group
    markerClusterGroup.addLayer(points);

    // Add the marker cluster group to the map
    map.addLayer(markerClusterGroup);

    markerClusterGroup.bindTooltip(function(layer) {
        return "District: " + layer.feature.properties.District + 
               "<br>CO: " + layer.feature.properties.CO + 
               "<br>CO2: " + layer.feature.properties.CO2+  
               "<br>Nox: " + layer.feature.properties.Nox+ 
               "<br>HC: " + layer.feature.properties.HO; 
    });
});

// Define styles for divisions and their hover effect
// Define styles for roads and their hover effect
let roadStyle = {
    color: 'red',
    weight: 3,
    opacity: 1
};
let hoverroadStyle = {
    color: 'white',
    weight: 4,
    opacity: 0.6
};

// Define the variable for the roads layer to make it accessible
// Define a function to get the color based on Road_type
function getRoadColor(roadType) {
    switch (roadType) {
        case 'CPEC-Highway':
            return 'Red'; // Color for CPEC-Highway
        case 'Non CPEC-Highway':
            return '#CD7F32'; // Color for Non CPEC-Highway
        case 'CPEC-Motorway':
            return 'blue'; // Color for CPEC-Motorway
        default:
            return 'gray'; // Default color for any other type
    }
}

let pakroad;

// Fetch roads data and add it to the map
fetch('newroad.geojson')
    .then(response => response.json())
    .then(data => {
        pakroad = L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: getRoadColor(feature.properties.Road_type), // Get the color based on Road_type
                    weight: 3,
                    opacity: 1
                };
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup('Road Type: ' + feature.properties.Road_type + '<br>Road Name: ' + feature.properties.Road_Name);
                layer.on('mouseover', function() {
                    layer.setStyle({
                        color: 'white', // Hover color
                        weight: 4,
                        opacity: 0.8
                    });
                });
                layer.on('mouseout', function() {
                    layer.setStyle({
                        color: getRoadColor(feature.properties.Road_type), // Revert to the original color
                        weight: 3,
                        opacity: 1
                    });
                });
            }
        }).addTo(map);

        // Ensure roads are on top by bringing them to the front
        pakroad.bringToFront();
    })
    .catch(error => console.error('Error loading roads GeoJSON:', error));


// Define styles for divisions and their hover effect
let divStyle = {
    color: 'white',
    weight: 2,
    fillColor: 'blue',
    opacity: 0.6
};
let hoverStyle = {
    color: 'red',
    weight: 2,
    fillColor: 'yellow',
    opacity: 0.6
};

// Define the variable for the divisions layer to make it accessible
let pakshp;

// Fetch division data and add it to the map
fetch('pakdiv.json')
    .then(response => response.json())
    .then(data => {
        pakshp = L.geoJSON(data, {
            style: divStyle,
            onEachFeature: function(feature, layer) {
                layer.bindPopup('Division: ' + feature.properties.NAME_2);
                layer.on('mouseover', function() {
                    layer.setStyle(hoverStyle);
                });
                layer.on('mouseout', function() {
                    layer.setStyle(divStyle);
                });
            }
        }).addTo(map);
        pakshp.bringToBack();
        L.control.layers(null, {
            'Divisions': pakshp,
            'Roads': pakroad,
            'District':markerClusterGroup
        }, {
            collapsed: false,
            position: 'bottomright'
        }).addTo(map);
    })
    .catch(error => console.error('Error loading divisions GeoJSON:', error));

// Layer control for enabling and disabling layers






