(function () {
    const BUTTON_ID = 'page-context-menu-button';
    const LABEL_TEXT = 'Copy page URL';

    function displaySuccessIndicator() {
        const btn = document.getElementById(BUTTON_ID);
        if (!btn) return;

        const textSpan = btn.querySelector('span');
        if (textSpan) {
            textSpan.textContent = 'URL Copied!';
            setTimeout(() => {
                textSpan.textContent = LABEL_TEXT;
            }, 2000);
        }
    }

    function copyUrlToClipboard() {
        const url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(url);
        }

        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textarea);
        }
        return Promise.resolve();
    }

    function patchButton() {
        const btn = document.getElementById(BUTTON_ID);
        if (!btn) return;

        // Avoid re-patching the same element repeatedly
        if (btn.getAttribute('data-copy-url-patched') === 'true') return;

        // Update accessible label
        btn.setAttribute('aria-label', LABEL_TEXT);

        // Update visible text (keep icon intact)
        const textSpan = btn.querySelector('span');
        if (textSpan) {
            textSpan.textContent = LABEL_TEXT;
        }

        // Remove existing listeners by cloning, then attach our handler
        const clone = btn.cloneNode(true);
        clone.setAttribute('data-copy-url-patched', 'true');
        clone.addEventListener(
            'click',
            (e) => {
                console.log('click detected')
                e.preventDefault();
                e.stopPropagation();
                copyUrlToClipboard().then(() => {
                    displaySuccessIndicator();
                });
            },
            true
        );

        // Replace the original button in the DOM
        btn.parentNode && btn.parentNode.replaceChild(clone, btn);
    }

    function run() {
        patchButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    // Observe SPA navigations and dynamic content changes
    const observer = new MutationObserver(() => run());
    observer.observe(document.body, { childList: true, subtree: true });
})();
