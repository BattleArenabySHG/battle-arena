document.addEventListener("DOMContentLoaded", function() {
    // 1. Find all links and buttons
    const links = document.querySelectorAll('a');
    const forms = document.querySelectorAll('form');

    // 2. Force links to open in the 'gameFrame'
    links.forEach(link => {
        if (!link.getAttribute('target')) {
            link.setAttribute('target', 'gameFrame');
        }
    });

    // 3. Force forms (if any) to submit in the 'gameFrame'
    forms.forEach(form => {
        if (!form.getAttribute('target')) {
            form.setAttribute('target', 'gameFrame');
        }
    });

    // 4. Safety Check: If someone opens 'start.html' directly, 
    // redirect them to the index.html so the music plays.
    if (window.self === window.top && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
});