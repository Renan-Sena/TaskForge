// ===== PÁGINA DO PROJETO - KANBAN BOARD =====

class ProjectPage {
    constructor() {
        console.log('🔧 CONSTRUTOR ProjectPage CHAMADO');

        this.projectId = new URLSearchParams(window.location.search).get('id');
        console.log('📌 projectId:', this.projectId);

        this.project = null;
        this.tasks = [];
        this.members = [];
        this.draggedTask = null;

        // FLAGS DE CONTROLE
        this.savingTask = false;
        this.openingModal = false;
        this.loadingProject = false;
        this.invitingMember = false;
        this.retryCount = 0;

        if (!this.projectId) {
            console.error('❌ Nenhum projectId encontrado!');
            window.showToast?.('ID do projeto não encontrado', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            return;
        }

        // Iniciar imediatamente
        this.init();
    }

    async init() {
        console.log('🚀 ProjectPage.init() chamado');

        try {
            this.loadUserInfo();
            this.setupEventListeners();
            this.setupDropdowns(); // AGORA IMPLEMENTADO
            this.setupDragAndDrop();
            await this.loadProject();
            console.log('✅ ProjectPage inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    loadUserInfo() {
        console.log('👤 loadUserInfo()');
        const user = window.auth?.getUser();

        if (user) {
            document.getElementById('userName').textContent = user.name || 'Usuário';
            document.getElementById('userEmail').textContent = user.email || '';

            const avatarEl = document.getElementById('userAvatar');
            if (avatarEl) {
                avatarEl.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`;
            }
        }
    }

    setupEventListeners() {
        console.log('🔌 setupEventListeners()');

        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });

        document.getElementById('addTaskBtn')?.addEventListener('click', () => {
            this.showTaskModal();
        });

        document.getElementById('inviteMemberBtn')?.addEventListener('click', () => {
            this.showInviteModal();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.auth?.logout();
        });
    }

    // ===== DROPDOWNS CORRIGIDOS =====
    setupDropdowns() {
        console.log('🔽 Configurando dropdowns no projeto');

        // IMPORTANTE: Usar setTimeout para garantir que o DOM esteja pronto
        setTimeout(() => {
            this._setupUserDropdown();
            this._setupNotificationsDropdown();
            this._setupClickOutside();
        }, 100);
    }

    _setupUserDropdown() {
        const userWrapper = document.querySelector('.user-wrapper');
        const userMenu = document.getElementById('userMenu');
        const userDropdown = document.getElementById('userDropdown');

        if (userWrapper && userMenu && userDropdown) {
            console.log('✅ Configurando dropdown do usuário');

            // Remover listeners antigos clonando
            const newUserMenu = userMenu.cloneNode(true);
            userMenu.parentNode.replaceChild(newUserMenu, userMenu);

            newUserMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('👤 Dropdown do usuário clicado');

                // Fechar o outro dropdown
                document.getElementById('notificationsDropdown')?.classList.remove('show');

                // Alternar este dropdown
                userDropdown.classList.toggle('show');
            });

            // Atualizar referência
            window.userMenu = newUserMenu;
        } else {
            console.warn('⚠️ Elementos do usuário não encontrados');
        }
    }

    _setupNotificationsDropdown() {
        const notificationsWrapper = document.querySelector('.notifications-wrapper');
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsDropdown = document.getElementById('notificationsDropdown');

        if (notificationsWrapper && notificationsBtn && notificationsDropdown) {
            console.log('✅ Configurando dropdown de notificações');

            const newNotificationsBtn = notificationsBtn.cloneNode(true);
            notificationsBtn.parentNode.replaceChild(newNotificationsBtn, notificationsBtn);

            newNotificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('🔔 Dropdown de notificações clicado');

                // Fechar o outro dropdown
                document.getElementById('userDropdown')?.classList.remove('show');

                // Alternar este dropdown
                notificationsDropdown.classList.toggle('show');
            });

            window.notificationsBtn = newNotificationsBtn;
        } else {
            console.warn('⚠️ Elementos de notificações não encontrados');
        }
    }

    _setupClickOutside() {
        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            const userDropdown = document.getElementById('userDropdown');
            const userWrapper = document.querySelector('.user-wrapper');
            const notificationsDropdown = document.getElementById('notificationsDropdown');
            const notificationsWrapper = document.querySelector('.notifications-wrapper');

            // Fechar user dropdown se clicar fora
            if (userDropdown && userWrapper && !userWrapper.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }

            // Fechar notifications dropdown se clicar fora
            if (notificationsDropdown && notificationsWrapper && !notificationsWrapper.contains(e.target) && !notificationsDropdown.contains(e.target)) {
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
    }

    setupDragAndDrop() {
        console.log('🎯 setupDragAndDrop()');
        // Implementação do drag and drop (se necessário)
    }

    async loadProject() {
        console.log('📥 loadProject() - ID:', this.projectId);

        try {
            window.showLoading?.();

            const project = await window.api.get(`/projects/${this.projectId}`);
            console.log('📊 Projeto carregado:', project);

            this.project = project;
            this.tasks = project.tasks || [];
            this.members = project.members || [];

            this.renderProject();
            this.renderKanban();

        } catch (error) {
            console.error('❌ Erro ao carregar projeto:', error);
            window.showToast?.('Erro ao carregar projeto', 'error');
        } finally {
            window.hideLoading?.();
        }
    }

    renderProject() {
        console.log('🎨 renderProject()');

        document.getElementById('projectName').textContent = this.project.name || 'Sem nome';
        document.getElementById('projectDescription').textContent = this.project.description || 'Sem descrição';
        document.getElementById('projectOwner').textContent = this.project.owner_name || 'Desconhecido';

        if (this.project.created_at) {
            const date = new Date(this.project.created_at);
            document.getElementById('projectCreated').textContent = date.toLocaleDateString('pt-BR');
        }

        this.renderMembers();
    }

    renderMembers() {
        const container = document.getElementById('membersList');
        if (!container) return;

        container.innerHTML = '';

        this.members.forEach(member => {
            const img = document.createElement('img');
            img.src = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563EB&color=fff`;
            img.className = 'member-avatar';
            img.title = member.name;
            container.appendChild(img);
        });
    }

    async saveTask() {
        console.log('💾 saveTask() chamado');

        if (this.savingTask) {
            console.log('⏳ Já salvando uma tarefa');
            return;
        }

        const taskId = document.getElementById('taskId').value;
        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            assignedTo: document.getElementById('taskAssignee').value || null, // <-- ATRIBUIÇÃO AQUI!
            dueDate: document.getElementById('taskDueDate').value || null,
            projectId: this.projectId
        };

        console.log('📝 Dados da tarefa:', taskData);

        if (!taskData.title) {
            window.showToast?.('Título é obrigatório', 'error');
            return;
        }

        const saveBtn = document.getElementById('saveTaskBtn');
        const originalText = saveBtn?.innerHTML || 'Salvar';

        this.savingTask = true;
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        }

        try {
            window.showLoading?.();

            if (taskId) {
                // Editar tarefa existente
                await window.api.put(`/tasks/${taskId}`, taskData);
                window.showToast?.('Tarefa atualizada!', 'success');
            } else {
                // Criar nova tarefa
                await window.api.post('/tasks', taskData);
                window.showToast?.('Tarefa criada!', 'success');
            }

            this.closeModals();
            await this.loadProject(); // Recarregar projeto para mostrar nova tarefa

        } catch (error) {
            console.error('❌ Erro ao salvar tarefa:', error);
            window.showToast?.(error.message || 'Erro ao salvar tarefa', 'error');
        } finally {
            this.savingTask = false;
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
            window.hideLoading?.();
        }
    }

    renderKanban() {
        console.log('📋 renderKanban()');

        const todoContainer = document.getElementById('todoContainer');
        const doingContainer = document.getElementById('doingContainer');
        const doneContainer = document.getElementById('doneContainer');

        if (todoContainer) todoContainer.innerHTML = '';
        if (doingContainer) doingContainer.innerHTML = '';
        if (doneContainer) doneContainer.innerHTML = '';

        document.getElementById('todoCount').textContent = this.tasks.filter(t => t.status === 'todo').length;
        document.getElementById('doingCount').textContent = this.tasks.filter(t => t.status === 'doing').length;
        document.getElementById('doneCount').textContent = this.tasks.filter(t => t.status === 'done').length;

        this.tasks.forEach(task => {
            const card = this.createTaskCard(task);

            if (task.status === 'todo' && todoContainer) todoContainer.appendChild(card);
            if (task.status === 'doing' && doingContainer) doingContainer.appendChild(card);
            if (task.status === 'done' && doneContainer) doneContainer.appendChild(card);
        });
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';

        // Versão mais completa do card
        const priorityClass = `priority-${task.priority || 'medium'}`;
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;

        card.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <span class="task-priority ${priorityClass}"></span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">#${task.id?.slice(-4) || '0000'}</span>
            </div>
            <div class="task-title">${this.escapeHtml(task.title)}</div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <div class="task-assignee">
                    ${task.assigned_to_name ? `
                        <img src="${task.assigned_to_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_to_name)}&background=2563EB&color=fff`}" alt="${task.assigned_to_name}">
                        <span>${task.assigned_to_name.split(' ')[0]}</span>
                    ` : '<span>Não atribuído</span>'}
                </div>
                ${dueDate ? `
                    <div class="task-due">
                        <i class="far fa-calendar"></i>
                        ${dueDate.toLocaleDateString('pt-BR')}
                    </div>
                ` : ''}
            </div>
            <div class="task-actions">
                <button class="task-action edit" onclick="window.projectPage.editTask('${task.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action delete" onclick="window.projectPage.deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return card;
    }

    escapeHtml(text) {
        if (!text) return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTaskModal(taskId = null) {
        console.log('➕ showTaskModal()', taskId);

        if (this.openingModal) return;
        this.openingModal = true;

        const modal = document.getElementById('taskModal');
        const titleEl = document.getElementById('taskModalTitle');

        if (!modal) {
            this.openingModal = false;
            return;
        }

        try {
            // Limpar formulário
            document.getElementById('taskForm').reset();
            document.getElementById('taskId').value = '';

            // Preencher select de membros
            this.populateMembersSelect();

            if (taskId) {
                // Editar tarefa existente
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    titleEl.textContent = 'Editar Tarefa';
                    document.getElementById('taskId').value = task.id;
                    document.getElementById('taskTitle').value = task.title;
                    document.getElementById('taskDescription').value = task.description || '';
                    document.getElementById('taskPriority').value = task.priority || 'medium';
                    document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';

                    // Selecionar o responsável atual
                    if (task.assignedToId) {
                        document.getElementById('taskAssignee').value = task.assignedToId;
                    }
                }
            } else {
                titleEl.textContent = 'Nova Tarefa';
            }

            modal.classList.add('show');
        } finally {
            this.openingModal = false;
        }
    }

    populateMembersSelect() {
        const select = document.getElementById('taskAssignee');
        if (!select) return;

        // Limpar opções atuais
        select.innerHTML = '<option value="">👤 Não atribuir</option>';

        // Adicionar membros do projeto
        if (this.members && this.members.length > 0) {
            this.members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.userId || member.id;

                // Avatar visual no texto da opção
                const avatar = member.avatar ? '' : '';
                option.textContent = `${avatar} ${member.name} (${member.role || 'membro'})`;

                // Estilo para o option
                option.style.padding = '8px';
                option.style.backgroundColor = 'var(--bg-secondary)';

                select.appendChild(option);
            });
        }

        // Adicionar evento de mudança para mostrar feedback
        select.addEventListener('change', (e) => {
            const selected = e.target.options[e.target.selectedIndex];
            console.log('👤 Responsável selecionado:', selected.textContent);
        });
    }

    editTask(taskId) {
        this.showTaskModal(taskId);
    }

    async deleteTask(taskId) {
        console.log('🗑️ deleteTask()', taskId);
        // Implementar lógica de delete
    }

    showInviteModal() {
        console.log('👥 showInviteModal()');
        document.getElementById('inviteModal')?.classList.add('show');
    }

    async inviteMember() {
        const email = document.getElementById('inviteEmail').value;
        const role = document.getElementById('inviteRole').value;

        if (!email) {
            showToast('Email é obrigatório', 'error');
            return;
        }

        try {
            showLoading();
            await api.post(`/projects/${this.projectId}/invite`, { email, role });

            this.closeModals();
            await this.loadProject();
            showToast('Membro adicionado com sucesso!', 'success');

            document.getElementById('inviteEmail').value = '';
        } catch (error) {
            console.error('❌ Erro ao convidar membro:', error);
            showToast(error.message || 'Erro ao convidar membro', 'error');
        } finally {
            hideLoading();
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
}

// ===== INICIALIZAÇÃO IMEDIATA =====
console.log('🔥 project.js executado');

// Criar instância quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM carregado, criando ProjectPage...');
        window.projectPage = new ProjectPage();
    });
} else {
    console.log('📄 DOM já carregado, criando ProjectPage agora...');
    window.projectPage = new ProjectPage();
}