import express from 'express';
import { Notification } from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Buscar notificações do usuário
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.findByUser(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar notificações não lidas
router.get('/unread', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.findUnreadByUser(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error('❌ Erro ao buscar notificações não lidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Marcar notificação como lida
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        await Notification.markAsRead(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erro ao marcar notificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Marcar todas como lidas
router.post('/read-all', authenticateToken, async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erro ao marcar todas como lidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar notificação
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Notification.delete(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        console.error('❌ Erro ao deletar notificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Contar notificações não lidas
router.get('/count', authenticateToken, async (req, res) => {
    try {
        const count = await Notification.countUnread(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('❌ Erro ao contar notificações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;