    
        const gameTips = [
        "Upgrade your gear to increase power.",
        "If you lost something you can find it again.",
        "Use potions wisely, they can save your life.",
        "Roosters might be quite challenging.",
        "Remember to wash your hands after using the toilet."
    ];

    // Function to display a random tip
        function showRandomTip() {
            const tipEl = document.getElementById("game-tip");
            if (!tipEl) return;

            const randomIndex = Math.floor(Math.random() * gameTips.length);
            tipEl.textContent = "💡 Tip: " + gameTips[randomIndex];
        }

        // Show tip on page load
        
    
    
    export async function initPlayPage() {
        const fill = document.getElementById("progress-fill");
        const text = document.getElementById("progress-text");

        const res = await fetch("/pkg/your_project_bg.wasm");
        const reader = res.body.getReader();
        const total = res.headers.get("Content-Length");

        let received = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            received += value.length;

            if (total) {
                const percent = Math.round((received / total) * 100);
                fill.style.width = percent + "%";
                text.innerText = percent + "%";
            }
        }

        const bytes = new Uint8Array(received);
        let pos = 0;
        for (let c of chunks) {
            bytes.set(c, pos);
            pos += c.length;
        }

        // const wasm = await import("/pkg/your_project.js");
        // await wasm.default(bytes);

        // text.innerText = "Starting...";

        // wasm.main();

        // document.body.innerHTML = ""; // optional

        showRandomTip()
    }


