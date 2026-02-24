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

// Gestion de la redirection sécurisée vers Stripe
document.addEventListener('DOMContentLoaded', () => {
    const relaisForm = document.getElementById('relais-form');

    if (relaisForm) {
        relaisForm.addEventListener('submit', function(e) {
            // Ton lien Stripe exact
            const stripeUrl = "https://buy.stripe.com/6oUaEY9TH0RPg8K2za1VK00"; 

            // On change le texte du bouton pour montrer que c'est en cours
            const btn = document.getElementById('submit-btn');
            if(btn) {
                btn.innerText = "Envoi en cours...";
                btn.style.opacity = "0.7";
            }

            // On laisse 1.2 seconde à FormSubmit pour envoyer les données
            // avant de rediriger de force vers Stripe
            setTimeout(() => {
                window.location.href = stripeUrl;
            }, 1200);
        });
    }
});

