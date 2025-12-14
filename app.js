/**
 * THE PRODUCT STRATEGIST'S GRIMOIRE
 * Interactive Book Portfolio - Main Application
 */

class BookPortfolio {
    constructor() {
        // DOM Elements
        this.book = document.getElementById('book');
        this.pages = document.querySelectorAll('.page');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageIndicator = document.getElementById('pageIndicator');
        this.animToggle = document.getElementById('animToggle');
        this.tocToggle = document.getElementById('tocToggle');
        this.tocSidebar = document.getElementById('tocSidebar');
        this.tocItems = document.querySelectorAll('.toc-item');
        this.particlesContainer = document.getElementById('particles');
        this.pageFlipSound = document.getElementById('pageFlipSound');

        // State
        this.currentPage = 0;
        this.totalPages = this.pages.length;
        this.isAnimating = false;
        this.soundEnabled = false; // Page flip sound disabled by default
        this.animationsEnabled = true;
        this.scrollDebounceTimer = null;

        // Page names for indicator
        this.pageNames = [];
        this.initPageNames();

        // Initialize
        this.init();
    }

    initPageNames() {
        this.pages.forEach((page, index) => {
            if (index === 0) {
                this.pageNames.push('Cover');
                return;
            }
            // Try to find a title in the page
            const titleEl = page.querySelector('.chapter-title');
            if (titleEl) {
                this.pageNames.push(titleEl.textContent.trim());
            } else if (page.querySelector('.about-title')) {
                this.pageNames.push('About the Author');
            } else {
                this.pageNames.push(`Chapter ${index}`);
            }
        });
    }

    init() {
        // this.renderPages(); // Disabled: Using static HTML
        this.reinitializeDOMElements();
        this.bindEvents();
        this.createParticles();
        this.restoreAnimationPreference();
        this.updateNavigation();
        this.initRevealAnimations();
        this.initModals();

        // Initial reveal for cover page
        setTimeout(() => {
            this.revealPageContent(0);
        }, 500);
    }

    // Legacy dynamic rendering methods (disabled/removed)
    /*
    renderPages() { ... }
    flattenData(nodes) { ... }
    */

    reinitializeDOMElements() {
        // Refresh TOC references
        const tocNav = document.querySelector('.toc-nav');
        tocNav.innerHTML = ''; // a fresh start

        // Regenerate TOC based on discovered pages
        this.pageNames.forEach((name, index) => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = `toc-item ${index === 0 ? 'active' : ''}`;
            link.dataset.page = index;

            let num = index;
            if (index === 0) num = '◆';
            else if (index === this.pageNames.length - 1 && name === 'About the Author') num = '∞';
            else {
                // Roman numerals for chapters
                const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                num = romans[index - 1] || index;
            }

            link.innerHTML = `<span class="toc-number">${num}</span><span class="toc-text">${name}</span>`;
            tocNav.appendChild(link);
        });

