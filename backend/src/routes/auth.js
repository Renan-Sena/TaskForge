import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { db } from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log('📝 Tentativa de registro:', { name, email });

        // Validações
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Criar usuário
        const user = await User.create({ name, email, password });

        // Gerar token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('❌ Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔑 Tentativa de login:', { email });

        // Buscar usuário
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Verificar senha
        const validPassword = await User.comparePassword(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Gerar token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Verificar token
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.json({ valid: false });
        }
        res.json({ valid: true, user });
    } catch (error) {
        console.error('❌ Erro ao verificar token:', error);
        res.json({ valid: false });
    }
});

// Rota para pegar dados do usuário atual (incluindo role)
// Rota para pegar dados do usuário atual (incluindo role)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 Buscando dados do usuário:', req.user.id);

        const user = await db.queryOne(
            `SELECT 
                id, 
                name, 
                email, 
                avatar, 
                COALESCE(role, 'user') as role,
                created_at as createdAt
             FROM users 
             WHERE id = ?`,
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        console.log('✅ Usuário encontrado:', user.email, 'Role:', user.role);
        res.json(user);
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;