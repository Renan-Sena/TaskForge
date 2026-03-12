// ===== SUPER ADMIN DASHBOARD - VERSÃO COMPLETA =====

class SuperAdminDashboard {
    constructor() {
        console.log('👑 Inicializando Super Admin Dashboard');
        this.stats = {};
        this.users = [];
        this.projects = [];
        this.activities = [];
        this.logs = [];
        this.exportFormat = 'json';
        this.init();
    }

    async init() {
        console.log('🚀 SuperAdmin.init() chamado');
        
        // Verificar autenticação
        const user = window.auth?.getUser();
        if (!user) {
            console.log('🔐 Usuário não autenticado');
            window.location.href = 'login.html';
            return;
        }

        // Verificar permissão
        const hasPermission = await this.checkPermission();
        if (!hasPermission) return;
        
        this.loadUserInfo();
        this.setupEventListeners();
        this.setupTabs();
        this.startLiveUpdates();
        this.updateDateTime();
        await this.loadAllData();
    }

    async checkPermission() {
        try {
            console.log('🔐 Verificando permissão de super admin...');
            const userData = await window.api.get('/auth/me');
            
            if (!userData || userData.role !== 'superadmin') {
                console.log('⛔ Acesso negado - role:', userData?.role);
                window.showToast?.('Acesso negado. Área restrita.', 'error');
                setTimeout(() => window.location.href = 'dashboard.html', 2000);
                return false;
            }
            
            console.log('✅ Permissão de super admin verificada');
            return true;
        } catch (error) {
            console.error('❌ Erro ao verificar permissão:', error);
            if (error.message?.includes('401')) window.location.href = 'login.html';
            return false;
        }
    }

