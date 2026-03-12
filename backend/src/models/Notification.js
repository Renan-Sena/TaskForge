import { db } from '../config/database.js';
import crypto from 'crypto';

export const Notification = {
    async create({ type, title, message, userId, taskId = null, projectId = null }) {
        const id = crypto.randomUUID();
        
        await db.query(
            `INSERT INTO notifications (id, type, title, message, userId, taskId, projectId) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, type, title, message, userId, taskId, projectId]
        );
        
        return this.findById(id);
    },

    async findById(id) {
        return db.queryOne(
            `SELECT n.*, 
                    t.title as task_title,
                    p.name as project_name
             FROM notifications n
             LEFT JOIN tasks t ON n.taskId = t.id
             LEFT JOIN projects p ON n.projectId = p.id
             WHERE n.id = ?`,
            [id]
        );
    },

    async findByUser(userId) {
        return db.query(
            `SELECT n.*, 
                    t.title as task_title,
                    p.name as project_name
             FROM notifications n
             LEFT JOIN tasks t ON n.taskId = t.id
             LEFT JOIN projects p ON n.projectId = p.id
             WHERE n.userId = ?
             ORDER BY n.created_at DESC`,
            [userId]  // APENAS UM PARÂMETRO
        );
    },

    async findUnreadByUser(userId) {
        return db.query(
            `SELECT * FROM notifications 
             WHERE userId = ? AND isRead = false 
             ORDER BY created_at DESC`,
            [userId]
        );
    },

    async markAsRead(id, userId) {
        await db.query(
            'UPDATE notifications SET isRead = true WHERE id = ? AND userId = ?',
            [id, userId]
        );
        return true;
    },

    async markAllAsRead(userId) {
        await db.query(
            'UPDATE notifications SET isRead = true WHERE userId = ? AND isRead = false',
            [userId]
        );
        return true;
    },

    async delete(id, userId) {
        await db.query(
            'DELETE FROM notifications WHERE id = ? AND userId = ?',
            [id, userId]
        );
        return true;
    },

    async countUnread(userId) {
        const result = await db.queryOne(
            'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = false',
            [userId]
        );
        return result?.count || 0;
    }
};