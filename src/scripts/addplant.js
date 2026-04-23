import { getBaseUrl } from "../utils/api.js";
// MAP SETUP
const selectMap = L.map("select-map").setView([59.33, 18.06], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(selectMap);

// MAP INTERACTION
let selectedCoordinates = null;
let selectedMarker;

// click to select location
selectMap.on("click", function (e) {
  const { lat, lng } = e.latlng;

  selectedCoordinates = [lat, lng];

  console.log("Selected:", selectedCoordinates);

  if (selectedMarker) {
    selectMap.removeLayer(selectedMarker);
  }

  selectedMarker = L.marker([lat, lng]).addTo(selectMap);
  selectedMarker.bindPopup("Vald plats 🌱").openPopup();
});

// USER LOCATION
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    L.marker([lat, lng]).addTo(selectMap).bindPopup("Du är här 📍");
    selectMap.setView([lat, lng], 14);
  },
  (err) => {
    console.log("Location error:", err);
  },
);

// FORM
const form = document.getElementById("plantForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Auth gate user måste logga in först
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Du måste logga in först");
    window.location.href = "/login.html";
    return;
  }

  const BASE_URL = getBaseUrl();

  const plantName = document.getElementById("plantName").value;
  const imageUrl = document.getElementById("plantImage").value;
  const light = Number(document.getElementById("lightLevel").value);

  if (!selectedCoordinates) {
    alert("Välj en plats på kartan 📍");
    return;
  }

  const newPlant = {
    plantName,
    description: "Fin växt 🌱",
    light,
    water: 1,
    imageUrl: imageUrl.includes("?")
      ? imageUrl
      : imageUrl + "?w=400&h=300&fit=crop",
    coordinates: selectedCoordinates,
    meetingTime: new Date().toISOString(),
    available: true,
  };

  try {
    console.log("TOKEN:", localStorage.getItem("token"));

    const res = await fetch(BASE_URL + "plants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newPlant),
    });

    if (!res.ok) {
      alert("Kunde inte spara växt ❌");
      return;
    }

    // CONFIRMATION UI
    form.innerHTML = `
      <div class="confirmation-box">
        <h2>🌱 Växt tillagd!</h2>
        <p>Din växt finns nu på kartan</p>

        <div class="confirmation-buttons">
          <button id="goHome">Gå till Hem</button>
          <button id="goMap">Se på karta</button>
        </div>
      </div>
    `;

    document.getElementById("goHome").onclick = () => {
      window.location.href = "/index.html";
    };

    document.getElementById("goMap").onclick = () => {
      window.location.href = "/map.html";
    };
  } catch (error) {
    console.error("Error saving plant:", error);
  }
});
