(function () {
    const USERNAME_TITLE = 'Authorization.username';
    const PASSWORD_TITLE = 'Authorization.password';

    // Insert a caption exactly like Mintlify's auto-descriptions, i.e.
    // <div class="prose prose-sm prose-gray dark:prose-invert text-gray-500 dark:text-gray-400"><p class="whitespace-pre-line">...</p></div>
    function insertCaptionFor(title, message) {
        const titleEls = document.querySelectorAll(`[title="${title}"]`);
        titleEls.forEach((titleEl) => {
            // The title lives inside the left column stack ("space-y-2"); insert caption there
            const fieldStack = titleEl.closest('.space-y-2');
            if (!fieldStack) return;

            // Avoid duplicates if re-rendered
            if (fieldStack.querySelector('[data-auth-caption]')) return;

            const desc = document.createElement('div');
            desc.setAttribute('data-auth-caption', 'true');
            desc.className = 'prose prose-sm prose-gray dark:prose-invert text-gray-500 dark:text-gray-400';

            const p = document.createElement('p');
            p.className = 'whitespace-pre-line';
            p.textContent = message;

            desc.appendChild(p);
            fieldStack.appendChild(desc);
        });
    }

    function applyHints() {
        insertCaptionFor(USERNAME_TITLE, 'Leave this value empty');
        insertCaptionFor(PASSWORD_TITLE, 'Use your API token here');
    }

    // Initial run (after hydration)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyHints);
    } else {
        applyHints();
    }

    // Observe SPA route changes and accordion expansions
    const observer = new MutationObserver(() => applyHints());
    observer.observe(document.body, { childList: true, subtree: true });
})();