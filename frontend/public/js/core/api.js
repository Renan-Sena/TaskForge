// ===== CONFIGURAÇÃO DA API =====

const API_URL = 'http://localhost:3000/api';

// Helper para requisições autenticadas
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    console.log(`🌐 Requisição: ${options.method || 'GET'} ${endpoint}`);
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        console.log(`📥 Status: ${response.status}`);
        
        if (response.status === 401) {
            console.log('🔐 Token inválido');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return null;
        }
        
        if (response.status === 204) {
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro na API:', error);
        throw error;
    }
}

// Métodos auxiliares
const api = {
    get: (endpoint) => apiRequest(endpoint),
    post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    patch: (endpoint, data) => apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

window.api = api;