    loadUserInfo() {
        const user = window.auth?.getUser();
        if (user) {
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            
            const avatar = document.getElementById('userAvatar');
            if (avatar) {
                avatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=dc2626&color=fff&size=128`;
            }
        }
    }

    setupEventListeners() {
        // Botões principais
        document.getElementById('refreshDataBtn')?.addEventListener('click', () => this.refreshData());
        document.getElementById('emergencyBtn')?.addEventListener('click', () => this.showEmergencyModal());
        document.getElementById('quickEmergencyBtn')?.addEventListener('click', () => this.showEmergencyModal());
        document.getElementById('exportFloatingBtn')?.addEventListener('click', () => this.showExportModal());

        // Fechar modais
        document.getElementById('closeEmergencyModal')?.addEventListener('click', () => this.closeModals());
        document.getElementById('closeExportModal')?.addEventListener('click', () => this.closeModals());

        // Ações de emergência
        document.getElementById('emergencyLockdown')?.addEventListener('click', () => this.emergencyAction('lockdown'));
        document.getElementById('emergencyMaintenance')?.addEventListener('click', () => this.emergencyAction('maintenance'));
        document.getElementById('emergencyBackup')?.addEventListener('click', () => this.emergencyAction('backup'));
        document.getElementById('emergencyRestart')?.addEventListener('click', () => this.emergencyAction('restart'));

        // Tabs de gerenciamento
        document.querySelectorAll('.management-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchManagementTab(e.target));
        });

        // Filtros de log
        document.getElementById('applyLogFilter')?.addEventListener('click', () => this.loadLogs());

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.auth?.logout();
        });

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown')?.classList.remove('show');
            }
            if (!e.target.closest('.notifications')) {
                document.getElementById('notificationsDropdown')?.classList.remove('show');
            }
        });
    }

    setupTabs() {
        const firstTab = document.querySelector('.management-tab');
        if (firstTab) this.switchManagementTab(firstTab);
    }

    switchToTab(tabName) {
        const tab = document.querySelector(`.management-tab[data-tab="${tabName}"]`);
        if (tab) this.switchManagementTab(tab);
    }

    async loadAllData() {
        try {
            window.showLoading?.();
            await Promise.all([
                this.loadStats(),
                this.loadUsers(),
                this.loadProjects(),
                this.loadActivities(),
                this.loadSystemInfo(),
                this.loadLogs()
            ]);
            this.renderRecentUsers();
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            window.showToast?.('Erro ao carregar dados', 'error');
        } finally {
            window.hideLoading?.();
        }
    }

    async loadStats() {
        try {
            const data = await window.api.get('/admin/stats');
            this.stats = data;

            document.getElementById('totalUsers').textContent = data.users.total || 0;
            document.getElementById('totalProjects').textContent = data.projects.total || 0;
            document.getElementById('completedTasks').textContent = data.tasks.completed || 0;
            document.getElementById('totalTasks').textContent = data.tasks.total || 0;
            document.getElementById('overdueTasks').textContent = data.tasks.overdue || 0;
            document.getElementById('totalComments').textContent = data.comments || 0;
            document.getElementById('newUsers').textContent = `+${data.users.new || 0} esta semana`;
            document.getElementById('newProjects').textContent = `+${data.projects.new || 0} novos`;

        } catch (error) {
            console.error('❌ Erro ao carregar stats:', error);
        }
    }

    async loadUsers() {
        try {
            this.users = await window.api.get('/admin/users');
            this.renderUsersTable();
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
        }
    }

    renderRecentUsers() {
        const tbody = document.getElementById('recentUsersTable');
        if (!tbody) return;

        const recentUsers = this.users.slice(0, 5);
        
        tbody.innerHTML = recentUsers.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="${user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`}" 
                             style="width: 24px; height: 24px; border-radius: 50%;">
                        <span>${user.name}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
            </tr>
        `).join('');
    }

    async loadProjects() {
        try {
            this.projects = await window.api.get('/admin/projects');
            this.renderProjectsTable();
        } catch (error) {
            console.error('❌ Erro ao carregar projetos:', error);
        }
    }

    async loadActivities() {
        try {
            this.activities = await window.api.get('/admin/activity');
            this.renderActivities();
        } catch (error) {
            console.error('❌ Erro ao carregar atividades:', error);
        }
    }

    async loadSystemInfo() {
        try {
            const data = await window.api.get('/admin/system');
            
            document.getElementById('dbSize').textContent = `${data.database.size} MB`;
            document.getElementById('dbTables').textContent = data.database.tables;
            document.getElementById('dbStatus').textContent = data.database.status;
            document.getElementById('serverUptime').textContent = 
                `${data.server.uptime.days}d ${data.server.uptime.hours}h ${data.server.uptime.minutes}m`;
            document.getElementById('serverMemory').textContent = 
                `${data.server.memory.used}GB / ${data.server.memory.total}GB (${data.server.memory.usagePercent}%)`;
            
            document.getElementById('cpuUsage').style.width = `${data.server.cpu.load[0] * 100}%`;
            document.getElementById('cpuUsage').textContent = `${(data.server.cpu.load[0] * 100).toFixed(1)}%`;
            document.getElementById('ramUsage').style.width = `${data.server.memory.usagePercent}%`;
            document.getElementById('ramUsage').textContent = `${data.server.memory.usagePercent}%`;

        } catch (error) {
            console.error('❌ Erro ao carregar sistema:', error);
        }
    }

    async loadLogs() {
        try {
            const level = document.getElementById('logLevel')?.value || 'all';
            const date = document.getElementById('logDate')?.value || '';
            
            const params = new URLSearchParams({ level, limit: 50 });
            if (date) params.append('date', date);
            
            this.logs = await window.api.get(`/admin/logs?${params}`);
            this.renderLogs();
        } catch (error) {
            console.error('❌ Erro ao carregar logs:', error);
            document.getElementById('logsList').innerHTML = '<div class="log-entry">Erro ao carregar logs</div>';
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (!this.users || this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-row">Nenhum usuário encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => {
            const roleClass = {
                'superadmin': 'badge-danger',
                'admin': 'badge-warning',
                'user': 'badge-primary'
            }[user.role] || 'badge-primary';

            return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="${user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`}" 
                             style="width: 32px; height: 32px; border-radius: 50%;">
                        <span>${user.name}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge ${roleClass}">${user.role}</span></td>
                <td>${user.ownedProjects || 0}</td>
                <td>${user.createdTasks || 0}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="action-btn edit" onclick="window.superAdmin.editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="window.superAdmin.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `}).join('');
    }

    renderProjectsTable() {
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;

        if (!this.projects || this.projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-row">Nenhum projeto encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = this.projects.map(project => {
            const progress = project.tasks_count > 0 
                ? ((project.completed_tasks / project.tasks_count) * 100).toFixed(0)
                : 0;
            
            return `
            <tr>
                <td>${project.name}</td>
                <td>${project.owner_name}</td>
                <td>${project.members_count || 0}</td>
                <td>${project.tasks_count || 0}</td>
                <td>
                    <div class="progress-bar" style="width: 100px; height: 20px;">
                        <div class="progress-fill" style="width: ${progress}%">${progress}%</div>
                    </div>
                </td>
                <td>${new Date(project.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                    ${project.overdue_tasks > 0 ? 
                        `<span class="badge badge-danger">${project.overdue_tasks} atrasadas</span>` : 
                        '<span class="badge badge-success">OK</span>'}
                </td>
            </tr>
        `}).join('');
    }

    renderActivities() {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;

        if (!this.activities || this.activities.length === 0) {
            feed.innerHTML = '<div class="activity-item">Nenhuma atividade recente</div>';
            return;
        }

        feed.innerHTML = this.activities.map(act => {
            const badgeClass = {
                'user': 'success',
                'project': 'info',
                'task': 'warning',
                'comment': 'primary'
            }[act.type] || 'info';

            const time = new Date(act.createdAt).toLocaleTimeString('pt-BR');

            return `
            <div class="activity-item">
                <span class="activity-time">${time}</span>
                <span class="activity-badge ${badgeClass}">${act.type.toUpperCase()}</span>
                <span class="activity-text">
                    ${act.title} - ${act.description}
                </span>
            </div>
        `}).join('');
    }

    renderLogs() {
        const container = document.getElementById('logsList');
        if (!container) return;

        if (!this.logs || this.logs.length === 0) {
            container.innerHTML = '<div class="log-entry">Nenhum log encontrado</div>';
            return;
        }

        container.innerHTML = this.logs.map(log => `
            <div class="log-entry">
                <span class="log-time">${new Date(log.created_at).toLocaleString('pt-BR')}</span>
                <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
                <span class="log-message">${log.message}</span>
                <span class="log-user">${log.user_id?.slice(0, 8) || 'system'}</span>
            </div>
        `).join('');
    }

    // ===== AÇÕES DE EMERGÊNCIA =====
    async emergencyAction(action) {
        const actions = {
            lockdown: { msg: 'Sistema será bloqueado', confirm: true },
            maintenance: { msg: 'Ativar modo manutenção', confirm: true },
            backup: { msg: 'Iniciar backup forçado', confirm: false },
            restart: { msg: 'REINICIAR SERVIÇOS', confirm: true }
        };

        const actionData = actions[action];
        
        if (actionData.confirm) {
            const confirmed = await window.confirmDialog(`⚠️ ${actionData.msg}. Continuar?`);
            if (!confirmed) return;
        }

        try {
            window.showLoading?.();
            await window.api.post(`/admin/emergency/${action}`, {});
            window.showToast?.(`✅ Ação ${action} executada com sucesso`, 'success');
            this.closeModals();
            setTimeout(() => this.loadLogs(), 1000);
        } catch (error) {
            console.error(`❌ Erro na ação ${action}:`, error);
            window.showToast?.(`Erro ao executar ${action}`, 'error');
        } finally {
            window.hideLoading?.();
        }
    }

    // ===== EXPORTAÇÃO DE DADOS =====
    setExportFormat(format) {
        this.exportFormat = format;
        document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`format${format.toUpperCase()}`)?.classList.add('active');
    }

    async exportData(type = 'all') {
        try {
            window.showLoading?.();
            
            let data;
            let filename;
            
            switch(type) {
                case 'users':
                    data = this.users;
                    filename = `users-${new Date().toISOString().slice(0,10)}`;
                    break;
                case 'projects':
                    data = this.projects;
                    filename = `projects-${new Date().toISOString().slice(0,10)}`;
                    break;
                case 'logs':
                    data = this.logs;
                    filename = `logs-${new Date().toISOString().slice(0,10)}`;
                    break;
                default:
                    data = {
                        stats: this.stats,
                        users: this.users,
                        projects: this.projects,
                        activities: this.activities,
                        logs: this.logs,
                        exportedAt: new Date().toISOString()
                    };
                    filename = `taskforge-full-${new Date().toISOString().slice(0,10)}`;
            }

            let content;
            let mimeType;

            if (this.exportFormat === 'json') {
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                filename += '.json';
            } else {
                // CSV
                content = this.convertToCSV(data, type);
                mimeType = 'text/csv';
                filename += '.csv';
            }

            // Download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            window.showToast?.(`✅ Dados exportados como ${this.exportFormat.toUpperCase()}`, 'success');
            this.closeModals();

        } catch (error) {
            console.error('❌ Erro ao exportar:', error);
            window.showToast?.('Erro ao exportar dados', 'error');
        } finally {
            window.hideLoading?.();
        }
    }

    convertToCSV(data, type) {
        if (type === 'users' && Array.isArray(data)) {
            const headers = ['Nome', 'Email', 'Role', 'Projetos', 'Tarefas', 'Cadastro'];
            const rows = data.map(u => [
                u.name,
                u.email,
                u.role,
                u.ownedProjects || 0,
                u.createdTasks || 0,
                new Date(u.createdAt).toLocaleDateString()
            ]);
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
        return JSON.stringify(data, null, 2);
    }

    // ===== UTILITÁRIOS =====
    switchManagementTab(tab) {
        const tabName = tab.dataset.tab;
        
        document.querySelectorAll('.management-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.management-pane').forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tabName}Pane`).classList.add('active');

        if (tabName === 'logs') this.loadLogs();
    }

    async refreshData() {
        await this.loadAllData();
        window.showToast?.('📊 Dados atualizados', 'success');
    }

    showEmergencyModal() {
        document.getElementById('emergencyModal')?.classList.add('show');
    }

    showExportModal() {
        document.getElementById('exportModal')?.classList.add('show');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    updateDateTime() {
        const update = () => {
            const now = new Date();
            document.getElementById('currentDateTime').textContent = 
                now.toLocaleString('pt-BR', { 
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
        };
        update();
        setInterval(update, 1000);
    }

    startLiveUpdates() {
        setInterval(() => this.loadActivities(), 30000);
        setInterval(() => this.loadStats(), 60000);
        setInterval(() => this.loadSystemInfo(), 120000);
    }

    // Ações de usuário (placeholder)
    async editUser(userId) {
        window.showToast?.(`✏️ Editando usuário ${userId}`, 'info');
    }

    async deleteUser(userId) {
        const confirmed = await window.confirmDialog(`Deletar usuário permanentemente?`);
        if (!confirmed) return;
        window.showToast?.(`🗑️ Usuário ${userId} deletado`, 'success');
        // Implementar delete real
    }
}

// Inicialização
let superAdmin;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        superAdmin = new SuperAdminDashboard();
        window.superAdmin = superAdmin;
    });
} else {
    superAdmin = new SuperAdminDashboard();
    window.superAdmin = superAdmin;
}