// Modern Portfolio with Dashboard - Enhanced JavaScript

// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeToggle();
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }
}

// Dashboard Management
class DashboardManager {
    constructor() {
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.currentStatus = localStorage.getItem('developerStatus') || 'available';
        this.messages = JSON.parse(localStorage.getItem('messages') || '[]');
        this.projects = this.getDefaultProjects();
        this.init();
    }

    init() {
        this.updateLoginState();
        this.bindEvents();
        this.updateStatusDisplay();
        this.updateStats();
        this.loadMessages();
        this.loadProjects();
        this.initializeTabs();
    }

    getDefaultProjects() {
        const stored = localStorage.getItem('projects');
        if (stored) {
            return JSON.parse(stored);
        }
        
        return [
            {
                id: 1,
                title: 'E-Commerce Platform',
                description: 'A full-stack e-commerce solution built with React, Node.js, and MongoDB. Features include user authentication, payment integration, and admin dashboard.',
                tech: 'React, Node.js, MongoDB',
                link: '#',
                code: '#'
            },
            {
                id: 2,
                title: 'Task Management App',
                description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
                tech: 'Vue.js, Firebase, CSS3',
                link: '#',
                code: '#'
            },
            {
                id: 3,
                title: 'Weather Dashboard',
                description: 'A responsive weather application with location-based forecasts, interactive charts, and beautiful animations using modern CSS techniques.',
                tech: 'JavaScript, API Integration, Chart.js',
                link: '#',
                code: '#'
            }
        ];
    }

    bindEvents() {
        // Login modal events
        const adminLoginLink = document.getElementById('adminLoginLink');
        const loginModal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        const closeButtons = document.querySelectorAll('.close');

        if (adminLoginLink) {
            adminLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isLoggedIn) {
                    this.logout();
                } else {
                    loginModal.style.display = 'block';
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });

        // Dashboard events
        const toggleStatus = document.getElementById('toggleStatus');
        if (toggleStatus) {
            toggleStatus.addEventListener('click', () => this.toggleStatus());
        }

        const clearMessages = document.getElementById('clearMessages');
        if (clearMessages) {
            clearMessages.addEventListener('click', () => this.clearMessages());
        }

        const addProject = document.getElementById('addProject');
        if (addProject) {
            addProject.addEventListener('click', () => this.showProjectModal());
        }

