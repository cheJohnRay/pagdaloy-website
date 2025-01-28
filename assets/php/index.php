<?php 
  session_start();
  include('database.php');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Map</title>
    <link rel="icon" href="../img/PAGPAG.png">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>
     <link rel="stylesheet" href="../css/map.css"/>
     <link rel="stylesheet" href="../css/summary.css"/>
     <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin=""></script>
</head>

<div id="map"></div>
    
<div class="modal-container" id="modal-container">

<div id="modal-popup">
    <img id="close" src="../img/close-icon.png" alt="close">

    <h1 class="modal-header">
        <img id="custommarker-pic" src="../img/pig-icon.png" alt="custommarker">
        Input Custom Data
    </h1>

    <div class="inputbox">
        <label for="farmname">Farm Name:</label>
        <input type="text" id="farmname" name="farmname">

        <label for="sanitation">Sanitation:</label>
          <select id="sanitation" name="sanitation">
          <option value="N/A" disabled selected hidden id="sanitation">Types of Sanitation</option>
              <option value="Septic Tank">Septic Tank</option>
              <option value="Composting">Composting</option>
              <option value="Free-flow">Free-flow</option>
              <option value="Biogas">Biogas</option>
              <option value="Ipa/Rice Hull">Ipa/Rice Hull</option>
              <option value="Lagoon">Lagoon</option>
              <option value="N/A">N/A</option>
          </select>

        <div class="info-main-container">
          <div class="info-inputbox">
            <div class="info-type">
              <label class="sow" for="sowcount">Sow:</label>
              <input class="sow" type="number" id="sow" name="sowcount" min="0">
            </div>
            <div class="info-type">
              <label for="fattenercount">Fattener:</label>
              <input type="number" id="fattener" name="fattenercount" min="0">
            </div>
            <div class="info-type">
              <label for="nativecount">Native:</label>
              <input type="number" id="native" name="nativecount" min="0">
            </div>
          </div>  

          <div class="info-inputbox">
            <div class="info-type">
              <label for="boarcount">Boar:</label>
              <input type="number" id="boar" name="boarcount" min="0">
            </div>
            <div class="info-type">
              <label for="pigletcount">Piglet:</label>
              <input type="number" id="piglet" name="pigletcount" min="0">
            </div>
          </div>
        </div>
        
    </div>
    <button id="save-btn">Save</button>
</div>

</div>

        <div id="home">
          <a href="../php/home.php"><img id="header-logo" src="../img/home_icon.png" alt="LOGO"></a>
          <div id="modal"><img id="custom-modal" src="../img/add_icon.png" alt="add"></div>
          <img id="flow-acc" src="../img/summary_icon.png" alt="">
          <div id="clearmarker"><img id="clearme" src="../img/refresh_icon.png" alt="clearmarker"></div>
        </div>

        <div id="legend">
    <h1>LEGEND</h1>
    <div id="waterwayhover" class="legend-contents" onmouseover="updateLegend(event, 'volcstream.png', 'Volcanic Stream')" onmouseout="resetLegend(event)">
        <img src="../img/waterwaylegend.png" alt="">
        <p>Waterways</p>
    </div>
    <div class="legend-contents" onmouseover="updateLegend(event, 'barangay-icon.png', 'Barangay')" onmouseout="resetLegend(event)">
    <img id="markericonlegend" src="../img/barangay-icon.png" alt="">
    <p>Barangay</p>
</div>
<div class="legend-contents" onmouseover="updateLegend(event, 'pig-icon.png', 'Pig Farm')" onmouseout="resetLegend(event)">
    <img id="pigfarmlegend" src="../img/pig-icon.png" alt="">
    <p>Pig Farm</p>
</div>


<div class="legend-contents" onmouseover="updateLegend(event, 'degraded.png', 'Degraded Waterways')" onmouseout="resetLegend(event)">
    <img src="../img/effluentflowlegend.png" alt="">
    <p>Discharge Path</p>
</div>

