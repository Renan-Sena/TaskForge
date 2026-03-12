import { db } from '../config/database.js';
import crypto from 'crypto';

export const Project = {
    async create({ name, description, ownerId }) {
        const id = crypto.randomUUID();
        
        await db.query(
            `INSERT INTO projects (id, name, description, ownerId) 
             VALUES (?, ?, ?, ?)`,
            [id, name, description, ownerId]
        );
        
        await db.query(
            `INSERT INTO project_members (id, projectId, userId, role) 
             VALUES (?, ?, ?, ?)`,
            [crypto.randomUUID(), id, ownerId, 'owner']
        );
        
        return this.findById(id);
    },

    async findByUser(userId) {
        console.log('🔍 Buscando projetos para userId:', userId);
        
        const projects = await db.query(
            `SELECT DISTINCT p.*, 
                    u.name as owner_name, u.avatar as owner_avatar,
                    (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'todo') as todo_count,
                    (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'doing') as doing_count,
                    (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'done') as done_count
             FROM projects p
             JOIN project_members pm ON p.id = pm.projectId
             JOIN users u ON p.ownerId = u.id
             WHERE pm.userId = ?
             ORDER BY p.created_at DESC`,
            [userId]
        );
        
        console.log(`📊 Encontrados ${projects.length} projetos`);
        
        for (const project of projects) {
            project.members = await db.query(
                `SELECT u.id, u.name, u.email, u.avatar, pm.role
                 FROM project_members pm
                 JOIN users u ON pm.userId = u.id
                 WHERE pm.projectId = ?`,
                [project.id]
            );
        }
        
        return projects;
    },

    async findById(id) {
        console.log('🔍 Buscando projeto por ID:', id);
        
        const project = await db.queryOne(
            `SELECT p.*, u.name as owner_name, u.avatar as owner_avatar
             FROM projects p
             JOIN users u ON p.ownerId = u.id
             WHERE p.id = ?`,
            [id]
        );
        
        console.log('📊 Projeto encontrado:', project);
        
        if (project) {
            project.members = await db.query(
                `SELECT u.id, u.name, u.email, u.avatar, pm.role
                 FROM project_members pm
                 JOIN users u ON pm.userId = u.id
                 WHERE pm.projectId = ?`,
                [id]
            );
            
            project.tasks = await db.query(
                `SELECT t.*, 
                        creator.name as created_by_name,
                        assignee.name as assigned_to_name,
                        assignee.avatar as assigned_to_avatar,
                        (SELECT COUNT(*) FROM comments WHERE taskId = t.id) as comments_count
                 FROM tasks t
                 LEFT JOIN users creator ON t.createdById = creator.id
                 LEFT JOIN users assignee ON t.assignedToId = assignee.id
                 WHERE t.projectId = ?
                 ORDER BY t.created_at DESC`,
                [id]
            );
        }
        
        return project;
    },

    async addMember(projectId, userId, role = 'member') {
        const existing = await db.queryOne(
            'SELECT * FROM project_members WHERE projectId = ? AND userId = ?',
            [projectId, userId]
        );
        
        if (existing) {
            return existing;
        }
        
        await db.query(
            `INSERT INTO project_members (id, projectId, userId, role) 
             VALUES (?, ?, ?, ?)`,
            [crypto.randomUUID(), projectId, userId, role]
        );
        
        return { projectId, userId, role };
    },

    async isMember(projectId, userId) {
        const member = await db.queryOne(
            'SELECT * FROM project_members WHERE projectId = ? AND userId = ?',
            [projectId, userId]
        );
        return !!member;
    },

    async isAdmin(projectId, userId) {
        const member = await db.queryOne(
            `SELECT * FROM project_members 
             WHERE projectId = ? AND userId = ? AND role IN ('owner', 'admin')`,
            [projectId, userId]
        );
        return !!member;
    },

    async delete(id, userId) {
        // Verificar se o usuário é o owner do projeto
        const project = await db.queryOne(
            'SELECT * FROM projects WHERE id = ? AND ownerId = ?',
            [id, userId]
        );
        
        if (!project) {
            throw new Error('Projeto não encontrado ou você não tem permissão');
        }
        
        await db.query('DELETE FROM projects WHERE id = ?', [id]);
        return true;
    }
};