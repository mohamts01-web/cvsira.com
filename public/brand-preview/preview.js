const tabs = [...document.querySelectorAll("[data-view]")];
function show(view) {
  for (const id of ["home", "dashboard"]) {
    document.getElementById(id).hidden = id !== view;
  }
  for (const tab of tabs) {
    const selected = tab.dataset.view === view;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
}
for (const tab of tabs) {
  tab.addEventListener("click", () => show(tab.dataset.view));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[1] : tabs.find(item => item !== tab);
    show(next.dataset.view);
    next.focus();
  });
}
for (const button of document.querySelectorAll("[data-switch]")) {
  button.addEventListener("click", () => {
    show(button.dataset.switch);
    tabs.find(tab => tab.dataset.view === button.dataset.switch).focus();
  });
}
let messageTimer;
for (const button of document.querySelectorAll("[data-demo]")) {
  button.addEventListener("click", () => {
    const message = document.getElementById("demo-message");
    message.textContent = button.dataset.demo;
    message.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { message.hidden = true; }, 4500);
  });
}