</div>


        <div class="container-cities">

        </div>
        
        <div class="summary-container">
          <div class="summary-wrapper">
            <div class="summary-item" id="municipalityContainer">
              <div class="head">
                <h1>Summary</h1>
                <img class='exit' src="../img/close-icon.png" alt="">
              </div>
              <div id="municipalityContainer">
              <div class="agoncillo_summary">
                <button class="municipalities-name" id="AGON" onclick="showMunicipalityMarkers('Agoncillo')">Agoncillo</button>
                <div class="barangay-container agoncillo-barangays AGON">
                  <!-- Barangays will be dynamically inserted here -->
                </div>
              </div>
            <div class="alitagtag_summary">
                <button class="municipalities-name" id="ALI" onclick="showMunicipalityMarkers('Alitagtag')">Alitagtag</button>
                <div class="barangay-container alitagtag-barangays ALI"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
            <div class="balete_summary">
                <button class="municipalities-name" id="BAL" onclick="showMunicipalityMarkers('Balete')">Balete</button>
                <div class="barangay-container balete-barangays BAL"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
            <div class="cuenca_summary">
                <button class="municipalities-name" id="CUE" onclick="showMunicipalityMarkers('Cuenca')">Cuenca</button>
                <div class="barangay-container cuenca-barangays CUE"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
            <div class="laurel_summary">
                <button class="municipalities-name" id="LAU" onclick="showMunicipalityMarkers('Laurel')">Laurel</button>
                <div class="barangay-container laurel-barangays LAU"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
            <div class="mataasnakahoy_summary">
                <button class="municipalities-name" id="MNK" onclick="showMunicipalityMarkers('Mataas Na Kahoy')">Mataas Na Kahoy</button>
                <div class="barangay-container mataasnakahoy-barangays MNK"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
            <div class="sannicolas_summary">
                <button class="municipalities-name" id="SAN" onclick="showMunicipalityMarkers('San Nicolas')">San Nicolas</button>
                <div class="barangay-container sannicolas-barangays SAN"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
                <div class="stateresita_summary">
    <button class="municipalities-name" id="STA" onclick="showMunicipalityMarkers('Sta. Teresita')">Sta. Teresita</button>
    <div class="barangay-container stateresita-barangays STA"></div>
    <!-- Barangays will be dynamically inserted here -->
</div>
            <div class="talisay_summary">
                <button class="municipalities-name" id="TAL" onclick="showMunicipalityMarkers('Talisay')">Talisay</button>
                <div class="barangay-container talisay-barangays TAL"></div>
                  <!-- Barangays will be dynamically inserted here -->
                </div>
            <div class="tanauan_summary">
                <button class="municipalities-name" id="TAN" onclick="showMunicipalityMarkers('Tanauan')">Tanauan</button>
                <div class="barangay-container tanauan-barangays TAN"></div>
                    </div>
                  </div>
                </div>
                </div>
                
                <script>
          // Get all municipality buttons
          const municipalityButtons = document.querySelectorAll('.municipalities-name');
        
          // Function to toggle barangay container visibility
          function toggleBarangayContainer(event) {
            const barangayContainers = document.querySelectorAll('.barangay-container.active');
            barangayContainers.forEach(container => {
              container.classList.remove('active');
            });
        
            const barangayContainer = event.currentTarget.nextElementSibling;
            barangayContainer.classList.toggle('active');
          }
        
          // Function to create and append barangay items to container
          function createBarangayItems(container, barangays) {
            barangays.forEach(barangay => {
              const barangayItem = document.createElement('div');
              barangayItem.classList.add('barangay-item');
              barangayItem.textContent = barangay;
              container.appendChild(barangayItem);
            });
          }

function createBarangayItems(container, barangays) {
  barangays.forEach(barangay => {
    const barangayItem = document.createElement('div');
    barangayItem.classList.add('barangay-item');
    barangayItem.textContent = barangay;
    barangayItem.addEventListener('click', () => {
      // Get the coordinates for the clicked barangay
      const coordinates = getCoordinatesForBarangay(barangay);
      if (coordinates) {
        // Fly to the coordinates
        map.flyTo(coordinates, 17); // Assuming `map` is your Leaflet map object
      }
    });
    container.appendChild(barangayItem);
  });
}
        </script>
<script type="text/javascript">
  document.addEventListener("DOMContentLoaded", function() {
    fetchUserDataAndShowButtons();
});

function fetchUserDataAndShowButtons() {
    var xhr = new XMLHttpRequest();
    var url = 'userdata.php';

    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var userData = JSON.parse(xhr.responseText);
                    showButtonsBasedOnUserTypeAndMunicipality(userData.user_type, userData.municipality_code);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                console.error('Request failed with status:', xhr.status);
            }
        }
    };

    xhr.send();
}

