// ===== DRAWER SIMPLES (para index) =====

class SimpleDrawer {
    constructor() {
        this.overlay = null;
        this.drawer = null;
        this.init();
    }

    init() {
        this.createDrawer();
        this.setupEventListeners();
    }

    createDrawer() {
        if (!document.querySelector('.mobile-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'mobile-overlay';
            document.body.appendChild(this.overlay);
        }

        if (!document.querySelector('.mobile-drawer')) {
            this.drawer = document.createElement('div');
            this.drawer.className = 'mobile-drawer';
            this.drawer.innerHTML = this.getDrawerHTML();
            document.body.appendChild(this.drawer);
        }

        this.closeBtn = document.getElementById('closeDrawerBtn');
    }

    getDrawerHTML() {
        return `
            <div class="drawer-header">
                <h3>TaskForge</h3>
                <button class="drawer-close" id="closeDrawerBtn">&times;</button>
            </div>
            
            <div class="drawer-content">
                <div class="drawer-section active">
                    <a href="#story" class="drawer-menu-item">
                        <i class="fas fa-history"></i> História
                    </a>
                    <a href="#features" class="drawer-menu-item">
                        <i class="fas fa-cubes"></i> Recursos
                    </a>
                    <a href="#pilares" class="drawer-menu-item">
                        <i class="fas fa-columns"></i> Pilares
                    </a>
                    <a href="#contato" class="drawer-menu-item">
                        <i class="fas fa-envelope"></i> Contato
                    </a>
                    <div class="drawer-menu-divider"></div>
                    <a href="login.html" class="drawer-menu-item">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="login.html" class="drawer-menu-item" style="color: white; background: var(--primary-blue);">
                        <i class="fas fa-user-plus"></i> Cadastro
                    </a>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        document.querySelectorAll('.drawer-menu-item').forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    }

    open() {
        if (!this.drawer || !this.overlay) return;
        this.drawer.classList.add('open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.drawer || !this.overlay) return;
        this.drawer.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

new SimpleDrawer();