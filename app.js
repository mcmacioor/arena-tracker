const APP_VERSION = "0.1.0";
const DATA_DRAGON_VERSION = "16.13.1";

document.documentElement.dataset.appVersion = APP_VERSION;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dataPatch").textContent = DATA_DRAGON_VERSION;

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const route = link.dataset.route;
      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.toggle("is-active", item === link);
      });
      document.querySelectorAll(".view").forEach((view) => {
        view.classList.toggle("is-visible", view.dataset.view === route);
      });
    });
  });
});
