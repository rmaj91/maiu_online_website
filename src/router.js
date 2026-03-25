const app = document.getElementById("app");

const routes = {
    "/": "main",
    "/leaderboards": "leaderboards",
    "/news": "news"
};

async function loadPage(name) {
    const res = await fetch(`/pages/${name}.html`);
    app.innerHTML = await res.text();
}

function navigate(path, push = true) {
    const page = routes[path] || "main";

    loadPage(page);

    if (push) {
        history.pushState({ page }, "", path);
    }

    setActiveLink(path);
}

function setActiveLink(path) {
    document.querySelectorAll(".nav a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === path);
    });
}

// click navigation
function setupNav() {
    document.querySelectorAll(".nav a").forEach(a => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(a.getAttribute("href"));
        });
    });
}

// back/forward support
window.addEventListener("popstate", () => {
    navigate(window.location.pathname, false);
});

// init
window.addEventListener("DOMContentLoaded", () => {
    setupNav();
    navigate(window.location.pathname || "/", false);
});