import { db } from '../config/database.js';
import crypto from 'crypto';

export const Task = {
    async create({ title, description, projectId, createdBy, assignedTo, priority, dueDate }) {
        const id = crypto.randomUUID();
        
        await db.query(
            `INSERT INTO tasks 
             (id, title, description, projectId, createdById, assignedToId, priority, dueDate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, description, projectId, createdBy, assignedTo || null, priority || 'medium', dueDate || null]
        );
        
        return this.findById(id);
    },

    async findById(id) {
        return db.queryOne(
            `SELECT t.*, 
                    creator.name as created_by_name,
                    assignee.name as assigned_to_name,
                    assignee.avatar as assigned_to_avatar,
                    (SELECT COUNT(*) FROM comments WHERE taskId = t.id) as comments_count
             FROM tasks t
             LEFT JOIN users creator ON t.createdById = creator.id
             LEFT JOIN users assignee ON t.assignedToId = assignee.id
             WHERE t.id = ?`,
            [id]
        );
    },

    async update(id, data) {
        const fields = [];
        const values = [];
        
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.status !== undefined) {
            fields.push('status = ?');
            values.push(data.status);
        }
        if (data.priority !== undefined) {
            fields.push('priority = ?');
            values.push(data.priority);
        }
        if (data.assignedTo !== undefined) {
            fields.push('assignedToId = ?');
            values.push(data.assignedTo);
        }
        if (data.dueDate !== undefined) {
            fields.push('dueDate = ?');
            values.push(data.dueDate);
        }
        
        if (fields.length > 0) {
            values.push(id);
            await db.query(
                `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }
        
        return this.findById(id);
    },

    async move(id, status) {
        await db.query(
            'UPDATE tasks SET status = ? WHERE id = ?',
            [status, id]
        );
        return this.findById(id);
    },

    async delete(id) {
        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        return true;
    },

    async findByProject(projectId) {
        return db.query(
            `SELECT t.*, 
                    creator.name as created_by_name,
                    assignee.name as assigned_to_name,
                    assignee.avatar as assigned_to_avatar,
                    (SELECT COUNT(*) FROM comments WHERE taskId = t.id) as comments_count
             FROM tasks t
             LEFT JOIN users creator ON t.createdById = creator.id
             LEFT JOIN users assignee ON t.assignedToId = assignee.id
             WHERE t.projectId = ?
             ORDER BY 
                CASE t.priority 
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                t.dueDate ASC,
                t.created_at DESC`,
            [projectId]
        );
    }
};