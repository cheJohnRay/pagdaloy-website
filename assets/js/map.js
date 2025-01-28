var map = L.map('map', {
  center: [14.0113, 120.9977],
  zoom: 12,
  zoomControl: false,
});


var MyControl = L.Control.extend({
    options: {
        position: 'topright'
    },
  
    onAdd: function(map) {
        this._div = L.DomUtil.create('div', 'myControl');
        this._div.innerHTML = '<input type="text" value="" placeholder="Search"/><div class="search-container hidden"><ul class="search-results"></ul></div>';
        var self = this; // To access 'this' inside event listener
  
        // Add an input event listener to the input field
        var inputField = this._div.querySelector('input[type="text"]');
        inputField.addEventListener('input', function(e) {
            var searchText = e.target.value.trim().toLowerCase(); // Convert search text to lowercase and remove leading/trailing spaces
            // Toggle the visibility of the search container based on search text
            var searchContainer = self._div.querySelector('.search-container');
            if (searchText === '') {
                searchContainer.classList.add('hidden');
            } else {
                searchContainer.classList.remove('hidden');
            }
            // AJAX request to fetch user data
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        var userData = JSON.parse(xhr.responseText); // Parse JSON response
                        self.fetchPiggeries(userData, searchText, map); // Fetch piggeries based on user data
                        self.fetchPiggeriesCustom(userData, searchText, map);
                    } else {
                        console.error('Error: ' + xhr.status); // Log error if status is not 200
                    }
                }
            };
            xhr.open('GET', '../php/userdata.php', true);
            xhr.send();
        });
  
        // Prevent map events from propagating when scrolling inside the search container
        var searchContainer = this._div.querySelector('.search-container');
        L.DomEvent.on(searchContainer, 'mouseover', function(e) {
            map.scrollWheelZoom.disable();
        });
        L.DomEvent.on(searchContainer, 'mouseout', function(e) {
            map.scrollWheelZoom.enable();
        });
  
        // Stop click events on the text field from propagating to the map
        L.DomEvent.disableClickPropagation(this._div.querySelector('input[type="text"]'));
  
        // Stop click events on the search results from propagating to the map
        L.DomEvent.disableClickPropagation(this._div.querySelector('.search-results'));
  
        return this._div;
    },
  
    fetchPiggeries: function(userData, searchText, map) {
        var self = this; // To access 'this' inside AJAX callback
        // AJAX request to fetch data from PHP script
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText); // Parse JSON response
                    // Filter piggeries based on user role
                    var filteredData;
                    if (userData.user_type === 'ADMIN') {
                        // If user is an admin, search all piggeries
                        filteredData = data;
                    } else {
                        // If user is not an admin, filter piggeries based on municipality code
                        filteredData = data.filter(function(piggery) {
                            return piggery.municipality_code === userData.municipality_code;
                        });
                    }
                    self.showMatches(filteredData, searchText, map); // Display matched results
                } else {
                    console.error('Error: ' + xhr.status); // Log error if status is not 200
                }
            }
        };
        xhr.open('GET', '../php/piggeries.php', true); // Replace 'your_php_script.php' with your actual PHP script URL
        xhr.send();
    },
    
    
    fetchPiggeriesCustom: function(userData, searchText, map) {
        var self = this; // To access 'this' inside AJAX callback
        // AJAX request to fetch data from PHP script
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText); // Parse JSON response
                    // Filter piggeries based on user role
                    var filteredData;
                    if (userData.user_type === 'ADMIN') {
                        // If user is an admin, search all piggeries
                        filteredData = data;
                    } else {
                        // If user is not an admin, filter piggeries based on municipality code
                        filteredData = data.filter(function(piggery) {
                            return piggery.municipality_code === userData.municipality_code;
                        });
                    }
                    self.showMatches(filteredData, searchText, map); // Display matched results
                } else {
                    console.error('Error: ' + xhr.status); // Log error if status is not 200
                }
            }
        };
        xhr.open('GET', '../php/custom_pig_api.php', true); // Replace 'your_php_script.php' with your actual PHP script URL
        xhr.send();
    },
  
    showMatches: function(data, searchText, map) {
        var resultList = this._div.querySelector('.search-results');
        resultList.innerHTML = ''; // Clear previous results
    
        // Check if data is valid and not undefined
        if (!Array.isArray(data) || data.length === 0) {
            console.error('Invalid or empty data received');
            return;
        }
    
        // Fetch user data from userdata.php
        fetch('../php/userdata.php')
            .then(response => response.json())
            .then(userData => {
                const municipality = userData.username ? userData.username.toUpperCase() : "Unknown"; // Get municipality name from user data
    
                // Add matched results to the list
                data.forEach(function(item) {
                    // Ensure each item has the expected structure
                    if (item && typeof item === 'object' && item.hasOwnProperty('farm_name') && item.hasOwnProperty('municipality_code')) {
                        var farmName = item.farm_name || municipality; // Use municipality if farmName is undefined
                        farmName = farmName || "Unknown"; // Default to "Unknown" if both farm_name and municipality are undefined
    
                        // Construct the text content of the list item
                        var listItemText = farmName;
                        if (item.barangay && item.municipality) {
                            listItemText += ' (' + item.barangay + ', ' + item.municipality + ')';
                        }
    
                        if (farmName.toLowerCase().includes(searchText) || 
                            (item.barangay && item.barangay.toLowerCase().includes(searchText)) || 
                            (item.municipality && item.municipality.toLowerCase().includes(searchText)) ||
                            (item.barangay && item.municipality && listItemText.toLowerCase().includes(searchText))) {
                            var listItem = document.createElement('li');
                            listItem.textContent = listItemText;
                            // Add click event listener to fly to the corresponding location on the map and filter markers
                            listItem.addEventListener('click', function(e) {
                                clearFetchedShapeLayer();
                                e.stopPropagation(); // Prevent click event from propagating to the map
                                map.flyTo([item.latitude, item.longitude], 17);
                                filterMarkers(item, map);
                                // Open popup after flying to the location
                                var marker = getMarkerByFarmName(item.farm_name);
                                if (marker) {
                                    marker.openPopup();
                                }
                                // Fetch and display the corresponding barangay shapefile and piggery markers
                                fetchAndDisplayBarangayShape(item.municipality_code, item.barangay, map);
                            });
                            resultList.appendChild(listItem);
                        }
                    } else {
                        console.error('Invalid item in data:', item);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }
    
});
function fetchAndDisplayBarangayShape(municipality_code, barangay, map) {
  clearShapeLayers();
  const geojsonURL = `../../geojson_files/Shapefiles.geojson`;
  fetch(geojsonURL)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
      })
      .then(geojsonData => {
          console.log('GeoJSON data:', geojsonData); // Debugging statement

          // Filter the GeoJSON data based on municipality and barangay
          const filteredFeatures = geojsonData.features.filter(feature => {
              // Assuming barangay property is stored in feature.properties.ADM4_EN
              return feature.properties.ADM4_EN === barangay && feature.properties.Municipality_Code === municipality_code;
          });

          // Clear existing barangay layer group
          barangayLayerGroup.clearLayers();

          // Add filtered features to the map with different colors based on barangay
          filteredFeatures.forEach(feature => {
              // Assign a random color for each barangay
              const randomColor = getRandomColor();

              // Add GeoJSON feature with specified color
              L.geoJSON(feature, {
                  style: {
                      fillColor: randomColor,
                      color: randomColor,
                      weight: 4
                  }
              }).addTo(barangayLayerGroup);
          });

       

          // Add the barangay layer group to the map
          barangayLayerGroup.addTo(map);
      })
      .catch(error => {
          console.error('Error fetching and displaying barangay shape:', error);
      });
}


var myControl = new MyControl();
myControl.addTo(map);

// Declare an array to store all markers
let allMarkers = [];

// Add markers to the allMarkers array when they are added to the map
map.on('layeradd', function(event) {
    if (event.layer instanceof L.Marker) {
        allMarkers.push(event.layer);
    }
});

// Modify filterMarkers function to show/hide markers based on search criteria
function filterMarkers(clickedItem, map) {
    // Iterate over all markers
    allMarkers.forEach(function(marker) {
        var markerData = marker.getPopup().getContent();
        // Check if the marker matches the search criteria
        if (markerData.includes(clickedItem.farm_name)) {
            marker.addTo(map); // Show the marker on the map
            // Open popup if it matches exactly
            if (markerData === clickedItem.farm_name) {
                marker.openPopup();
            }
        } else {
            map.removeLayer(marker); // Hide the marker from the map
        }
    });

    // Update the currently shown marker
    currentlyShownMarker = clickedItem;
}

function getMarkerByFarmName(farmName) {
    return allMarkers.find(function(marker) {
        return marker.getPopup().getContent().includes(farmName);
    });
}


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
maxZoom: 17,
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

L.control.layers({
"Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 17,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}),
"Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}),
"Topography": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenTopoMap contributors, SRTM | Map style: &copy; OpenTopoMap'
})
}).addTo(map);


