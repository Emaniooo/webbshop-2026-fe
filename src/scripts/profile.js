import { getBaseUrl } from "../utils/api.js";

const BASE_URL = getBaseUrl();

/* Mina Växter */
async function loadMyPlants(user) {
  const res = await fetch(BASE_URL + "plants");
  const plants = await res.json();

  const myPlants = plants.filter(p => p.ownerId === user.id);

  const container = document.getElementById("plant-list");

  container.innerHTML = myPlants
    .map((p) => `
      <div class="list-item">
        <img src="${p.imageUrl || p.image}" width="60" />
        <div>
          <strong>${p.plantName || p.name}</strong>
          <p>☀️ Light: ${p.light ?? "N/A"}</p>
          <button class="delete-btn" data-id="${p._id}">Ta bort</button>
        </div>
      </div>
    `)
    .join("");

  // DELETE LOGIC
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Är du säker att du vill ta bort växten?")) return;

      try {
        const res = await fetch(BASE_URL + "plants/" + id, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          alert("Kunde inte ta bort växt ❌");
          return;
        }

        // notification icon
        const notifIcon = document.getElementById("notification-icon");
        if (notifIcon) {
          const hasNotification = true;
          notifIcon.src = hasNotification ? "notis2.png" : "notis1.png";
        }

        alert("Växt borttagen 🌱");
        loadMyPlants(user);

      } catch (err) {
        console.error(err);
        alert("Något gick fel");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("loggedIn"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("welcome-text").textContent =
    `Välkommen, ${user.name}!`;

  const loginBtn = document.getElementById("nav-login-btn");
  loginBtn.textContent = "Logga ut";
  loginBtn.href = "#";

  loginBtn.addEventListener("click", () => {
    sessionStorage.removeItem("loggedIn");
    alert("Du har loggats ut!");
    window.location.href = "index.html";
  });

  const profileIconContainer = document.getElementById("profile-icon-container");
  const profileDropdown = document.getElementById("profile-dropdown");
  const profileIcon = document.getElementById("profile-icon");
  profileIconContainer.style.display = "block";

  document.getElementById("dd-name").textContent = user.name;
  document.getElementById("dd-email").textContent = user.email;

  profileIcon.addEventListener("click", () => {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  });

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
      }

      if (tab === "user-plants") {
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
  if (status === "approved") {
    return `<span class="status approved">✅ Approved</span>`;
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

  if (!res.ok) {
    const container = document.getElementById("user-history");
    container.innerHTML = "<p>Session expired – logga in igen</p>";
    return;
  }

  const trades = await res.json();
  const history = trades.data || trades;

  history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const container = document.getElementById("user-history");

  if (!Array.isArray(history) || history.length === 0) {
    container.innerHTML = "<p>Ingen historik att visa.</p>";
    return;
  }

  container.innerHTML = history
    .map((t) => {
      const plant = t.plantId;

      const isSender = t.requesterId?._id === user.id;

      const otherUser = isSender
        ? t.ownerId?.name || "Unknown"
        : t.requesterId?.name || "Unknown";

      const direction = isSender ? `Du → ${otherUser}` : `${otherUser} → Du`;

      return `
      <div class="list-item">
        <img 
          src="${plant?.imageUrl || "default-plant.png"}" 
          width="60"
          onerror="this.src='default-plant.png'"
        />

        <div>
          <strong>${plant?.plantName || "Växt"}</strong>
          <p>☀️ Light: ${plant?.light ?? "N/A"}</p>
          <p>🤝 ${direction}</p>
          <p>${getStatusBadge(t.status)}</p>
          <p>📅 ${new Date(t.createdAt).toLocaleString()}</p>
        </div>
      </div>
    `;
    })
    .join("");
}
