// ===== GERENCIAMENTO DE AUTENTICAÇÃO =====

class Auth {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.token = localStorage.getItem('token') || null;
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    getUser() {
        return this.user;
    }
    
    getToken() {
        return this.token;
    }
    
    async login(email, password) {
        try {
            console.log('🔑 Tentando login:', email);
            const data = await api.post('/auth/login', { email, password });
            
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('✅ Login bem-sucedido:', this.user);
            return { success: true };
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, error: error.message };
        }
    }
    
    async register(name, email, password) {
        try {
            console.log('📝 Tentando registro:', { name, email });
            const data = await api.post('/auth/register', { name, email, password });
            
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('✅ Registro bem-sucedido:', this.user);
            return { success: true };
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            return { success: false, error: error.message };
        }
    }
    
    logout() {
        console.log('👋 Fazendo logout');
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
    
    async verifyToken() {
        if (!this.token) return false;
        
        try {
            const data = await api.get('/auth/verify');
            return data.valid;
        } catch {
            return false;
        }
    }
    
    updateUserAvatar(avatarUrl) {
        if (this.user) {
            this.user.avatar = avatarUrl;
            localStorage.setItem('user', JSON.stringify(this.user));
            
            // Atualizar avatares na página
            document.querySelectorAll('.user-avatar, .drawer-avatar').forEach(img => {
                if (img) img.src = avatarUrl;
            });
        }
    }
}

// Instância global
const auth = new Auth();
window.auth = auth;

// Verificar autenticação em páginas protegidas
async function requireAuth() {
    const publicPages = ['login.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage)) {
        if (!auth.isAuthenticated()) {
            console.log('🔐 Não autenticado, redirecionando para login');
            window.location.href = 'login.html';
            return false;
        }
        
        const isValid = await auth.verifyToken();
        if (!isValid) {
            console.log('🔐 Token inválido, fazendo logout');
            auth.logout();
            return false;
        }
        
        console.log('🔐 Autenticação válida');
        return true;
    }
    return true;
}

// Executar verificação
document.addEventListener('DOMContentLoaded', requireAuth);