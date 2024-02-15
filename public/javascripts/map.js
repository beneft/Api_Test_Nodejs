const weatherData = JSON.parse(document.getElementById('weatherData').textContent);
// Initialize the OpenLayers map
const osmResolutions = [
    156543.03392804097,
    78271.51696402048,
    39135.75848201024,
    19567.87924100512,
    9783.93962050256,
    4891.96981025128,
    2445.98490512564,
    1222.99245256282
];

// Define a square tile grid for OpenStreetMap
const osmTileGrid = new ol.tilegrid.TileGrid({
    tileSize: [256, 256],
    extent: ol.proj.get('EPSG:3857').getExtent(),
    resolutions: osmResolutions,
});
const customTileUrlFunction = function (tileCoord) {
    const z = tileCoord[0];
    const x = tileCoord[1];
    const y = -tileCoord[2] - 1; // Flip y-axis

    // Calculate tile coordinates for OpenWeatherMap based on center coordinates
    const centerX = Math.floor(osmTileGrid.getResolutions()[z] * x * 256 + 128);
    const centerY = Math.floor(osmTileGrid.getResolutions()[z] * y * 256 + 128);

    // Adjust the centerX to create a mirrored effect
    const mirroredCenterX = 256 - centerX;
    let url;
    fetch('http://localhost:3000/weatherlayer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            x: mirroredCenterX,
            y: centerY
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response:', data);
            url = data.mapUrl1;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    return url;
};

const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM({
                tileGrid: osmTileGrid,
            }),
        }),

        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: weatherData.rainmapurl,
                params: { 'LAYERS': 'weather' },
                serverType: 'mapserver',
                tileGrid: osmTileGrid,
            }),
        }),
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([weatherData.lon, weatherData.lat]),
        zoom: 8,
    }),
    interactions: ol.interaction.defaults({
        dragPan:false,
        mouseWheelZoom:false
    }),
    controls: [],
});


// Add a marker for the weather data location
const marker = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([weatherData.lon, weatherData.lat])),
});

const vectorSource = new ol.source.Vector({
    features: [marker],
});

const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
});

map.addLayer(vectorLayer);