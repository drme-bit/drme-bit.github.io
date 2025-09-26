// Additional animations and effects for the portfolio

// Parallax effect for hero section
function initParallaxEffect() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = hero.querySelector('#hero::before');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Typing animation for hero title
function initTypingAnimation() {
    const titleElement = document.querySelector('.hero-content h1 .highlight');
    if (!titleElement) return;

    const text = titleElement.textContent;
    titleElement.textContent = '';
    
    let i = 0;
    const typeSpeed = 100;
    
    function typeWriter() {
        if (i < text.length) {
            titleElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, typeSpeed);
        }
    }
    
    // Start typing animation after a delay
    setTimeout(typeWriter, 1000);
}

// Floating animation for tech tags
function initFloatingTags() {
    const techTags = document.querySelectorAll('.tech-tag');
    
    techTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.1}s`;
        tag.classList.add('floating');
    });
}

// Mouse cursor trail effect
function initCursorTrail() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// Add CSS for additional animations
function addAnimationStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
        .floating {
            animation: float 3s ease-in-out infinite;
        }
        
        .floating:nth-child(odd) {
            animation-direction: reverse;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .cursor-trail {
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(102, 126, 234, 0.3);
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        }
        
        .cursor-trail::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: var(--accent-primary);
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        
        @media (max-width: 768px) {
            .cursor-trail {
                display: none;
            }
        }
    `;
    document.head.appendChild(styles);
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    initParallaxEffect();
    initFloatingTags();
    
    // Only add cursor trail on desktop
    if (window.innerWidth > 768) {
        initCursorTrail();
    }
    
    // Start typing animation after other elements load
    setTimeout(initTypingAnimation, 2000);
});