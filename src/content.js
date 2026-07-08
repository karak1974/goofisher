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

    function editPrice() {
        const cnyRate = 7.767; // Yes, hardcoded exchange rate, I know pathetic
        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            const candidates = document.querySelectorAll("[class*='price--']");

            for (const price of candidates) {
                if (!isVisible(price)) continue;

                const textValue = price.textContent.trim();

                if (!textValue) continue;

                const match = textValue.match(/[\d,.]+/);

                if (!match) continue;

                const amountCny = Number(match[0].replace(/,/g, ""));

                if (!amountCny) continue;

                const amountEur = amountCny / cnyRate;
                const euroText = `€${amountEur.toFixed(2)}`;

                let euroLabel = price.querySelector(".euro-price-label");

                if (!euroLabel) {
                    euroLabel = document.createElement("span");
                    euroLabel.className = "euro-price-label";
                    euroLabel.style.marginLeft = "8px";
                    euroLabel.style.fontSize = "18px";
                    euroLabel.style.fontWeight = "normal";
                    euroLabel.style.opacity = "0.85";

                    price.appendChild(euroLabel);
                }

                euroLabel.textContent = `≈ ${euroText}`;

                clearInterval(interval);
                return;
            }

            if (attempts >= 10) {
                console.log("PRICE NOT FOUND");
                clearInterval(interval);
            }
        }, 500);
    }

    function editOtherPrices() {
        const cnyRate = 7.767; // Yes, hardcoded exchange rate, I know pathetic
        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            const candidates = document.querySelectorAll("[class*='number--']");
            let updatedCount = 0;

            for (const price of candidates) {
                if (!isVisible(price)) continue;

                const textValue = price.childNodes[0]?.textContent?.trim() || "";

                if (!textValue) continue;

                const match = textValue.match(/[\d,.]+/);

                if (!match) continue;

                const amountCny = Number(match[0].replace(/,/g, ""));

                if (!amountCny) continue;

                const amountEur = amountCny / cnyRate;
                const euroText = `€${amountEur.toFixed(2)}`;

                let euroLabel = price.querySelector(".euro-price-label");

                if (!euroLabel) {
                    euroLabel = document.createElement("span");
                    euroLabel.className = "euro-price-label";
                    euroLabel.style.marginLeft = "8px";
                    euroLabel.style.fontSize = "18px";
                    euroLabel.style.fontWeight = "normal";
                    euroLabel.style.opacity = "0.85";

                    price.appendChild(euroLabel);
                }

                euroLabel.textContent = `≈ ${euroText}`;
                updatedCount++;
            }

            if (updatedCount > 0) {
                console.log(`UPDATED ${updatedCount} PRICE ELEMENTS`);
                clearInterval(interval);
                return;
            }

            if (attempts >= 10) {
                console.log("PRICE NOT FOUND");
                clearInterval(interval);
            }
        }, 500);
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

    if (clickCloseIcon()) {
        editPrice();
        editOtherPrices();
    }

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