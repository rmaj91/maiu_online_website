import { servers } from "./main.js";

const MAX_ROWS = 15;
const leaderboardBody = document.getElementById("leaderboard-body");
const tabsContainer = document.getElementById("tabs");
let allData = {}; // store fetched data per server
let combinedData = []; // for "All" tab

// === UTILS ===
async function fetchLeaderboard(server) {
    try {
        const res = await fetch(`${server.base}/ranking`);
        const json = await res.json();

        const entries = Array.isArray(json.entries) ? json.entries : [];

        return entries.map(d => ({
            ...d,
            server: server.name,
            serverId: server.id
        }));
    } catch (err) {
        console.error(`Failed to fetch leaderboard from ${server.name}:`, err);
        return [];
    }
}

function renderTable(data) {
    const leaderboardBody = document.getElementById("leaderboard-body");
    if (!leaderboardBody) {
        console.warn("Leaderboard table body not found yet!");
        return;
    }

    leaderboardBody.innerHTML = "";
    data.slice(0, MAX_ROWS).forEach((row, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${row.name}</td>
      <td>${row.class}</td>
      <td>${row.level}</td>
      <td>${row.gear_score}</td>
      <td>${row.server}</td>
    `;
        leaderboardBody.appendChild(tr);
    });
}

function filterTable(serverId) {
    if (serverId === "all") {
        renderTable(combinedData);
    } else {
        renderTable(allData[serverId] || []);
    }

    // Update active tab class
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelector(`.tab[data-server="${serverId}"]`)?.classList.add("active");
}

// === INIT ===
export async function initLeaderboardPage() {
  const leaderboardBody = document.getElementById("leaderboard-body");
  const tabsContainer = document.getElementById("tabs");

  if (!leaderboardBody || !tabsContainer) {
    console.warn("Leaderboard elements not found yet!");
    return;
  }


    // Build tabs
    const allTab = document.createElement("button");
    allTab.className = "tab active";
    allTab.textContent = "All";
    allTab.dataset.server = "all";
    allTab.onclick = () => filterTable("all");
    tabsContainer.appendChild(allTab);

    servers.forEach(s => {
        const btn = document.createElement("button");
        btn.className = "tab";
        btn.textContent = s.name;
        btn.dataset.server = s.id;
        btn.onclick = () => filterTable(s.id);
        tabsContainer.appendChild(btn);
    });

    // Fetch all servers in parallel
    const promises = servers.map(s => fetchLeaderboard(s));
    const results = await Promise.all(promises);

    servers.forEach((s, idx) => {
        allData[s.id] = results[idx];
    });

    // Build combined "all" data
    combinedData = Object.values(allData).flat()
        .sort((a, b) => b.level - a.level || b.gear_score - a.gear_score)
        .slice(0, MAX_ROWS);

    // Render default
    filterTable("all");
}