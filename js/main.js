// ============================================================
//  NaviDron.com — Main JS
// ============================================================

// ── Firebase Config ─────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app, auth, db;
try {
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);
} catch(e) { console.warn("Firebase init skipped in offline mode:", e.message); }

// ── DOM Ready ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initNavbar();
  initParticles();
  initAOS();
  initCounters();
  initUAVTabs();
  initAuthModal();
  initForms();
  initMobileMenu();
  initMarquee();
  initFirebaseAuth();
  initLightbox();
});

// ── Loading Screen ───────────────────────────────────────────
function initLoader() {
  const screen = document.getElementById("loading-screen");
  if (!screen) return;
  setTimeout(() => screen.classList.add("hidden"), 2500);
}

// ── Navbar ───────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Active nav link
  const links = document.querySelectorAll(".nav-link[href]");
  const sections = document.querySelectorAll("section[id]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const id = entry.target.id;
        const active = document.querySelector(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

// ── Mobile Menu ──────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu   = document.querySelector(".mobile-menu");
  const links  = document.querySelectorAll(".mobile-menu .mob-link");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    menu.classList.toggle("open");
    document.body.style.overflow = menu.classList.contains("open") ? "hidden" : "";
  });

  links.forEach(l => l.addEventListener("click", () => {
    toggle.classList.remove("active");
    menu.classList.remove("open");
    document.body.style.overflow = "";
  }));
}

// ── Particle System ──────────────────────────────────────────
function initParticles() {
  const container = document.querySelector(".particles-bg");
  if (!container) return;
  const count = window.innerWidth < 768 ? 12 : 25;
  for (let i = 0; i < count; i++) createParticle(container);
}

function createParticle(container) {
  const p = document.createElement("div");
  p.className = "particle";
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 8 + 6;
  const delay = Math.random() * 8;
  const left = Math.random() * 100;
  p.style.cssText = `
    left: ${left}%;
    width: ${size}px;
    height: ${size}px;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    opacity: 0;
  `;
  container.appendChild(p);
}

// ── AOS (Animate On Scroll) ──────────────────────────────────
function initAOS() {
  const elements = document.querySelectorAll("[data-aos]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || "0");
        setTimeout(() => entry.target.classList.add("aos-animate"), delay);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  elements.forEach(el => observer.observe(el));
}

// ── Counter Animation ────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target._counted) return;
      entry.target._counted = true;
      const target = parseInt(entry.target.dataset.target || entry.target.textContent);
      const suffix = entry.target.dataset.suffix || "";
      animateCounter(entry.target, 0, target, 1800, suffix);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, start, end, duration, suffix) {
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (end - start) * ease) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── UAV Tabs ─────────────────────────────────────────────────
function initUAVTabs() {
  const tabs = document.querySelectorAll(".uav-tab");
  const panels = document.querySelectorAll(".drone-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById(tab.dataset.target);
      if (target) {
        target.classList.add("active");
        // Re-trigger AOS
        target.querySelectorAll("[data-aos]").forEach(el => {
          el.classList.remove("aos-animate");
          setTimeout(() => el.classList.add("aos-animate"), 50);
        });
      }
    });
  });
}

// ── Auth Modal ───────────────────────────────────────────────
function initAuthModal() {
  const modal    = document.getElementById("auth-modal");
  const openBtns = document.querySelectorAll("[data-open-auth]");
  const closeBtn = document.querySelector(".auth-close");
  const tabs     = document.querySelectorAll(".auth-tab-btn");
  if (!modal) return;

  openBtns.forEach(btn => btn.addEventListener("click", () => modal.classList.add("open")));
  closeBtn?.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".auth-form").forEach(f => f.style.display = "none");
      const target = document.getElementById(`${tab.dataset.tab}-form`);
      if (target) target.style.display = "block";
    });
  });

  // Login
  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = loginForm.querySelector("#login-email")?.value;
    const pass  = loginForm.querySelector("#login-pass")?.value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast("✅ Logged in successfully!", "success");
      modal.classList.remove("open");
    } catch(err) { showToast("❌ " + err.message, "error"); }
  });

  // Register
  const registerForm = document.getElementById("register-form");
  registerForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = registerForm.querySelector("#reg-email")?.value;
    const pass  = registerForm.querySelector("#reg-pass")?.value;
    const name  = registerForm.querySelector("#reg-name")?.value;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (db) {
        await addDoc(collection(db, "users"), {
          uid: cred.user.uid, name, email, createdAt: serverTimestamp()
        });
      }
      showToast("🎉 Account created! Welcome to NaviDron!", "success");
      modal.classList.remove("open");
    } catch(err) { showToast("❌ " + err.message, "error"); }
  });

  // Google
  const googleBtns = document.querySelectorAll(".auth-google");
  googleBtns.forEach(btn => btn.addEventListener("click", async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("✅ Signed in with Google!", "success");
      modal.classList.remove("open");
    } catch(err) { showToast("❌ " + err.message, "error"); }
  }));
}

