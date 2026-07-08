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

    function clickCloseIcon() {
        const closeIcons = document.querySelectorAll(
            "img.closeIcon--gwB7wNKs, img.closeIcon--jnS6DrX5, img.closeIcon--XlKKbKOd"
        );

        for (const closeIcon of closeIcons) {
            if (!isVisible(closeIcon)) continue;
            closeIcon.click();

            const clickableParent = closeIcon.closest("button, a, div, span");
            if (clickableParent && clickableParent !== closeIcon) {
                clickableParent.click();
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
        attributes: true
    });

    const interval = setInterval(() => {
        clickCloseIcon();
    }, 1000);

    setTimeout(() => clearInterval(interval), 30000);
})();
