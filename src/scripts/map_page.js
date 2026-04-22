import { map } from "../utils/map.js";

import { getBaseUrl } from "../utils/api.js";
const BASE_URL = getBaseUrl();

// console.log("map_page.js is running");



// // simulate login (can be null)
// /* const currentUser = localStorage.getItem("user"); */


/* // popup interactions
map.on("popupopen", (e) => {
  console.log("POPUP OPENED");

  const popup = e.popup._contentNode;

  const tradeBtn = popup.querySelector(".trade-btn");
  console.log("Button found:", tradeBtn);

  const editBtn = popup.querySelector(".edit-btn");
  const deleteBtn = popup.querySelector(".delete-btn");

  if (tradeBtn) {
    tradeBtn.onclick = () => {
      const token = localStorage.getItem("token");

      // login check
      if (!token) {
        alert("Du måste logga in först");
        return;
      }

      const plantId = tradeBtn.dataset.id;

      console.log("CLICKED");
      console.log("Plant ID:", plantId);

      // TEMP feedback (before BE)
      alert("Förfrågan skickad 🌱");

      if (editBtn) {
        editBtn.onclick = () => {
          alert("Edit kommer senare");
        };
      }

      if (deleteBtn) {
        deleteBtn.onclick = () => {
          alert("Delete kommer senare");
        };
      }
    };
  }
}); */

//
document.addEventListener("click", async (event) => {
  
  const tradeBtn = event.target.closest(".trade-btn");
  if (!tradeBtn) return;

  const token = localStorage.getItem("token");

  // BLOCK immediately if not logged in
  if (!token) {
    alert("Du måste logga in först");
    return;
  }

  const plantId = tradeBtn.dataset.id;

  // See plant ID and users
console.log("CLICKED PLANT ID:", plantId);
console.log("CURRENT USER:", JSON.parse(localStorage.getItem("user"))?.id);

  try {
    const res = await fetch(`${BASE_URL}trades/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plantId }),
    });

    const data = await res.json();

    // Token exists but invalid/expired
    if (res.status === 401) {
      alert("Sessionen har gått ut. Logga in igen.");
      localStorage.removeItem("token");
      return;
    }

    // Business logic error (own plant etc.)
    if (!res.ok) {
      if (data.message === "You cannot trade your own plant") {
        alert("Du kan inte byta din egen växt");
      } else {
        alert("Kunde inte skicka förfrågan");
      }
      return;
    }

    // SUCCESS
    alert("Förfrågan skickad 🌱");
  } catch (error) {
    console.error(error);
    alert("Något gick fel");
  }
});
