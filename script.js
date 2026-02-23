document.addEventListener('DOMContentLoaded', () => {
    // Reveal Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.bento-item, .pricing-card, .member-card, .form-wrapper, .hero-inner').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        nav.style.padding = window.scrollY > 50 ? '0.8rem 0' : '1.5rem 0';
    });
});
