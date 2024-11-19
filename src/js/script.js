// Utility: Throttle function to limit event calls
function throttle(callback, delay) {
    let isThrottled = false;
    return (...args) => {
        if (!isThrottled) {
            callback(...args);
            isThrottled = true;
            setTimeout(() => (isThrottled = false), delay);
        }
    };
}

// Utility: Smooth scroll with reduced-motion preference support
function smoothScrollTo(target) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        target.scrollIntoView({ behavior: 'auto' });
        return;
    }

    const start = window.scrollY;
    const end = target.offsetTop;
    const distance = end - start;
    const startTime = performance.now();

    function animation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        window.scrollTo(0, start + distance * easeOutCubic(progress));
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// Easing function
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Show project animation using IntersectionObserver
const projects = document.querySelectorAll('.project');
if (projects.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        },
        { threshold: 0.1 }
    );

    projects.forEach((project) => observer.observe(project));
}

// Section Scrolling Logic
const sections = Array.from(document.querySelectorAll('.full-page-section'));
let currentSectionIndex = 0;
const scrollDuration = 800; // Scroll animation duration (ms)
const scrollThreshold = 150; // Distance in pixels for touch gestures

function scrollToSection(index) {
    if (index >= 0 && index < sections.length) {
        currentSectionIndex = index;
        smoothScrollTo(sections[currentSectionIndex]);
    }
}

window.addEventListener(
    'wheel',
    throttle((event) => {
        if (event.deltaY > 0 && currentSectionIndex < sections.length - 1) {
            scrollToSection(currentSectionIndex + 1);
        } else if (event.deltaY < 0 && currentSectionIndex > 0) {
            scrollToSection(currentSectionIndex - 1);
        }
    }, scrollDuration)
);

// Touch support for mobile devices
let touchStartY = 0;
window.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
});

window.addEventListener(
    'touchmove',
    throttle((event) => {
        const touchDeltaY = touchStartY - event.touches[0].clientY;

        if (Math.abs(touchDeltaY) > scrollThreshold) {
            if (touchDeltaY > 0 && currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
            } else if (touchDeltaY < 0 && currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
            touchStartY = event.touches[0].clientY; // Reset start position
        }
    }, scrollDuration)
);

// Footer and Header Visibility
const footer = document.querySelector('.footer');
const header = document.querySelector('.header');
window.addEventListener(
    'scroll',
    throttle(() => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.body.scrollHeight;
        const windowHeight = window.innerHeight;

        if (footer) {
            footer.style.bottom =
                scrollTop + windowHeight >= scrollHeight ? '0' : '-100px';
        }

        if (header) {
            header.classList.toggle('transparent', scrollTop > header.offsetHeight);
        }
    }, 200)
);

// Smooth Scroll for Anchor Links
document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) smoothScrollTo(target);
    });
});


