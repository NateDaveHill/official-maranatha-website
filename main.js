// Website Text Management System
class MaranathaTextManager {
    constructor() {
        this.websiteTexts = null;
        this.currentLanguage = 'de';
        this.isLoading = true;
        this.scrollTimeout = null;

        // Get language from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const savedLanguage = localStorage.getItem('maranatha-language');
        const urlLanguage = urlParams.get('lang');

        this.currentLanguage = urlLanguage || savedLanguage || 'de';

        this.init();
    }

    async init() {
        try {
            await this.loadTexts();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Keep the German text already present in the HTML.
        }
    
        this.setupLanguageSwitching();
        this.setupAnimations();
        this.setupScrollEffects();
        this.setupImageOptimization();
        this.hideLoading();
    }


    async loadTexts() {
        try {
            console.log('Attempting to load texts from:', 'website_texts/texts.json');
            const response = await fetch('website_texts/texts.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.websiteTexts = await response.json();
            console.log('Loaded texts from JSON file');

            this.updateAllContent();

        } catch (error) {
            console.error('Failed to load JSON texts:', error);
            throw error; // Re-throw to trigger error handling
        }
    }

    updateAllContent() {
        if (!this.websiteTexts) {
            console.warn('No texts loaded yet');
            return;
        }

        const elements = document.querySelectorAll('[data-json-key]');
        console.log(`Found ${elements.length} elements to update with translations`);

        elements.forEach(element => {
            const key = element.getAttribute('data-json-key');
            if (!key) {
                console.warn('Element with data-json-key attribute but no key value:', element);
                return;
            }

            const text = this.getText(key);
            if (!text) {
                console.warn(`No text found for key: ${key}`);
                return;
            }

            // Wrap the entire content in a paragraph tag if it's not already wrapped
            const wrappedText = text.startsWith('<p>') ? text : `<p>${text}</p>`;
            element.innerHTML = wrappedText;
        });
    }


    setupLanguageSwitching() {
        const languageToggle = document.getElementById('languageToggle');
        const langOptions = document.querySelectorAll('.lang-option');

        if (!languageToggle) {
            console.warn('Language toggle element not found');
            return;
        }

        // Set initial language state
        this.updateLanguageUI();

        // Language toggle click handler
        languageToggle.addEventListener('click', (e) => {
            // Don't toggle if clicking on specific language option
            if (!e.target.classList.contains('lang-option')) {
                this.currentLanguage = this.currentLanguage === 'de' ? 'en' : 'de';
                this.switchLanguage(this.currentLanguage);
            }
        });

        // Individual language option click handlers
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = option.getAttribute('data-lang');
                if (selectedLang && selectedLang !== this.currentLanguage) {
                    this.switchLanguage(selectedLang);
                }
            });
        });
    }

    switchLanguage(lang) {
        if (!lang || !['de', 'en'].includes(lang)) {
            console.warn(`Invalid language: ${lang}`);
            return;
        }

        this.currentLanguage = lang;

        // Save to localStorage
        localStorage.setItem('maranatha-language', lang);

        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);

        // Update document language
        document.documentElement.setAttribute('lang', lang);

        // Add transition effect
        document.body.classList.add('lang-switching');

        setTimeout(() => {
            this.updateLanguageUI();
            this.updateAllContent();
            document.body.classList.remove('lang-switching');
        }, 100);
    }

    updateLanguageUI() {
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            const isActive = option.getAttribute('data-lang') === this.currentLanguage;
            option.classList.toggle('active', isActive);
        });
    }
    getText(key) {
        if (!this.websiteTexts || !this.websiteTexts[key]) {
            console.warn(`Text key "${key}" not found in JSON file`);
            return null;
        }

        const textObj = this.websiteTexts[key];
        const text = textObj[this.currentLanguage] || textObj['de'] || null;

        if (!text) return null;

        // Split by double newlines for paragraphs, then by single newlines for line breaks
        return text
            .split('\n\n')  // Split into paragraphs first
            .map(paragraph =>
                paragraph
                    .split('\n')  // Split remaining single newlines
                    .join('<br>') // Replace single newlines with <br>
            )
            .join('</p><p>');  // Wrap in paragraph tags
    }


    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all blog posts and leadership cards
        const elementsToObserve = document.querySelectorAll('.blog-post, .leadership-card');
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });

        // Store observer for potential cleanup
        this.intersectionObserver = observer;
    }

    setupScrollEffects() {
        // Header background change on scroll with debouncing
        const handleScroll = () => {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.scrollTimeout = setTimeout(() => {
                const header = document.querySelector('.header-section');
                if (!header) return;

                if (window.scrollY > 100) {
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    header.style.backdropFilter = 'blur(10px)';
                } else {
                    header.style.backgroundColor = '#fff';
                    header.style.backdropFilter = 'none';
                }
            }, 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupImageOptimization() {
        // Image loading optimization
        const images = document.querySelectorAll('.main-image');

        images.forEach(img => {
            // Set initial styles
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';

            const handleImageLoad = function() {
                this.style.opacity = '1';
            };

            img.addEventListener('load', handleImageLoad);

            // Handle already loaded images
            if (img.complete && img.naturalHeight !== 0) {
                img.style.opacity = '1';
            }
        });

        // Touch device detection
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) return;

        loadingOverlay.classList.add('hidden');

        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }

    showError() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            console.error('Loading overlay element not found');
            return;
        }

        loadingOverlay.innerHTML = `
            <div style="text-align: center; color: #ff6b6b;">
                <h3>⚠️ Fehler beim Laden</h3>
                <p>Die JSON-Datei konnte nicht geladen werden.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">
                    Bitte stellen Sie sicher, dass die Datei 'website_texts/texts.json' existiert.
                </p>
                <button onclick="location.reload()" 
                        style="margin-top: 15px; padding: 10px 20px; border: none; 
                               background: #667eea; color: white; border-radius: 5px; 
                               cursor: pointer;">
                    Erneut versuchen
                </button>
            </div>
        `;
    }

    // Helper method for formatting Impressum text
    formatImpressumText(text) {
        const strongHeaders = [
            "Haftung für Inhalte",
            "Haftung für Links",
            "Urheberrecht"
        ];

        return text
            .split('\n\n')
            .map(paragraph => {
                const html = paragraph
                    .split('\n')
                    .map(line => {
                        const trimmedLine = line.trim();
                        if (strongHeaders.includes(trimmedLine)) {
                            return `<strong>${trimmedLine}</strong>`;
                        }
                        return line;
                    })
                    .join('<br>');
                return `<p>${html}</p>`;
            })
            .join('');
    }

    // Public method to manually reload texts
    async reloadTexts() {
        this.isLoading = true;
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.classList.remove('hidden');
        }

        try {
            await this.loadTexts();
            this.hideLoading();
        } catch (error) {
            this.showError();
        }
    }

    // Cleanup method for removing event listeners and observers
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }

    // Debug information
    getDebugInfo() {
        return {
            currentLanguage: this.currentLanguage,
            websiteTexts: this.websiteTexts,
            isLoading: this.isLoading,
            availableMethods: ['reloadTexts()', 'switchLanguage(lang)', 'getDebugInfo()']
        };
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the text management system
    window.maranathaTextManager = new MaranathaTextManager();

    // Make reload function available globally for debugging
    window.reloadTexts = () => {
        window.maranathaTextManager.reloadTexts();
    };

    // Expose debug function
    window.debugInfo = () => {
        const info = window.maranathaTextManager.getDebugInfo();
        console.log('Current Language:', info.currentLanguage);
        console.log('Loaded Texts:', info.websiteTexts);
        console.log('Available functions:', info.availableMethods.join(', '));
        return info;
    };
});