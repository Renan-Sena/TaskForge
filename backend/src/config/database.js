import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexões
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Testar conexão na inicialização
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Conectado ao Aiven MySQL!');
        conn.release();
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
    }
})();

// Helper para queries
export const db = {
    /**
     * Executa uma query SQL e retorna todas as linhas
     */
    async query(sql, params = []) {
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ Erro na query:', error.sql);
            console.error('📝 Parâmetros:', params);
            console.error('💥 Mensagem:', error.message);
            throw error;
        }
    },

    /**
     * Executa uma query e retorna a primeira linha
     */
    async queryOne(sql, params = []) {
        try {
            const [rows] = await pool.execute(sql, params);
            return rows[0] || null;
        } catch (error) {
            console.error('❌ Erro na queryOne:', error.sql);
            console.error('📝 Parâmetros:', params);
            console.error('💥 Mensagem:', error.message);
            throw error;
        }
    },

    /**
     * Executa uma query de inserção e retorna o ID inserido
     */
    async insert(sql, params = []) {
        try {
            const [result] = await pool.execute(sql, params);
            return result.insertId;
        } catch (error) {
            console.error('❌ Erro no insert:', error.sql);
            console.error('📝 Parâmetros:', params);
            console.error('💥 Mensagem:', error.message);
            throw error;
        }
    },

    /**
     * Obtém uma conexão do pool (para transações)
     */
    async getConnection() {
        return await pool.getConnection();
    }
};

export default pool;