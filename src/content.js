(() => {
    if (window.location.hostname !== "www.goofish.com") {
        return;
    }

    function isVisible(el) {
        if (!el) return false;

        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            rect.width > 0 &&
            rect.height > 0
        );
    }

    function isCloseIcon(el) {
        if (!el || !el.classList) return false;

        return [...el.classList].some(className =>
            /^closeIcon--/.test(className)
        );
    }

    function clickElement(el) {
        el.dispatchEvent(new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    function clickCloseIcon() {
        const candidates = document.querySelectorAll("[class*='closeIcon--']");

        for (const closeIcon of candidates) {
            if (!isCloseIcon(closeIcon)) continue;
            if (!isVisible(closeIcon)) continue;

            clickElement(closeIcon);

            const clickableParent = closeIcon.closest(
                "button, a, [role='button'], div, span"
            );

            if (clickableParent && clickableParent !== closeIcon) {
                clickElement(clickableParent);
            }

            return true;
        }

        return false;
    }

    clickCloseIcon();

    const observer = new MutationObserver(() => {
        clickCloseIcon();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"]
    });

    const interval = setInterval(() => {
        clickCloseIcon();
    }, 1000);

    setTimeout(() => clearInterval(interval), 30000);
})();