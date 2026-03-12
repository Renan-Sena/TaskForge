#!/usr/bin/env node

import { exec } from 'child_process';
import chalk from 'chalk';
import figlet from 'figlet';

console.log(
    chalk.blue(
        figlet.textSync('KanbanFlow', { horizontalLayout: 'full' })
    )
);

console.log(chalk.yellow('\n📋 Iniciando servidor frontend...\n'));

// Verificar se as dependências estão instaladas
exec('npm list express', (error) => {
    if (error) {
        console.log(chalk.red('❌ Dependências não encontradas. Instalando...'));
        exec('npm install', (err) => {
            if (err) {
                console.error(chalk.red('❌ Erro ao instalar dependências:', err));
                process.exit(1);
            }
            console.log(chalk.green('✅ Dependências instaladas!'));
            startServer();
        });
    } else {
        startServer();
    }
});

function startServer() {
    console.log(chalk.cyan('🚀 Iniciando servidor...\n'));
    
    const server = exec('node server.js');
    
    server.stdout.on('data', (data) => {
        console.log(data);
    });
    
    server.stderr.on('data', (data) => {
        console.error(chalk.red(data));
    });
}