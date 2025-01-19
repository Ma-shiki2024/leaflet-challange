// Create the 'basemap' tile layer that will be the background of our map.
// Create the map object with center and zoom options.

let myMap = L.map("map", {
  center: [38.01, -95.84],
  zoom: 5
});

// Adding the tile layer
// Then add the 'basemap' tile layer to the map.
let myDefaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

// Define variables for our tile layers.

let baseMaps = {
  default: myDefaultMap,
  street: street
};

// Add the layer control to the map.
//L.control.layers(baseMaps).addTo(myMap);





// OPTIONAL: Step 2

// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let earthquake_data = new L.LayerGroup();
let tectonics = new L.LayerGroup();
let overlays = {
  "Earthquakes": earthquake_data,
  "Tectonic Plates": tectonics
};

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(myMap);
// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {

      return {
        color: getColor(feature.geometry.coordinates[2]),
        radius: getRadius(feature.properties.mag), //sets radius based on magnitude 
        fillColor: getColor(feature.geometry.coordinates[2]) //sets fillColor based on the depth of the earthquake
    }


  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {

    if (depth <= 10) return " green";
    else if (depth > 10 & depth <= 30) return "Yellow";
    else if (depth > 30 & depth <= 50) return "Orange";
    else if (depth > 50 & depth <= 70) return "brown";
    else if (depth > 70 & depth <= 90) return "pink";
    else return "red";

  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {

    return magnitude*3;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {

      return L.circleMarker(latlng); //function creates a circleMarker at latlon and binds a popup with the earthquake id

    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {

      layer.bindPopup(`<h3>${feature.properties.mag}</h3><hr><p>${feature.geometry.coordinates[0]} </p> <p>${feature.geometry.coordinates[1]} </p>`);

    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
   
    div.innerHTML += '<li style="background-color: green"></li><span>(Depth < 10)</span><br>';
    div.innerHTML += '<li style="background-color: Yellow"></li><span>(10 < Depth <= 30)</span><br>';
    div.innerHTML += '<li style="background-color: orange"></li><span>( 30< Depth <= 50)</span><br>';
    div.innerHTML += '<li style="background-color: brown"></li><span>(50 < Depth <= 70)</span><br>';
    div.innerHTML += '<li style="background-color: pink"></li><span>(70 < Depth <= 90)</span><br>';
    div.innerHTML += '<li style="background-color: red"></li><span>(Depth > 90)</span><br>';

    // Loop through our depth intervals to generate a label with a colored square for each interval.


    return div;
  };
  legend.addTo(myMap);
  // Finally, add the legend to the map.


  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
      L.geoJson(plate_data, {
        color: "purple",  //sets the line color to purple
        weight: 3
    }).addTo(tectonics); //add the tectonic data to the tectonic layergroup / overlay
    tectonics.addTo(myMap);
   });
});