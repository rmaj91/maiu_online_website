import { servers } from "./main.js";

const MAX_ROWS = 15;

let allData = {};
let combinedData = [];

async function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
            observer.disconnect();
            reject(`Element ${selector} not found`);
        }, timeout);
    });
}


async function renderTable(data) {
    const leaderboardBody = await waitForElement("#leaderboard-body");
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

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelector(`.tab[data-server="${serverId}"]`)?.classList.add("active");
}
async function fetchLeaderboard(server) {
  try {
    const res = await fetch(`${server.base}/ranking`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json.entries)) throw new Error("Invalid data format");
    return json.entries.map(d => ({ ...d, server: server.name, serverId: server.id }));
  } catch (err) {
    console.error(`Failed to fetch leaderboard from ${server.name}:`, err);
    // Throw to notify initLeaderboardPage
    throw { server: server.name, error: err };
  }
}

export async function initLeaderboardPage() {
  const statusEl = await waitForElement("#leaderboard-status");
  statusEl.textContent = "Loading leaderboard…";

  const tabsContainer = await waitForElement("#tabs");

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
  try {
    const results = await Promise.all(
      servers.map(s => fetchLeaderboard(s).catch(err => err)) // catch individual errors
    );

    let failedServers = [];
    results.forEach((res, idx) => {
      if (res.error) {
        allData[servers[idx].id] = [];
        failedServers.push(servers[idx].name);
      } else {
        allData[servers[idx].id] = res;
      }
    });

    // Combined "All" tab
    combinedData = Object.values(allData).flat()
      .sort((a, b) => b.level - a.level || b.gear_score - a.gear_score)
      .slice(0, MAX_ROWS);

    filterTable("all");

const statusEl = await waitForElement("#leaderboard-status");

// Loading
statusEl.textContent = "Loading leaderboard…";
statusEl.classList.remove("warning");
statusEl.classList.add("loading");

// After fetch
if (failedServers.length > 0) {
    statusEl.textContent = `⚠️ Failed to load leaderboard for: ${failedServers.join(", ")} ⚠️`;
    statusEl.classList.remove("loading");
    statusEl.classList.add("warning");
} else {
    statusEl.textContent = "";
    statusEl.classList.remove("loading", "warning");
}

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load leaderboard.";
  }
}