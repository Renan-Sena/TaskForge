// ===== SISTEMA DE NOTIFICAÇÕES =====

class NotificationSystem {
    constructor() {
        this.notifications = [];
        // Não chamar init aqui - vamos esperar o page-loader
    }

    async init() {
        console.log('🔔 Inicializando sistema de notificações');
        this.setupEventListeners();
        await this.loadNotifications();
    }

    setupEventListeners() {
        // Notificações dropdown
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsDropdown = document.getElementById('notificationsDropdown');

        if (notificationsBtn && notificationsDropdown) {
            // Remover listeners antigos
            const newBtn = notificationsBtn.cloneNode(true);
            notificationsBtn.parentNode.replaceChild(newBtn, notificationsBtn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔔 Abrindo notificações');
                notificationsDropdown.classList.toggle('show');
            });

            window.notificationsBtn = newBtn;
        }

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationsDropdown');
            const btn = document.getElementById('notificationsBtn');

            if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Marcar todas como lidas
        document.getElementById('markAllRead')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.markAllAsRead();
        });
    }

    async loadNotifications() {
        // Verificar se api está disponível
        if (!window.api) {
            console.log('⏳ API não disponível, aguardando...');
            setTimeout(() => this.loadNotifications(), 500);
            return;
        }

        try {
            console.log('🔔 Carregando notificações da API...');
            const data = await window.api.get('/notifications');
            console.log('📦 Notificações recebidas:', data);

            if (!data || data.length === 0) {
                console.log('📭 Nenhuma notificação, usando exemplos');
                this.notifications = this.getSampleNotifications();
            } else {
                this.notifications = data;
            }

            this.renderNotifications();
        } catch (error) {
            console.error('❌ Erro ao carregar notificações:', error);
            console.log('📋 Usando notificações de exemplo');
            this.notifications = this.getSampleNotifications();
            this.renderNotifications();
        }
    }

    getSampleNotifications() {
        return [
            {
                id: 1,
                type: 'task_assigned',
                title: 'Tarefa atribuída',
                message: 'Você foi atribuído à tarefa "Revisar documentação"',
                isRead: false,
                created_at: new Date(Date.now() - 300000).toISOString()
            },
            {
                id: 2,
                type: 'task_commented',
                title: 'Novo comentário',
                message: 'João comentou na tarefa "Atualizar layout"',
                isRead: false,
                created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 3,
                type: 'member_added',
                title: 'Bem-vindo ao projeto',
                message: 'Você foi adicionado ao projeto "Marketing 2026"',
                isRead: true,
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ];
    }

    renderNotifications() {
        const badge = document.querySelector('.notification-badge');
        const list = document.getElementById('notificationsList');

        if (!badge || !list) {
            console.warn('⚠️ Elementos de notificação não encontrados');
            return;
        }

        const unreadCount = this.notifications.filter(n => !n.isRead).length;

        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        if (unreadCount > 0) badge.textContent = unreadCount;

        list.innerHTML = '';

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="empty-notifications">Nenhuma notificação</div>';
            return;
        }

        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.isRead ? '' : 'unread'}`;

            let icon = 'fa-info-circle';
            if (notification.type === 'task_assigned') icon = 'fa-tasks';
            if (notification.type === 'task_commented') icon = 'fa-comment';
            if (notification.type === 'member_added') icon = 'fa-user-plus';
            if (notification.type === 'task_due_soon') icon = 'fa-clock';

            const time = window.formatDate ?
                window.formatDate(notification.created_at) :
                new Date(notification.created_at).toLocaleString('pt-BR');

            item.innerHTML = `
                <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                    <i class="fas ${icon}" style="color: var(--primary-blue); font-size: 1rem; margin-top: 0.2rem;"></i>
                    <div style="flex: 1;">
                        <div class="notification-title">${this.escapeHtml(notification.title)}</div>
                        <div class="notification-message">${this.escapeHtml(notification.message)}</div>
                        <div class="notification-time">${time}</div>
                    </div>
                    ${!notification.isRead ? '<span style="width: 8px; height: 8px; background: var(--primary-blue); border-radius: 50%; align-self: center;"></span>' : ''}
                </div>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleNotificationClick(notification);
            });

            list.appendChild(item);
        });

        // Atualizar drawer se existir
        if (window.mobileDrawer) {
            window.mobileDrawer.renderNotifications(this.notifications);
        }
    }

    handleNotificationClick(notification) {
        console.log('🔔 Notificação clicada:', notification);

        if (!notification.isRead) {
            notification.isRead = true;
            this.renderNotifications();

            // Se for notificação real (não exemplo), marcar como lida no backend
            if (notification.id > 1000 && window.api) {
                window.api.patch(`/notifications/${notification.id}/read`, {}).catch(console.error);
            }
        }

        // Fechar dropdown
        document.getElementById('notificationsDropdown')?.classList.remove('show');

        // Navegar baseado no tipo
        if (notification.type === 'task_assigned' && notification.taskId) {
            window.location.href = `project.html?taskId=${notification.taskId}`;
        } else if (notification.type === 'member_added' && notification.projectId) {
            window.location.href = `project.html?id=${notification.projectId}`;
        }
    }

    async markAllAsRead() {
        this.notifications.forEach(n => n.isRead = true);
        this.renderNotifications();

        try {
            if (window.api) {
                await window.api.post('/notifications/read-all', {});
                window.showToast?.('Todas notificações marcadas como lidas', 'success');
            }
        } catch (error) {
            console.error('❌ Erro ao marcar todas como lidas:', error);
        }
    }

    createNotification(type, title, message) {
        const newNotification = {
            id: Date.now(),
            type: type,
            title: title,
            message: message,
            isRead: false,
            created_at: new Date().toISOString()
        };

        this.notifications.unshift(newNotification);
        this.renderNotifications();
        window.showToast?.(message, type);

        return newNotification;
    }

    escapeHtml(text) {
        if (!text) return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Não inicializar automaticamente - vamos deixar o page-loader gerenciar
window.NotificationSystem = NotificationSystem;