let shapeLayer;
var popup = L.popup();

const apiURL = '../php/api.php';
const piggeriesUrl = '../php/piggeries.php';
// Object to hold markers for each municipality
var markersByMunicipality = {}; // Ensure this is declared in an accessible scope
var markersByBarangay = {};
var shapeLayers = {}; // Object to hold shape layers by municipality
var municipalityCoordinates = {
  "Balete": [14.03193, 121.095428],
  "Agoncillo" : [13.963389, 120.925484],
  "Alitagtag": [13.862914, 121.016121],
  "Cuenca": [13.90461431313024, 121.05597251881868],
  "Laurel": [14.05213019982489, 120.90732456456205],
  "Mataas Na Kahoy": [13.979085952016785, 121.09739159746668],
  "San Nicolas": [13.919965859758854, 120.94770603976525],
  "Sta. Teresita": [13.875449936908929, 120.97140159298453],
  "Talisay": [14.106513571117576, 121.01920986439174],
  "Tanauan": [14.09888862387092, 121.09632379483912]
};



function clearMarkers() {
  for (var municipality in markersByMunicipality) {
    markersByMunicipality[municipality].forEach(marker => {
      map.removeLayer(marker);
    });
  }
  for (var municipality in shapeLayers) {
    map.removeLayer(shapeLayers[municipality]);
  }

  for (var barangay in markersByBarangay) {
    markersByBarangay[barangay].forEach(marker => {
      map.removeLayer(marker);
    });
  }
}

// Define the Leaflet layer group for barangay shapes
const barangayLayerGroup = L.layerGroup().addTo(map);

// Function to generate a random color with minimum contrast ratio against the background
function getRandomColor(background) {
  // Define minimum contrast ratio (0-21, where 0 is no contrast and 21 is maximum contrast)
  const minContrastRatio = 21; // Adjust this value as needed

  // Function to calculate contrast ratio between two colors
  function contrastRatio(color1, color2) {
      // Convert hex color to RGB
      const rgb1 = parseInt(color1.substring(1), 16);
      const r1 = (rgb1 >> 16) & 0xff;
      const g1 = (rgb1 >>  8) & 0xff;
      const b1 = (rgb1 >>  0) & 0xff;

      const rgb2 = parseInt(color2.substring(1), 16);
      const r2 = (rgb2 >> 16) & 0xff;
      const g2 = (rgb2 >>  8) & 0xff;
      const b2 = (rgb2 >>  0) & 0xff;

      // Calculate luminance for each color
      const luminance1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
      const luminance2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;

      // Calculate contrast ratio
      const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

      return contrast;
  }

  // Generate a random color
  let color = '#' + Math.floor(Math.random() * 16777215).toString(16);

  // Check if the background color is provided
  if (background) {
      // Check if the contrast ratio with the background is above the minimum threshold
      while (contrastRatio(color, background) < minContrastRatio) {
          // If not, generate a new color
          color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }
  }

  return color;
}

