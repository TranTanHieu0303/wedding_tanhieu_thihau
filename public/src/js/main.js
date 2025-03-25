function runAnimationDoc(element, eventData = null, options = {}) {
    if (!element) return;

    // Lấy dữ liệu event nếu chưa có
    if (!eventData && element.id) {
        eventData = window.runtime?.eventData?.[element.id] || {};
    }

    // Gán giá trị mặc định cho options
    options.is_child = options.is_child ?? false;
    options.run_timeout = options.run_timeout ?? true;

    // Nếu phần tử thuộc carousel
    if (options.element_type === "carousel") {
        let ancestorCarousel = findAncestor(element, "ladi-carousel");
        ancestorCarousel = ancestorCarousel ? findAncestor(ancestorCarousel, "ladi-element") : element;

        if (options.is_child && ancestorCarousel && options.run_timeout) {
            let carouselContent = ancestorCarousel.querySelector(".ladi-carousel-content");
            let transitionDuration = parseFloat(getComputedStyle(carouselContent).transitionDuration) * 1000 || 0;

            setTimeout(() => {
                if (isElementInViewport(element)) {
                    options.run_timeout = false;
                    runAnimationDoc(element, eventData, options);
                }
            }, transitionDuration + 100);
            return;
        }
    } else {
        if (element.classList.contains("ladi-animation")) {
            element.classList.add("ladi-animation-hidden");
        }
    }

    // Chạy animation nếu phần tử bị ẩn
    if (element.classList.contains("ladi-animation-hidden")) {
        let animationDelay = parseFloat(eventData?.[window.runtime?.device + ".style.animation-delay"]) || 0;

        element.classList.add("ladi-animation");
        setTimeout(() => {
            element.classList.remove("ladi-animation-hidden");
        }, animationDelay * 1000);
    }

    // Nếu có nhiều phần tử cần chạy animation
    if (options.is_multiple) {
        let elementsToAnimate = element.querySelectorAll(".ladi-animation, .ladi-animation-hidden");
        options.is_child = true;
        elementsToAnimate.forEach(child => runAnimationDoc(child, null, options));
    }
}

// Hàm kiểm tra phần tử có trong khung nhìn không
function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Hàm tìm phần tử cha có class cụ thể
function findAncestor(el, className) {
    while (el && !el.classList.contains(className)) {
        el = el.parentElement;
    }
    return el;
}

// Hàm chạy animation khi cuộn trang
function handleScrollAnimation() {
    document.querySelectorAll(".ladi-animation-hidden").forEach(el => {
        if (isElementInViewport(el)) {
            runAnimationDoc(el);
        }
    });
}

// Lắng nghe sự kiện scroll để chạy animation khi phần tử xuất hiện
window.addEventListener("scroll", handleScrollAnimation);