function showButtonsBasedOnUserTypeAndMunicipality(user_type, municipality_code) {
    console.log("User Type:", user_type);
    console.log("Municipality Code:", municipality_code);

    // Hide all buttons initially
    var allButtons = document.querySelectorAll('.municipalities-name');
    allButtons.forEach(button => {
        button.style.display = "none";
        console.log("Button ID:", button.id);
    });

    // Show buttons based on user type and municipality code
    if (user_type === "ADMIN" && municipality_code === "ADMIN") {
        console.log("Admin logged in");
        // Show all buttons for admin
        allButtons.forEach(button => {
            button.style.display = "inline-block";
        });

              // Function to show markers for a specific municipality
      fetch(apiURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        var customIcon = L.icon({
          iconUrl: '../img/barangay-icon.png',
          iconSize: [37, 43],
          iconAnchor: [22, 94],
          popupAnchor: [-3, -76]
        });

        // Load the GeoJSON file once and store the data for later use
        fetch('../../geojson_files/Shapefiles.geojson')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
          })
          .then(geojsonData => {
            // Create shape layers for each municipality
            data.forEach(item => {
              var municipalityName = item.municipality;
              if (!shapeLayers[municipalityName]) {
                var specificFeatures = geojsonData.features.filter(feature => feature.properties.ADM3_EN === municipalityName);
                shapeLayers[municipalityName] = L.geoJSON(specificFeatures, {style: {color: getMunicipalityColor(municipalityName)}}); // Example style, customize as needed
                shapeLayers[municipalityName].addTo(map);
              }
            });

            function getMunicipalityColor(municipalityName) {
              // Here you can implement your logic to return a specific color for each municipality
              // For example, you could use a switch statement or an object with key-value pairs
              const municipalityColors = {
                'Agoncillo': '#B0C4DE', // Light Steel Blue
                'Alitagtag': '#87CEFA', // Silver
                'Balete': '#B0E0E6',    // Powder Blue
                'Cuenca': '#D8BFD8',    // Light Gray
                'Laurel': '#E0FFFF',    // Light Cyan
                'Mataas Na Kahoy': '#F0E68C', // Khaki
                'San Nicolas': '#F5F5DC',      // Moccasin
                'Sta. Teresita': '#FFDAB9',    // Peach Puff
                'Talisay': '#98FB98',           // Pale Green
                'Tanauan': '#F5F5F5',            // White Smoke
              };
            
              // Return the color for the municipality, or a default color if not found
              return municipalityColors[municipalityName] || '#CCCCCC'; // default color
            }
        
            // Create markers for each item
            data.forEach(item => {
              var marker = L.marker([item.latitude, item.longitude], { icon: customIcon });
              marker.bindPopup(` <b>Municipality </b>: ${item.municipality} <br>  <b>Barangay: </b> ${item.barangay}<br>  <b>Latitude: </b> ${item.latitude} <br>  <b>Longitude: </b> ${item.longitude}`);
              if (!markersByMunicipality[item.municipality]) {
                markersByMunicipality[item.municipality] = [];
              }
              markersByMunicipality[item.municipality].push(marker);
              marker.addTo(map); // Add the marker to the map
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
            });
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });

      function displayPiggeries() {
    fetch(piggeriesUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Process marker data and display markers on the map
            data.forEach(markerData => {
                const markerIcon = L.icon({
                    iconUrl: '../img/pig-icon.png',
                    iconSize: [39, 43],
                    iconAnchor: [22, 94],
                    popupAnchor: [-3, -76]
                });
                const marker = L.marker([markerData.latitude, markerData.longitude], { icon: markerIcon }).addTo(map);
                // Customize popup content if needed
                const popupContent = `
                <div style="font-size: 12px;">
              <b style="font-size: 14px;">${markerData.farm_name}</b><br>
              <span style="font-weight: bold;">Sow Count:</span> ${markerData.sow_count}<br>
              <span style="font-weight: bold;">Boar Count:</span> ${markerData.boar_count}<br>
              <span style="font-weight: bold;">Fattener Count:</span> ${markerData.fattener_count}<br>
              <span style="font-weight: bold;">Piglet Count:</span> ${markerData.piglet_count}<br>
              <span style="font-weight: bold;">Native Count:</span> ${markerData.native_count}<br>
              <span style="font-weight: bold;">Latitude:</span> ${markerData.latitude}<br>
              <span style="font-weight: bold;">Longitude:</span> ${markerData.longitude}<br>
              <span style="font-weight: bold;">Sanitation:</span> ${markerData.sanitation}<br>
            </div>     
                `;
                marker.bindPopup(popupContent);
               
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Handle fetch errors
        });
}
// Call the function to display piggeries when needed
displayPiggeries();
    } else if (user_type === "USER") {
        console.log("User logged in");
        // Convert municipality code to lowercase for case insensitivity
        var lowerCaseMunicipalityCode = municipality_code;
        // Show button for the logged-in municipality
        var loggedInButton = document.getElementById(lowerCaseMunicipalityCode);
        if (loggedInButton) {
            loggedInButton.style.display = "inline-block";
            console.log("Showing button for municipality:", lowerCaseMunicipalityCode);
            // Call function to show shape layer based on municipality code
            showShapeLayerBasedOnMunicipalityCode(lowerCaseMunicipalityCode);
            // Get the container div
            var container = document.getElementById("municipalityContainer");
            // Get the div containing the head
            var headDiv = document.querySelector('.head');
            // Move the logged-in button below the head div
            headDiv.parentNode.insertBefore(loggedInButton.parentNode, headDiv.nextSibling);
            
        } else {
            console.log("Button for municipality not found:", lowerCaseMunicipalityCode);
        }
    } else {
        console.log("Invalid user type:", user_type);
    }
}

