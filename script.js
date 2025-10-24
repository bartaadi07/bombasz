/* UNCS – stabil UI JS (Aurora Glass) */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // ---- Óra ----
  const clockEl = document.getElementById("real-time-clock");
  const z = v => String(v).padStart(2,"0");
  function tick(){
    if (!clockEl) return;
    const n = new Date();
    clockEl.textContent = `${z(n.getHours())}:${z(n.getMinutes())}:${z(n.getSeconds())}`;
  }
  tick(); setInterval(tick, 1000);

  // ---- Név AI chat ----
  const chatBtn      = document.getElementById("toggle-chat");
  const chatBox      = document.getElementById("chat-box");
  const chatInput    = document.getElementById("chat-input");
  const sendBtn      = document.getElementById("send-chat");
  const chatMessages = document.getElementById("chat-messages");

  if (chatBox && chatBtn) {
    chatBox.style.display = "none";
    chatBtn.addEventListener("click", () => {
      const open = chatBox.style.display !== "none";
      chatBox.style.display = open ? "none" : "flex";
      chatBtn.textContent   = open ? "Név AI" : "Bezár";
      if (!open) chatInput?.focus();
    });
  }

  const MALE = new Set(["bence","levente","máté","dániel","dominik","dávid","zsolt","bálint","ádám","péter","attila","zoltán","gábor","istván","tamás","marcell","benedek"]);
  const FEMALE = new Set(["anna","hanna","réka","luca","lilla","fanni","nóra","zoé","kata","eszter","viktória","kinga","blanka","zsófia","boglárka","laura"]);

  function determineGender(name){
    const n = name.trim().toLowerCase();
    if (!n) return "Írj be egy nevet.";
    if (MALE.has(n))   return `A(z) <strong>${name}</strong> valószínűleg <strong>FÉRFI</strong> név. ♂️`;
    if (FEMALE.has(n)) return `A(z) <strong>${name}</strong> valószínűleg <strong>NŐI</strong> név. ♀️`;
    return `A(z) <strong>${name}</strong> nincs a listámban – nem megállapítható. 🤔`;
  }
  function appendMsg(html, cls){
    const el = document.createElement("div");
    el.className = cls;
    el.innerHTML = html;
    chatMessages?.appendChild(el);
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight; // mindig a végére ugrik
  }
  function processName(){
    if (!chatInput) return;
    const val = chatInput.value.trim();
    if (!val) return;
    appendMsg(val, "user-msg");
    chatInput.value = "";
    appendMsg("Elemzés…", "bot-msg");
    setTimeout(() => {
      if (chatMessages?.lastElementChild?.textContent === "Elemzés…") {
        chatMessages.removeChild(chatMessages.lastElementChild);
      }
      appendMsg(determineGender(val), "bot-msg");
    }, 300);
  }

  // <<< LÉNYEG: biztos kötés gomb + Enter + delegáció fallback
  sendBtn?.addEventListener("click", processName);
  chatInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); processName(); }
  });
  document.addEventListener("click", e => {
    const t = e.target;
    if (t && t.closest && t.closest("#send-chat")) processName();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && document.activeElement?.id === "chat-input") {
      e.preventDefault(); processName();
    }
  });

  // ---- Slideshow (ha nem kell, ezt hagyhatod) ----
  initSlideshow();
});

/* Egyszerű slideshow init */
function initSlideshow(){
  const wrapper   = document.querySelector(".slideshow") || document.querySelector(".slideshow-wrapper");
  if (!wrapper) return;
  const container = wrapper.querySelector(".slideshow-container");
  const slides    = container ? Array.from(container.querySelectorAll(".slide")) : [];
  const prev      = container?.querySelector(".prev");
  const next      = container?.querySelector(".next");
  const dotsBox   = wrapper.querySelector(".dots");
  if (!slides.length || !dotsBox) return;

  dotsBox.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "dot"; b.setAttribute("aria-label", `Kép ${i+1}`);
    b.addEventListener("click", () => { go(i); stop(); });
    dotsBox.appendChild(b);
  });

  let idx = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
  const dots = Array.from(dotsBox.querySelectorAll(".dot"));
  function render(){ slides.forEach((s,i)=>s.classList.toggle("active", i===idx));
                     dots.forEach((d,i)=>d.classList.toggle("active",  i===idx)); }
  function go(n){ idx = (n + slides.length) % slides.length; render(); }

  prev?.addEventListener("click", e => { e.preventDefault(); go(idx-1); stop(); });
  next?.addEventListener("click", e => { e.preventDefault(); go(idx+1); stop(); });

  let auto=null; const start=()=>{ if(!auto) auto=setInterval(()=>go(idx+1),5000); };
  const stop =()=>{ if(auto){ clearInterval(auto); auto=null; } };
  wrapper.addEventListener("mouseenter", stop);
  wrapper.addEventListener("mouseleave", start);
  wrapper.addEventListener("touchstart", stop, {passive:true});
  wrapper.addEventListener("touchend",   start, {passive:true});

  // FAB toggler (ha van)
  const toggle = document.getElementById("toggle-slideshow");
  if (toggle) toggle.addEventListener("click", () => {
    const hidden = wrapper.hasAttribute("hidden");
    if (hidden) { wrapper.removeAttribute("hidden"); toggle.setAttribute("aria-pressed","true"); }
    else        { wrapper.setAttribute("hidden","");  toggle.setAttribute("aria-pressed","false"); }
  });

  if (idx < 0) idx = 0;
  render(); start();
}
// --- Mobil menü (hamburger) ---
(() => {
    const burger = document.getElementById('hamburger');
    const nav    = document.getElementById('main-nav');
    if (!burger || !nav) return;
  
    const toggle = () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
  
    burger.addEventListener('click', toggle);
    // menüpont választás után zárás
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
    }));
  })();
  (() => {
    const burger = document.getElementById('hamburger');
    const nav    = document.getElementById('main-nav');
    if (!burger || !nav) return; // nincs már felső menü, kilépünk
  })();
    