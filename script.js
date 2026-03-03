/* ═══════════════════════════════════════════════ */
/* TEACHCONNECT - Main Script                      */
/* ═══════════════════════════════════════════════ */

// ─── Preloader ───────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        initScrollAnimations();
        animateCounters();
    }, 1800);
});

// ─── Navbar Scroll Effect ────────────────────────
const navbar = document.getElementById('main-nav');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (scrollY > 500) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

    // Active nav link based on scroll
    updateActiveNavLink();
});

// ─── Mobile Nav Toggle ───────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ─── Active Nav Link on Scroll ───────────────────
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[data-section="${id}"]`);

        if (link) {
            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
}

// ─── Counter Animation ───────────────────────────
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current).toLocaleString();
            if (target >= 1000) {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// ─── Scroll Animations (Reveal on scroll) ────────
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unsubscribe after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ─── Testimonial Slider ──────────────────────────
let currentTestimonial = 0;
const totalTestimonials = 3;

function slideTestimonial(direction) {
    currentTestimonial += direction;
    if (currentTestimonial < 0) currentTestimonial = totalTestimonials - 1;
    if (currentTestimonial >= totalTestimonials) currentTestimonial = 0;

    updateTestimonialSlider();
}

function updateTestimonialSlider() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');

    cards.forEach((card, index) => {
        card.style.transform = `translateX(-${currentTestimonial * 100}%)`;
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentTestimonial);
    });
}

// Auto-slide testimonials
setInterval(() => slideTestimonial(1), 5000);

// Dot clicks
document.querySelectorAll('.testimonial-dots .dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentTestimonial = index;
        updateTestimonialSlider();
    });
});

// ─── Modal Functions (General) ───────────────────
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// closeModal is now handled by app.js

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 200);
}

// ─── OTP Input Auto-focus ────────────────────────
document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// ─── Form Handlers (Specific) ────────────────────
function handleBooking(e) {
    e.preventDefault();
    closeModal('bookingModal');
    showToast('Session Booked!', 'Your consultancy session has been scheduled.');
}

function handleContactSubmit(e) {
    e.preventDefault();
    e.target.reset();
    showToast('Message Sent!', 'We\'ll get back to you within 24 hours.');
}

// showToast and hideToast are now handled by app.js (matching 'toast' ID)

// ─── Scroll to Top ──────────────────────────────
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Smooth Scroll for Anchor Links ─────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ─── Parallax-like effect on hero floating cards ─
window.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.hero-floating-card');
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    cards.forEach((card, index) => {
        const factor = (index + 1) * 0.5;
        card.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});
