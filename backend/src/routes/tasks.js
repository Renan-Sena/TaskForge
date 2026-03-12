import express from 'express';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Project } from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Criar tarefa
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, priority, dueDate } = req.body;
        
        if (!title || !projectId) {
            return res.status(400).json({ error: 'Título e projeto são obrigatórios' });
        }
        
        // Verificar se usuário é membro do projeto
        const isMember = await Project.isMember(projectId, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const task = await Task.create({
            title,
            description,
            projectId,
            createdBy: req.user.id,
            assignedTo,
            priority,
            dueDate
        });
        
        res.status(201).json(task);
    } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar tarefa
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        // Verificar se usuário é membro do projeto
        const isMember = await Project.isMember(task.projectId, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const updatedTask = await Task.update(req.params.id, req.body);
        res.json(updatedTask);
    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Mover tarefa (atualizar status)
router.patch('/:id/move', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['todo', 'doing', 'done'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        // Verificar se usuário é membro do projeto
        const isMember = await Project.isMember(task.projectId, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const movedTask = await Task.move(req.params.id, status);
        res.json(movedTask);
    } catch (error) {
        console.error('❌ Erro ao mover tarefa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar tarefa
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        // Verificar se usuário é membro do projeto
        const isMember = await Project.isMember(task.projectId, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        await Task.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Adicionar comentário
router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        // Verificar se usuário é membro do projeto
        const isMember = await Project.isMember(task.projectId, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const comment = await Comment.create({
            content,
            taskId: req.params.id,
            userId: req.user.id
        });
        
        res.status(201).json(comment);
    } catch (error) {
        console.error('❌ Erro ao adicionar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar comentários de uma tarefa
router.get('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        
        // Verificar se usuário é membro do projeto
        const isMember = await Project.isMember(task.projectId, req.user.id);
        if (!isMember) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        
        const comments = await Comment.findByTask(req.params.id);
        res.json(comments);
    } catch (error) {
        console.error('❌ Erro ao listar comentários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;