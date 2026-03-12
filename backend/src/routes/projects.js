import express from 'express';
import { Project } from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/database.js'; // <-- IMPORTANTE: IMPORTAR O DB!

const router = express.Router();

// Listar projetos do usuário
router.get('/', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.findByUser(req.user.id);
        res.json(projects);
    } catch (error) {
        console.error('❌ Erro ao listar projetos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar projeto
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
        }
        
        const project = await Project.create({
            name,
            description,
            ownerId: req.user.id
        });
        
        res.status(201).json(project);
    } catch (error) {
        console.error('❌ Erro ao criar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar projeto específico
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        
        // Verificar se usuário é membro
        const isMember = await Project.isMember(req.params.id, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        res.json(project);
    } catch (error) {
        console.error('❌ Erro ao buscar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Convidar membro
router.post('/:id/invite', authenticateToken, async (req, res) => {
    try {
        const { email, role } = req.body;
        
        console.log('📧 Convidando membro:', { email, role, projectId: req.params.id });
        
        // Verificar se usuário é admin
        const isAdmin = await Project.isAdmin(req.params.id, req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Sem permissão para convidar' });
        }
        
        // Buscar usuário por email
        const user = await db.queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        console.log('✅ Usuário encontrado:', user);
        
        // Verificar se já é membro
        const existingMember = await db.queryOne(
            'SELECT * FROM project_members WHERE projectId = ? AND userId = ?',
            [req.params.id, user.id]
        );
        
        if (existingMember) {
            return res.status(400).json({ error: 'Usuário já é membro do projeto' });
        }
        
        // Adicionar membro
        const member = await Project.addMember(req.params.id, user.id, role);
        console.log('✅ Membro adicionado:', member);
        
        res.json(member);
    } catch (error) {
        console.error('❌ Erro ao convidar membro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar projeto
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Project.delete(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        console.error('❌ Erro ao deletar projeto:', error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
});

export default router;