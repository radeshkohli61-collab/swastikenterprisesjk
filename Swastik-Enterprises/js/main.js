function initApp() {
   // 1. Mobile Navigation Toggle (Delegated & Double-Toggle Proof)
    if (!document.body.dataset.menuBound) {
        document.body.dataset.menuBound = "true";

        document.addEventListener("click", (e) => {
            const toggleBtn = e.target.closest("#menuToggle");
            const navLinks = document.getElementById("navLinks");
            if (!navLinks) return;

            // If user tapped the 3-line / 3-dot button
            if (toggleBtn) {
                e.preventDefault();
                const isOpen = navLinks.classList.toggle("open");
                toggleBtn.setAttribute("aria-expanded", String(isOpen));
                return;
            }

            // If menu is open and user tapped a link inside it or tapped outside
            if (navLinks.classList.contains("open")) {
                if (e.target.closest("#navLinks a") || !e.target.closest("#navLinks")) {
                    navLinks.classList.remove("open");
                    document.getElementById("menuToggle")?.setAttribute("aria-expanded", "false");
                }
            }
        });
    }

    // 2. Service Category Filter
    const filterButtons = document.querySelectorAll(".tab");
    const serviceCards = document.querySelectorAll("#servicesGrid .card");

    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");

                const filterValue = button.getAttribute("data-filter");
                serviceCards.forEach(card => {
                    card.style.display = (filterValue === "all" || card.getAttribute("data-category") === filterValue) 
                        ? "block" 
                        : "none";
                });
            });
        });
    }

    // 3. Lazy-Trigger Animated Counters (Guaranteed to run)
    const counters = document.querySelectorAll(".counter");
    if (counters.length) {
        const startCounter = (counter) => {
            if (counter.dataset.animated === "true") return;
            counter.dataset.animated = "true";

            const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
            const increment = Math.max(1, Math.ceil(target / 60));
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = current;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        };

        if ("IntersectionObserver" in window) {
            const counterObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05 });

            counters.forEach(c => counterObserver.observe(c));
        }

        // Safety fallback: trigger after 600ms if observer hasn't fired
        setTimeout(() => {
            counters.forEach(startCounter);
        }, 600);
    }

    // 4. Lazy-load Firebase only when user interacts with the quote form
    const formEl = document.getElementById("quoteForm");
    if (formEl) {
        formEl.addEventListener("focusin", async () => {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js");
            // Initialize Firebase here only when needed
        }, { once: true });
    }

    // 5. Defer Video Player Setup so it doesn't block initial rendering
    const scheduleWork = window.requestIdleCallback || ((cb) => setTimeout(cb, 150));
    scheduleWork(initVideoPlayers);
}

// Run immediately if DOM is already parsed, otherwise wait for DOMContentLoaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

function initVideoPlayers() {
    const videoCards = document.querySelectorAll(".video-card");
    if (!videoCards.length) return;

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector("video");
            if (!entry.isIntersecting && video && !video.paused) {
                video.pause();
            }
        });
    }, { threshold: 0.3 });

    videoCards.forEach(card => {
        const video = card.querySelector("video");
        if (!video) return;

        // Prevent videos from downloading megabytes on initial page load
        video.preload = "metadata"; 
        videoObserver.observe(card);

        const wrapper = document.createElement("div");
        wrapper.className = "video-wrapper";
        video.parentNode.insertBefore(wrapper, video);
        wrapper.appendChild(video);

        const centerBtn = document.createElement("button");
        centerBtn.type = "button";
        centerBtn.className = "center-play-btn";
        centerBtn.setAttribute("aria-label", "Play or Pause Video");
        centerBtn.innerHTML = "&#9654;";
        wrapper.appendChild(centerBtn);

        const restartBtn = document.createElement("button");
        restartBtn.type = "button";
        restartBtn.className = "restart-video-btn";
        restartBtn.setAttribute("aria-label", "Restart Video from Beginning");
        restartBtn.innerHTML = "&#8634; Restart";
        wrapper.appendChild(restartBtn);

        wrapper.addEventListener("click", () => {
            if (video.paused) {
                document.querySelectorAll(".video-card video").forEach(v => {
                    if (v !== video) v.pause();
                });
                video.muted = false;
                video.play();
            } else {
                video.pause();
            }
        });

        restartBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".video-card video").forEach(v => {
                if (v !== video) v.pause();
            });
            video.currentTime = 0;
            video.muted = false;
            video.play();
        });

        video.addEventListener("play", () => {
            wrapper.classList.add("is-playing");
            wrapper.classList.remove("is-paused-midway");
        });

        video.addEventListener("pause", () => {
            wrapper.classList.remove("is-playing");
            if (video.currentTime > 0.5 && !video.ended) {
                wrapper.classList.add("is-paused-midway");
            }
        });

        video.addEventListener("ended", () => {
            wrapper.classList.remove("is-playing", "is-paused-midway");
            video.currentTime = 0.1;
        });
    });
}

