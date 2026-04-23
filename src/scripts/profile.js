import { getBaseUrl } from "../utils/api.js";

const BASE_URL = getBaseUrl();

async function loadMyPlants(user) {
  const res = await fetch("https://plottwistgrupp11.vercel.app/plants");
  const plants = await res.json();

  console.log("FIRST PLANT:", plants[0]);
  console.log("USER:", user);

  const myPlants = plants.filter(p => p.ownerId === user.id);
  
  const container = document.getElementById("plant-list");
  
  container.innerHTML = myPlants
    .map(
      (p) => `
      <div class="list-item">
        <img src="${p.imageUrl || p.image}" width="60" />
        <div>
          <strong>${p.plantName || p.name}</strong>
          <p>Plats: ${p.location || "Okänd"}</p>
          <button class="delete-btn" data-id="${p._id}">Ta bort</button>
        </div>
      </div>
    `
    )
    .join("");

  // DELETE LOGIC
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Är du säker att du vill ta bort växten?")) return;

      try {
        const res = await fetch(
          `https://plottwistgrupp11.vercel.app/plants/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) {
          alert("Kunde inte ta bort växt ❌");
          return;
        }

        alert("Växt borttagen 🌱");
        loadMyPlants(user); // refresh

      } catch (err) {
        console.error(err);
        alert("Något gick fel");
      }
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
  setTimeout(() => {
  loadMyPlants(user);
}, 0);

  loadMyPlants(user);
});

/* ------------------------------- incoming request start here  ------------------------------------------ */

// const incomingTab = document.querySelector("#incoming-tab");
const statusPara = document.createElement("p");
statusPara.innerHTML = `Status: `;

const incomingTradesbox = document.querySelector("#Incoming-trades-box");

async function getIncomingReq() {
  try {
    //get backend data of trades 
    const res = await fetch(getBaseUrl() + "trades/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log(res);
    if (!res.ok) {
      throw new Error("Could not fetch trades");

    }
    
    const data = await res.json();
    

    if (!data || data.length === 0) {
      const displayNoRequests = document.createElement("p");
      displayNoRequests.innerHTML = `Du har inga förfrågningar`;
      incomingTradesbox.append(displayNoRequests);
      return;
    }

    incomingTradesbox.innerHTML = data.map(
    (p) => `
    <div class="list-item">
    <p>${p.requesterId?.name || "Okänd"} har skickat en förfrågan</p>
    <img src="${p.plantId?.imageUrl || "Bild kunde ej laddas"}" width="60" />
    <div>
    <strong>${p.plantId?.plantName || "Okänd"}</strong>
    <p>Plats: ${p.requesterId?.location|| "Okänd"}</p>
    <button class= "acceptBtn" data-id="${p._id}" >Acceptera</button>
    <button class= "declineBtn" data-id="${p._id}">Avböj</button>
    
    
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

//check if buttons exist and set logic
incomingTradesbox.addEventListener("click", (e) => {
  if(e.target.classList.contains("acceptBtn")) {
    console.log("approved");
    // console.log(e.data.id)
    const idRequest = e.target.dataset.id;
    console.log("Approved" + idRequest);

    acceptTrade(idRequest);

  } else if(e.target.classList.contains("declineBtn")) {
    console.log("Declined");
    const idRequest = e.target.dataset.id;
    console.log("Declined " + idRequest)
    //alert here 
  }
})

getIncomingReq();


async function acceptTrade(id) {
  try {
    const res = await fetch(getBaseUrl() + "trades/" + id + "/approve", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }

      //alert here 
    });
    if (!res.ok) {
      throw new Error("Failed to approve trade");
    }
  } catch (error) {
    console.error(error);
    //alert here
  }
}

/* ------------------------------- incoming request ends here  ------------------------------------------ */