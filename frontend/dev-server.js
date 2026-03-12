import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DevServer {
    constructor() {
        this.serverProcess = null;
        this.debounceTimer = null;
        this.wss = null;
        this.httpServer = null;
        this.clients = new Set();
        this.startTime = Date.now();
        this.restartCount = 0;
    }

    start() {
        this.printBanner();
        console.log('🔧 Iniciando servidor de desenvolvimento...\n');
        this.startWebSocketServer();
        this.startServer();
        this.watchFiles();
        this.setupCleanup();
        this.setupKeypress();
    }

    printBanner() {
        console.log(`
╔══════════════════════════════════════════════════════╗
║     🔥 KANBANFLOW - HOT RELOAD COMPLETO             ║
║     ✅ Reinicia servidor + 🔄 Recarrega página       ║
╚══════════════════════════════════════════════════════╝
        `);
    }

    startWebSocketServer() {
        // Criar servidor HTTP para WebSocket
        this.httpServer = http.createServer();
        
        this.wss = new WebSocketServer({ server: this.httpServer });
        
        this.wss.on('connection', (ws) => {
            console.log('✅ Cliente conectado ao WebSocket');
            this.clients.add(ws);
            
            ws.on('close', () => {
                console.log('❌ Cliente desconectado do WebSocket');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('❌ Erro no WebSocket:', error.message);
            });
        });

        this.httpServer.listen(5001, () => {
            console.log(`📡 Servidor WebSocket rodando na porta 5001`);
        });
    }

    notifyClients() {
        const message = JSON.stringify({
            type: 'reload',
            timestamp: Date.now(),
            restartCount: this.restartCount
        });

        this.clients.forEach(client => {
            if (client.readyState === 1) { // OPEN
                client.send(message);
            }
        });
        
        console.log(`📢 Notificando ${this.clients.size} cliente(s) para recarregar`);
    }

    startServer() {
        if (this.serverProcess) {
            this.restartCount++;
            console.log(`\n🔄 Reiniciando servidor (restart #${this.restartCount})...`);
            this.serverProcess.kill();
        } else {
            console.log('🚀 Iniciando servidor pela primeira vez...\n');
        }

        // Configurar ambiente
        const env = {
            ...process.env,
            NODE_ENV: 'development',
            DEV_SERVER: 'true',
            RESTART_COUNT: this.restartCount,
            WEBSOCKET_PORT: '5001'
        };

        // Iniciar novo processo
        this.serverProcess = spawn('node', ['server.js'], {
            stdio: 'inherit',
            env: env,
            cwd: __dirname
        });

        const uptime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        this.serverProcess.on('error', (err) => {
            console.error('\n❌ Erro no servidor:', err.message);
        });

        this.serverProcess.on('exit', (code, signal) => {
            if (code !== null && code !== 0 && signal !== 'SIGTERM') {
                console.log(`\n⚠️ Servidor encerrado com código ${code}`);
            }
            
            // Notificar clientes que o servidor reiniciou
            setTimeout(() => {
                this.notifyClients();
            }, 500);
        });

        console.log(`📊 PID: ${this.serverProcess.pid} | Uptime: ${uptime}s`);
        
        // Notificar clientes sobre restart
        setTimeout(() => {
            this.notifyClients();
        }, 1000);
    }

    watchFiles() {
        const watchPaths = [
            __dirname,
            path.join(__dirname, 'public'),
            path.join(__dirname, 'public/css'),
            path.join(__dirname, 'public/js'),
        ];

        console.log('\n👀 Monitorando diretórios:');
        
        watchPaths.forEach(dirPath => {
            if (!fs.existsSync(dirPath)) {
                try {
                    fs.mkdirSync(dirPath, { recursive: true });
                } catch (err) {
                    return;
                }
            }

            console.log(`   📌 ${path.relative(__dirname, dirPath) || '.'}`);

            try {
                fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
                    this.handleFileChange(eventType, filename, dirPath);
                });
            } catch (err) {
                console.error(`❌ Erro ao monitorar ${dirPath}:`, err.message);
            }
        });

        console.log('\n✅ Monitoramento ativo!');
    }

    handleFileChange(eventType, filename, directory) {
        if (!filename) return;

        // Ignorar arquivos temporários
        if (this.shouldIgnoreFile(filename)) return;

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const fullPath = path.join(directory, filename);
            const relativePath = path.relative(__dirname, fullPath);
            
            console.log(`\n📁 Arquivo alterado: ${relativePath}`);
            console.log(`🔄 Evento: ${eventType}`);
            
            // Reiniciar servidor e notificar clientes
            this.startServer();
            
        }, 300);
    }

    shouldIgnoreFile(filename) {
        const ignorePatterns = [
            '.swp', '.swo', '~', '.tmp', '.log', 
            '.cache', 'thumbs.db', '.ds_store'
        ];

        return ignorePatterns.some(pattern => 
            filename.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    setupCleanup() {
        process.on('SIGINT', () => this.cleanup('SIGINT'));
        process.on('SIGTERM', () => this.cleanup('SIGTERM'));
        
        process.on('uncaughtException', (err) => {
            console.error('\n❌ Erro não capturado:', err);
            this.cleanup('uncaughtException');
        });
    }

    cleanup(signal) {
        const uptime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        console.log(`\n👋 Encerrando servidor (${signal})...`);
        console.log(`📊 Total de restarts: ${this.restartCount}`);
        console.log(`⏱️  Uptime total: ${uptime}s`);
        
        // Fechar conexões WebSocket
        if (this.wss) {
            this.wss.close();
        }
        
        if (this.httpServer) {
            this.httpServer.close();
        }
        
        if (this.serverProcess) {
            this.serverProcess.kill();
        }
        
        console.log('✅ Até mais! 👋\n');
        process.exit();
    }

    setupKeypress() {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (key) => {
            if (key === 'r' || key === 'R') {
                console.log('\n🔄 Reinicialização manual');
                this.startServer();
            }
            if (key === 's' || key === 'S') {
                console.log('\n📊 Status:');
                console.log(`   🔄 Restarts: ${this.restartCount}`);
                console.log(`   ⏱️  Uptime: ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`);
                console.log(`   👥 Clientes: ${this.clients.size}`);
            }
            if (key === 'q' || key === 'Q' || key === '\u0003') {
                this.cleanup('KEYBOARD');
            }
        });
    }
}

// Iniciar servidor
const devServer = new DevServer();
devServer.start();

console.log('\n📝 Comandos:');
console.log('   R - Reiniciar servidor');
console.log('   S - Status');
console.log('   Q - Sair');
console.log('   Ctrl+C - Sair\n');