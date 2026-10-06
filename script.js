// Mobile navigation toggle
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('primary-nav');

    if (!toggle || !menu) {
        return;
    }

    function setOpen(open) {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
        setOpen(!menu.classList.contains('is-open'));
    });

    // Close the menu after tapping a link so the page isn't left covered
    menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
            setOpen(false);
        }
    });

    // Reset state when returning to the desktop layout
    window.addEventListener('resize', function () {
        if (window.innerWidth > 760) {
            setOpen(false);
        }
    });
})();
