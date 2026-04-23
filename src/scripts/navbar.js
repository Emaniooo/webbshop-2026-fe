document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navbar = document.querySelector(".navbar");

  if (!hamburger || !navbar) return;

  hamburger.addEventListener("click", () => {
    navbar.classList.toggle("open");
  });
});
