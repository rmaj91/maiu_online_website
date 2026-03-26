console.log('SCRIPT IS WORKING')

export const servers = [
    { id: "eu", name: "Europe", base: "https://api-eu.maiu-online:3000" },
    { id: "au", name: "Australia", base: "https://api-au.maiu-online.com:3000" }
];



//@ts-ignore
if (import.meta.env.MODE === 'dev') {
    servers.push({ id: "local", name:"Local", base: "http://localhost:3000" });
}


function updateVisibility() {
    document.addEventListener("contextmenu", event => event.preventDefault());

    const isMobile = window.innerWidth <= 800 || window.innerHeight <= 540;

    const hiddenOnMobile = document.querySelectorAll('.mobile-hide');
    const shownOnMobile = document.querySelectorAll('.mobile-show');

    hiddenOnMobile.forEach(el => {
        el.classList.toggle('hidden', isMobile);
    });

    shownOnMobile.forEach(el => {
        el.classList.toggle('hidden', !isMobile);
    });

}

window.addEventListener('resize', updateVisibility);
window.addEventListener('DOMContentLoaded', updateVisibility);



export function initServerStatusPage() {
    updateVisibility()

    //@ts-ignore
    if (import.meta.env.MODE !== 'dev') {
        const devElements = document.querySelectorAll(".dev-only");
        devElements.forEach(el => el.style.display = "none");
    }

    async function fetchServerStatus(server: any) {
        try {
            const res = await fetch(`${server.base}/server-status`);
            const data = await res.json();

            const el = document.getElementById(server.id + '-status');
            if (!el) return; // page might have changed

            if (data.status === "Online") {
                el.textContent = `🟢 ONLINE (${data.in_game})`;
                el.style.color = "#35c728";
            } else {
                el.textContent = "🔴 OFFLINE";
                el.style.color = "crimson";
            }
        } catch {
            const el = document.getElementById(server.id);
            if (!el) return;

            el.textContent = "🔴 OFFLINE";
            el.style.color = "crimson";
        }
    }

    async function updateAll() {
        await Promise.all(servers.map(fetchServerStatus));
    }

    // initial load
    updateAll();

    // repeat every 5s
    const interval = setInterval(updateAll, 5000);

    // cleanup when leaving page
    return () => clearInterval(interval);
}