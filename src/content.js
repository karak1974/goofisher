(async () => {
    if (window.location.hostname !== "www.goofish.com") {
        return;
    }

    const FALLBACK_CNY_PER_EUR = 7.767;

    async function getCnyToEurRateOnce() {
        try {
            const response = await fetch("https://api.frankfurter.dev/v2/rate/CNY/EUR", {
                cache: "force-cache"
            });

            if (!response.ok) {
                throw new Error(`Frankfurter HTTP ${response.status}`);
            }

            const data = await response.json();

            if (typeof data.rate !== "number") {
                throw new Error("Frankfurter response missing numeric rate");
            }

            console.log(`CNY → EUR rate loaded: ${data.rate}`);
            return data.rate;
        } catch (error) {
            console.warn("Failed to fetch exchange rate, using fallback:", error);
            return 1 / FALLBACK_CNY_PER_EUR;
        }
    }

    const CNY_TO_EUR_RATE = await getCnyToEurRateOnce();

    function cnyToEur(amountCny) {
        return amountCny * CNY_TO_EUR_RATE;
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

    function addEuroLabel(price, amountCny) {
        const amountEur = cnyToEur(amountCny);
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
    }

    function parseCnyAmount(textValue) {
        if (!textValue) return null;

        const match = textValue.match(/[\d,.]+/);
        if (!match) return null;

        const amountCny = Number(match[0].replace(/,/g, ""));
        return amountCny || null;
    }

    function editPrice() {
        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            const candidates = document.querySelectorAll("[class*='price--']");

            for (const price of candidates) {
                if (!isVisible(price)) continue;

                const textValue = price.childNodes[0]?.textContent?.trim() || price.textContent.trim();
                const amountCny = parseCnyAmount(textValue);

                if (!amountCny) continue;

                addEuroLabel(price, amountCny);

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
        let attempts = 0;

        const interval = setInterval(() => {
            attempts++;

            const candidates = document.querySelectorAll("[class*='number--']");
            let updatedCount = 0;

            for (const price of candidates) {
                if (!isVisible(price)) continue;

                const textValue = price.childNodes[0]?.textContent?.trim() || "";
                const amountCny = parseCnyAmount(textValue);

                if (!amountCny) continue;

                addEuroLabel(price, amountCny);
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

    let priceEditsStarted = false;

    function startPriceEditsOnce() {
        if (priceEditsStarted) return;
        priceEditsStarted = true;

        editPrice();
        editOtherPrices();
    }

    if (clickCloseIcon()) {
        startPriceEditsOnce();
    }

    const observer = new MutationObserver(() => {
        if (clickCloseIcon()) {
            startPriceEditsOnce();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"]
    });

    const interval = setInterval(() => {
        if (clickCloseIcon()) {
            startPriceEditsOnce();
        }
    }, 1000);

    setTimeout(() => clearInterval(interval), 30000);
})();