function showBarangayShape(municipality_code, barangay) {
  clearMarkers(); // Clear all existing markers and shape layers
  clearFetchedShapeLayer();

  const geojsonURL = `../../geojson_files/Shapefiles.geojson`;
  fetch(geojsonURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(geojsonData => {
      console.log('GeoJSON data:', geojsonData); // Debugging statement

      // Filter the GeoJSON data based on municipality and barangay
      const filteredFeatures = geojsonData.features.filter(feature => {
        // Assuming barangay property is stored in feature.properties.ADM4_EN
        return feature.properties.ADM4_EN === barangay && feature.properties.Municipality_Code === municipality_code;
      });
      console.log('Filtered features:', filteredFeatures); // Debugging statement

      // Clear existing barangay layer group
      barangayLayerGroup.clearLayers();

      // Add filtered features to the map with different colors based on barangay
      filteredFeatures.forEach(feature => {
        // Extract municipality code, municipality, barangay, and coordinates
        const municipalityCode = feature.properties.Municipality_Code;
        const municipality = feature.properties.Municipality;
        const barangay = feature.properties.ADM4_EN;
        const coordinates = feature.geometry.coordinates;

        console.log('Municipality Code:', municipalityCode);
        console.log('Municipality:', municipality);
        console.log('Barangay:', barangay);
        console.log('Coordinates:', coordinates);

        // Assign a random color for each barangay
        const randomColor = getRandomColor();

        // Add GeoJSON feature with specified color
        L.geoJSON(feature, {
          style: {
            fillColor: randomColor,
            color: randomColor,
            weight: 4
          },
          onEachFeature: function (feature, layer) {
            // Extract coordinates from the feature properties
            const xCoord = feature.properties.xcoord;
            const yCoord = feature.properties.ycoord;
            // Fly to the coordinates of the barangay
            map.flyTo([yCoord, xCoord], 15);

            // Add popup or other interactions here if needed
          }
        }).addTo(barangayLayerGroup);
      });

      // Fetch barangay markers data for the selected municipality and barangay
      // Fetch barangay marker data
// Fetch barangay marker data
fetch(apiURL) 
    .then(response => response.json())
    .then(data => {
        console.log('Barangay marker data:', data); // Debugging statement

        // Clear existing piggery markers
        clearPiggeryMarkers();

        // Show markers for the selected barangay
        data.forEach(item => {
            if (item.barangay === barangay && item.municipality_code === municipality_code) {
                const customIcon = L.icon({
                    iconUrl: '../img/barangay-icon.png',
                    iconSize: [39, 43],
                    iconAnchor: [16, 16],
                    popupAnchor: [3.5, -21.5]
                });

                const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });
                marker.bindPopup(`<b>Municipality</b>: ${item.municipality} <br> <b>Barangay</b>: ${item.barangay} <br> <b>Latitude</b>: ${item.latitude} <br> <b>Longitude</b>: ${item.longitude}`);
                marker.addTo(map);
                marker.on("popupopen", function (e) {
                    // Get the map instance
                    var map = e.target._map;

                    // Get the marker's coordinates
                    var markerLatLng = marker.getLatLng();

                    // Set the map's center to the marker's position
                    map.setView(markerLatLng, map.getZoom() + 1);
                });
                marker.on("popupclose", function (e) {
                    // Get the map instance
                    var map = e.target._map;

                    // Reset the zoom level (you can customize this value)
                    map.setZoom(map.getZoom() - 1);
                });

                // Store markers by barangay
                if (!markersByBarangay[item.barangay]) {
                    markersByBarangay[item.barangay] = [];
                }
                markersByBarangay[item.barangay].push(marker);
            }
        });

        // Fetch piggery data after displaying barangay markers
        fetch(piggeriesUrl) // Fetch piggery data
            .then(response => response.json())
            .then(data => {
                // Filter piggery data for the selected municipality and barangay
                const municipalityBarangayPiggeries = data.filter(piggery => piggery.municipality_code === municipality_code && piggery.barangay === barangay);
                const piggerymarker = L.icon({
                    iconUrl: '../img/pig-icon.png',
                    iconSize: [39, 43],
                    iconAnchor: [16, 16],
                    popupAnchor: [3.5, -21.5]
                });

                // Add markers for each piggery in the municipality and barangay
                municipalityBarangayPiggeries.forEach(piggery => {
                    const piggeryMarker = L.marker([piggery.latitude, piggery.longitude], {
                        icon: piggerymarker
                    }).addTo(map);
                    piggeryMarker.bindPopup(`<b>${piggery.farm_name}</b><br> <b>Sow Count:</b> ${piggery.sow_count}<br><b>Boar Count:</b> ${piggery.boar_count} <br> <b>Fattener Count:</b> ${piggery.fattener_count}<br><b>Piglet Count:</b> ${piggery.piglet_count}<br><b>Native Count:</b> ${piggery.native_count}<br><b>Latitude:</b> ${piggery.latitude}<br><b>Longitude:</b> ${piggery.longitude}<br><b>Sanitation:</b> ${piggery.sanitation}<br></br>`);
                });
            })
            .catch(error => {
                console.error('Error fetching piggery data:', error);
            });
    })
    .catch(error => {
        console.error('Error fetching barangay marker data:', error);
    });

// Function to clear existing piggery markers
function clearPiggeryMarkers() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

})
}

