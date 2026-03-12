import { db } from '../config/database.js';
import crypto from 'crypto';

export const Comment = {
    async create({ content, taskId, userId }) {
        const id = crypto.randomUUID();
        
        await db.query(
            `INSERT INTO comments (id, content, taskId, userId) 
             VALUES (?, ?, ?, ?)`,
            [id, content, taskId, userId]
        );
        
        return this.findById(id);
    },

    async findById(id) {
        return db.queryOne(
            `SELECT c.*, u.name as user_name, u.avatar as user_avatar
             FROM comments c
             JOIN users u ON c.userId = u.id
             WHERE c.id = ?`,
            [id]
        );
    },

    async findByTask(taskId) {
        return db.query(
            `SELECT c.*, u.name as user_name, u.avatar as user_avatar
             FROM comments c
             JOIN users u ON c.userId = u.id
             WHERE c.taskId = ?
             ORDER BY c.created_at DESC`,
            [taskId]
        );
    },

    async delete(id) {
        await db.query('DELETE FROM comments WHERE id = ?', [id]);
        return true;
    }
};