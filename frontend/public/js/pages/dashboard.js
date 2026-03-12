// ===== DASHBOARD - LISTA DE PROJETOS =====

class Dashboard {
    constructor() {
        console.log('🚀 Inicializando Dashboard');
        this.projects = [];
        this.notifications = [];
        this.creatingProject = false;
        this.init();
    }

    async init() {
        console.log('📋 Dashboard.init() chamado');
        this.loadUserInfo();
        this.setupEventListeners();
        this.setupDropdowns(); // Versão única e corrigida
        await this.loadProjects();
        await this.loadNotifications();
        this.setupNotificationsPolling();
    }

    loadUserInfo() {
        console.log('👤 Carregando informações do usuário');
        const user = window.auth ? window.auth.getUser() : null;

        if (user) {
            console.log('✅ Usuário encontrado:', user);

            // Nome e email
            const userNameEl = document.getElementById('userName');
            const userEmailEl = document.getElementById('userEmail');

            if (userNameEl) userNameEl.textContent = user.name || 'Usuário';
            if (userEmailEl) userEmailEl.textContent = user.email || '';

            // Avatar
            const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2563EB&color=fff&size=128`;

            document.querySelectorAll('.user-avatar').forEach(img => {
                if (img) {
                    img.src = avatarUrl;
                    img.onerror = () => {
                        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2563EB&color=fff&size=128`;
                    };
                }
            });
        } else {
            console.warn('⚠️ Nenhum usuário encontrado');
        }
    }

    setupEventListeners() {
        console.log('🔌 Configurando event listeners');

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.auth) window.auth.logout();
        });

        // Criar projeto
        document.getElementById('createProjectBtn')?.addEventListener('click', () => {
            this.showCreateProjectModal();
        });

        // Botão salvar projeto
        document.getElementById('saveProjectBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.createProject();
        });

        // Fechar modal
        document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
    }

    // ===== CONFIGURAÇÃO DOS DROPDOWNS (VERSÃO ÚNICA E CORRIGIDA) =====
    setupDropdowns() {
        console.log('🔽 Configurando dropdowns');
        console.log('Largura da tela:', window.innerWidth);
        console.log('É desktop?', window.innerWidth > 768);

        // User menu dropdown
        const userMenu = document.getElementById('userMenu');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenu && userDropdown) {
            // Remover listeners antigos
            const newUserMenu = userMenu.cloneNode(true);
            userMenu.parentNode.replaceChild(newUserMenu, userMenu);

            newUserMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('👤 Clicou no menu do usuário');

                // Fechar notificações se estiver aberto
                document.getElementById('notificationsDropdown')?.classList.remove('show');

                // Alternar dropdown do usuário
                userDropdown.classList.toggle('show');
            });

            // Atualizar referência
            window.userMenu = newUserMenu;
        } else {
            console.warn('⚠️ userMenu ou userDropdown não encontrados');
        }

        // Notificações dropdown
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsDropdown = document.getElementById('notificationsDropdown');

        if (notificationsBtn && notificationsDropdown) {
            // Remover listeners antigos
            const newNotificationsBtn = notificationsBtn.cloneNode(true);
            notificationsBtn.parentNode.replaceChild(newNotificationsBtn, notificationsBtn);

            newNotificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('🔔 Clicou nas notificações');

                // Fechar user dropdown se estiver aberto
                document.getElementById('userDropdown')?.classList.remove('show');

                // Alternar notificações
                notificationsDropdown.classList.toggle('show');
            });

            // Atualizar referência
            window.notificationsBtn = newNotificationsBtn;
        } else {
            console.warn('⚠️ notificationsBtn ou notificationsDropdown não encontrados');
        }

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            const userDropdown = document.getElementById('userDropdown');
            const userMenu = document.getElementById('userMenu');
            const notificationsDropdown = document.getElementById('notificationsDropdown');
            const notificationsBtn = document.getElementById('notificationsBtn');

            // Fechar user dropdown se clicar fora
            if (userDropdown && userMenu && !userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }

            // Fechar notifications dropdown se clicar fora
            if (notificationsDropdown && notificationsBtn && !notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
                notificationsDropdown.classList.remove('show');
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('userDropdown')?.classList.remove('show');
                document.getElementById('notificationsDropdown')?.classList.remove('show');
            }
        });

        // Reconfigurar ao redimensionar a tela
        window.addEventListener('resize', () => {
            // Se virou mobile, fechar dropdowns
            if (window.innerWidth <= 768) {
                document.getElementById('userDropdown')?.classList.remove('show');
                document.getElementById('notificationsDropdown')?.classList.remove('show');
            }
        });
    }

    async loadProjects() {
        try {
            console.log('🔍 Carregando projetos...');
            showLoading();

            this.projects = await window.api.get('/projects');
            console.log('📊 Projetos recebidos:', this.projects);

            this.renderProjects();
        } catch (error) {
            console.error('❌ Erro ao carregar projetos:', error);
            window.showToast?.('Erro ao carregar projetos', 'error');
        } finally {
            hideLoading();
        }
    }

    renderProjects() {
        const container = document.getElementById('projectsContainer');
        const template = document.getElementById('projectCardTemplate');

        if (!container) {
            console.error('❌ Container #projectsContainer não encontrado');
            return;
        }

        console.log('🎨 Renderizando projetos...');
        container.innerHTML = '';

        if (!this.projects || this.projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>Nenhum projeto ainda</h3>
                    <p>Comece criando seu primeiro projeto e forje sua produtividade!</p>
                    <button class="btn btn-primary" onclick="window.dashboard.showCreateProjectModal()">
                        <i class="fas fa-plus"></i> Criar Projeto
                    </button>
                </div>
            `;
            return;
        }

        this.projects.forEach(project => {
            const card = template.content.cloneNode(true);

            // Ícone do projeto
            const iconEl = card.querySelector('.project-icon');
            if (iconEl) iconEl.textContent = project.name.charAt(0).toUpperCase();

            // Título e descrição
            const titleEl = card.querySelector('.project-title');
            if (titleEl) titleEl.textContent = project.name;

            const descEl = card.querySelector('.project-description');
            if (descEl) descEl.textContent = project.description || 'Sem descrição';

            // Owner
            const ownerImg = card.querySelector('.owner-avatar');
            if (ownerImg) {
                ownerImg.src = project.owner_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner_name)}&background=2563EB&color=fff`;
                ownerImg.alt = project.owner_name;
            }

            const ownerName = card.querySelector('.owner-name');
            if (ownerName) ownerName.textContent = project.owner_name;

            // Stats
            const todoSpan = card.querySelector('.stat-todo span');
            if (todoSpan) todoSpan.textContent = project.todo_count || 0;

            const doingSpan = card.querySelector('.stat-doing span');
            if (doingSpan) doingSpan.textContent = project.doing_count || 0;

            const doneSpan = card.querySelector('.stat-done span');
            if (doneSpan) doneSpan.textContent = project.done_count || 0;

            // Membros
            const membersContainer = card.querySelector('.members-avatars');
            if (membersContainer && project.members) {
                membersContainer.innerHTML = '';

                const members = project.members.slice(0, 5);
                members.forEach(member => {
                    const img = document.createElement('img');
                    img.src = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563EB&color=fff`;
                    img.alt = member.name;
                    img.title = member.name;
                    membersContainer.appendChild(img);
                });

                if (project.members.length > 5) {
                    const more = document.createElement('span');
                    more.className = 'more';
                    more.textContent = `+${project.members.length - 5}`;
                    membersContainer.appendChild(more);
                }
            }

            // Botão de delete
            const deleteBtn = card.querySelector('.btn-delete');
            if (deleteBtn) {
                const user = window.auth?.getUser();
                if (user && project.owner_name === user.name) {
                    deleteBtn.onclick = (e) => this.deleteProject(project.id, e);
                } else {
                    deleteBtn.style.display = 'none';
                }
            }

            // Click no card
            const cardEl = card.querySelector('.project-card');
            if (cardEl) {
                cardEl.addEventListener('click', (e) => {
                    if (!e.target.closest('.btn-delete')) {
                        window.location.href = `project.html?id=${project.id}`;
                    }
                });
            }

            container.appendChild(card);
        });
    }

    async deleteProject(projectId, event) {
        event.stopPropagation();

        const confirmed = await window.confirmDialog('Tem certeza que deseja deletar este projeto? Todas as tarefas serão perdidas!');
        if (!confirmed) return;

        try {
            showLoading();
            await window.api.delete(`/projects/${projectId}`);

            this.projects = this.projects.filter(p => p.id !== projectId);
            this.renderProjects();
            window.showToast?.('Projeto deletado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao deletar projeto:', error);
            window.showToast?.(error.message || 'Erro ao deletar projeto', 'error');
        } finally {
            hideLoading();
        }
    }

    showCreateProjectModal() {
        const modal = document.getElementById('createProjectModal');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('projectName')?.focus();
        }
    }

    async createProject() {
        if (this.creatingProject) return;

        const name = document.getElementById('projectName')?.value;
        const description = document.getElementById('projectDescription')?.value;
        const saveBtn = document.getElementById('saveProjectBtn');

        if (!name) {
            window.showToast?.('Nome do projeto é obrigatório', 'error');
            return;
        }

        this.creatingProject = true;
        const originalText = saveBtn?.innerHTML || 'Criar';
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        }

        try {
            showLoading();
            await window.api.post('/projects', { name, description });

            this.closeModals();
            await this.loadProjects();
            window.showToast?.('Projeto criado com sucesso!', 'success');

            document.getElementById('projectName').value = '';
            document.getElementById('projectDescription').value = '';
        } catch (error) {
            console.error('❌ Erro ao criar projeto:', error);
            window.showToast?.(error.message || 'Erro ao criar projeto', 'error');
        } finally {
            this.creatingProject = false;
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
            hideLoading();
        }
    }

    async loadNotifications() {
        try {
            const data = await window.api.get('/notifications');
            this.notifications = data || [];
            this.renderNotifications();
        } catch (error) {
            console.error('❌ Erro ao carregar notificações:', error);
            this.notifications = [];
        }
    }

    renderNotifications() {
        console.log('🔔 Renderizando notificações:', this.notifications);

        const badge = document.querySelector('.notification-badge');
        const list = document.getElementById('notificationsList');
        const dropdown = document.getElementById('notificationsDropdown');

        if (!badge || !list) {
            console.warn('⚠️ Elementos de notificação não encontrados');
            return;
        }

        // Atualizar badge
        const unreadCount = this.notifications.filter(n => !n.isRead).length;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        if (unreadCount > 0) badge.textContent = unreadCount;

        // Limpar lista
        list.innerHTML = '';

        if (!this.notifications || this.notifications.length === 0) {
            list.innerHTML = '<div class="empty-notifications">Nenhuma notificação</div>';
            return;
        }

        // Renderizar cada notificação
        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.isRead ? '' : 'unread'}`;
            item.dataset.id = notification.id;

            // Ícone baseado no tipo
            let icon = 'fa-info-circle';
            if (notification.type === 'task_assigned') icon = 'fa-tasks';
            if (notification.type === 'task_commented') icon = 'fa-comment';
            if (notification.type === 'member_added') icon = 'fa-user-plus';

            // Formatar data
            const timeStr = notification.created_at
                ? (window.formatDate ? window.formatDate(notification.created_at) : new Date(notification.created_at).toLocaleString())
                : notification.time || '';

            item.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <i class="fas ${icon}" style="color: var(--primary-blue); font-size: 1.1rem; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <div class="notification-title">${this.escapeHtml(notification.title || 'Notificação')}</div>
                    <div class="notification-message">${this.escapeHtml(notification.message || '')}</div>
                    <div class="notification-time">${timeStr}</div>
                </div>
                ${!notification.isRead ? '<span style="width: 8px; height: 8px; background: var(--primary-blue); border-radius: 50%; margin-top: 6px;"></span>' : ''}
            </div>
        `;

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleNotificationClick(notification);
            });

            list.appendChild(item);
        });

        // Atualizar contador no drawer se existir
        if (window.mobileDrawer) {
            window.mobileDrawer.renderNotifications?.(this.notifications);
        }
    }

    // Método auxiliar para escapar HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    handleNotificationClick(notification) {
        if (!notification.isRead) {
            notification.isRead = true;
            this.renderNotifications();

            // Fechar dropdown
            document.getElementById('notificationsDropdown')?.classList.remove('show');
        }
    }

    setupNotificationsPolling() {
        setInterval(() => this.loadNotifications(), 30000);
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, aguardando scripts...');
});

// Aguardar todos os scripts carregarem
document.addEventListener('page-scripts-loaded', () => {
    console.log('✅ Todos scripts carregados, iniciando Dashboard');
    window.dashboard = new Dashboard();
});