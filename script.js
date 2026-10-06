// Theme toggle: remembers an explicit choice, otherwise follows the OS
(function () {
    var STORAGE_KEY = 'pf-theme';
    var root = document.documentElement;
    var toggle = document.querySelector('.theme-toggle');

    function systemPrefersDark() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function currentTheme() {
        var set = root.getAttribute('data-theme');
        if (set === 'dark' || set === 'light') {
            return set;
        }
        return systemPrefersDark() ? 'dark' : 'light';
    }

    function label(theme) {
        return theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        if (toggle) {
            toggle.setAttribute('aria-label', label(theme));
            toggle.setAttribute('title', label(theme));
            toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        }
    }

    if (toggle) {
        apply(currentTheme());

        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            apply(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) {
                /* storage unavailable, theme still applies for this page */
            }
        });
    }

    // Track the OS while the visitor has no saved preference
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () {
        var saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            saved = null;
        }
        if (saved !== 'dark' && saved !== 'light') {
            apply(systemPrefersDark() ? 'dark' : 'light');
        }
    };

    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onChange);
    } else if (typeof media.addListener === 'function') {
        media.addListener(onChange);
    }
})();

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
        if (window.innerWidth > 820) {
            setOpen(false);
        }
    });
})();

// Contact form, submitted over AJAX so the visitor stays on the page
(function () {
    var PLACEHOLDER = 'YOUR_WEB3FORMS_ACCESS_KEY';
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');

    if (!form || !status) {
        return;
    }

    var button = form.querySelector('button[type="submit"]');
    var originalLabel = button ? button.textContent : '';

    function show(message, kind) {
        status.textContent = message;
        status.classList.add('is-visible');
        status.classList.toggle('is-success', kind === 'success');
        status.classList.toggle('is-error', kind === 'error');
    }

    function busy(isBusy) {
        if (!button) {
            return;
        }
        button.disabled = isBusy;
        button.textContent = isBusy ? 'Sending...' : originalLabel;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var data = Object.fromEntries(new FormData(form));

        // Silently accept anything that trips the honeypot
        if (data.botcheck) {
            show('Thanks, your message has been sent.', 'success');
            form.reset();
            return;
        }

        if (data.access_key === PLACEHOLDER || !data.access_key) {
            show('This form is not connected yet. Please email projectfuturellc@gmail.com directly.', 'error');
            return;
        }

        busy(true);

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(function (response) {
                return response.json().then(function (body) {
                    return { ok: response.ok, body: body };
                });
            })
            .then(function (result) {
                if (result.ok && result.body.success) {
                    show('Thanks, your message has been sent. We will get back to you shortly.', 'success');
                    form.reset();
                } else {
                    show('Something went wrong. Please email projectfuturellc@gmail.com instead.', 'error');
                }
            })
            .catch(function () {
                show('Network error. Please email projectfuturellc@gmail.com instead.', 'error');
            })
            .finally(function () {
                busy(false);
            });
    });
})();
