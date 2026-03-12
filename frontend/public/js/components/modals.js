// ===== GERENCIAMENTO DE MODAIS =====

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Fechar modais com botão X
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeActiveModal());
        });

        // Fechar modais com botão cancelar
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeActiveModal());
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeActiveModal();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            this.activeModal = modal;

            // Focar no primeiro input
            const firstInput = modal.querySelector('input:not([type="hidden"])');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            if (this.activeModal === modal) this.activeModal = null;
        }
    }

    closeActiveModal() {
        if (this.activeModal) {
            this.activeModal.classList.remove('show');
            this.activeModal = null;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.activeModal = null;
    }
}

// Inicializar
let modalManager;
document.addEventListener('DOMContentLoaded', () => {
    modalManager = new ModalManager();
    window.modalManager = modalManager;
});