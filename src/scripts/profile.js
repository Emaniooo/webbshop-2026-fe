import { getBaseUrl } from "../utils/api.js";
const BASE_URL = getBaseUrl();

async function loadMyPlants(user) {
  const res = await fetch(BASE_URL + "plants");
  const plants = await res.json();

  const myPlants = plants;

  const container = document.getElementById("plant-list");

  container.innerHTML = myPlants
    .map(
      (p) => `
    <div class="list-item">
      <img src="${p.image || p.imageUrl}" width="60" />
      <div>
        <strong>${p.name || p.plantName}</strong>
        <p>Plats: ${p.location || "Okänd"}</p>
        <button class="delete-btn" data-id="${p._id}">Ta bort</button>
      </div>
    </div>
  `,
    )
    .join("");

  //
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      console.log("CLICKED");

      const id = btn.dataset.id;
      console.log("Deleting:", id);

      await fetch(BASE_URL + "plants/" + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

        // Notis-ikon
        const notifIcon = document.getElementById("notification-icon");

        if (notifIcon) {
          const hasNotification = true; // byter till backend sen
          notifIcon.src = hasNotification ? "notis2.png" : "notis1.png";
        }

      loadMyPlants(user);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("loggedIn"));

  // Om ingen är inloggad - skicka till login
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // välkomsttext
  document.getElementById("welcome-text").textContent =
    `Välkommen, ${user.name}!`;

  // Ändra nav-knappen till Logga ut
  const loginBtn = document.getElementById("nav-login-btn");
loginBtn.textContent = "Logga ut";
loginBtn.href = "#";

loginBtn.addEventListener("click", () => {
  sessionStorage.removeItem("loggedIn");
    alert("Du har loggats ut!");
  window.location.href = "index.html";
});


  // Visa profil-ikon när man är inloggad
  const profileIconContainer = document.getElementById(
    "profile-icon-container",
  );
  const profileDropdown = document.getElementById("profile-dropdown");
  const profileIcon = document.getElementById("profile-icon");
  profileIconContainer.style.display = "block";

  // Användardata
  document.getElementById("dd-name").textContent = user.name;
  document.getElementById("dd-email").textContent = user.email;

  // Öppna dropdown
  profileIcon.addEventListener("click", () => {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  });

  // Stäng dropdown
  document.addEventListener("click", (e) => {
    if (!profileIconContainer.contains(e.target)) {
      profileDropdown.style.display = "none";
    }
  });
  // placeholder-data // kommentat ut denna. vill inte använda fake data
  /* const placeholder = {
    plants: [
      { name: "Monstera", location: "Göteborg" },
      { name: "Aloe Vera", location: "Borås" }
    ]
  }; */

  // Växter
  /* document.getElementById("plant-list").innerHTML =
    placeholder.plants.map(p => `
      <div class="list-item">
        <strong>${p.name}</strong>
        <p>Plats: ${p.location}</p>
      </div>
    `).join(""); */

  // Tabs
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tab).classList.add("active");
    });
    
  });
  loadMyPlants(user);
});


// incoming request 
const incomingTab = document.querySelector("#incoming-tab");

incomingTab.addEventListener("click", () => {

  console.log("Hej")
  const statusPara = document.createElement("p");
  statusPara.innerHTML = `Status: `;

  const incomingTradesBox = document.querySelector("#Incoming-trades-box");

  async function getIncomingReq() {
    try {
      const res = await fetch(getBaseUrl() + "trades/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(res);
      if (!res.ok) {
        throw new Error("Failed to fetch trades");
      }

      const data = await res.json();

      const incomingTrades = data; 

      incomingTradesBox.innerHTML = incomingTrades.map(
      (p) => `
      <div class="list-item">
      <p>${p.requesterId?.name || "Okänd"} har skickat en förfrågan</p>
      <img src="${p.plantId?.imageUrl || "Bild kunde ej laddas"}" width="60" />
      <div>
      <strong>${p.plantId?.plantName || "Okänd"}</strong>
      <p>Plats: ${p.requesterId?.name.location || "Okänd"}</p>
      <button class= "acceptBtn">Acceptera</button>
      <button class= "declineBtn">Avböj</button>
      </div>
      </div>
      `   ,
      )
      .join("");

      console.log(data);

      
    } catch (error) {
      console.error(error);
    }
  }

  getIncomingReq();

  

})