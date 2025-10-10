document.addEventListener("DOMContentLoaded", () => {
    // Slideshow alapból elrejtve
    const slideshowSection = document.querySelector('.slideshow-wrapper');
    slideshowSection.style.display = 'none';
    slideshowSection.style.opacity = '0';
    slideshowSection.style.transform = 'translateY(20px)';
    slideshowSection.style.transition = 'all 0.6s ease';

    // Slideshow toggle gomb
    const toggleBtn = document.getElementById('toggle-slideshow');
    toggleBtn.addEventListener('click', () => {
        if (slideshowSection.style.display === 'none' || slideshowSection.style.opacity === '0') {
            slideshowSection.style.display = 'block';
            setTimeout(() => {
                slideshowSection.style.opacity = '1';
                slideshowSection.style.transform = 'translateY(0)';
            }, 10);
        } else {
            slideshowSection.style.opacity = '0';
            slideshowSection.style.transform = 'translateY(20px)';
            setTimeout(() => {
                slideshowSection.style.display = 'none';
            }, 600);
        }
    });

    // Slideshow működés
    const slides = document.querySelectorAll('.slide');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    const dotsContainer = document.querySelector('.dots');
    let slideIndex = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => showSlide(i));
        dotsContainer.appendChild(dot);
    });
    const dots = document.querySelectorAll('.dot');
    if (dots[0]) dots[0].classList.add('active');

    function showSlide(n) {
        slideIndex = (n + slides.length) % slides.length;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
    }

    if (prev) prev.addEventListener('click', () => showSlide(slideIndex - 1));
    if (next) next.addEventListener('click', () => showSlide(slideIndex + 1));

    setInterval(() => showSlide(slideIndex + 1), 5000);
});

// Hamburger toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => { navMenu.classList.toggle('show'); });
}

// Member card toggle
document.querySelectorAll('.member-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const arrow = toggle.querySelector('.member-arrow');
        const extra = toggle.nextElementSibling; 
        extra.classList.toggle('show');
        arrow.classList.toggle('open');
    });
});

// -------------------- Fejlesztői eszközök tiltása --------------------
var isCtrl = false;
document.onkeyup = function(e){ if(e.which==17) isCtrl=false; }
document.onkeydown = function(e){
    if(e.which==17) isCtrl=true;
    if(((e.which==85)||(e.which==65)||(e.which==88)||(e.which==67)||(e.which==86)||(e.which==123)||(e.which==83)) && isCtrl){
        alert('nuh-uh'); return false;
    }
}
document.addEventListener('contextmenu', e => e.preventDefault());
function ctrlShiftKey(e,keyCode){return e.ctrlKey && e.shiftKey && e.keyCode===keyCode.charCodeAt(0);}
document.onkeydown = (e)=>{
    if(e.keyCode===123 || ctrlShiftKey(e,'I') || ctrlShiftKey(e,'J') || ctrlShiftKey(e,'C') || (e.ctrlKey && e.keyCode==='U'.charCodeAt(0))){
        alert('nuh-uh'); return false;
    }
}
document.onselectstart=()=>false;
if(window.sidebar){document.onmousedown=()=>false;document.onclick=()=>true;}

// -------------------- Canvas Background --------------------
const canvas = document.getElementById('bg-circles');
const ctx = canvas.getContext('2d');
let width,height;
let layers=[];
let mouseX=window.innerWidth/2, mouseY=window.innerHeight/2, scrollY=0;

function Circle(layer){
    this.x = Math.random()*width;
    this.baseY = Math.random()*height;
    this.baseRadius = 10 + Math.random()*(layer===0?30:layer===1?40:60);
    this.radius = this.baseRadius;
    this.speedX = (Math.random()-0.5)*(layer===0?0.2:layer===1?0.4:0.7);
    this.speedY = (Math.random()-0.5)*(layer===0?0.2:layer===1?0.4:0.7);
    this.hue = 180 + Math.random()*60;
    this.layer = layer;
    this.parallaxX = 0;
    this.parallaxY = 0;
    this.pulseOffset = Math.random()*Math.PI*2;
    this.trail = [];
}

Circle.prototype.update=function(){
    this.x+=this.speedX;
    this.baseY+=this.speedY;
    if(this.x<-this.radius)this.x=width+this.radius;
    if(this.x>width+this.radius)this.x=-this.radius;
    if(this.baseY<-this.radius)this.baseY=height+this.radius;
    if(this.baseY>height)this.baseY=-this.radius;
    const parallaxFactor = this.layer===0?0.01:this.layer===1?0.02:0.04;
    this.parallaxX=(mouseX-width/2)*parallaxFactor;
    this.parallaxY=(mouseY-height/2)*parallaxFactor+scrollY*parallaxFactor*2;
    this.radius=this.baseRadius*(0.85+0.15*Math.sin(Date.now()*0.002+this.pulseOffset));
    this.hue=180+60*Math.sin(Date.now()*0.001+this.pulseOffset);
    this.trail.push({x:this.x+this.parallaxX, y:this.baseY+this.parallaxY, alpha:0.5, radius:this.radius, hue:this.hue});
    if(this.trail.length>25)this.trail.shift();
};

