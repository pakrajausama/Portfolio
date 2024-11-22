let map = L.map('map');
map.setView([30,70],5);

let osmLayer= L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=x13uWPynShOcbm8f2l2Q',{
    attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    maxZoom:6,
    minZoom:5
}).addTo(map);
let satLayer = L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=x13uWPynShOcbm8f2l2Q',{
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    maxZoom:6,
    minZoom:5
});

let baseLayer = {
    'OSM':osmLayer,
    'Satelitte':satLayer
}
L.control.layers(baseLayer).addTo(map)
let heatLayer;

// Fetch GeoJSON and create the heat map
fetch('points.geojson')
  .then(response => response.json())
  .then(data => {
    // Extract the coordinates and weights (CO values)
    const heatData = data.features.map(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      const coValue = feature.properties.CO2; // Replace 'CO' with the correct field name if necessary
      return [lat, lng, coValue];
    });
    console.log(heatData)

    // Create the heat layer
    heatLayer = L.heatLayer(heatData, {
        radius: 20,
        blur: 15,
        maxZoom: 19,
        minOpacity: 0.1,
        gradient: {
          0.1: 'purple',
          0.3: 'blue',
          0.5: 'lime',
          0.7: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);

    // Add the heat layer to the map without adding the marker layer
    L.control.layers(null, { 'Heat Map': heatLayer },{collapsed:false}).addTo(map);
  });
// Create a custom control for the legend
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = ["Very Low", "Low", "Medium", "High", "Very High"];
    // const grades = [0.1, 0.3, 0.5, 0.7, 1.0];
    const colors = ['purple', 'blue', 'lime', 'yellow', 'red'];

    // Loop through the labels and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            grades[i] + '<br>';

    }

    return div;
};

// Add the legend to the map
legend.addTo(map);