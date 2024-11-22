let map = L.map('map',{fullscreenControl: true,});
map.setView([30,70],5);
let osmLayer = L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=x13uWPynShOcbm8f2l2Q',{
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
}).addTo(map);

let satLayer = L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=x13uWPynShOcbm8f2l2Q',{
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    
});

let baseLayer = {
    'OSM':osmLayer,
    'Satelitte':satLayer
}
L.control.layers(baseLayer).addTo(map);

// Mouse event style functions
let HoverStyle = function (e) {
    var layer = e.target;
    layer.setStyle({ color: 'yellow', fillOpacity: 0.2,weight:3 });
    info.update(layer.feature.properties);
};

let defStyle = function (e) {
    pakshp.resetStyle(e.target); // Reset the style to the original
    info.update();
};
let onclick = function (e) {
    map.fitBounds(e.target.getBounds());
};


let effect = function onEachFeature (feature, layer) {
    layer.on({
        mouseover: HoverStyle,
        mouseout: defStyle,
        click: onclick
    });
    layer.bindPopup(`<b>District:</b> ${feature.properties.NAME_34}`); // Bind popup
};

// Global variable for choropleth layer
let pakshp;

fetch('choroplethshp.geojson')
    .then(response => response.json())
    .then(data => {
        pakshp = L.choropleth(data, {
            valueProperty: 'CO', // which property in the features to use
            scale: ['white', 'green'], // chroma.js scale - include as many as you like
            steps: 6, // number of breaks or steps in range
            mode: 'e', // q for quantile, e for equidistant, k for k-means
            style: {
                color: 'black', // border color
                weight: 0.3,
                fillOpacity: 0.8,
                dashArray:2,
            },
            onEachFeature: effect // Use the effect function
        }).addTo(map);
        pakshp.bringToBack();
        createLegend(pakshp);
        const searchControl = new L.Control.Search({
            layer: pakshp, // Specify the layer
            propertyName: 'NAME_34', // Property to search
            zoom: 10, // Zoom level when a result is found
            minLength: 2, // Minimum characters before search
            autoType: true, // Autocomplete
            moveToLocation: function(latlng, title, map) {
                // Smooth fly to the location
                map.flyTo(latlng, 14, {
                    animate: true,
                    duration: 4 // Duration in seconds
                });
            },
            textErr: 'Location not found', // Error message
            initial: true, // Initial search on load
            position: 'topleft', // Position of the control
            hideMarkerOnCollapse: true,
            textPlaceholder: 'Search for District'
        });
        
        map.addControl(searchControl); // Add control to the map
    })
    .catch(error => console.error('Error loading GeoJSON:', error)); // Catch and log any errors

var info = L.control({ position: 'topright' });

// Create an info control for the map
info.onAdd = function(map) {
    // Create a new div element with the class name "info"
    this._div = L.DomUtil.create('div', 'info'); 
    
    // Call the update method to initialize the div with content
    this.update(); 
    
    // Return the created div to be added to the map
    return this._div; 
};

// Method to update the content of the info control with feature properties
info.update = function(props) {
    // Set the inner HTML of the div to display information
    this._div.innerHTML = '<h4>Emission in GG/yr</h4>' + 
        // If props is defined, show the property values
        (props ? 
            `<b>${props.NAME_34}</b><br>CO: ${props.CO}</b><br>CO2: ${props.CO2}</b><br>HC: ${props.HC}</b><br>NOx: ${props.Nox}`
        // If props is not defined, show a default message
        : 'Hover over a district');
};

// Add the info box control to the map
info.addTo(map);


function getroadColor (roadtype){
    switch(roadtype){
        case 'CPEC-Motorway':
            return 'blue';
        case 'CPEC-Highway':
            return '#f20c0c';
        case 'Non CPEC-Highway':
            return '#b08205';
        default:
            return 'grey';
    }
}

let roadStyle = function rStyle(feature){
    return{color:getroadColor(feature.properties.Road_type),weight:2}
}

let hoverroad = function hoveronRoad(e){
    var layer = e.target;
    layer.setStyle({color:'white',weight:4})
}

let roadrest = function outroad(e){
    road.resetStyle();
}

let roadclick = function (e) {
    var layer = e.target;

    // Define the blink style
    let blinkStyle = { color: 'yellow', fillOpacity: 0.2, weight: 3,fillColor:'white' };
    let originalStyle = { color: 'red', fillOpacity: 0.8, weight: 1 }; // Adjust based on default style

    // Apply the blink effect
    layer.setStyle(blinkStyle);
    setTimeout(() => {
        layer.setStyle(originalStyle);
        setTimeout(() => {
            layer.setStyle(blinkStyle);
            setTimeout(() => {
                layer.setStyle(originalStyle);
            }, 200); // Duration of second blink (300ms)
        }, 200); // Time between blinks (300ms)
    }, 200); // Duration of first blink (300ms)
    // map.fitBounds(e.target.getBounds());
};

let roadEffect = function onEachFeature(feature,layer){
    layer.on({
        mouseover:hoverroad,
        mouseout:roadrest,
        click:roadclick
    })
    layer.bindPopup(`
        <b>Road Type:</b> ${feature.properties.Road_type}<br>
        <b>Road Name:</b> ${feature.properties.Road_Name}
    `);
}

let road;
fetch('newroad.geojson')
    .then(response => response.json())
    .then(data => {
        road = L.geoJSON(data, {
            style:roadStyle ,
            onEachFeature:roadEffect
        }).addTo(map);
        road.bringToFront();
    })
    .catch(error => console.error('Error loading GeoJSON:', error)); // Catch and log any errors

// Function to create a legend
function createLegend(choroplethLayer) {
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var limits = choroplethLayer.options.limits || []; // Get limits from choropleth layer
        var colors = choroplethLayer.options.colors || []; // Get colors from choropleth layer
        var labels = [];

        // // Add min & max to the legend
        // div.innerHTML = '<div class="labels"><div class="min">' + (limits[0] || '0') + '</div>' +
        //     '<div class="max">' + (limits[limits.length - 1] || '0') + '</div></div>';

         // Change min and max to display "Low" and "High"
         div.innerHTML = '<div class="labels"><div class="min">' + (limits[0] ? 'Low' : 'Low') + '</div>' +
         '<div class="max">' + (limits[limits.length - 1] ? 'High' : 'High') + '</div></div>';

        // Loop through limits and colors to create the legend labels
        limits.forEach(function (limit, index) {
            labels.push('<li style="background-color: ' + colors[index] + '"></li>');
        });

        div.innerHTML += '<ul>' + labels.join('') + '</ul>';
        return div;
    };

    legend.addTo(map);
}


L.control.locate({
    position: 'topleft',
    flyTo: true,
    keepCurrentZoomLevel: false,
    strings: {
        title: "Find my location"
       
    },
    drawCircle: false,
    drawMarker: true,
    markerStyle: {
        color: '#136AEC',
        fillColor: '#2A93EE',
        fillOpacity: 1,
        radius: 5
    },
    circleStyle: {
        color: '#136AEC',
        fillColor: '#136AEC',
        fillOpacity: 0.2,
        weight: 2
    },
    locateOptions: {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
        maxZoom: 14
    }
}).addTo(map);

