const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);


(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    const particleCount = 700;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        velocities.push({
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        });
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    const icoGeo = new THREE.IcosahedronGeometry(2, 2);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    function animate() {
        requestAnimationFrame(animate);
        ico.rotation.x += (mouseY * 0.5 - ico.rotation.x) * 0.02;
        ico.rotation.y += (mouseX * 0.5 - ico.rotation.y) * 0.02;
        ico.rotation.z += 0.002;

        const pos = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3 + 2] += velocities[i].z;
            if (Math.abs(pos[i * 3]) > 10) velocities[i].x *= -1;
            if (Math.abs(pos[i * 3 + 1]) > 10) velocities[i].y *= -1;
            if (Math.abs(pos[i * 3 + 2]) > 10) velocities[i].z *= -1;
        }
        geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    gsap.to(ico.rotation, {
        y: Math.PI * 4,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true }
    });

    gsap.to(camera.position, {
        z: 5,
        ease: 'none',
        scrollTrigger: { trigger: '.pages-section', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.to(material, {
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: { trigger: '.downloads-section', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.to(ico.scale, {
        x: 2,
        y: 2,
        z: 2,
        ease: 'none',
        scrollTrigger: { trigger: '.pages-section', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.to(material, {
        size: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: '.downloads-section', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.to(particles.rotation, {
        x: Math.PI * 0.5,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true }
    });

    gsap.to(camera, {
        fov: 90,
        ease: 'none',
        scrollTrigger: {
            trigger: '.footer',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: () => camera.updateProjectionMatrix()
        }
    });
})();

gsap.registerPlugin(ScrollTrigger);
const header = document.querySelector('.header');

ScrollTrigger.create({
    start: 'top top',
    end: 99999,
    onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 50) {
            header.classList.add('header-hidden');
        }
        else if (self.direction === -1) {
            header.classList.remove('header-hidden');
        }
    }
});
document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
});
document.querySelectorAll('.split-text').forEach(el => {
    ScrollTrigger.create({
        trigger: el, start: 'top 80%',
        onEnter: () => el.classList.add('active'),
        onLeaveBack: () => el.classList.remove('active')
    });
});
document.querySelectorAll('.stagger-reveal').forEach(grid => {
    ScrollTrigger.create({
        trigger: grid, start: 'top 80%',
        onEnter: () => grid.classList.add('active'),
        onLeaveBack: () => grid.classList.remove('active')
    });
});
gsap.to('.hero-title', {
    yPercent: 50, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
});

window.showUserUI = function (user, isAdmin) {
    const container = document.getElementById('auth-section');
    if (!container) return;
    const name = user.displayName || user.email.split('@')[0];
    container.innerHTML = `
                <span class="header-auth">
                    ${name} ${isAdmin ? '<span style="opacity:0.5">[ADMIN]</span>' : ''}
                </span>
                ${isAdmin ? '<a href="admin.html" style="color:#fff;text-decoration:none;font-size:14px;"><i class="fa-solid fa-gear"></i></a>' : ''}
                <button class="btn-header" onclick="logoutUser()">KILÉPÉS</button>
            `;
};
window.showGuestUI = function () {
    const container = document.getElementById('auth-section');
    if (!container) return;
    container.innerHTML = `
                <a href="login.html" style="text-decoration:none">
                    <button class="btn-header">BELÉPÉS</button>
                </a>
            `;
};

function updateClock() {
    const now = new Date();
    const options = {
        timeZone: 'Europe/Budapest',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    document.getElementById('real-time-clock').textContent = new Intl.DateTimeFormat('hu-HU', options).format(now);
}
setInterval(updateClock, 1000);
updateClock();