function showMunicipalityMarkers(municipality) {
  clearPiggeryMarkers(); // Clear all existing piggery markers
  clearShapeLayers(); // Clear all existing shape layers
  barangayLayerGroup.clearLayers();

  // Remove active class and clear barangay buttons of previously clicked municipality
  var previousContainer = document.querySelector('.active-barangays');
  if (previousContainer) {
      previousContainer.classList.remove('active-barangays');
      previousContainer.innerHTML = '';
  }

  // Add the shape layer for the selected municipality
  if (shapeLayers[municipality]) {
      shapeLayers[municipality].addTo(map);
  }

  // Add only the markers for the selected municipality
  if (markersByMunicipality[municipality]) {
      markersByMunicipality[municipality].forEach(marker => {
          marker.addTo(map);
      });
  }

  var coordinates = municipalityCoordinates[municipality]; // Retrieve coordinates for the municipality
  if (coordinates) {
      map.flyTo(coordinates, 13); // Fly to the specified coordinates
  }

 // Map municipality names to their corresponding codes
const municipalityCodes = {
    "Agoncillo": "AGON",
    "Balete": "BAL",
    "Alitagtag": "ALI",
    "Cuenca": "CUE",
    "Laurel": "LAU",
    "Mataas Na Kahoy": "MNK",
    "San Nicolas": "SAN",
    "Sta. Teresita": "STA",
    "Talisay": "TAL",
    "Tanauan": "TAN"
};

// Get the municipality code based on the municipality name
const municipalityCode = municipalityCodes[municipality];

Promise.all([
    fetch(piggeriesUrl).then(response => response.json()),
    fetch('../php/custom_pig_api.php').then(response => response.json()).catch(() => [])
])
.then(([piggeryData, customPigData]) => {
    // Filter piggery data for the selected municipality
    const municipalityPiggeries = piggeryData.filter(piggery => piggery.municipality === municipality);
    const piggerymarker = L.icon({
        iconUrl: '../img/pig-icon.png',
        iconSize: [39, 43],
        iconAnchor: [16, 16],
        popupAnchor: [3.5, -21.5]
    });

    // Initialize total counts as integers
    let totalSowCount = 0;
    let totalBoarCount = 0;
    let totalNativeCount = 0;
    let totalPigletCount = 0;

    // Add markers for each piggery in the municipality
    municipalityPiggeries.forEach(piggery => {
        // Ensure that values are treated as numbers by using parseInt or unary plus operator
        totalSowCount += parseInt(piggery.sow_count) || 0;
        totalBoarCount += parseInt(piggery.boar_count) || 0;
        totalNativeCount += parseInt(piggery.native_count) || 0;
        totalPigletCount += parseInt(piggery.piglet_count) || 0;

        const piggeryMarker = L.marker([piggery.latitude, piggery.longitude], {
            icon: piggerymarker
        }).addTo(map);
        piggeryMarker.bindPopup(`
            <b>${piggery.farm_name}</b><br>
            <strong>Sow Count:</strong> ${piggery.sow_count}<br>
            <strong>Boar Count:</strong> ${piggery.boar_count}<br>
            <strong>Fattener Count:</strong> ${piggery.fattener_count}<br>
            <strong>Piglet Count:</strong> ${piggery.piglet_count}<br>
            <strong>Native Count:</strong> ${piggery.native_count}<br>
            <strong>Latitude:</strong> ${piggery.latitude}<br>
            <strong>Longitude:</strong> ${piggery.longitude}<br>
            <strong>Sanitation:</strong> ${piggery.sanitation}<br>
        `);
    });

    // Filter customPigData based on municipality_code
    const filteredCustomPigData = Array.isArray(customPigData) ? customPigData.filter(data => data.municipality_code === municipalityCode) : [];

    if (Array.isArray(filteredCustomPigData)) {
        // Extract counts from filtered customPigData and add to total counts
        filteredCustomPigData.forEach(data => {
            totalSowCount += parseInt(data.sow_count) || 0;
            totalBoarCount += parseInt(data.boar_count) || 0;
            totalNativeCount += parseInt(data.native_count) || 0;
            totalPigletCount += parseInt(data.piglet_count) || 0;
        });
    } else {
        console.error('Filtered custom pig API data is not an array:', filteredCustomPigData);
    }

    // Get the center coordinates of the municipality
    let municipalityCenter;
    if (shapeLayers[municipality]) {
        municipalityCenter = shapeLayers[municipality].getBounds().getCenter();
    } else {
        console.error(`Shape layer for municipality ${municipality} is not defined.`);
        // Provide a default center or handle the error as needed

        // Check if there are any markers available
        const markers = municipalityPiggeries.map(piggery => L.marker([piggery.latitude, piggery.longitude]));
        if (markers.length > 0) {
            // Use the coordinates of the first marker
            municipalityCenter = markers[0].getLatLng();
        } else {
            console.error(`No markers available for municipality ${municipality}.`);
            // Provide a default center or handle the error as needed
            municipalityCenter = [14.009113, 120.998182];
        }
    }

    // Create popup content including total counts
    const popupContent = `
        <b>Municipality: ${municipality}</b><br>
        <strong>Total Sow Count:</strong> ${totalSowCount}<br>
        <strong>Total Boar Count:</strong> ${totalBoarCount}<br>
        <strong>Total Native Count:</strong> ${totalNativeCount}<br>
        <strong>Total Piglet Count:</strong> ${totalPigletCount}<br>
    `;

    // Create popup and display it at the center of the municipality
    L.popup()
        .setLatLng(municipalityCenter)
        .setContent(popupContent)
        .openOn(map);
})
.catch(error => {
    console.error('Error fetching data:', error);
});


  // Fetch barangay data for the selected municipality from the database
  fetch(apiURL) // Assuming you have an endpoint to fetch barangay data
      .then(response => response.json())
      .then(data => {
          // Convert municipality name to lowercase and remove special characters
          const municipalityClass = municipality.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s/g, '');
          const barangayContainer = document.querySelector(`.${municipalityClass}_summary .barangay-container`);
          if (barangayContainer) {
              barangayContainer.classList.add('active-barangays');

              // Filter barangay data for the selected municipality
              const municipalityBarangays = data.filter(barangay => barangay.municipality === municipality);

              // Create buttons for each barangay and append them to the barangay container
              municipalityBarangays.forEach(barangay => {
                  const barangayButton = document.createElement('button');
                  barangayButton.innerText = barangay.barangay; // Assuming the data contains barangay names
                  barangayButton.classList.add('barangay-list-item');
                  barangayButton.addEventListener('click', () => {
                      showBarangayShape(barangay.municipality_code, barangay.barangay);
                  });
                  barangayContainer.appendChild(barangayButton);
              });
          } else {
              console.error('Barangay container not found for the selected municipality.');
          }
      })
      .catch(error => {
          console.error('Error fetching barangay data:', error);
      });
}