// ── Firebase Auth State ──────────────────────────────────────
function initFirebaseAuth() {
  if (!auth) return;
  onAuthStateChanged(auth, user => {
    const loginBtn  = document.getElementById("nav-login-btn");
    const logoutBtn = document.getElementById("nav-logout-btn");
    const userInfo  = document.getElementById("nav-user-info");
    if (user) {
      if (loginBtn)  loginBtn.style.display  = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (userInfo)  userInfo.textContent    = user.displayName || user.email;
    } else {
      if (loginBtn)  loginBtn.style.display  = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (userInfo)  userInfo.textContent    = "";
    }
  });

  document.getElementById("nav-logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
    showToast("👋 Signed out. See you again!", "success");
  });
}

// ── Forms (Contact + Customize) ──────────────────────────────
function initForms() {
  // Contact Form with EmailJS
  const contactForm = document.getElementById("contact-form");
  contactForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = contactForm.querySelector("[type=submit]");
    const original = btn.textContent;
    btn.textContent = "Sending..."; btn.disabled = true;

    const data = {
      from_name:    contactForm.querySelector("#c-name")?.value,
      from_email:   contactForm.querySelector("#c-email")?.value,
      subject:      contactForm.querySelector("#c-subject")?.value,
      message:      contactForm.querySelector("#c-message")?.value,
      to_name:      "NaviDron Team"
    };

    try {
      // EmailJS integration
      if (window.emailjs) {
        await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", data, "YOUR_PUBLIC_KEY");
        showToast("✅ Message sent! We'll reply soon.", "success");
      } else {
        // Firebase fallback
        if (db) {
          await addDoc(collection(db, "contacts"), { ...data, createdAt: serverTimestamp() });
          showToast("✅ Message received! We'll reply soon.", "success");
        } else {
          showToast("✅ Message noted! (Demo mode)", "success");
        }
      }
      contactForm.reset();
    } catch(err) {
      showToast("❌ Failed to send. Try again.", "error");
    } finally {
      btn.textContent = original; btn.disabled = false;
    }
  });

  // Drone Customize Form
  const customForm = document.getElementById("customize-form");
  customForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = customForm.querySelector("[type=submit]");
    btn.textContent = "Submitting..."; btn.disabled = true;

    const data = {
      purpose:  customForm.querySelector("#purpose")?.value,
      budget:   customForm.querySelector("#budget")?.value,
      features: customForm.querySelector("#features")?.value,
      name:     customForm.querySelector("#cust-name")?.value,
      email:    customForm.querySelector("#cust-email")?.value,
      phone:    customForm.querySelector("#cust-phone")?.value,
      notes:    customForm.querySelector("#cust-notes")?.value,
      submittedAt: new Date().toISOString()
    };

    try {
      if (db) await addDoc(collection(db, "custom_orders"), { ...data, timestamp: serverTimestamp() });
      showToast("🚁 Custom order submitted! We'll contact you soon.", "success");
      customForm.reset();
    } catch(err) {
      showToast("✅ Request noted! We'll contact you soon.", "success");
    } finally {
      btn.textContent = "Submit Custom Order"; btn.disabled = false;
    }
  });
}

// ── Marquee Duplication ──────────────────────────────────────
function initMarquee() {
  const marquees = document.querySelectorAll(".figure-marquee");
  marquees.forEach(m => {
    const clone = m.innerHTML;
    m.innerHTML += clone; // duplicate for seamless loop
  });
}

// ── Lightbox ─────────────────────────────────────────────────
function initLightbox() {
  const items = document.querySelectorAll(".gallery-item");
  items.forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (!img) return;
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,.92);
        display:flex;align-items:center;justify-content:center;cursor:pointer;
        animation:fadeIn .3s ease;
      `;
      const el = document.createElement("img");
      el.src = img.src;
      el.style.cssText = `max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 40px 100px rgba(0,0,0,.5);`;
      overlay.appendChild(el);
      overlay.addEventListener("click", () => overlay.remove());
      document.body.appendChild(overlay);
    });
  });
}

// ── Toast Notifications ──────────────────────────────────────
function showToast(message, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ── Smooth Scroll for all anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ── Expose globally ──────────────────────────────────────────
window.NaviDron = { showToast };
