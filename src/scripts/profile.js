import { getBaseUrl } from "../utils/api.js";

const BASE_URL = getBaseUrl();

async function loadMyPlants(user) {
  const res = await fetch("https://plottwistgrupp11.vercel.app/plants");
  const plants = await res.json();

  console.log("FIRST PLANT:", plants[0]);
  console.log("USER:", user);

  const myPlants = plants.filter((p) => p.ownerId === user.id);

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
    `,
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
          },
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

      if (tab === "user-history") {
        loadHistory(user);
      } else if (tab === "user-plants") {
        loadMyPlants(user);
      }
    });
  });
  loadMyPlants(user);
});

/* HELPER */
function getStatusBadge(status) {
  if (status === "pending") {
    return `<span class="status pending">⏳ Pending</span>`;
  }
  if (status === "accepted") {
    return `<span class="status accepted">✅ Accepted</span>`;
  }
  if (status === "rejected") {
    return `<span class="status rejected">❌ Rejected</span>`;
  }
  if (status === "completed") {
    return `<span class="status completed">🎉 Completed</span>`;
  }
  return `<span class="status">${status}</span>`;
}

/* History */
async function loadHistory(user) {
  const res = await fetch(BASE_URL + "trades/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const container = document.getElementById("user-history");

  if (!res.ok) {
    container.innerHTML = "<p>Session expired – logga in igen</p>";
    return;
  }

  const trades = await res.json();
  const historyData = trades.data || trades;

  console.log("HISTORY DATA:", historyData);

  // 🔒 Safety: ensure array
  if (!Array.isArray(historyData) || historyData.length === 0) {
    container.innerHTML = "<p>Ingen historik att visa.</p>";
    return;
  }

  // 🔽 Sort newest first
  historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = historyData
    .map((t) => {
      const plant = t.plantId || t.plant || {};

      // Fix user id comparison (important!)
      const userId = user._id || user.id;

      const requesterId = t.requesterId?._id || t.requesterId;
      const ownerId = t.ownerId?._id || t.ownerId;

      const isReceiver = ownerId === userId;

      const isSender = requesterId === userId;

      const otherUser = isSender
        ? t.ownerId?.name || t.owner?.name || "Unknown"
        : t.requesterId?.name || t.requester?.name || "Unknown";


      const direction = isSender
        ? `Du skickade till ${otherUser}`
        : `${otherUser} skickade till dig`;

      return `
      <div class="list-item">
        <img 
          src="${plant.imageUrl || (plant.image?.startsWith("data:image") ? plant.image : "") || "default-plant.png"}" 
          width="60"
          onerror="this.src='default-plant.png'"
        />

        <div>
          <strong>${plant.plantName || plant.name || "Växt"}</strong>
          <p>☀️ Light: ${plant.light ?? "N/A"}</p>
          <p>🤝 ${direction}</p>
          <p>${getStatusBadge(t.status)}</p>
          <p>📅 ${new Date(t.createdAt).toLocaleString()}</p>

          ${
            isReceiver && t.status === "pending"
              ? `<button class="approve-btn" onclick="approveTrade('${t._id}')">Godkänn</button>`
              : ""
          }

        </div>
      </div>
      
    `;
    })
    .join("");
}
window.approveTrade = async function (id) {
  await fetch(BASE_URL + "trades/" + id + "/approve", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const user = JSON.parse(sessionStorage.getItem("loggedIn"));
  loadHistory(user);
};