// Function to clear existing piggery markers
function clearPiggeryMarkers() {
  // Loop through all layers on the map
  map.eachLayer(layer => {
      // Check if the layer is a marker and remove it if so
      if (layer instanceof L.Marker) {
          map.removeLayer(layer);
      }
  });
}

// Function to clear existing shape layers
function clearShapeLayers() {
  Object.values(shapeLayers).forEach(shapeLayer => {
      map.removeLayer(shapeLayer);
  });
}


// Define styles for the barangay list items
const barangayListItemStyle = `
.barangay-list-item {
    display: none; /* Initially hide the buttons */
    margin-bottom: 3px; /* Adjust margin to reduce spacing */
    padding: 5px 10px;
    border: none;
    background-color: #f2f2f2;
    cursor: pointer;
    opacity: 0; /* Set opacity to 0 initially */
    transition: opacity 0.3s ease-in-out; /* Smooth transition for opacity */
}

.active-barangays .barangay-list-item {
    display: block; /* Display the buttons when the container has the active-barangays class */
    opacity: 1; /* Set opacity to 1 when displayed */
    transition-delay: 0.1s; /* Add a slight delay for a staggered effect */
}
`;

// Create a style element and append it to the document head
const styleElement = document.createElement('style');
styleElement.textContent = barangayListItemStyle;
document.head.appendChild(styleElement);


  
  
  
// Function to delete a marker and its associated data
function deleteMarker(farmName, markerId) {
  // Make a DELETE request to the API
  fetch('custom_pig_api.php', {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ farmName: farmName })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
  })
  .then(data => {
      // Handle successful deletion
      console.log('Data deleted successfully:', data);
      // Remove marker from the map using the provided markerId
      const markerToRemove = map._layers[markerId];
      if (markerToRemove) {
          map.removeLayer(markerToRemove);
      } else {
          console.error('Marker not found with id:', markerId);
      }
      location.reload();
  })
  .catch(error => {
      console.error('Error deleting data:', error);
      // Handle deletion errors
  });
}

// Call the function to display markers on the map
displayMarkers();

// Add CSS styles for the delete button
const deleteButtonStyle = document.createElement('style');
deleteButtonStyle.textContent = `
.delete-button {
    color: white;
    background-color: red;
    border: none;
    padding: 10px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    display: block;
    margin: 0 auto;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
}

.delete-button:hover {
    background-color: #990000; /* Slightly darker red */
    transform: scale(1.05); /* Enlarge the button by 5% */
}
`;
document.head.appendChild(deleteButtonStyle);

  function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
  }
  
  map.on('click', onMapClick);

  document.querySelector('.exit').addEventListener('click', function() {
    document.querySelector('.summary-container').style.display = 'none'
    })
document.querySelector('#flow-acc').addEventListener('click', function() {
    document.querySelector('.summary-container').style.display = 'flex'
})

// MODAL
var modalDisplay = document.querySelector(".modal-container");
var farmname = document.querySelector("#farmname");
var sowcount = document.querySelector("#sow");
var boarcount = document.querySelector("#boar");
var fattenercount = document.querySelector("#fattener");
var pigletcount = document.querySelector("#piglet");
var nativecount = document.querySelector("#native");

sowcount.defaultValue = 0;
boarcount.defaultValue = 0;
fattenercount.defaultValue = 0;
pigletcount.defaultValue = 0;
nativecount.defaultValue = 0;

document.querySelector("#modal").addEventListener("click", function () {
  modalDisplay.style.display = "flex";
});

