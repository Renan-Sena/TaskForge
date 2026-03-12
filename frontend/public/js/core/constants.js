// ===== CONSTANTES DO SISTEMA =====

// Cores da marca
const COLORS = {
    primary: '#2563EB',
    secondary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
};

// Status das tarefas
const TASK_STATUS = {
    TODO: 'todo',
    DOING: 'doing',
    DONE: 'done'
};

// Prioridades das tarefas
const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Papéis dos membros
const MEMBER_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member'
};

// Tipos de notificação
const NOTIFICATION_TYPES = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_COMMENTED: 'task_commented',
    TASK_DUE_SOON: 'task_due_soon',
    MEMBER_ADDED: 'member_added',
    REMINDER: 'reminder'
};

// Exportar para uso global
window.COLORS = COLORS;
window.TASK_STATUS = TASK_STATUS;
window.TASK_PRIORITY = TASK_PRIORITY;
window.MEMBER_ROLES = MEMBER_ROLES;
window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;