// ===== CARREGADOR INTELIGENTE DE SCRIPTS =====

class PageLoader {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.loadedScripts = new Set();
        console.log('📦 Página atual:', this.currentPage);
        console.log('📦 URL completa:', window.location.href);
    }

    getCurrentPage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path;
    }

    async loadScript(src) {
        if (this.loadedScripts.has(src)) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`✅ Carregado: ${src}`);
                this.loadedScripts.add(src);
                resolve();
            };
            script.onerror = (error) => {
                console.error(`❌ Erro ao carregar ${src}:`, error);
                reject(error);
            };
            document.body.appendChild(script);
        });
    }

    getRequiredScripts() {
        const page = this.currentPage;
        const scripts = [];

        scripts.push('js/core/helpers.js');

        if (page === 'index.html') {
            console.log('📄 Index detectado - carregando drawer-simple.js');
            scripts.push('js/components/drawer-simple.js');
        }
        else if (page === 'login.html') {
            scripts.push('js/core/api.js');
            scripts.push('js/core/auth.js');
        }
        else if (page === 'dashboard.html') {
            scripts.push('js/core/api.js');
            scripts.push('js/core/auth.js');
            scripts.push('js/components/drawer-full.js');
            scripts.push('js/components/notifications.js');
            scripts.push('js/pages/dashboard.js');
        }
        else if (page === 'project.html') {
            scripts.push('js/core/api.js');
            scripts.push('js/core/auth.js');
            scripts.push('js/components/drawer-full.js');
            scripts.push('js/components/notifications.js');
            scripts.push('js/pages/project.js');
        }
        else if (page === 'superadmin.html') {
            console.log('👑 Super Admin detectado - carregando módulos especiais');
            scripts.push('js/core/api.js');
            scripts.push('js/core/auth.js');
            scripts.push('js/components/drawer-full.js');
            scripts.push('js/components/notifications.js');
            scripts.push('js/pages/superadmin.js');
        }

        return scripts;
    }

    async loadPageScripts() {
        const scripts = this.getRequiredScripts();
        console.log('📦 Carregando scripts:', scripts);

        for (const src of scripts) {
            try {
                await this.loadScript(src);
            } catch (error) {
                console.error(`❌ Falha ao carregar ${src}`);
            }
        }

        console.log('🎉 Todos os scripts carregados!');

        setTimeout(() => {
            this.initializeSystems();
        }, 100);
    }

    async initializeSystems() {
        console.log('🚀 Inicializando sistemas...');

        const pagesWithNotifications = ['dashboard.html', 'project.html', 'superadmin.html'];

        if (pagesWithNotifications.includes(this.currentPage)) {
            if (window.NotificationSystem && !window.notificationSystem) {
                console.log('🔔 Criando instância do NotificationSystem');
                window.notificationSystem = new NotificationSystem();
                await window.notificationSystem.init();
            } else if (window.notificationSystem) {
                console.log('🔔 NotificationSystem já existe, recarregando...');
                await window.notificationSystem.loadNotifications();
            }
        }

        if (pagesWithNotifications.includes(this.currentPage)) {
            if (window.FullDrawer && !window.fullDrawer) {
                console.log('📱 Criando instância do FullDrawer');
                window.fullDrawer = new FullDrawer();
            }
        }

        switch (this.currentPage) {
            case 'index.html':
                console.log('🏠 Index carregado - SimpleDrawer já foi iniciado');
                this.initIndexFeatures();
                break;

            case 'superadmin.html':
                console.log('👑 Super Admin - aguardando superadmin.js iniciar...');
                break;
        }

        document.dispatchEvent(new Event('page-scripts-loaded'));
    }

    initIndexFeatures() {
        const storyHeader = document.getElementById('storyHeader');
        const storyContent = document.getElementById('storyContent');
        const storyToggle = document.getElementById('storyToggle');

        if (storyHeader && storyContent && storyToggle) {
            const newStoryHeader = storyHeader.cloneNode(true);
            storyHeader.parentNode.replaceChild(newStoryHeader, storyHeader);
            
            newStoryHeader.addEventListener('click', () => {
                storyContent.classList.toggle('open');
                storyToggle.classList.toggle('open');
            });
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    if (window.simpleDrawer) {
                        window.simpleDrawer.close();
                    }
                }
            });
        });
    }
}

const pageLoader = new PageLoader();
window.pageLoader = pageLoader;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pageLoader.loadPageScripts());
} else {
    pageLoader.loadPageScripts();
}