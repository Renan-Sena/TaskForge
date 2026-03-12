// ===== DRAWER COMPLETO (para dashboard/project) =====

class FullDrawer {
    constructor() {
        this.overlay = null;
        this.drawer = null;
        this.isOpen = false;
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
        this.drawerTabs = document.querySelectorAll('.drawer-tab');
        this.drawerSections = document.querySelectorAll('.drawer-section');
        this.drawerAvatar = document.getElementById('drawerAvatar');
        this.drawerUserName = document.getElementById('drawerUserName');
        this.drawerUserEmail = document.getElementById('drawerUserEmail');
        this.drawerLogoutBtn = document.getElementById('drawerLogoutBtn');
        this.notificationsContainer = document.getElementById('drawerNotifications');
    }

    getDrawerHTML() {
        return `
            <div class="drawer-header">
                <h3>TaskForge</h3>
                <button class="drawer-close" id="closeDrawerBtn">&times;</button>
            </div>
            
            <div class="drawer-tabs">
                <button class="drawer-tab active" data-tab="menu">
                    <i class="fas fa-bars"></i> Menu
                </button>
                <button class="drawer-tab" data-tab="notifications">
                    <i class="far fa-bell"></i> 
                    Notificações <span class="notification-badge" style="display: none;">0</span>
                </button>
            </div>
            
            <div class="drawer-content">
                <div class="drawer-section active" id="drawerMenu">
                    <div class="drawer-user-info">
                        <img src="" alt="Avatar" class="drawer-avatar" id="drawerAvatar">
                        <div class="drawer-user-details">
                            <div class="drawer-user-name" id="drawerUserName"></div>
                            <div class="drawer-user-email" id="drawerUserEmail"></div>
                        </div>
                    </div>
                    
                    <a href="dashboard.html" class="drawer-menu-item">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="#" class="drawer-menu-item" id="drawerProfileBtn">
                        <i class="fas fa-user"></i> Perfil
                    </a>
                    <a href="#" class="drawer-menu-item" id="drawerSettingsBtn">
                        <i class="fas fa-cog"></i> Configurações
                    </a>
                    <div class="drawer-menu-divider"></div>
                    <a href="#" class="drawer-menu-item" id="drawerLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Sair
                    </a>
                </div>
                
                <div class="drawer-section" id="drawerNotifications">
                    <div class="empty-notifications">Nenhuma notificação</div>
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

        if (this.drawerTabs) {
            this.drawerTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(tab);
                });
            });
        }

        if (this.drawerLogoutBtn) {
            this.drawerLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.auth) window.auth.logout();
            });
        }

        document.getElementById('drawerProfileBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showToast?.('Perfil em desenvolvimento', 'info');
            this.close();
        });

        document.getElementById('drawerSettingsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.showToast?.('Configurações em desenvolvimento', 'info');
            this.close();
        });
    }

    open() {
        if (!this.drawer || !this.overlay) return;
        this.drawer.classList.add('open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        this.updateUserInfo();
        this.syncNotifications();
    }

    close() {
        if (!this.drawer || !this.overlay) return;
        this.drawer.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    switchTab(tab) {
        const tabName = tab.dataset.tab;
        this.drawerTabs.forEach(t => t.classList.remove('active'));
        this.drawerSections.forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`drawer${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    }

    updateUserInfo() {
        const user = window.auth?.getUser();
        if (user && this.drawerUserName) {
            this.drawerUserName.textContent = user.name || 'Usuário';
            if (this.drawerUserEmail) this.drawerUserEmail.textContent = user.email || '';
            
            const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2563EB&color=fff&size=128`;
            if (this.drawerAvatar) {
                this.drawerAvatar.src = avatarUrl;
            }
        }
    }

    syncNotifications() {
        if (window.notificationSystem) {
            this.renderNotifications(window.notificationSystem.notifications);
        }
    }

    renderNotifications(notifications) {
        if (!this.notificationsContainer) return;
        
        const badge = document.querySelector('.drawer-tab[data-tab="notifications"] .notification-badge');
        const unreadCount = notifications.filter(n => !n.isRead).length;

        if (badge) {
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
            if (unreadCount > 0) badge.textContent = unreadCount;
        }

        if (!notifications || notifications.length === 0) {
            this.notificationsContainer.innerHTML = '<div class="empty-notifications">Nenhuma notificação</div>';
            return;
        }

        this.notificationsContainer.innerHTML = '';
        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `drawer-notification-item ${notification.isRead ? '' : 'unread'}`;

            let icon = 'fa-info-circle';
            if (notification.type === 'task_assigned') icon = 'fa-tasks';
            if (notification.type === 'task_commented') icon = 'fa-comment';
            if (notification.type === 'member_added') icon = 'fa-user-plus';

            item.innerHTML = `
                <div style="display: flex; gap: 0.75rem;">
                    <i class="fas ${icon}" style="color: var(--primary-blue);"></i>
                    <div style="flex: 1;">
                        <div class="drawer-notification-title">${notification.title || ''}</div>
                        <div class="drawer-notification-message">${notification.message || ''}</div>
                        <div class="drawer-notification-time">${window.formatDate ? window.formatDate(notification.created_at) : notification.time || 'agora'}</div>
                    </div>
                </div>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.notificationSystem) {
                    window.notificationSystem.handleNotificationClick(notification);
                }
                this.close();
            });

            this.notificationsContainer.appendChild(item);
        });
    }
}

window.fullDrawer = new FullDrawer();