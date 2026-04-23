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

// Se status 
async function loadTradeStatus(user) {
  const container = document.getElementById("status-list");
  container.innerHTML = "Laddar...";

  try {
    const res = await fetch(BASE_URL + "trades/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!res.ok) {
      container.innerHTML = "<p>Kunde inte hämta status just nu.</p>";
      return;
    }

    const trades = await res.json();

  // Hitta userId 
    const userId = user._id || user.id;

// Skickade förfrågningar
    const sentTrades = trades.filter(
      (t) => t.requester && (t.requester._id === userId || t.requester === userId),
    );

    if (!sentTrades.length) {
      container.innerHTML = "<p>Inga skickade förfrågningar ännu.</p>";
      return;
    }

    container.innerHTML = sentTrades
      .map((t) => {
        const plant = t.plantId || t.plant || {};
        const receiver = t.owner || t.receiver || {};
        const status = t.status || "pending";

        return `
        <div class="list-item status-item">
          <img src="${plant.imageUrl || plant.image || "placeholder.png"}" width="60" />
          <div class="status-main">
            <strong>${plant.plantName || plant.name || "Okänd växt"}</strong>
            <p>Mottagare: ${receiver.name || "Okänd användare"}</p>
          </div>
          <div class="status-meta">
            <span class="status-badge status-${status}">${status}</span>
          </div>
        </div>
      `;
      })
      .join("");

}catch (err) {
    console.error(err);
    container.innerHTML = "<p>Ett fel uppstod när status skulle hämtas.</p>";
  }
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

 // Ladda data per tab
      if (tab === "user-plants") {
        loadMyPlants(user);
      }
      if (tab === "user-status") {
        loadTradeStatus(user);
      }
      if(tab === "incoming-tab") {
        getIncomingReq(user);
      }
    });
    
  });
  setTimeout(() => {
  loadMyPlants(user);
}, 0);

  loadMyPlants(user);
});

/* ------------------------------- incoming request start here  ------------------------------------------ */

const incomingTradesbox = document.querySelector("#Incoming-trades-box");

// 
async function getIncomingReq(user) {
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
    
    //Check if there is no data and output text to user 
    if (!data || data.length === 0) {
      const displayNoRequests = document.createElement("p");
      displayNoRequests.innerHTML = `Du har inga förfrågningar`;
      incomingTradesbox.append(displayNoRequests);
      return;
    }

    data = data.filter((trade) => trade.ownerId !== null && trade.ownerId.id !== null && trade.ownerId.id !== user.id);

    //display data as text and image to user 
    incomingTradesbox.innerHTML = data.map(
    (p) => `
    <div class="list-item">
    <p>${p.requesterId?.name || "Okänd"} har skickat en förfrågan</p>
    <img src="${p.plantId?.imageUrl || "Bild kunde ej laddas"}" width="60" />
    <div>
    <strong>${p.plantId?.plantName || "Okänd"}</strong>
    <p>Plats: ${p.requesterId?.location|| "Okänd"}</p>
    <button class= "acceptBtn" data-id="${p._id}" >Godkänn</button>
    <button class= "declineBtn" data-id="${p._id}">Neka</button>
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

incomingTradesbox.addEventListener("click", (e) => {
  //check if button exist in the container
  if(e.target.classList.contains("acceptBtn")) {
    const idRequest = e.target.dataset.id;
    console.log("Approved " + idRequest);

    acceptTrade(idRequest);

  } if(e.target.classList.contains("declineBtn")) {
    const idRequest = e.target.dataset.id;
    console.log("Declined " + idRequest)
    
    alert("Du nekade förfrågan");
  }
})

async function acceptTrade(id) {
  try {
    const res = await fetch(getBaseUrl() + "trades/" + id + "/approve", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });
    if (!res.ok) {
      throw new Error("Failed to approve trade");
    }

      alert("Du godkände förfrågan!");
  } catch (error) {
    console.error(error);
    alert("Fel uppstod. Vänligen försök igen senare");
  }
}



//decline trade function here 

/* ------------------------------- incoming request ends here  ------------------------------------------ */