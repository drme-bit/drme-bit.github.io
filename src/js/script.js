document.body.style.overflow = 'hidden';
function throttle(callback, limit) {
    let wait = false;
    return function (...args) {
        if (!wait) {
            callback.apply(this, args);
            wait = true;
            setTimeout(() => (wait = false), limit);
        }
    };
}

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

const sections = Array.from(document.querySelectorAll('.full-page-section'));
let currentSectionIndex = 0;
const scrollDuration = 800;
const scrollThreshold = 150;

function smoothScrollTo(target) {
    const start = window.scrollY;
    const end = target.offsetTop;
    const distance = end - start;
    const startTime = performance.now();

    function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / scrollDuration, 1);
        window.scrollTo(0, start + distance * easeOutCubic(progress));
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function scrollToSection(index) {
    if (index >= 0 && index < sections.length) {
        currentSectionIndex = index;
        smoothScrollTo(sections[currentSectionIndex]);
    }
}

window.addEventListener(
    'wheel',
    throttle((event) => {
        const deltaY = event.deltaY;
        if (deltaY > 0 && currentSectionIndex < sections.length - 1) {
            scrollToSection(currentSectionIndex + 1);
        } else if (deltaY < 0 && currentSectionIndex > 0) {
            scrollToSection(currentSectionIndex - 1);
        }
    }, scrollDuration)
);

// Touch support for mobile
let touchStartY = 0;
window.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
});

window.addEventListener(
    'touchmove',
    throttle((event) => {
        const touchEndY = event.touches[0].clientY;
        const touchDeltaY = touchStartY - touchEndY;

        if (Math.abs(touchDeltaY) > scrollThreshold) {
            if (touchDeltaY > 0 && currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
            } else if (touchDeltaY < 0 && currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
            touchStartY = touchEndY; // Reset for continued swiping
        }
    }, scrollDuration)
);

// Footer and Header Logic
const footer = document.querySelector('.footer');
const header = document.querySelector('.header');
window.addEventListener(
    'scroll',
    throttle(() => {
        const scrollTop = window.scrollY;

        if (footer) {
            footer.style.bottom =
                scrollTop + window.innerHeight >= document.body.offsetHeight
                    ? '0'
                    : '-100px';
        }

        if (header) {
            if (scrollTop > header.offsetHeight) {
                header.classList.add('transparent');
            } else {
                header.classList.remove('transparent');
            }
        }
    }, 200)
);

// Smooth scroll for anchor links
document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) smoothScrollTo(targetElement);
    });
});
