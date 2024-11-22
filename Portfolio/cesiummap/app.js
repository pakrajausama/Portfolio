console.log("app.js is loaded");

// Set Cesium Ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwOWM3NTFlMS0xNWVjLTRhZmYtYjFkMS05YzZjZjRhNzI4YjkiLCJpZCI6MjM4MTA0LCJpYXQiOjE3MjY2Njc4NDF9.tCoR_EVrA9LshkYxqB6t-6_jNRkdGJisAhaDCHe3ZuM';

// Wrap the code in an async function

 // Initialize Cesium Viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
    timeline:false,
    animation:false,
    baseLayerPicker:true,
});
const homeCoordinates = Cesium.Cartesian3.fromDegrees(74.26576950188611,31.479794000462203, 1000); // Example: Lahore, Pakistan

// Override the Home button behavior
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (event) {
    event.cancel = true; // Prevent the default action
    viewer.camera.flyTo({
        destination: homeCoordinates,
        duration: 2.0, // Optional: Adjust fly-to duration
    });
});

viewer.shadows = true;
viewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
viewer.scene.skyAtmosphere.brightnessShift = 0.2;
  
async function loadGJ(url, extrusionHeight = 0, outlineColor = '#000000', heightAttribute = 'height') {
    const dataSource = await Cesium.GeoJsonDataSource.load(url);
    viewer.dataSources.add(dataSource);
    viewer.zoomTo(dataSource);

    dataSource.entities.values.forEach((entity) => {
        if (entity.polygon) {
            const entityHeight = entity.properties && entity.properties[heightAttribute]
                ? entity.properties[heightAttribute].getValue()
                : extrusionHeight;

            entity.polygon.extrudedHeight = entityHeight;
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.fromCssColorString(outlineColor);

            // Change color based on the 'type' property in GeoJSON
            const entityType = entity.properties && entity.properties['type'] 
                ? entity.properties['type'].getValue() 
                : null;

            let polygonColor;
            switch (entityType) {
                case 'Department':
                    polygonColor = '#f1c718'; // Yellow for residential
                    break;
                case 'Facility':
                    polygonColor = '#e74c3c'; // Red for industrial
                    break;
                default:
                    polygonColor = '#FF0000'; // Default color
            }

            entity.polygon.material = Cesium.Color.fromCssColorString(polygonColor).withAlpha(0.7);
        }
    });

    return dataSource;
}

// Load GeoJSON with extrusion height and color handling based on type
loadGJ('building.geojson', extrusionHeight = 5, outlineColor = '#dfdfdc');