document.querySelector("#close").addEventListener("click", function () {
  modalDisplay.style.display = "none";
});
document.querySelector("#save-btn").addEventListener("click", function () {
    // Get the selected value of sanitation
    var sanitation = document.querySelector("#sanitation").value;
    
    // Check if farm name is empty
    var farmname = document.querySelector("#farmname").value;
    if (farmname.trim() === "") {
        Swal.fire({
            text: "Farm Name has no value.",
            icon: "warning",
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            didOpen: () => {
                const swalContainer = document.querySelector('.swal2-container');
                swalContainer.style.zIndex = 3000;
            }
        });
        return; // Stop execution
    }
    
    // Check if any livestock count is negative
    var livestockCounts = [
        parseInt(sowcount.value),
        parseInt(boarcount.value),
        parseInt(fattenercount.value),
        parseInt(pigletcount.value),
        parseInt(nativecount.value)
    ];
    if (livestockCounts.some(count => isNaN(count) || count < 0)) {
        Swal.fire({
            text: "One or more livestock counts have negative values.",
            icon: "warning",
            position: 'center',
            showConfirmButton: false,
            timer: 2000,
            didOpen: () => {
                const swalContainer = document.querySelector('.swal2-container');
                swalContainer.style.zIndex = 3000;
            }
        });
        return; // Stop execution
    }
    
    // Calculate discharge based on the sanitation type and livestock counts
    var defaultDischarge = 0;
    if (sanitation === "Free-flow") {
        defaultDischarge = (
            (parseInt(sowcount.value) * 3.35) + 
            (parseInt(boarcount.value) * 1.08) + 
            (parseInt(fattenercount.value) * 2.83) + 
            (parseInt(pigletcount.value) * 2.37) + 
            parseInt(nativecount.value * 1.50)
        ) * 0.70; // 70% of the total livestock count
    }
  
    // If discharge is not defined, set it to the default value
    var discharge = typeof discharge !== 'undefined' ? discharge : defaultDischarge;
  
    // Your existing validation code...
  
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var userData = JSON.parse(xhr.responseText);
                var municipality_code = userData.municipality_code;
  
                var coordinatesPopup = L.popup({ closeButton: false });
  
                function updateCoordinatesPopup(e) {
                    // Update the content and position of the popup
                    coordinatesPopup
                        .setLatLng(e.latlng)
                        .setContent(
                            "Latitude: " +
                            e.latlng.lat.toFixed(6) +
                            ", Longitude: " +
                            e.latlng.lng.toFixed(6)
                        )
                        .openOn(map);
                }
  
                function closeCoordinatesPopup() {
                    coordinatesPopup.removeFrom(map);
                }
  
                map.on("mousemove", updateCoordinatesPopup);
                map.on("mouseout", closeCoordinatesPopup);
  
                Swal.fire({
                    text: "Click on the Map where the custom pig farm is located",
                    icon: "info",
                });
  
                map.on("click", function (e) {
                    // Construct the URL with sanitation value included
                    var url =
                        "../php/pigfarm_api.php?name=" +
                        encodeURIComponent(farmname) +
                        "&sow=" +
                        sowcount.value +
                        "&boar=" +
                        boarcount.value +
                        "&fattener=" +
                        fattenercount.value +
                        "&piglet=" +
                        pigletcount.value +
                        "&native=" +
                        nativecount.value +
                        "&latitude=" +
                        e.latlng.lat +
                        "&longitude=" +
                        e.latlng.lng +
                        "&sanitation=" +
                        sanitation +
                        "&municipality_code=" +
                        municipality_code +
                        "&discharge=" +
                        discharge; // Use the calculated discharge value
  
                    console.log("url: ", url);
  
                    fetch(url)
                        .then((resp) => resp.json())
                        .then((resp) => {
                            console.log(resp);
                            // Add a marker with custom icon
                            L.marker([e.latlng.lat, e.latlng.lng], {
                                icon: L.icon({
                                    iconUrl: "../img/pig-icon.png",
                                    iconSize: [39, 43],
                                    iconAnchor: [16, 16],
                                    popupAnchor: [3.5, -21.5] 
                                }),
                            }).addTo(map);
                        })
                        .catch((err) => {
                            console.error(err);
                        });
  
                    console.log(e.latlng);
                    map.off("click");
                    location.reload();
                });
  
                modalDisplay.style.display = "none";
            } else {
                console.error('Error: ' + xhr.status); // Log error if status is not 200
            }
        }
    };
    xhr.open('GET', '../php/userdata.php', true);
    xhr.send();
});


document.querySelector("#clearmarker").addEventListener("click", function () {
  map.flyTo([14.0113, 120.9977], 12)
})

// Initialize waterwaysLayer variable
let waterwaysLayer;

// Define the initial style for the waterways layer
const initialWaterwaysStyle = {
    color: '#0000CD', // Default blue color
    weight: 3, // Change the line weight
};

