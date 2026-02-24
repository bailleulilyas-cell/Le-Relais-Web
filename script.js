document.addEventListener('DOMContentLoaded', () => {
    // Reveal Observer (Apparition au scroll)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    const targets = document.querySelectorAll('.bento-item, .pricing-card, .profile-card, .story-item, .form-container');
    targets.forEach(t => {
        t.classList.add('reveal');
        observer.observe(t);
    });

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        nav.style.padding = window.scrollY > 50 ? '0.8rem 0' : '1.5rem 0';
        nav.style.background = window.scrollY > 50 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)';
    });
});
