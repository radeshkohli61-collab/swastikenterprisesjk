// js/visitor-counter.js
import { db } from '../firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const statsRef = doc(db, "siteStats", "visitors");
let latestTotal = 0;

async function initVisitorTracker() {
    try {
        // 1. Silently increment visitor count once per browser session
        if (!sessionStorage.getItem("swastik_visited")) {
            const snap = await getDoc(statsRef);
            if (!snap.exists()) {
                await setDoc(statsRef, { total: 1 });
            } else {
                await updateDoc(statsRef, { total: increment(1) });
            }
            sessionStorage.setItem("swastik_visited", "true");
        }

        // 2. Keep live total updated in real time
        onSnapshot(statsRef, (docSnap) => {
            if (docSnap.exists()) {
                latestTotal = docSnap.data().total;
                const formatted = latestTotal.toLocaleString('en-IN');

                // Update Admin Panel card if present
                const adminCounter = document.getElementById('visitorCount');
                if (adminCounter) adminCounter.innerText = formatted;

                // Update secret floating badge if open
                const secretNum = document.getElementById('secretVisitorNum');
                if (secretNum) secretNum.innerText = formatted;
            }
        });
    } catch (err) {
        console.error("Visitor tracker error:", err);
    }
}

// 3. Secret Keyboard Shortcut: Press Ctrl + Shift + V to show/hide floating badge
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        toggleSecretVisitorBadge();
    }
});

function toggleSecretVisitorBadge() {
    let badge = document.getElementById("secretVisitorBadge");

    if (badge) {
        badge.remove();
        return;
    }

    badge = document.createElement("div");
    badge.id = "secretVisitorBadge";
    badge.innerHTML = `
        <span style="display:inline-block;width:9px;height:9px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;"></span>
        <span>Total Visitors: <strong id="secretVisitorNum" style="color:#fbbf24;">${latestTotal.toLocaleString('en-IN')}</strong></span>
        <button id="closeSecretBadge" style="background:none;border:none;color:#94a3b8;font-size:1rem;cursor:pointer;margin-left:6px;">&times;</button>
    `;

    Object.assign(badge.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "99999",
        background: "#0b1120",
        color: "#ffffff",
        border: "1.5px solid #d97706",
        padding: "10px 16px",
        borderRadius: "50px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.45)"
    });

    document.body.appendChild(badge);
    document.getElementById("closeSecretBadge").onclick = () => badge.remove();
}

initVisitorTracker();