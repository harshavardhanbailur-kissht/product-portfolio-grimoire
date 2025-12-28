/**
 * THE PRODUCT STRATEGIST'S GRIMOIRE
 * Interactive Book Portfolio - Main Application
 */

/**
 * Three.js Faceted Gem Loader
 * Premium 3D gem with gold metallic material and multi-axis rotation
 */
class GemLoader {
    constructor() {
        this.canvas = document.getElementById('gemCanvas');
        if (!this.canvas || typeof THREE === 'undefined') {
            console.warn('GemLoader: Canvas or Three.js not available');
            this.isActive = false;
            return;
        }

        this.isActive = true;
        this.animationId = null;
        this.isReady = false;

        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        // Small delay to let CSS fully apply before rendering
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.init();
                this.isReady = true;
            });
        });
    }

    /**
     * Create environment map for realistic metallic reflections
     * Uses PMREMGenerator with a custom scene containing warm-toned lights
     */
    createEnvironment() {
        // Create a simple environment scene for gold reflections
        const envScene = new THREE.Scene();

        // Warm gradient background for gold-friendly reflections
        envScene.background = new THREE.Color(0x1a1510);

        // Create light spheres that will reflect on the gold surface
        const sphereGeometry = new THREE.SphereGeometry(50, 16, 16);

        // Warm white sphere (main highlight)
        const warmWhiteMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFAF0,
            side: THREE.BackSide
        });
        const warmSphere = new THREE.Mesh(sphereGeometry, warmWhiteMaterial);
        warmSphere.position.set(100, 100, 50);
        envScene.add(warmSphere);

        // Gold accent sphere
        const goldMaterial = new THREE.MeshBasicMaterial({
            color: 0xDAA520,
            side: THREE.BackSide
        });
        const goldSphere = new THREE.Mesh(sphereGeometry, goldMaterial);
        goldSphere.position.set(-80, -50, 80);
        envScene.add(goldSphere);

        // Subtle orange for warmth
        const orangeMaterial = new THREE.MeshBasicMaterial({
            color: 0xCD853F,
            side: THREE.BackSide
        });
        const orangeSphere = new THREE.Mesh(sphereGeometry, orangeMaterial);
        orangeSphere.position.set(0, -100, -50);
        envScene.add(orangeSphere);

        // Generate PMREM environment map
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
        this.envMap = envMap;
        this.scene.environment = envMap;

        // Clean up
        pmremGenerator.dispose();
        envScene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // Transparent background
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Camera position
        this.camera.position.z = 5;

        // Create environment map for realistic metallic reflections
        this.createEnvironment();

        // Create gem geometry (Icosahedron for 20 faceted faces - premium gem look)
        const geometry = new THREE.IcosahedronGeometry(1.2, 0); // 0 = low poly faceted

        // Premium glossy gold - matched to portfolio's --gold-primary
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xd4af37,           // Portfolio gold (--gold-primary)
            metalness: 1.0,            // Fully metallic
            roughness: 0.12,           // Very smooth for glossy look
            flatShading: true,         // Shows facets clearly
            clearcoat: 0.4,            // Glossy clearcoat layer
            clearcoatRoughness: 0.08,  // Smooth clearcoat
            reflectivity: 1.0,         // Maximum reflectivity
            envMapIntensity: 1.8,      // Strong environment reflections
            emissive: 0x3d2a05,        // Warm gold emissive for magical glow
            emissiveIntensity: 0.15    // Base emissive (will pulse in animate)
        });

        this.gem = new THREE.Mesh(geometry, material);
        this.gemMaterial = material;  // Store reference for animate()
        this.scene.add(this.gem);

        // Add wireframe overlay for mystical/arcane effect
        const wireframe = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({
                color: 0xd4af37,
                transparent: true,
                opacity: 0.35
            })
        );
        this.gem.add(wireframe);

        // Lighting optimized for gold reflections
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Key light - warm white for gold highlights
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
        keyLight.position.set(5, 5, 5);
        this.scene.add(keyLight);

        // Fill light - warm gold tone
        const fillLight = new THREE.DirectionalLight(0xFFE4B5, 1.0);
        fillLight.position.set(-5, 0, 5);
        this.scene.add(fillLight);

        // Rim light - adds edge definition
        const rimLight = new THREE.DirectionalLight(0xFFF8DC, 0.8);
        rimLight.position.set(0, -5, -5);
        this.scene.add(rimLight);

        // Purple accent light - matches portfolio's --purple-glow
        const purpleLight = new THREE.PointLight(0x7b68ee, 0.6);
        purpleLight.position.set(-3, -3, 2);
        this.scene.add(purpleLight);

        // Apply environment map to the gem
        if (this.envMap) {
            material.envMap = this.envMap;
        }

        // Handle window resize
        this.handleResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', this.handleResize);

        // Start animation
        this.animate();
    }

    animate() {
        if (!this.isActive) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        // Multi-axis rotation (smooth and elegant)
        this.gem.rotation.x += 0.005;
        this.gem.rotation.y += 0.01;
        this.gem.rotation.z += 0.003;

        // Subtle scale pulse (breathing effect)
        const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05;
        this.gem.scale.set(scale, scale, scale);

        // Emissive pulse for magical artifact glow
        if (this.gemMaterial) {
            const emissiveIntensity = 0.15 + Math.sin(Date.now() * 0.003) * 0.1;
            this.gemMaterial.emissiveIntensity = emissiveIntensity;
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Shatter effect - gem explodes into particles
     */
    shatter(callback) {
        if (!this.isActive) {
            callback();
            return;
        }

        // Wait for gem to be ready before shattering
        if (!this.isReady || !this.gem) {
            setTimeout(() => this.shatter(callback), 100);
            return;
        }

        // Cancel normal animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Create shatter particles from gem vertices
        this.createShatterParticles();

        const duration = 800;
        const start = Date.now();

        const animateShatter = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            // Eased progress for smooth feel
            const eased = 1 - Math.pow(1 - progress, 3);

            // Main gem shrinks and spins fast
            const scale = Math.max(0, 1 - eased * 1.5);
            this.gem.scale.set(scale, scale, scale);
            this.gem.rotation.y += 0.2;
            this.gem.rotation.x += 0.1;

            // Animate particles flying outward
            if (this.particles) {
                this.particles.forEach((particle) => {
                    const particleProgress = Math.min(elapsed / 600, 1);
                    const particleEased = 1 - Math.pow(1 - particleProgress, 2);

                    // Fly outward
                    particle.position.x = particle.userData.direction.x * particleEased * 4;
                    particle.position.y = particle.userData.direction.y * particleEased * 4;
                    particle.position.z = particle.userData.direction.z * particleEased * 4;

                    // Shrink and spin
                    const pScale = Math.max(0, 1 - particleProgress);
                    particle.scale.set(pScale, pScale, pScale);
                    particle.rotation.x += 0.1;
                    particle.rotation.y += 0.15;
                });
            }

            this.renderer.render(this.scene, this.camera);

            if (progress < 1) {
                requestAnimationFrame(animateShatter);
            } else {
                // Done - trigger callback
                callback();
            }
        };

        animateShatter();
    }

    /**
     * Create particle meshes for shatter effect
     */
    createShatterParticles() {
        this.particles = [];
        const particleCount = 20;
        const particleGeometry = new THREE.TetrahedronGeometry(0.15, 0);
        const particleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xd4af37,            // Match portfolio gold
            metalness: 1.0,
            roughness: 0.12,
            flatShading: true,
            clearcoat: 0.4,
            envMap: this.envMap,
            envMapIntensity: 1.8,
            emissive: 0x3d2a05,
            emissiveIntensity: 0.2
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            // Random direction for explosion
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            particle.userData.direction = {
                x: Math.sin(phi) * Math.cos(theta),
                y: Math.sin(phi) * Math.sin(theta),
                z: Math.cos(phi)
            };

            // Start at gem center
            particle.position.set(0, 0, 0);

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    dispose() {
        this.isActive = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this.handleResize);

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.gem && this.gem.geometry) {
            this.gem.geometry.dispose();
        }

        if (this.gem && this.gem.material) {
            this.gem.material.dispose();
        }
    }
}

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
        this.createParticles(); // Gold floating particles
        this.addGoldCorners(); // Gold corner decorations on all pages

        // Check for reduced motion preference (accessibility)
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Initialize Three.js Gem Loader (only if motion is allowed)
        if (!this.prefersReducedMotion) {
            this.gemLoader = new GemLoader();
        }

        // UI/UX: Progress indicator elements
        const progressFill = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');

        // UI/UX: Animate progress with Goal-Gradient Effect (starts at 20%)
        // Research shows users feel closer to completion when starting higher
        const updateProgress = (percent, text) => {
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (loadingText) loadingText.textContent = text;
        };

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

        // UI/UX: Staggered progress updates for system status visibility
        setTimeout(() => updateProgress(35, 'Loading fonts'), 500);
        setTimeout(() => updateProgress(55, 'Loading styles'), 1200);
        setTimeout(() => updateProgress(75, 'Preparing content'), 2200);
        setTimeout(() => updateProgress(90, 'Almost ready'), 3200);

        // Ensure loader shows for at least 4 seconds for smooth, glitch-free UX
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 4000));

        Promise.all([fontsReady, cssReady, minLoadTime]).then(() => {
            updateProgress(100, 'Welcome');

            // For reduced motion: skip 3D animation, just fade out
            if (this.prefersReducedMotion) {
                const skeleton = document.getElementById('pageSkeleton');
                if (skeleton) skeleton.classList.add('fade-out');
                setTimeout(() => {
                    document.body.classList.add('loaded');
                    setTimeout(() => this.revealPageContent(0), 400);
                }, 400);
                return;
            }

            // Double requestAnimationFrame ensures browser has fully painted
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Trigger gem shatter animation (Three.js)
                    this.gemLoader.shatter(() => {
                        // Start fade-out transition on loader (skeleton starts fading)
                        const skeleton = document.getElementById('pageSkeleton');
                        if (skeleton) {
                            skeleton.classList.add('fade-out');
                        }

                        // Wait for shatter particles to fade, then reveal content
                        setTimeout(() => {
                            // Clean up Three.js resources
                            this.gemLoader.dispose();

                            // Trigger crossfade: content fades in while skeleton continues fading
                            document.body.classList.add('loaded');

                            // Reveal page content after CSS animations have started
                            setTimeout(() => this.revealPageContent(0), 300);
                        }, 200);
                    });
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
            document.body.classList.remove('animations-disabled');
            if (this.animToggle) this.animToggle.classList.add('active');
        } else {
            document.body.classList.add('animations-disabled');
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

        // Add flipping class FIRST (high z-index during animation)
        currentPageEl.classList.add('flipping');
        // Add flipped to trigger the rotation
        currentPageEl.classList.add('flipped');
        this.createDustParticles(currentPageEl);

        const delay = this.animationsEnabled ? 800 : 0;

        setTimeout(() => {
            // Remove flipping class after animation (z-index drops to 1 via .flipped)
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

        // Add unflipping class FIRST (high z-index during animation)
        prevPageEl.classList.add('unflipping');
        // Remove flipped to trigger the reverse rotation
        prevPageEl.classList.remove('flipped');
        this.createDustParticles(prevPageEl);

        const delay = this.animationsEnabled ? 800 : 0;

        setTimeout(() => {
            // Remove unflipping class after animation
            prevPageEl.classList.remove('unflipping');

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

        // Update book progress indicator (Goal-Gradient Effect)
        this.updateBookProgress();

        // Announce page change for screen readers (Accessibility)
        this.announcePageChange();

        // Check for journey completion (Peak-End Effect)
        this.checkCompletion();
    }

    // Book progress bar - shows reading progress
    updateBookProgress() {
        const progressBar = document.getElementById('bookProgress');
        if (progressBar) {
            // Calculate progress (0-100%)
            const progress = ((this.currentPage + 1) / this.totalPages) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // ARIA live region announcement for accessibility
    announcePageChange() {
        const announcer = document.getElementById('pageAnnouncer');
        if (announcer) {
            const pageName = this.pageNames[this.currentPage] || `Page ${this.currentPage + 1}`;
            announcer.textContent = `Now viewing: ${pageName}`;
        }
    }

    // Peak-End Effect - celebration when user reaches the last page
    checkCompletion() {
        const badge = document.getElementById('completionBadge');
        if (badge && this.currentPage === this.totalPages - 1) {
            // Only show once per session
            if (!this.celebrationShown) {
                this.celebrationShown = true;
                // Small delay for dramatic effect
                setTimeout(() => {
                    badge.classList.add('revealed');
                    // Create celebration particles
                    this.createCelebrationParticles();
                }, 500);
            }
        }
    }

    // Gold particle burst for celebration
    createCelebrationParticles() {
        if (!this.animationsEnabled) return;

        const container = this.particlesContainer;
        if (!container) return;

        // Create burst of gold particles from center
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle celebration-particle';

            // Random angle and distance for burst effect
            const angle = (Math.PI * 2 * i) / 30;
            const distance = 100 + Math.random() * 200;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            // Start from center
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.opacity = '1';
            particle.style.transform = 'translate(-50%, -50%)';
            particle.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

            container.appendChild(particle);

            // Animate outward
            requestAnimationFrame(() => {
                particle.style.transform = `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px))`;
                particle.style.opacity = '0';
            });

            // Remove after animation
            setTimeout(() => particle.remove(), 1500);
        }
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

    // ===================================
    // GOLD PARTICLES
    // ===================================

    createParticles() {
        if (!this.particlesContainer) return;

        // Increased particle count for mystical experience
        const particleCount = 60;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Spread particles across the screen
            particle.style.left = `${Math.random() * 100}%`;

            // Longer, varied animation delays for continuous effect
            particle.style.animationDelay = `${Math.random() * 15}s`;

            // Longer durations (12-22s) for slower, more mystical movement
            particle.style.animationDuration = `${12 + Math.random() * 10}s`;

            // Varied sizes (2-6px) for depth perception
            const size = 2 + Math.random() * 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            // Brighter particles are larger
            if (size > 4) {
                particle.style.boxShadow = `
                    0 0 ${size * 2}px var(--gold-primary),
                    0 0 ${size * 4}px rgba(212, 175, 55, 0.6),
                    0 0 ${size * 6}px rgba(212, 175, 55, 0.3)
                `;
            }

            this.particlesContainer.appendChild(particle);
        }
    }

    createDustParticles(pageEl) {
        if (!this.animationsEnabled) return;

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
    // GOLD CORNER DECORATIONS
    // ===================================

    addGoldCorners() {
        // Add gold corners and frame to each page
        this.pages.forEach(page => {
            // Add gold frame border
            const frame = document.createElement('div');
            frame.className = 'page-gold-frame';
            page.appendChild(frame);

            // Add 4 gold corners
            const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            corners.forEach(position => {
                const corner = document.createElement('div');
                corner.className = `gold-corner ${position}`;
                page.appendChild(corner);
            });
        });
    }
}

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