function showShapeLayerBasedOnMunicipalityCode(municipality_code, user_type) {
  clearMarkers();
    console.log("User Type:", user_type);
    console.log("Municipality Code:", municipality_code);

    // Define custom icons for different markers
    var customIcon = L.icon({
        iconUrl: '../img/barangay-icon.png',
        iconSize: [37, 43],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });

    var piggeryIcon = L.icon({
        iconUrl: '../img/pig-icon.png',
        iconSize: [37, 43],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });
    // Fetch barangay data
    fetch(apiURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (municipality_code) {
        data = data.filter(item => item.municipality_code === municipality_code);
      }

      data.forEach(item => {
        var marker = L.marker([item.latitude, item.longitude], { icon: customIcon })
          .bindPopup(`<b>Municipality</b>: ${item.municipality}<br><b>Barangay:</b> ${item.barangay}<br><b>Latitude:</b> ${item.latitude}<br><b>Longitude:</b> ${item.longitude}`);
          if (!markersByMunicipality[item.municipality]) {
                markersByMunicipality[item.municipality] = [];
              }
        markersByMunicipality[item.municipality].push(marker);
        marker.addTo(map); // Add the marker to the map
        marker.on("popupopen", function (e) {
                  var map = e.target._map;
                  var markerLatLng = marker.getLatLng();
                  map.setView(markerLatLng, map.getZoom() + 1);
            });
            marker.on("popupclose", function (e) {
             var map = e.target._map;
             map.setZoom(map.getZoom() - 1);
          });
          
      });
    })
    .catch(error => {
      console.error('Error fetching barangay data:', error);
    });
let piggeryMarkers = [];

