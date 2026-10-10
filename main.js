// Translations are embedded by Jekyll: no network request or loading screen.
class MaranathaTextManager {
    constructor() {
        this.languages = ['de', 'en', 'ru'];
        this.websiteTexts = {};
        this.currentLanguage = 'de';
        this.isLoading = false;
        let savedLanguage;
        try { savedLanguage = localStorage.getItem('maranatha-language'); } catch (_) {}
        const requested = new URLSearchParams(location.search).get('lang') || savedLanguage;
        if (this.languages.includes(requested)) this.currentLanguage = requested;
        try {
            this.websiteTexts = JSON.parse(document.getElementById('website-translations').textContent);
        } catch (error) { console.error('Unable to read translations:', error); }
        document.querySelectorAll('button[data-lang]').forEach(button => {
            button.addEventListener('click', () => this.switchLanguage(button.dataset.lang));
        });
        this.originalContent = new Map();
        document.querySelectorAll('[data-json-key]').forEach(element => {
            this.originalContent.set(element, element.innerHTML);
        });
        this.updateAllContent();
    }

    switchLanguage(lang) {
        if (!this.languages.includes(lang)) return;
        this.currentLanguage = lang;
        try { localStorage.setItem('maranatha-language', lang); } catch (_) {}
        const url = new URL(location.href);
        url.searchParams.set('lang', lang);
        history.replaceState({}, '', url);
        this.updateAllContent();
    }

    updateAllContent() {
        document.documentElement.lang = this.currentLanguage;
        document.querySelectorAll('[data-json-key]').forEach(element => {
            const text = this.websiteTexts[element.dataset.jsonKey]?.[this.currentLanguage];
            if (!text) {
                element.innerHTML = this.originalContent.get(element);
                element.lang = 'de';
                return;
            }
            // Translation values are plain text; never insert them as executable HTML.
            element.replaceChildren();
            const paragraphs = text.replace(/\u2028/g, '\n').split('\n\n');
            const canContainParagraphs = ['DIV', 'BLOCKQUOTE', 'SECTION'].includes(element.tagName);
            paragraphs.forEach((paragraph, index) => {
                const target = canContainParagraphs ? document.createElement('p') : element;
                if (index && !canContainParagraphs) target.append(document.createElement('br'));
                paragraph.split('\n').forEach((line, lineIndex) => {
                    if (lineIndex) target.append(document.createElement('br'));
                    target.append(document.createTextNode(line));
                });
                if (canContainParagraphs) element.append(target);
            });
            element.lang = this.currentLanguage;
        });
        document.querySelectorAll('[data-localized]').forEach(group => {
            const variants = Array.from(group.children).filter(child => child.hasAttribute('data-content-lang'));
            const chosen = variants.find(child => child.dataset.contentLang === this.currentLanguage && child.textContent.trim())
                || variants.find(child => child.dataset.contentLang === 'de');
            variants.forEach(child => { child.hidden = child !== chosen; });
        });
        document.querySelectorAll('button[data-lang]').forEach(button => {
            const active = button.dataset.lang === this.currentLanguage;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        document.querySelectorAll('.navigation-bar a, .blog-back, .blog-read-more, .journal-card h2 a').forEach(link => {
            const url = new URL(link.href, location.href);
            if (url.origin !== location.origin) return;
            url.searchParams.set('lang', this.currentLanguage);
            link.href = url.href;
        });
        const gate = document.getElementById('blogGate');
        const unlocked = document.getElementById('blogUnlocked');
        const titleRoot = gate && !gate.hidden ? gate : unlocked || document.querySelector('main');
        const title = titleRoot?.querySelector('h1');
        if (title) {
            const visibleTitle = title.cloneNode(true);
            visibleTitle.querySelectorAll('[hidden]').forEach(element => element.remove());
            document.title = `${visibleTitle.textContent.trim()} | Maranatha Gemeinde`;
        }
    }

    reloadTexts() { this.updateAllContent(); }
    getDebugInfo() { return { currentLanguage: this.currentLanguage, isLoading: false, websiteTexts: this.websiteTexts }; }
}

// This script is included after page content and runs before the parser finishes.
window.maranathaTextManager = new MaranathaTextManager();
window.reloadTexts = () => window.maranathaTextManager.reloadTexts();
window.debugInfo = () => window.maranathaTextManager.getDebugInfo();

const loginDialog = document.getElementById('blogLoginDialog');
const blogGate = document.getElementById('blogGate');
if (loginDialog && blogGate) {
    const password = blogGate.dataset.password;
    const unlock = () => {
        document.getElementById('blogUnlocked').hidden = false;
        blogGate.hidden = true;
        loginDialog.close();
        window.maranathaTextManager.updateAllContent();
    };
    try {
        if (password && sessionStorage.getItem('blog-preview-password') === password) unlock();
    } catch (_) {}
    document.getElementById('blogLoginOpen').addEventListener('click', () => {
        document.getElementById('blogLoginError').hidden = true;
        loginDialog.showModal();
        document.getElementById('blogPassword').focus();
    });
    document.getElementById('blogPasswordForm').addEventListener('submit', event => {
        event.preventDefault();
        if (password && document.getElementById('blogPassword').value === password) {
            try { sessionStorage.setItem('blog-preview-password', password); } catch (_) {}
            unlock();
        } else {
            document.getElementById('blogLoginError').hidden = false;
            document.getElementById('blogPassword').select();
        }
    });
}
