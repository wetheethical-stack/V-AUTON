/* ==========================================================================
   1. VISUAL ENGINE (BLACK HOLE & UI)
   ========================================================================== */
const canvas = document.getElementById('cosmos-canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Optimization

let width, height, centerX, centerY;
let particles = [];
const PARTICLE_COUNT = window.innerWidth > 768 ? 1500 : 600; 

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    centerX = width > 1024 ? width * 0.75 : width * 0.5;
    centerY = height * 0.5;
    initParticles();
}
window.addEventListener('resize', resize);

class Particle {
    constructor() { this.reset(); }
    reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * (Math.max(width, height));
        this.x = centerX + Math.cos(angle) * dist;
        this.y = centerY + Math.sin(angle) * dist;
        this.size = Math.random() * 1.5;
        this.color = Math.random() > 0.9 ? '#ffffff' : (Math.random() > 0.6 ? '#3b82f6' : '#06b6d4');
        this.speed = 0.005 + Math.random() * 0.01;
    }
    update() {
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distSq = dx*dx + dy*dy;
        const dist = Math.sqrt(distSq);
        const pull = 800 / (distSq + 0.1); 
        
        this.x -= (dx/dist) * pull * 2;
        this.y -= (dy/dist) * pull * 2;
        
        const angle = this.speed;
        const xNew = (this.x - centerX) * Math.cos(angle) - (this.y - centerY) * Math.sin(angle) + centerX;
        const yNew = (this.x - centerX) * Math.sin(angle) + (this.y - centerY) * Math.cos(angle) + centerY;
        this.x = xNew;
        this.y = yNew;

        if (dist < 50 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for(let i=0; i<PARTICLE_COUNT; i++) particles.push(new Particle());
}

function animate() {
    ctx.fillStyle = 'rgba(3, 3, 4, 0.2)'; 
    ctx.fillRect(0, 0, width, height);
    
    // Event Horizon
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(centerX, centerY, 60, 0, Math.PI*2); ctx.fill();
    
    // Accretion Glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 60, centerX, centerY, 120);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(centerX, centerY, 120, 0, Math.PI*2); ctx.fill();

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}

resize();
animate();

// Matrix Text Effect
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#";
document.querySelectorAll('.decrypt-effect').forEach(header => {
    let iterations = 0;
    const originalText = header.dataset.value;
    const interval = setInterval(() => {
        header.innerText = originalText.split("").map((l, i) => {
            if(i < iterations) return originalText[i];
            return letters[Math.floor(Math.random() * 36)];
        }).join("");
        if(iterations >= originalText.length) clearInterval(interval);
        iterations += 1/3; 
    }, 40);
});

// 3D Tilt Effect (Desktop Only)
document.querySelectorAll('.tilt-target').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 1024) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y - rect.height/2) / rect.height/2) * -8;
        const rotY = ((x - rect.width/2) / rect.width/2) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
});

// Scroll Reveal
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ==========================================================================
   2. SERVERLESS FORM HANDLER
   ========================================================================== */
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('user-email').value;
    const organization = document.getElementById('user-org').value;
    
    btn.innerHTML = "ENCRYPTING TRANSMISSION...";
    btn.style.background = "#333";
    btn.disabled = true;

    try {
        // Send to Vercel Serverless Function
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, organization })
        });

        if (!response.ok) throw new Error('API Error');

        btn.innerText = "ACCESS GRANTED";
        btn.style.background = "#10b981";
        btn.style.color = "#fff";
        e.target.reset();
        
        setTimeout(() => {
            btn.innerText = "INITIALIZE SEQUENCE";
            btn.style.background = "#fff";
            btn.style.color = "#000";
            btn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error(error);
        btn.innerText = "CONNECTION REJECTED";
        btn.style.background = "#ef4444";
        btn.style.color = "#fff";
        setTimeout(() => {
            btn.innerText = "INITIALIZE SEQUENCE";
            btn.style.background = "#fff";
            btn.style.color = "#000";
            btn.disabled = false;
        }, 3000);
    }
});