Circle.prototype.draw=function(){
    for(let i=0;i<this.trail.length;i++){
        const t=this.trail[i];
        ctx.beginPath();
        ctx.arc(t.x,t.y,t.radius*(i/this.trail.length*0.8+0.2),0,Math.PI*2);
        ctx.fillStyle=`hsla(${t.hue},80%,60%,${t.alpha*(i/this.trail.length)})`;
        ctx.fill();
    }
    ctx.beginPath();
    const color=`hsl(${this.hue},80%,60%)`;
    ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=30;
    ctx.arc(this.x+this.parallaxX,this.baseY+this.parallaxY,this.radius,0,Math.PI*2);
    ctx.fill();
};

window.addEventListener('mousemove', e=>{mouseX=e.clientX;mouseY=e.clientY;});
window.addEventListener('scroll', ()=>{scrollY=window.scrollY;});

function init(){
    width=window.innerWidth;
    height=window.innerHeight;
    canvas.width=width;
    canvas.height=height;
    layers=[[],[],[]];
    for(let l=0;l<3;l++){
        let count=l===0?10:l===1?15:20;
        for(let i=0;i<count;i++) layers[l].push(new Circle(l));
    }
}

function animate(){
    ctx.fillStyle='rgba(0,0,50,0.18)';
    ctx.fillRect(0,0,width,height);
    layers.forEach(layer=>layer.forEach(c=>{c.update();c.draw();}));
    requestAnimationFrame(animate);
}

window.addEventListener('resize',init);
init();
animate();

// -------------------- Óra --------------------
function updateClock(){
    const now=new Date();
    const h=String(now.getHours()).padStart(2,'0');
    const m=String(now.getMinutes()).padStart(2,'0');
    const s=String(now.getSeconds()).padStart(2,'0');
    const clockElement=document.getElementById('real-time-clock');
    if(clockElement){clockElement.textContent=`${h}:${m}:${s}`;}
}
setInterval(updateClock,1000);
updateClock();

// Scroll animáció
const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('show');});
},{threshold:0.15});
document.querySelectorAll("section, .member-card").forEach(el=>observer.observe(el));

// =========================================================
// 💬 CHATBOT V4.0 - KULCSSZAVAS, API KULCS NÉLKÜLI LOGIKA
// =========================================================

const chatBtn = document.getElementById('toggle-chat');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');

// alapból elrejtve
chatBox.style.display = 'none';
chatBox.style.opacity = '0';
chatBox.style.transform = 'translateY(20px)';
chatBox.style.transition = 'all 0.4s ease';

chatBtn.addEventListener('click', () => {
    if (chatBox.style.display === 'none' || chatBox.style.opacity === '0') {
        chatBox.style.display = 'flex';
        setTimeout(() => { chatBox.style.opacity = '1'; chatBox.style.transform = 'translateY(0)'; }, 10);
    } else {
        chatBox.style.opacity = '0';
        chatBox.style.transform = 'translateY(20px)';
        setTimeout(() => { chatBox.style.display = 'none'; }, 400);
    }
});

// 🤖 Szimulált Chatbot Logika (Kulcsszavakra épülő)
const BOT_RESPONSES = {
    "főoldal": "A főoldalon találod a cégünk logóját, a valós idejű órát és a SRT. Időzítő letöltési linkjét.",
    "rólunk": "Cégünk piacvezető a kék gömbös hátterű weboldalak területén. Küldetésünk: Dedicated for you!",
    "csapat": "A csapat tagjai: Barta Ádám (Fejlesztő), Gombos Bálint (Designer) és Beluscsák Zsolt (Fejlesztő).",
    "kapcsolat": "Kérjük, vedd fel a kapcsolatot e-mailben a megadott címeken: bartaa@kkszki.hu, gombosb@kkszki.hu, beluscsakzs@kkszki.hu.",
    "sr időzítő": "Az SRT. Időzítő egy hasznos szoftver, melyet a főoldalon tudsz letölteni a 'SRT. Időzítő letöltése' gombbal.",
    "hello": "Szia! Miben segíthetek ma? Kérdezhetsz a 'Rólunk', 'Csapat' vagy 'SRT Időzítő' témákban.",
    "szia": "Szia! Miben segíthetek ma? Kérdezhetsz a 'Rólunk', 'Csapat' vagy 'SRT Időzítő' témákban.",
    "köszönöm": "Szívesen! Bármi másban segíthetek?",
    // Alapértelmezett, ha nem talál találatot:
    "default": "Sajnálom, erre a kérdésre még nem tudok válaszolni. Kérlek, próbáld meg másképp vagy válassz egyet a fő témák közül (pl. Rólunk, Csapat)."
};

function getBotResponse(message) {
    const lowerCaseMsg = message.toLowerCase();
    
    // Keresés az előre definiált kulcsszavakban
    for (const key in BOT_RESPONSES) {
        if (lowerCaseMsg.includes(key)) {
            return BOT_RESPONSES[key];
        }
    }
    return BOT_RESPONSES["default"];
}

function appendMessage(message, className) {
    const msgElement = document.createElement('div');
    msgElement.className = className;
    msgElement.textContent = message;
    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessageToBot(message) {
    // Felhasználó üzenete
    appendMessage(message, 'user-msg');
    chatInput.value = '';
    
    // Bot válasza - szimulálunk egy kis késleltetést a valós hatásért
    const typingIndicator = appendMessage('...', 'bot-msg');

    setTimeout(() => {
        const botResponse = getBotResponse(message);
        // Töröljük a '...'
        chatMessages.removeChild(chatMessages.lastElementChild); 
        
        // Hozzáadjuk a valós választ
        appendMessage(botResponse, 'bot-msg');
    }, 500); 
}

sendBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) sendMessageToBot(msg);
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});