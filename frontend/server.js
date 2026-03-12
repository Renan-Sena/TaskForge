import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para injetar script de hot reload
app.use((req, res, next) => {
    // Só injetar em HTML e em desenvolvimento
    if (process.env.NODE_ENV === 'development' && req.path.endsWith('.html')) {
        const filePath = path.join(__dirname, 'public', req.path);
        
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Script de hot reload via WebSocket
            const reloadScript = `
                <script>
                    (function() {
                        console.log('🔌 Conectando ao hot reload...');
                        
                        let socket = null;
                        let reconnectAttempts = 0;
                        const maxReconnectAttempts = 10;
                        
                        function connectWebSocket() {
                            try {
                                socket = new WebSocket('ws://localhost:5001');
                                
                                socket.onopen = function() {
                                    console.log('✅ Conectado ao hot reload');
                                    reconnectAttempts = 0;
                                };
                                
                                socket.onmessage = function(event) {
                                    try {
                                        const data = JSON.parse(event.data);
                                        console.log('📢 Hot reload:', data);
                                        
                                        if (data.type === 'reload') {
                                            console.log('🔄 Recarregando página...');
                                            setTimeout(() => {
                                                location.reload();
                                            }, 100);
                                        }
                                    } catch (e) {
                                        console.error('❌ Erro ao processar mensagem:', e);
                                    }
                                };
                                
                                socket.onclose = function() {
                                    console.log('❌ Desconectado do hot reload');
                                    
                                    // Tentar reconectar
                                    if (reconnectAttempts < maxReconnectAttempts) {
                                        reconnectAttempts++;
                                        console.log(\`🔄 Tentando reconectar... (\${reconnectAttempts}/\${maxReconnectAttempts})\`);
                                        setTimeout(connectWebSocket, 2000);
                                    }
                                };
                                
                                socket.onerror = function(error) {
                                    console.error('❌ Erro no WebSocket:', error);
                                };
                                
                            } catch (error) {
                                console.error('❌ Erro ao conectar:', error);
                            }
                        }
                        
                        // Conectar quando a página carregar
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', connectWebSocket);
                        } else {
                            connectWebSocket();
                        }
                    })();
                </script>
            `;
            
            // Injetar antes do </body>
            content = content.replace('</body>', reloadScript + '</body>');
            res.send(content);
            return;
        }
    }
    next();
});

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        mode: process.env.NODE_ENV || 'production'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor frontend rodando!`);
    console.log(`📌 URL: http://localhost:${PORT}`);
    console.log(`📁 Servindo: ${path.join(__dirname, 'public')}`);
    console.log(`🔧 Modo: ${process.env.NODE_ENV || 'production'}\n`);
});