function calculateTotalDischarge(feature) {
    const distanceThreshold = 40; // Adjust the distance threshold as needed (in meters)
    const countedMarkers = new Set(); // Set to keep track of counted markers
    let totalDischarge = 0;

    const waterwayCoordinates = feature.geometry.coordinates; // Assuming it's a LineString

    // Check if the waterway status is degraded
    if (feature.properties.status && feature.properties.status.toLowerCase() === 'degraded') {
        // If degraded, make a fetch request
        return fetch('../php/rainfall.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Check if the volume collected has an integer value greater than 0
                const volumeCollected = parseInt(data.totalVolume);
                if (!isNaN(volumeCollected) && volumeCollected > 0) {
                    
                    let dischargeMultiplier = 1; // Default multiplier
                    if (volumeCollected <= 7.5) {
                        // If totalVolume is > 0 but less than or equal to 7.5, set multiplier to 0
                        dischargeMultiplier = 0;
                    } else if (volumeCollected <= 15) {
                        // If totalVolume is > 7.5 but less than or equal to 15, set multiplier to 0.25
                        dischargeMultiplier = 0.25;
                    } else if (volumeCollected <= 30) {
                        // If totalVolume is > 15 but less than or equal to 30, set multiplier to 0.50
                        dischargeMultiplier = 0.50;
                    }
                    // Perform calculations based on the fetched data
                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            const markerLatLng = layer.getLatLng();
                            // Check if marker has already been counted
                            if (countedMarkers.has(layer)) {
                                return; // Skip this marker
                            }
                            let isMarkerCounted = false; // Flag to track if marker has been counted
                            // Calculate distance from marker to each coordinate point in the waterway
                            for (let i = 0; i < waterwayCoordinates.length; i++) {
                                const coord = waterwayCoordinates[i];
                                const waterwayLatLng = L.latLng(coord[1], coord[0]);
                                const distance = markerLatLng.distanceTo(waterwayLatLng);
                                if (distance <= distanceThreshold) {
                                    const markerData = layer.options.markerData;
                                    if (markerData && typeof markerData.discharge === 'number') {
                                        if (markerData.sanitation === "Free-flow") {
                                            // Multiply discharge by the multiplier
                                            totalDischarge += parseFloat(markerData.discharge) * dischargeMultiplier;
                                            isMarkerCounted = true; // Mark this marker as counted
                                            break; // Exit the loop since the marker has been counted
                                        }
                                    }
                                }
                            }
                            if (isMarkerCounted) {
                                countedMarkers.add(layer); // Add the marker to the set of counted markers
                            }
                        }
                    });
                } else {
                    // If volumeCollected is not a number or less than or equal to 0, set totalDischarge to 0
                    totalDischarge = 0;
                }
                // Return totalDischarge as a Promise
                return totalDischarge;
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
                return 0; // Return 0 discharge in case of error
            });
    } else {
        // Waterway is not degraded, calculate total discharge without fetch request
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                const markerLatLng = layer.getLatLng();

                // Check if marker has already been counted
                if (countedMarkers.has(layer)) {
                    return; // Skip this marker
                }

                let isMarkerCounted = false; // Flag to track if marker has been counted

                // Calculate distance from marker to each coordinate point in the waterway
                for (let i = 0; i < waterwayCoordinates.length; i++) {
                    const coord = waterwayCoordinates[i];
                    const waterwayLatLng = L.latLng(coord[1], coord[0]);
                    const distance = markerLatLng.distanceTo(waterwayLatLng);
                    if (distance <= distanceThreshold) {
                        const markerData = layer.options.markerData;
                        if (markerData && typeof markerData.discharge === 'number') {
                            if (markerData.sanitation === "Free-flow") {
                                totalDischarge += parseFloat(markerData.discharge);
                                isMarkerCounted = true; // Mark this marker as counted
                                break; // Exit the loop since the marker has been counted
                            }
                        }
                    }
                }

                if (isMarkerCounted) {
                    countedMarkers.add(layer); // Add the marker to the set of counted markers
                }
            }
        });

        // Resolve totalDischarge as a Promise
        return Promise.resolve(totalDischarge);
    }
}



// Fetch the waterways data and update the layer style
fetch('../../geojson_files/Waterways_updated.geojson')
    .then(response => response.json())
    .then(data => {
        // Set the data and update the layer style
        waterwaysLayer = L.geoJSON(data, {
            style: initialWaterwaysStyle,
            onEachFeature: function(feature, layer) {
                const waterwayspopup = `<b>Name of Waterway</b>: ${feature.properties.name} <br> Waterway no: ${feature.properties.Waterway} <br> ID: ${feature.properties.full_id}`;
                layer.bindPopup(waterwayspopup);
            }
        }).addTo(map);

        waterwaysLayer.setZIndex(2000);
        map.fitBounds(waterwaysLayer.getBounds());

        // Add event listener to waterways layer for displaying total discharge when clicked
        waterwaysLayer.on('click', function(event) {
            const waterway = event.layer;
            calculateTotalDischarge(waterway.feature)
                .then(totalDischarge => {
                    // Generate popup content
                    const waterwayspopup = `
                    <div style="background-color: #fff;">
                    <h2 style="color: #333; font-size: 15px; text-align: center;">${waterway.feature.properties.name}</h2>
                    <p style="color: red; font-size: 13px;"><strong>Total Discharge Volume:</strong> <span style= "color: black; font-size: 13px;">${totalDischarge} kg</span></p> </div>
                    `;
                    waterway.bindPopup(waterwayspopup).openPopup();
                })
                .catch(error => {
                    console.error('Error calculating total discharge:', error);
                });
        });
    })
    .catch(error => {
        console.error('Error fetching waterways data:', error);
    });

// Function to find the nearest waterway to a given marker location
function findNearestWaterway(markerLatLng) {
    let nearestWaterway;
    let nearestDistance = Infinity;

    waterwaysLayer.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            const waterwayCoordinates = layer.getLatLngs(); // Get coordinates of the waterway path
            waterwayCoordinates.forEach(coord => {
                const waterwayLatLng = L.latLng(coord.lat, coord.lng);
                const distance = markerLatLng.distanceTo(waterwayLatLng);
                if (distance < nearestDistance) {
                    nearestWaterway = layer;
                    nearestDistance = distance;
                }
            });
        }
    });

    return nearestWaterway;
}

// Fetch marker coordinates from the API
function displayMarkers(municipality_code) {
    fetch('../php/custom_pig_api.php')
        .then(response => response.json())
        .then(data => {
            const filteredData = (municipality_code === 'ADMIN') ? data : data.filter(markerData => markerData.municipality_code === municipality_code);

            filteredData.forEach(markerData => {
                const markerIcon = L.icon({
                    iconUrl: '../img/pig-icon.png',
                    iconSize: [39, 43],
                    iconAnchor: [16, 16],
                    popupAnchor: [3.5, -21.5]
                });
                const marker = L.marker([markerData.latitude, markerData.longitude], { icon: markerIcon }).addTo(map);
                marker.options.markerData = markerData; // Attach markerData to marker options

                const popupContent = `
                    <b>Farm Name:</b> ${markerData.farm_name}<br>
                    <b>Sow Count:</b> ${markerData.sow_count}<br>
                    <b>Boar Count:</b> ${markerData.boar_count}<br>
                    <b>Fattener Count:</b> ${markerData.fattener_count}<br>
                    <b>Piglet Count:</b> ${markerData.piglet_count}<br>
                    <b>Native Count:</b> ${markerData.native_count}<br>
                    <b>Latitude:</b> ${markerData.latitude}<br>
                    <b>Longitude:</b> ${markerData.longitude}<br>
                    <b>Sanitation:</b> ${markerData.sanitation}<br>
                    <button class="delete-button" onclick="deleteMarker('${markerData.farm_name}', ${markerData.id})">Delete</button>
                `;

                marker.bindPopup(popupContent);

                marker.on('popupopen', function(event) {
                    const markerLatLng = marker.getLatLng();
                    highlightNearbyWaterways(markerLatLng, markerData);
                });

                marker.on('popupclose', function(event) {
                    resetNearbyWaterways();
                });
            });
        })
        .catch(error => {
            console.error('Error fetching marker data:', error);
        });
}

