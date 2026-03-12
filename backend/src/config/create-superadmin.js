import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

async function createSuperAdmin() {
    console.log('🚀 Iniciando criação de Super Admin...\n');

    // Configurações do super admin
    const superAdmin = {
        name: 'Super Admin',
        email: 'admin@taskforge.app',
        password: 'admin123',
        role: 'superadmin'
    };

    let connection;

    try {
        // Conectar ao banco
        connection = await mysql.createConnection({
            host: 'mysql-644e54c-renanleal-4d74.i.aivencloud.com',
            port: 21976,
            user: 'avnadmin',
            password: 'AVNS_n9LeC69B7WxD6aPdqRf',
            database: 'defaultdb',
            ssl: { rejectUnauthorized: false }
        });

        console.log('✅ Conectado ao banco de dados\n');

        // Verificar se já existe um super admin
        const [existing] = await connection.execute(
            'SELECT id, email, role FROM users WHERE email = ? OR role = ?',
            [superAdmin.email, 'superadmin']
        );

        if (existing.length > 0) {
            console.log('📋 Usuários encontrados:');
            existing.forEach(user => {
                console.log(`   - ${user.email} (${user.role})`);
            });

            if (existing.some(u => u.email === superAdmin.email)) {
                console.log(`\n⚠️  Já existe um usuário com email ${superAdmin.email}`);
                
                // Atualizar para super admin
                console.log('\n🔄 Atualizando para super admin...');
                await connection.execute(
                    'UPDATE users SET role = ? WHERE email = ?',
                    ['superadmin', superAdmin.email]
                );
                console.log('✅ Usuário atualizado para super admin!');
            } else {
                console.log(`\n⚠️  Já existe um super admin no sistema`);
            }
        } else {
            // Criar novo super admin
            console.log('📝 Criando novo super admin...');

            // Gerar hash da senha
            const hashedPassword = await bcrypt.hash(superAdmin.password, 10);
            const id = crypto.randomUUID();

            await connection.execute(
                `INSERT INTO users (id, name, email, password, role) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id, superAdmin.name, superAdmin.email, hashedPassword, superAdmin.role]
            );

            console.log('✅ Super admin criado com sucesso!');
        }

        // Verificar resultado final
        const [result] = await connection.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE role = ?',
            ['superadmin']
        );

        console.log('\n📊 Super Admin(s) no sistema:');
        if (result.length > 0) {
            result.forEach((admin, index) => {
                console.log(`\n👑 Super Admin #${index + 1}:`);
                console.log(`   ID: ${admin.id}`);
                console.log(`   Nome: ${admin.name}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Role: ${admin.role}`);
                console.log(`   Criado em: ${admin.created_at}`);
            });
        } else {
            console.log('❌ Nenhum super admin encontrado!');
        }

        console.log('\n🔑 Credenciais de acesso:');
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   Senha: ${superAdmin.password}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n👋 Conexão fechada');
        }
    }
}

// Executar
createSuperAdmin();