fetch(piggeriesUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(filteredPiggeries => {
    if (municipality_code) {
      // Filter only for user type 'USER' and specific municipality code
      filteredPiggeries = filteredPiggeries.filter(piggery => piggery.municipality_code === municipality_code);
    }

    // Debugging: Log filtered data
    console.log('Filtered Piggeries:', filteredPiggeries);

    // Remove markers not in filteredPiggeries
    piggeryMarkers.forEach(marker => {
      const markerIndex = filteredPiggeries.findIndex(piggery => piggery.latitude === marker.getLatLng().lat && piggery.longitude === marker.getLatLng().lng);
      if (markerIndex === -1) {
        map.removeLayer(marker);
        piggeryMarkers = piggeryMarkers.filter(m => m !== marker); // Remove from array
      }
    });

    // Add markers for filteredPiggeries
    filteredPiggeries.forEach(piggery => {
      // Check if marker already exists
      const existingMarker = piggeryMarkers.find(marker => marker.getLatLng().lat === piggery.latitude && marker.getLatLng().lng === piggery.longitude);
      if (!existingMarker) {
        const piggeryMarker = L.marker([piggery.latitude, piggery.longitude], { icon: piggeryIcon })
          .bindPopup(`<div style="font-size: 12px;">
              <b style="font-size: 14px;">${piggery.farm_name}</b><br>
              <span style="font-weight: bold;">Sow Count:</span> ${piggery.sow_count}<br>
              <span style="font-weight: bold;">Boar Count:</span> ${piggery.boar_count}<br>
              <span style="font-weight: bold;">Fattener Count:</span> ${piggery.fattener_count}<br>
              <span style="font-weight: bold;">Piglet Count:</span> ${piggery.piglet_count}<br>
              <span style="font-weight: bold;">Native Count:</span> ${piggery.native_count}<br>
              <span style="font-weight: bold;">Latitude:</span> ${piggery.latitude}<br>
              <span style="font-weight: bold;">Longitude:</span> ${piggery.longitude}<br>
              <span style="font-weight: bold;">Sanitation:</span> ${piggery.sanitation}<br>
            </div>`);
        piggeryMarker.addTo(map);
        piggeryMarkers.push(piggeryMarker);
          
      }
    });
  })
  .catch(error => {
    console.error('Error fetching piggery data:', error);
  });

  function getADM3_ENFromMunicipalityCode(municipality_code) {
    // Define the mapping from municipality_code to ADM3_EN
    const municipalityCodeMapping = {
        'AGON': 'Agoncillo',
        'ALI': 'Alitagtag',
        'BAL': 'Balete',
        'CUE': 'Cuenca',
        'LAU': 'Laurel',
        'MNK': 'Mataas Na Kahoy',
        'SAN': 'San Nicolas',
        'STA': 'Sta. Teresita',
        'TAN': 'Tanauan',
        'TAL': 'Talisay'
        // Add more mappings as needed
    };
    return municipalityCodeMapping[municipality_code];
}
function getMunicipalityColor(municipalityName) {
    const municipalityColors = {
        'Agoncillo': '#B0C4DE', // Light Steel Blue
        'Alitagtag': '#87CEFA', // Silver
        'Balete': '#B0E0E6',    // Powder Blue
        'Cuenca': '#D8BFD8',    // Light Gray
        'Laurel': '#E0FFFF',    // Light Cyan
        'Mataas Na Kahoy': '#F0E68C', // Khaki
        'San Nicolas': '#F5F5DC',      // Moccasin
        'Sta. Teresita': '#FFDAB9',    // Peach Puff
        'Talisay': '#98FB98',           // Pale Green
        'Tanauan': '#F5F5F5',           // White Smoke
    };
    
    // Return the color for the municipality, or a default color if not found
    return municipalityColors[municipalityName] || '#CCCCCC'; // default color
}
    // Fetch GeoJSON data
    fetch('../../geojson_files/Shapefiles.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(geojsonData => {
        // Find the corresponding ADM3_EN value for the given municipality_code
        var ADM3_EN = getADM3_ENFromMunicipalityCode(municipality_code);
        if (ADM3_EN) {
            clearShapeLayers();
            // Filter the GeoJSON data to get features with matching ADM3_EN
            var specificFeatures = geojsonData.features.filter(feature => feature.properties.ADM3_EN === ADM3_EN);
            if (specificFeatures.length > 0) {
                // Display the shape layer
                shapeLayer = L.geoJSON(specificFeatures, {
                    style: {
                        color: getMunicipalityColor(ADM3_EN)
                    }
                });
                shapeLayer.addTo(map);
            } else {
                console.log("Shape layer not found for municipality code:", municipality_code);
            }
        } else {
            console.log("ADM3_EN not found for municipality code:", municipality_code);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        });
}

function clearFetchedShapeLayer() {
    if (shapeLayer) {
        map.removeLayer(shapeLayer);
        shapeLayer = null;
    }
}
function getADM3_ENFromMunicipalityCode(municipality_code) {
    // Define the mapping from municipality_code to ADM3_EN
    const municipalityCodeMapping = {
        'AGON': 'Agoncillo',
        'ALI': 'Alitagtag',
        'BAL': 'Balete',
        'CUE': 'Cuenca',
        'LAU': 'Laurel',
        'MNK': 'Mataas Na Kahoy',
        'SAN': 'San Nicolas',
        'STA': 'Sta. Teresita',
        'TAN': 'Tanauan',
        'TAL': 'Talisay'
        // Add more mappings as needed
    };
    return municipalityCodeMapping[municipality_code];
} 
</script>
      </div>  
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="../js/map.js"></script>
</body>
</html>