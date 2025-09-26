// Utility function for throttling
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

// Show project animation on scroll using IntersectionObserver
const projects = document.querySelectorAll('.project-card');
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

// Skills animation
const skillBars = document.querySelectorAll('.skill-progress');
if (skillBars.length) {
    const skillObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const width = entry.target.getAttribute('data-width');
                    entry.target.style.width = width + '%';
                }
            });
        },
        { threshold: 0.5 }
    );

    skillBars.forEach((bar) => skillObserver.observe(bar));
}

// Scroll navigation between full-page sections
const sections = Array.from(document.querySelectorAll('.full-page-section'));
let currentSectionIndex = 0;
const scrollDuration = 800; // ms
const scrollThreshold = 150; // pixels

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

// Header Logic
const header = document.querySelector('.header');
window.addEventListener(
    'scroll',
    throttle(() => {
        const scrollTop = window.scrollY;

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

// Contact Form Validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });
        
        let isValid = true;
        
        // Validate name
        const name = document.getElementById('name').value.trim();
        if (!name) {
            document.getElementById('nameError').textContent = 'Name is required';
            isValid = false;
        } else if (name.length < 2) {
            document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Validate subject
        const subject = document.getElementById('subject').value.trim();
        if (!subject) {
            document.getElementById('subjectError').textContent = 'Subject is required';
            isValid = false;
        }
        
        // Validate message
        const message = document.getElementById('message').value.trim();
        if (!message) {
            document.getElementById('messageError').textContent = 'Message is required';
            isValid = false;
        } else if (message.length < 10) {
            document.getElementById('messageError').textContent = 'Message must be at least 10 characters';
            isValid = false;
        }
        
        if (isValid) {
            // Form is valid - in a real application, you would send the data to a server
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.querySelector('.btn-text').textContent;
            
            submitBtn.querySelector('.btn-text').textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                alert('Thank you for your message! I\'ll get back to you soon.');
                contactForm.reset();
                submitBtn.querySelector('.btn-text').textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
}