        this.tocItems = document.querySelectorAll('.toc-item');
    }

    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prevPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());

        // Page click to turn
        this.pages.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                // Ignore clicks on interactive elements
                if (e.target.closest('a, button, input, textarea, .resource-card, .artifact-card, .activity-card, .blog-link')) {
                    return;
                }

                // Don't flip if clicking on scrollable content area that has scrollable content
                // AND we are not at the bottom (scrolling down)
                const content = e.target.closest('.page-content');
                if (content && content.scrollHeight > content.clientHeight) {
                    // Allow clicking to turn ONLY if we aren't selecting text or interacting
                    // Implementation choice: require clicking specifically *outside* text or on margins?
                    // Simpler: Just don't auto-flip on scrollable pages unless at the very bottom?
                    // User complained about "buttons moving to next page". The interactive check above fixes that.
                    // Let's also ensure we don't accidentally flip when trying to scroll.
                    return;
                }

                if (index === this.currentPage && this.currentPage < this.totalPages - 1) {
                    this.nextPage();
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextPage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevPage();
            } else if (e.key === 'Escape') {
                this.closeTOC();
            }
        });

        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.book.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.book.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });

        // Table of Contents
        this.tocToggle.addEventListener('click', () => this.toggleTOC());

        this.tocItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageNum = parseInt(item.dataset.page);
                this.goToPage(pageNum);
                this.closeTOC();
            });
        });

        // Close TOC when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.tocSidebar.contains(e.target) &&
                !this.tocToggle.contains(e.target) &&
                this.tocSidebar.classList.contains('open')) {
                this.closeTOC();
            }
        });

        // Animation Toggle
        if (this.animToggle) {
            this.animToggle.addEventListener('click', () => this.toggleAnimations());
        }

        // Mouse Wheel Scroll (Debounced)
        window.addEventListener('wheel', (e) => this.handleScroll(e), { passive: false });
    }

    initModals() {
        const modalOverlay = document.getElementById('john-wick-modal');
        const openBtns = document.querySelectorAll('.read-more-btn');
        const closeBtn = document.querySelector('.close-modal-btn');

        if (!modalOverlay) return;

        // Open modal
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent page flip
                const modalId = btn.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'flex';
                }
            });
        });

        // Close functions
        const closeModal = () => {
            modalOverlay.style.display = 'none';
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close on background click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
                closeModal();
            }
        });
    }

    handleScroll(e) {
        // Don't flip if scrolling inside a scrollable area that actually has scroll room
        const scrollableContent = e.target.closest('.page-content');
        if (scrollableContent) {
            const isScrollable = scrollableContent.scrollHeight > scrollableContent.clientHeight;
            // If scrolling down and not at bottom, or scrolling up and not at top, let native scroll happen
            if (isScrollable) {
                const atBottom = Math.abs(scrollableContent.scrollHeight - scrollableContent.clientHeight - scrollableContent.scrollTop) < 2;
                const atTop = scrollableContent.scrollTop <= 0;

                if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
                    return;
                }
            }
        }

        e.preventDefault();

        if (this.scrollDebounceTimer) return;

        this.scrollDebounceTimer = setTimeout(() => {
            this.scrollDebounceTimer = null;
        }, 300); // 300ms debounce

        if (e.deltaY > 50) {
            this.nextPage();
        } else if (e.deltaY < -50) {
            this.prevPage();
        }
    }

    toggleAnimations() {
        this.animationsEnabled = !this.animationsEnabled;
        this.applyAnimationState();
        // Save preference
        localStorage.setItem('portfolio_animations', this.animationsEnabled ? 'true' : 'false');
    }

    applyAnimationState() {
        if (this.animationsEnabled) {
            document.body.classList.remove('no-animations');
            if (this.animToggle) this.animToggle.classList.add('active');
            if (this.particlesContainer) this.particlesContainer.style.display = '';
            const glow = document.querySelector('.ambient-glow');
            if (glow) glow.style.display = '';
        } else {
            document.body.classList.add('no-animations');
            if (this.animToggle) this.animToggle.classList.remove('active');
            if (this.particlesContainer) this.particlesContainer.style.display = 'none';
            const glow = document.querySelector('.ambient-glow');
            if (glow) glow.style.display = 'none';
        }
    }

    restoreAnimationPreference() {
        const saved = localStorage.getItem('portfolio_animations');
        if (saved !== null) {
            this.animationsEnabled = saved === 'true';
            this.applyAnimationState();
        }
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - next page
                this.nextPage();
            } else {
                // Swipe right - previous page
                this.prevPage();
            }
        }
    }

    nextPage() {
        if (this.isAnimating || this.currentPage >= this.totalPages - 1) return;

        this.isAnimating = true;
        this.playPageFlipSound();

        const currentPageEl = this.pages[this.currentPage];
        currentPageEl.classList.add('flipped', 'flipping');

        if (this.animationsEnabled) {
            this.createDustParticles(currentPageEl);
        }

        const delay = this.animationsEnabled ? 800 : 0;

        setTimeout(() => {
            currentPageEl.classList.remove('flipping');
            this.currentPage++;
            this.updateNavigation();
            this.updateTOC();
            this.revealPageContent(this.currentPage);
            this.isAnimating = false;
        }, delay);
    }

    prevPage() {
        if (this.isAnimating || this.currentPage <= 0) return;

        this.isAnimating = true;
        this.playPageFlipSound();

        this.currentPage--;
        const prevPageEl = this.pages[this.currentPage];
        prevPageEl.classList.remove('flipped');
        prevPageEl.classList.add('flipping');

        if (this.animationsEnabled) {
            this.createDustParticles(prevPageEl);
        }

        const delay = this.animationsEnabled ? 800 : 0;

        setTimeout(() => {
            prevPageEl.classList.remove('flipping');
            this.updateNavigation();
            this.updateTOC();
            this.revealPageContent(this.currentPage);
            this.isAnimating = false;
        }, delay);
    }

    goToPage(targetPage) {
        if (this.isAnimating || targetPage === this.currentPage) return;
        if (targetPage < 0 || targetPage >= this.totalPages) return;

        // Animate through pages
        const direction = targetPage > this.currentPage ? 'forward' : 'backward';

        if (direction === 'forward') {
            // Flip all pages between current and target forward
            for (let i = this.currentPage; i < targetPage; i++) {
                this.pages[i].classList.add('flipped');
            }
        } else {
            // Flip all pages between target and current backward
            for (let i = this.currentPage - 1; i >= targetPage; i--) {
                this.pages[i].classList.remove('flipped');
            }
        }

        this.playPageFlipSound();
        this.currentPage = targetPage;
        this.updateNavigation();
        this.updateTOC();

        setTimeout(() => {
            this.revealPageContent(this.currentPage);
        }, 400);
    }

    updateNavigation() {
        // Update button states
        this.prevBtn.disabled = this.currentPage <= 0;
        this.nextBtn.disabled = this.currentPage >= this.totalPages - 1;

        // Update page indicator
        this.pageIndicator.querySelector('.current').textContent = this.pageNames[this.currentPage] || `Page ${this.currentPage}`;
    }

    updateTOC() {
        this.tocItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentPage);
        });
    }

    toggleTOC() {
        this.tocSidebar.classList.toggle('open');
    }

    closeTOC() {
        this.tocSidebar.classList.remove('open');
    }

    // ===================================
    // ANIMATIONS
    // ===================================

    initRevealAnimations() {
        // Set up Intersection Observer for reveal animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observe all reveal items
        document.querySelectorAll('.reveal-item').forEach(item => {
            this.revealObserver.observe(item);
        });
    }

    revealPageContent(pageIndex) {
        const page = this.pages[pageIndex];
        const revealItems = page.querySelectorAll('.reveal-item');

        // Reset and re-trigger reveal animations
        revealItems.forEach((item, i) => {
            item.classList.remove('revealed');
            setTimeout(() => {
                item.classList.add('revealed');
            }, 100 + (i * 150));
        });
    }

    // ===================================
    // PARTICLE EFFECTS
    // ===================================

    createParticles() {
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.animationDuration = `${6 + Math.random() * 4}s`;
            particle.style.width = `${2 + Math.random() * 4}px`;
            particle.style.height = particle.style.width;
            particle.style.opacity = `${0.3 + Math.random() * 0.5}`;
            this.particlesContainer.appendChild(particle);
        }
    }

    createDustParticles(pageEl) {
        const dustCount = 15;
        const rect = pageEl.getBoundingClientRect();

        for (let i = 0; i < dustCount; i++) {
            const dust = document.createElement('div');
            dust.className = 'dust-particle';
            dust.style.cssText = `
                position: fixed;
                width: ${2 + Math.random() * 3}px;
                height: ${2 + Math.random() * 3}px;
                background: rgba(212, 175, 55, ${0.5 + Math.random() * 0.5});
                border-radius: 50%;
                left: ${rect.left + rect.width * 0.1}px;
                top: ${rect.top + Math.random() * rect.height}px;
                pointer-events: none;
                z-index: 1000;
                animation: dustFloat 1s ease-out forwards;
            `;

            document.body.appendChild(dust);

            // Remove after animation
            setTimeout(() => {
                dust.remove();
            }, 1000);
        }
    }

    // ===================================
    // SOUND
    // ===================================

    playPageFlipSound() {
        if (this.soundEnabled && this.pageFlipSound) {
            this.pageFlipSound.currentTime = 0;
            this.pageFlipSound.play().catch(() => {
                // Audio play failed - likely user hasn't interacted yet
            });
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
}

// Add dust particle animation
const dustStyle = document.createElement('style');
dustStyle.textContent = `
    @keyframes dustFloat {
        0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(${Math.random() > 0.5 ? '' : '-'}${30 + Math.random() * 50}px, -${30 + Math.random() * 50}px) scale(0.5);
        }
    }
`;
document.head.appendChild(dustStyle);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bookPortfolio = new BookPortfolio();

    // Add loading complete class
    document.body.classList.add('loaded');

    // Console easter egg
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║   📚 The Product Strategist's Grimoire 📚     ║
    ║                                               ║
    ║   Welcome, fellow seeker of product wisdom.   ║
    ║   May your journey through these pages        ║
    ║   illuminate the path to great products.     ║
    ║                                               ║
    ║   - Harshavardhan Bailur                      ║
    ╚═══════════════════════════════════════════════╝
    `);
});

// Preload indicator
window.addEventListener('load', () => {
    // Hide any loading indicators
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
});
