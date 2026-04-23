import { getPlants } from "./productsApi.js";

export let map = L.map('map');

/* ----------------------------search here-------------------------------------------------------------- */
var markersLayer = new L.LayerGroup();	//layer contain searched elements

map.addLayer(markersLayer);

map.addControl(new L.Control.FullScreen());

var controlSearch = new L.Control.Search({
    position: 'topleft',
    layer: markersLayer,
    initial: false,
    zoom: 18,
    marker: false,
    moveToLocation: (latLng, title, map) => {
        map.setView(latLng, 18);
        latLng.layer.fireEvent('click');
    }
});


map.addControl(controlSearch);

/* ----------------------------search end here-------------------------------------------------------------- */

async function loadPlants() {
    try {
        const plants = await getPlants();

        plants.forEach((plant, index) => {
            // safety check
            if (!plant.coordinates || plant.coordinates.length < 2) return;

            const lat = plant.coordinates[0];
            const lng = plant.coordinates[1];

            const marker = L.marker([lat, lng], {
                tags: [
                    `Ljusbehov: ${plant.light === 1 ? "Låg" : plant.light === 2 ? "Medel": plant.light === 3 ? "Hög"  : "Okänd"}`,
                    `Vattenbehov: ${plant.water === 1 ? "Låg" : plant.water === 2 ? "Medel" : plant.water === 3 ? "Hög" : "Okänd"}`
                ],
                    title: plant.plantName
                });

            // safer current user check (since backend auth not ready)
            const isOwner = false;

            marker.bindPopup(
            `
            <div class="popup-content">
            <h3>Namn: ${plant.plantName || "Okänd växt"}</h3>
        
            <p>Beskrivning: ${plant.description || "Ingen beskrivning"}</p>
        
            <p>Ljusbehov: ${plant.light === 1? "Låg" : plant.light ===2 ? "Medel" : plant.light === 3? "Hög" : "Okänd"}</p>
            <p>Vattenbehov: ${plant.water === 1? "Låg" : plant.water ===2 ? "Medel" : plant.water === 3? "Hög" : "Okänd"}</p>

        
            <p>Ägare: ${plant.ownerName || "Okänd"}</p>
        
            ${plant.imageUrl
                            ? `<img 
                src="${plant.imageUrl && plant.imageUrl !== 'https://example.com/monstera.jpg'
                                ? plant.imageUrl
                                : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6'
                            }"
                    class="popup-img"
                    />`
                            : ""
                        }
        
            ${isOwner
                            ? `
                    <button class="edit-btn">Redigera</button>
                    <button class="delete-btn">Ta bort</button>
                `
                            : `
                    <button class="trade-btn" data-id="${plant._id}">Begär byte</button>
                `
                        }
            </div>
            `,
                {
                    maxWidth: 220,
                    minWidth: 160,
                },
            );

            markersLayer.addLayer(marker);

            // focus first marker
            if (index === 0) {
                marker.openPopup();
                map.setView([lat, lng], 13);
            }
        });
    } catch (error) {
        console.error("Error loading plants:", error);
    }
}

loadPlants();

map.setView([59.325441, 18.071614], 13);

/* map.addControl(new L.Control.FullScreen()); */

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// user navigation 
navigator.geolocation.watchPosition(success, error);

let marker, circle, zoomed;

function success(pos) {
    console.log(pos);

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;

    if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
    }

    marker = L.marker([lat, lng]).addTo(map);

    circle = L.circle([lat, lng], {
        radius: accuracy,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
    }).addTo(map);

    if (!zoomed && circle) {
        zoomed = map.fitBounds(circle.getBounds());
    }

    map.setView([lat, lng]);
}

function error(err) {
    if (err.code === 1) {
        alert("Accept Plot Twist to access your current location");
    } else {
        alert("Cannot get current location");
    }
}


//filter sunlight for plants
L.control.tagFilterButton({
    data: ['Ljusbehov: Låg', 'Ljusbehov: Medel', 'Ljusbehov: Hög'],
    icon: '<i class="fa-regular fa-sun"></i>',
    filterOnEveryClick: true
}).addTo(map);

//filter plants type
L.control.tagFilterButton({
    data: ['Vattenbehov: Låg', 'Vattenbehov: Medel', 'Vattenbehov: Hög'],
    icon: '<i class="fa-solid fa-droplet"></i>',
    filterOnEveryClick: true
}).addTo(map);


jQuery('.easy-button-button').click(function () {
    let target = jQuery('.easy-button-button').not(this);
    target.parent().find('.tag-filter-tags-container').css({
        'display': 'none',
    });
});


document.querySelectorAll(".easy-button-button").forEach(function (button) {
    button.addEventListener("toggle", function () {
        let targets = Array.from(document.querySelectorAll('.easy-button-button'))
            .filter(el => el !== this);

        targets.forEach(target => {
            const container = target.parentElement.querySelector('.tag-filter-tags-container');
            if (container) {
                container.style.display = 'none';
            }
        });
    });
});