// Toggle Extra Photos
function togglePhotos(gridId, btnId) {
    const extraGrid = document.getElementById(gridId);
    const btn = document.getElementById(btnId);
    if (!extraGrid || !btn) return;

    const isShown = extraGrid.classList.toggle("show");
    btn.innerText = isShown ? "Show Less" : "More...";
    btn.setAttribute("aria-expanded", isShown);
}

// Event Delegation for Lightbox
document.addEventListener("click", (e) => {
    if (e.target.matches(".media-card img")) {
        const lightbox = document.getElementById("imageLightbox");
        const lightboxImg = document.getElementById("lightboxImg");
        const lightboxCaption = document.getElementById("lightboxCaption");
        if (!lightbox || !lightboxImg) return;

        const card = e.target.closest(".media-card");
        const title = card?.querySelector("h3")?.innerText || "";
        const desc = card?.querySelector("p")?.innerText || "";

        lightboxImg.src = e.target.src;
        lightboxImg.alt = title || "Event setup preview";
        if (lightboxCaption) {
            lightboxCaption.innerHTML = `<strong>${title}</strong>${desc ? " — " + desc : ""}`;
        }
        lightbox.classList.add("open");
    }
});

function closeLightbox(e) {
    if (e.target.id === "imageLightbox" || e.target.classList.contains("lightbox-close")) {
        document.getElementById("imageLightbox")?.classList.remove("open");
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.getElementById("imageLightbox")?.classList.remove("open");
        const albumModal = document.getElementById("eventAlbumModal");
        if (albumModal?.classList.contains("open")) {
            albumModal.querySelectorAll("video").forEach(v => v.pause());
            albumModal.classList.remove("open");
        }
    }
});

// Govt. Tender Work Albums
const govtWorkAlbums = {
    work1: {
        title: "Mega Political Rally & VIP Stage Setup",
        items: [
            { type: "video", src: "videos/rally-setup1.mp4#t=0.1", caption: "Main Rally Ground & Stage Walkthrough" },
            { type: "image", src: "images/govt/rally-chairs.jpg", caption: "3,000+ Plastic Chairs Sector Arrangement" },
            { type: "image", src: "images/govt/govt-stage.jpg", caption: "Reinforced VIP Stage & Official Backdrop" }
        ]
    },
    work2: {
        title: "State Departmental Exhibition & Official Function",
        items: [
            { type: "video", src: "videos/govt-tender2.mp4#t=0.1", caption: "Official Function & Stalls Video" },
            { type: "image", src: "images/govt/german-hanger.jpg", caption: "Waterproof German Hanger Structure" },
            { type: "image", src: "images/govt/exhibition-stalls.jpg", caption: "Departmental Exhibition Booths" },
            { type: "image", src: "images/govt/govt-catering.jpg", caption: "15+ LED Catering Counters for Delegates" }
        ]
    },
    work3: {
        title: "Grand Jalsa & Overnight Illumination Pandal",
        items: [
            { type: "video", src: "videos/jalsa-setup1.mp4#t=0.1", caption: "Jalsa Pandal & Night Lighting Video" },
            { type: "image", src: "images/govt/jalsa-pandal.jpg", caption: "Full Carpeted Community Gathering Pandal" }
        ]
    }
};

function openEventAlbum(workKey) {
    const album = govtWorkAlbums[workKey];
    if (!album) return;

    const modal = document.getElementById("eventAlbumModal");
    const titleEl = document.getElementById("albumModalTitle");
    const gridEl = document.getElementById("albumMediaGrid");
    if (!modal || !titleEl || !gridEl) return;

    titleEl.innerText = album.title;

    gridEl.innerHTML = album.items.map(item => {
        if (item.type === "video") {
            return `
                <div class="album-item">
                    <video controls preload="metadata" playsinline muted>
                        <source src="${item.src}" type="video/mp4">
                    </video>
                    <p>&#9654; ${item.caption}</p>
                </div>
            `;
        }
        return `
            <div class="album-item">
                <img src="${item.src}" alt="${item.caption}" loading="lazy">
                <p>${item.caption}</p>
            </div>
        `;
    }).join("");

    modal.classList.add("open");
}

function closeEventAlbum(e) {
    if (e.target.id === "eventAlbumModal" || e.target.classList.contains("close-album-btn")) {
        const modal = document.getElementById("eventAlbumModal");
        if (!modal) return;
        modal.querySelectorAll("video").forEach(v => v.pause());
        modal.classList.remove("open");
    }
}