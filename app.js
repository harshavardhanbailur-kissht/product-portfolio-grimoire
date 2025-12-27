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
        // this.reinitializeDOMElements(); // Disabled: Preserving static HTML structure
        this.bindEvents();
        this.restoreAnimationPreference();
        this.updateNavigation();
        this.initRevealAnimations();
        this.initModals();
        this.initFeedback();

        // Wait for BOTH fonts AND stylesheet to load before revealing
        // This prevents the flash caused by CSS not being applied yet
        const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
        const cssReady = new Promise(resolve => {
            const stylesheet = document.querySelector('link[href*="styles.css"]');
            if (!stylesheet) return resolve();
            if (stylesheet.sheet) return resolve(); // Already loaded
            stylesheet.onload = resolve;
            stylesheet.onerror = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
        });

        Promise.all([fontsReady, cssReady]).then(() => {
            // Double RAF pattern for stable initial render
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Mark body as loaded - triggers skeleton hide + cover reveal
                    document.body.classList.add('loaded');

                    // Reveal cover page content AFTER skeleton has faded
                    setTimeout(() => {
                        this.revealPageContent(0);
                    }, 450);
                });
            });
        });
    }

    initFeedback() {
        const orb = document.getElementById('feedbackOrb');
        const modal = document.getElementById('feedbackModal');
        const closeBtn = document.getElementById('closeFeedback');
        const sendBtn = document.getElementById('sendFeedback');

        if (orb && modal) {
            orb.addEventListener('click', () => {
                modal.classList.add('open');
            });

            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                }
            });

            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    this.sendFeedback();
                });
            }
        }
    }

    sendFeedback() {
        const type = document.getElementById('feedbackType').value;
        const msg = document.getElementById('feedbackMsg').value;

        if (!msg.trim()) {
            alert("Please enter a message before sending.");
            return;
        }

        const subject = `Portfolio Feedback: ${type}`;
        const body = `Category: ${type}\n\nMessage:\n${msg}`;
        const mailtoLink = `mailto:harshavardhanbailur@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;

        // Close modal after sending
        document.getElementById('feedbackModal').classList.remove('open');
        document.getElementById('feedbackMsg').value = '';
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
        // Completely disabled scroll-based page navigation as per user request.
        // We now rely solely on explicit navigation buttons.

        // We still need to allow native scrolling for content
        const scrollableContent = e.target.closest('.page-content');
        if (scrollableContent) {
            // Let the browser handle the scrolling naturally
            return;
        }

        // If not in a scrollable area, we ignore the wheel event to prevent 
        // unwanted browser behaviors if any, but we DO NOT flip pages.
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
        } else {
            document.body.classList.add('no-animations');
            if (this.animToggle) this.animToggle.classList.remove('active');
        }
    }

    restoreAnimationPreference() {
        const saved = localStorage.getItem('portfolio_animations');
        if (saved !== null) {
            this.animationsEnabled = saved === 'true';
        }
        // Always apply the state on load to ensure UI is in sync
        this.applyAnimationState();
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
        currentPageEl.classList.add('flipped');

        const delay = this.animationsEnabled ? 800 : 0;

        setTimeout(() => {
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

        const delay = this.animationsEnabled ? 800 : 0;

        setTimeout(() => {
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
        // Set up Intersection Observer for reveal animations on non-cover pages
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

        // Only observe reveal items on pages other than cover (page 0)
        // Cover page is handled manually in init()
        document.querySelectorAll('.page:not([data-page="0"]) .reveal-item').forEach(item => {
            this.revealObserver.observe(item);
        });
    }

    revealPageContent(pageIndex) {
        const page = this.pages[pageIndex];
        if (!page) return;

        const revealItems = page.querySelectorAll('.reveal-item');

        // Reset and re-trigger reveal animations with proper sequencing
        revealItems.forEach((item) => {
            item.classList.remove('revealed');
        });

        // Force reflow to ensure CSS transitions reset
        void page.offsetHeight;

        // Now add the revealed class with staggered timing
        revealItems.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('revealed');
            }, 50 + (i * 100));
        });
    }

    // Particle effects removed for stability - using static visual hierarchy instead

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

// Dust particle animations removed for stability

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the book portfolio
    window.bookPortfolio = new BookPortfolio();

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

// Preload indicator - fires after all resources loaded
window.addEventListener('load', () => {
    // Hide any loading indicators
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
});