        // Contact form events
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }

        // Tab events
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin123') {
            this.isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            this.updateLoginState();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('loginForm').reset();
            this.showNotification('Logged in successfully!', 'success');
        } else {
            this.showNotification('Invalid credentials. Try admin/admin123', 'error');
        }
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.setItem('isLoggedIn', 'false');
        this.updateLoginState();
        this.showNotification('Logged out successfully!', 'success');
    }

    updateLoginState() {
        const adminLink = document.getElementById('adminLink');
        const adminLoginLink = document.getElementById('adminLoginLink');
        const dashboardSection = document.getElementById('dashboard');

        if (adminLink) {
            adminLink.style.display = this.isLoggedIn ? 'block' : 'none';
        }

        if (adminLoginLink) {
            adminLoginLink.textContent = this.isLoggedIn ? 'Logout' : 'Admin';
        }

        if (dashboardSection) {
            dashboardSection.style.display = this.isLoggedIn ? 'block' : 'none';
        }
    }

    toggleStatus() {
        this.currentStatus = this.currentStatus === 'available' ? 'busy' : 'available';
        localStorage.setItem('developerStatus', this.currentStatus);
        this.updateStatusDisplay();
        this.showNotification(`Status changed to ${this.currentStatus}!`, 'success');
    }

    updateStatusDisplay() {
        const statusElement = document.getElementById('currentStatus');
        if (statusElement) {
            statusElement.textContent = this.currentStatus === 'available' ? 'Available' : 'Busy';
            statusElement.className = this.currentStatus === 'available' ? 'status-available' : 'status-busy';
        }
    }

    handleContactForm() {
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });

        // Validate form
        let isValid = true;

        if (!formData.name || formData.name.length < 2) {
            document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.subject) {
            document.getElementById('subjectError').textContent = 'Subject is required';
            isValid = false;
        }

        if (!formData.message || formData.message.length < 10) {
            document.getElementById('messageError').textContent = 'Message must be at least 10 characters';
            isValid = false;
        }

        if (isValid) {
            // Add message to storage
            this.messages.unshift({
                id: Date.now(),
                ...formData
            });
            localStorage.setItem('messages', JSON.stringify(this.messages));

            // Show success message
            this.showNotification('Message sent successfully!', 'success');
            document.getElementById('contactForm').reset();
            
            // Update message count if dashboard is visible
            this.updateStats();
            this.loadMessages();
        }
    }

    clearMessages() {
        if (confirm('Are you sure you want to clear all messages?')) {
            this.messages = [];
            localStorage.setItem('messages', JSON.stringify(this.messages));
            this.loadMessages();
            this.updateStats();
            this.showNotification('All messages cleared!', 'success');
        }
    }

    loadMessages() {
        const messagesList = document.getElementById('messagesList');
        if (!messagesList) return;

        if (this.messages.length === 0) {
            messagesList.innerHTML = '<p class="no-messages">No messages yet.</p>';
            return;
        }

        messagesList.innerHTML = this.messages.map(message => `
            <div class="message-item">
                <h4>${this.escapeHtml(message.name)}</h4>
                <div class="message-meta">
                    ${this.escapeHtml(message.email)} • ${new Date(message.timestamp).toLocaleDateString()}
                </div>
                <div class="message-content">
                    <strong>Subject:</strong> ${this.escapeHtml(message.subject)}<br>
                    <strong>Message:</strong> ${this.escapeHtml(message.message)}
                </div>
            </div>
        `).join('');
    }

    showProjectModal(project = null) {
        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const form = document.getElementById('projectForm');

        if (project) {
            title.textContent = 'Edit Project';
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectTech').value = project.tech;
            document.getElementById('projectLink').value = project.link;
            document.getElementById('projectCode').value = project.code;
            form.dataset.projectId = project.id;
        } else {
            title.textContent = 'Add Project';
            form.reset();
            delete form.dataset.projectId;
        }

        modal.style.display = 'block';
    }

    saveProject() {
        const form = document.getElementById('projectForm');
        const formData = new FormData(form);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            tech: formData.get('tech'),
            link: formData.get('link') || '#',
            code: formData.get('code') || '#'
        };

        if (form.dataset.projectId) {
            // Edit existing project
            const index = this.projects.findIndex(p => p.id == form.dataset.projectId);
            if (index !== -1) {
                this.projects[index] = { ...this.projects[index], ...projectData };
                this.showNotification('Project updated successfully!', 'success');
            }
        } else {
            // Add new project
            projectData.id = Date.now();
            this.projects.push(projectData);
            this.showNotification('Project added successfully!', 'success');
        }

        localStorage.setItem('projects', JSON.stringify(this.projects));
        this.loadProjects();
        this.updateProjectsInMainSection();
        this.updateStats();
        document.getElementById('projectModal').style.display = 'none';
    }

    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects = this.projects.filter(p => p.id !== id);
            localStorage.setItem('projects', JSON.stringify(this.projects));
            this.loadProjects();
            this.updateProjectsInMainSection();
            this.updateStats();
            this.showNotification('Project deleted successfully!', 'success');
        }
    }

    loadProjects() {
        const projectsList = document.getElementById('projectsList');
        if (!projectsList) return;

        projectsList.innerHTML = this.projects.map(project => `
            <div class="project-management-item">
                <div class="project-info">
                    <h4>${this.escapeHtml(project.title)}</h4>
                    <p>${this.escapeHtml(project.description.substring(0, 100))}...</p>
                </div>
                <div class="project-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.showProjectModal(${JSON.stringify(project).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteProject(${project.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateProjectsInMainSection() {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) return;

        projectsGrid.innerHTML = this.projects.map(project => `
            <div class="project-card show">
                <div class="project-image">
                    <div class="project-overlay">
                        <a href="${project.link}" class="project-link">View Project</a>
                        <a href="${project.code}" class="project-code">View Code</a>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${this.escapeHtml(project.title)}</h3>
                    <p>${this.escapeHtml(project.description)}</p>
                    <div class="project-tech">
                        ${project.tech.split(',').map(tech => `<span class="tech-tag">${tech.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const messageCount = document.getElementById('messageCount');
        const projectCount = document.getElementById('projectCount');

        if (messageCount) {
            messageCount.textContent = this.messages.length;
        }

        if (projectCount) {
            projectCount.textContent = this.projects.length;
        }
    }

    initializeTabs() {
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProject();
            });
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                }
                .notification-success { background: #48bb78; }
                .notification-error { background: #e53e3e; }
                .notification-info { background: #667eea; }
                .notification.show { transform: translateX(0); }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 10px;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Handle close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Animation and Scroll Management
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.initProjectAnimations();
        this.initSkillAnimations();
        this.initSmoothScrolling();
        this.initNavigationHighlight();
    }

    initProjectAnimations() {
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
    }

    initSkillAnimations() {
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
    }

    initSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement && targetId !== '#dashboard') {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else if (targetId === '#dashboard') {
                    // Special handling for dashboard
                    const dashboardSection = document.getElementById('dashboard');
                    if (dashboardSection && dashboardSection.style.display !== 'none') {
                        dashboardSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    initNavigationHighlight() {
        const sections = document.querySelectorAll('.section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.getAttribute('id');
                        
                        // Remove active class from all nav links
                        navLinks.forEach(link => link.classList.remove('active'));
                        
                        // Add active class to current section link
                        const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        sections.forEach((section) => observer.observe(section));
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme management
    window.themeManager = new ThemeManager();
    
    // Initialize dashboard
    window.dashboard = new DashboardManager();
    
    // Initialize animations
    window.animationManager = new AnimationManager();
    
    console.log('Portfolio loaded successfully! 🚀');
});

// Utility function for throttling (kept for compatibility)
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