let observer;

function createObserver() {
    if (!("IntersectionObserver" in window)) {
        return;
    }

    // small polyfill for Microsoft Edge 15 isIntersecting property
    // see https://github.com/WICG/IntersectionObserver/issues/211#issuecomment-309144669
    if ("IntersectionObserver" in window &&
        "IntersectionObserverEntry" in window &&
        "intersectionRatio" in window.IntersectionObserverEntry.prototype &&
        !("isIntersecting" in IntersectionObserverEntry.prototype)) {
        Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", {
            get() {
                return this.intersectionRatio > 0;
            }
        });
    }

    function onChange(changes) {
        changes.forEach(change => {
            if (change.isIntersecting) {
                change.target.classList.add("visible");
                change.target.src = change.target.dataset.src;
                observer.unobserve(change.target);
            }
        });
    }

    observer = new IntersectionObserver(onChange, {
        rootMargin: "250px 0px",
        threshold: 0.01
    });
}

function observe() {
    const imgElements = document.querySelectorAll(".lazyload");

    imgElements.forEach(img => {
        if (observer) {
            observer.observe(img);
        } else {
            img.src = img.dataset.src;
        }
    });
}

export default {
    createObserver,
    observe
};