function highlightNearbyWaterways(markerLatLng, markerData) {
    const nearestWaterway = findNearestWaterway(markerLatLng);

    if (nearestWaterway) {
        if (markerData.sanitation === "Free-flow") {
            // Check if totalVolume is greater than 0
            calculateTotalDischarge(nearestWaterway.feature)
                .then(totalDischarge => {
                    if (totalDischarge > 0) {
                        nearestWaterway.setStyle({ color: 'red' });
                    }
                })
                .catch(error => {
                    console.error('Error calculating total discharge:', error);
                });
        }
    }
}


function resetNearbyWaterways() {
    waterwaysLayer.eachLayer(layer => {
        layer.setStyle({ color: '#0000CD' });
    });
}




// Get user data
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            var userData = JSON.parse(xhr.responseText);
            var municipality_code = userData.municipality_code;

            // Display all markers if municipality code is 'ADMIN', otherwise display based on municipality code
            displayMarkers(municipality_code);
        } else {
            console.error('Error: ' + xhr.status); // Log error if status is not 200
        }
    }
};
xhr.open('GET', '../php/userdata.php', true);
xhr.send();



var currentHoveredLegend = null;
var previousHoveredLegend = null;

function updateLegend(event, iconSrc, name) {
  var legendIcon = event.currentTarget.querySelector('img');
  var legendName = event.currentTarget.querySelector('p');
  legendIcon.src = '../img/' + iconSrc;
  legendName.textContent = name;

  // Store the currently hovered legend item
  previousHoveredLegend = currentHoveredLegend;
  currentHoveredLegend = name;

  // If hovering over the same legend item twice, show all markers
  if (currentHoveredLegend === previousHoveredLegend) {
      currentHoveredLegend = null;
      resetMarkersVisibility();
      return;
  }

  if (name === 'Volcanic Stream') {
      // Change the style of waterways with the name "Volc Stream"
      waterwaysLayer.eachLayer(function(layer) {
          if (layer.feature.properties.name.startsWith('Volc Stream')) {
              layer.setStyle({
                  color: '#FFA500', // Orange color
                  weight: 3, // Change the line weight
              });
          }
      });
  } else if (name === 'Degraded Waterways') {
      // Change the style of waterways with the status "degraded"
      waterwaysLayer.eachLayer(function(layer) {
          if (layer.feature.properties.status && layer.feature.properties.status.toLowerCase() === 'degraded') {
              layer.setStyle({
                  color: '#F2613F', // Color for degraded waterways
                  weight: 3, // Change the line weight
              });
          }
      });
  } else if (name === 'Barangay') {
      toggleMarkersVisibility('../img/barangay-icon.png', true);
      toggleMarkersVisibility('../img/pig-icon.png', false);
  } else if (name === 'Pig Farm') {
      toggleMarkersVisibility('../img/pig-icon.png', true);
      toggleMarkersVisibility('../img/barangay-icon.png', false);
  } else if (name === 'Discharge Path') {
      // Change the icon and name for Discharge Path
      legendIcon.src = '../img/degraded.png';
      legendName.textContent = 'Degraded Waterways';
  }
}


function toggleMarkersVisibility(iconUrl, visible) {
    map.eachLayer(function(layer) {
        if (layer.options.icon && layer.options.icon.options.iconUrl === iconUrl) {
            layer.setOpacity(visible ? 1 : 0);
        }
    });
}

function resetMarkersVisibility() {
    map.eachLayer(function(layer) {
        if (layer.options.icon) {
            layer.setOpacity(1);
        }
    });
}

function resetLegend(event) {
  var legendIcon = event.currentTarget.querySelector('img');
  var legendName = event.currentTarget.querySelector('p');

  // Reset waterways style if the legend being reset is not 'Barangay', 'Pig Farm', 'Closest Point', or 'Discharge Path'
  if (legendName.textContent !== 'Discharge Path' && legendName.textContent !== 'Waterways' && legendName.textContent !== 'Pig Farm' && legendName.textContent !== 'Closest Point' && legendName.textContent !== 'Barangay' && legendName.textContent !== 'Degraded Waterways' ) {
      legendIcon.src = '../img/waterwaylegend.png'; // Change this to your default icon path
      legendName.textContent = 'Waterways';

      // Reset the style of all waterways
      waterwaysLayer.setStyle({
          color: '#0000CD', // Default blue color
          weight: 3 // Default weight
      });
  }
  if (legendName.textContent !== 'Discharge Path' && legendName.textContent !== 'Waterways' && legendName.textContent !== 'Pig Farm' && legendName.textContent !== 'Closest Point' && legendName.textContent !== 'Barangay' && legendName.textContent !== 'Volcanic Stream' ) {
    legendIcon.src = '../img/effluentflowlegend.png'; // Change this to your default icon path
    legendName.textContent = 'Discharge Path';

    waterwaysLayer.setStyle({
      color: '#0000CD', // Default blue color
      weight: 3 // Default weight
  });
  }
}



