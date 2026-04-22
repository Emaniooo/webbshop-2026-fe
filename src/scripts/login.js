import { getBaseUrl } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", initRegister);

function initRegister() {
  const registerForm = document.getElementById("registerForm");
  const skapaKontoLink = document.querySelector(".skapa-konto");
  const loginButton = registerForm.querySelector("button[type='submit']");

// Logga in
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    loginUser();
  });

  // Skapa konto
  skapaKontoLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerUser();
  });
}

//alert för fältvalidering - EMANS KOD
function validateFields() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    alert("Alla fält måste fyllas i");
    return false;
  }

  return { name, email, password };
}
// Waraporn lade till validation bara för login
function validateLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Email och lösenord krävs");
    return false;
  }

  return { email, password };
}

// Registrera användare
function registerUser() {
  const data = validateFields();
  if (!data) return;

  const { name, email, password } = data;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some((u) => u.email === email)) {
    alert("Det finns redan ett konto med denna email");
    return;
  }
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Konto skapat! Du kan nu logga in.");
  }

  
// Logga in användare -- EMANS KOD using fake API
  /* function loginUser() {
  const data = validateFields();
  if (!data) return;

  const { email, password } = data;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const existingUser = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!existingUser) {
    alert("Fel email eller lösenord");
    return;
  }

  sessionStorage.setItem("loggedIn", JSON.stringify(existingUser));
  
  window.location.href = "profil.html";
  } */


/* Logga in med BE API med TOKEN */
async function loginUser() {
  const data = validateLogin();
  if (!data) return;

  const { email, password } = data;

  // get BASE URL
  const BASE_URL = getBaseUrl();

  try {
    // call backend login API
    const res = await fetch(BASE_URL + "auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    // parse response
    const result = await res.json();

    // debug response 
    console.log("LOGIN RESPONSE:", result);
  

    // handle error from backend
    if (!res.ok) {
      alert(result.error || result.message || "Fel vid inloggning");
      return;
    }

    // SAVE TOKEN 
    localStorage.setItem("token", result.token);

    // KEEP team logic for UI)
    sessionStorage.setItem("loggedIn", JSON.stringify(result.user || {}));

    window.location.href = "profil.html";

  } catch (error) {
    console.error("Login error:", error);
    alert("Något gick fel vid inloggning");
  }
}