// ===== FUNÇÕES AUXILIARES =====

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'agora mesmo';
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    }
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (!text) return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading() {
    if (document.getElementById('loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 15, 28, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
    `;

    const spinner = document.createElement('div');
    spinner.className = 'loading';
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid rgba(37, 99, 235, 0.1);
        border-top-color: var(--primary-blue);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    `;

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
}

window.confirmDialog = function (message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Confirmar</h3>
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline" id="cancelConfirmBtn">Cancelar</button>
                    <button class="btn btn-danger" id="confirmBtn">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('confirmBtn').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
};

// Estilos
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Exportar
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;