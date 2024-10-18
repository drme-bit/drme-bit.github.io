// Show project animation on scroll
document.addEventListener('scroll', () => {
    const projects = document.querySelectorAll('.project');
    projects.forEach((project) => {
        const rect = project.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            project.classList.add('show');
        }
    });
});

// Selecting all full-page sections
const sections = document.querySelectorAll('.full-page-section');
let currentSectionIndex = 0;
let isThrottled = false; // Throttle flag
const scrollDuration = 800; // Duration for the scroll in milliseconds
const scrollThreshold = 150; // Required scroll distance in pixels to trigger a section change

function smoothScrollTo(target) {
    const start = window.scrollY;
    const end = target.offsetTop;
    const distance = end - start;
    const startTime = performance.now();

    function animation(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / scrollDuration, 1); // Normalize progress (0 to 1)
        window.scrollTo(0, start + distance * easeOutCubic(progress)); // Easing function
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// Easing function (Cubic)
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3); // Easing out for a smooth end
}

let lastScrollY = window.scrollY; // To track the last scroll position

window.addEventListener('wheel', (event) => {
    if (isThrottled) return; // Prevent further actions until throttle is released

    const deltaY = event.deltaY;

    // Determine which direction to scroll
    if (deltaY > 0) {
        // Scrolling down
        if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
        }
    } else if (deltaY < 0) {
        // Scrolling up
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
        }
    }

    // Scroll to the current section
    smoothScrollTo(sections[currentSectionIndex]);

    // Set throttle
    isThrottled = true;
    setTimeout(() => {
        isThrottled = false; // Reset throttle after scroll duration
    }, scrollDuration);
    
    lastScrollY = window.scrollY; // Update the last scroll position
});

// Touch Events for Mobile Devices (Optional)
let touchStartY = 0;

window.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY; // Get the initial touch position
});

window.addEventListener('touchmove', (event) => {
    const touchEndY = event.touches[0].clientY;
    const touchDeltaY = touchStartY - touchEndY;

    if (Math.abs(touchDeltaY) > scrollThreshold) {
        if (touchDeltaY > 0 && currentSectionIndex < sections.length - 1) {
            // Swiping up
            currentSectionIndex++;
        } else if (touchDeltaY < 0 && currentSectionIndex > 0) {
            // Swiping down
            currentSectionIndex--;
        }

        smoothScrollTo(sections[currentSectionIndex]); // Scroll to the current section
        touchStartY = touchEndY; // Reset the touch start position
    }
});

// Ensure the user can navigate back to the first section if at the last section
const footer = document.querySelector('.footer');
const header = document.querySelector('.header');

window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Hide footer at the top
    if (scrollTop === 0) {
        footer.style.bottom = '-100px'; // Hide footer
    } else if (scrollTop + window.innerHeight >= document.body.offsetHeight) {
        // Show footer when at the bottom
        footer.style.bottom = '0';
    }

    // Add or remove transparent class from header
    if (scrollTop > header.offsetHeight) {
        header.classList.add('transparent'); // Add transparency
    } else {
        header.classList.remove('transparent'); // Remove transparency
    }
});

// Smooth scroll for anchor links (optional)
const links = document.querySelectorAll('nav a'); // Find all navigation links
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior

        const targetId = link.getAttribute('href'); // Get href attribute
        const targetElement = document.querySelector(targetId); // Find the element by ID

        if (targetElement) {
            smoothScrollTo(targetElement); // Scroll to the element
        }
    });
});


