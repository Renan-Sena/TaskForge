import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import os from 'os';

const router = express.Router();

// Middleware para verificar se é SUPER ADMIN
async function isSuperAdmin(req, res, next) {
    try {
        const user = await db.queryOne(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user || user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas super admin.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ===== ESTATÍSTICAS GERAIS =====
router.get('/stats', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        // Usuários
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const [activeUsers] = await db.query(`
            SELECT COUNT(DISTINCT userId) as count 
            FROM project_members 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        const [newUsers] = await db.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        // Projetos
        const [totalProjects] = await db.query('SELECT COUNT(*) as count FROM projects');
        const [activeProjects] = await db.query(`
            SELECT COUNT(DISTINCT projectId) as count 
            FROM tasks 
            WHERE updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        const [newProjects] = await db.query(`
            SELECT COUNT(*) as count 
            FROM projects 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        // Tarefas
        const [totalTasks] = await db.query('SELECT COUNT(*) as count FROM tasks');
        const [completedTasks] = await db.query(`
            SELECT COUNT(*) as count 
            FROM tasks 
            WHERE status = 'done'
        `);
        const [overdueTasks] = await db.query(`
            SELECT COUNT(*) as count 
            FROM tasks 
            WHERE dueDate < CURDATE() AND status != 'done'
        `);

        // Comentários
        const [totalComments] = await db.query('SELECT COUNT(*) as count FROM comments');

        res.json({
            users: {
                total: totalUsers.count,
                active: activeUsers.count || 0,
                new: newUsers.count || 0
            },
            projects: {
                total: totalProjects.count,
                active: activeProjects.count || 0,
                new: newProjects.count || 0
            },
            tasks: {
                total: totalTasks.count,
                completed: completedTasks.count || 0,
                overdue: overdueTasks.count || 0
            },
            comments: totalComments.count || 0
        });
    } catch (error) {
        console.error('❌ Erro ao carregar stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== LISTAR TODOS OS USUÁRIOS =====
router.get('/users', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const users = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.avatar,
                u.created_at as createdAt,
                u.updated_at as updatedAt,
                COALESCE(u.role, 'user') as role,
                (SELECT COUNT(*) FROM projects WHERE ownerId = u.id) as ownedProjects,
                (SELECT COUNT(*) FROM project_members WHERE userId = u.id) as memberProjects,
                (SELECT COUNT(*) FROM tasks WHERE createdById = u.id) as createdTasks,
                (SELECT MAX(created_at) FROM project_members WHERE userId = u.id) as lastActivity
            FROM users u
            ORDER BY u.created_at DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== LISTAR TODOS OS PROJETOS =====
router.get('/projects', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const projects = await db.query(`
            SELECT 
                p.*,
                u.name as owner_name,
                u.email as owner_email,
                (SELECT COUNT(*) FROM project_members WHERE projectId = p.id) as members_count,
                (SELECT COUNT(*) FROM tasks WHERE projectId = p.id) as tasks_count,
                (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND status = 'done') as completed_tasks,
                (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND dueDate < CURDATE() AND status != 'done') as overdue_tasks
            FROM projects p
            JOIN users u ON p.ownerId = u.id
            ORDER BY p.created_at DESC
        `);

        res.json(projects);
    } catch (error) {
        console.error('❌ Erro ao listar projetos:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== ATIVIDADE RECENTE =====
router.get('/activity', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        // Novos usuários
        const newUsers = await db.query(`
            SELECT 
                'user' as type,
                name as title,
                email as description,
                created_at as createdAt,
                id as referenceId
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // Novos projetos
        const newProjects = await db.query(`
            SELECT 
                'project' as type,
                p.name as title,
                CONCAT('Criado por ', u.name) as description,
                p.created_at as createdAt,
                p.id as referenceId
            FROM projects p
            JOIN users u ON p.ownerId = u.id
            ORDER BY p.created_at DESC 
            LIMIT 5
        `);

        // Novas tarefas
        const newTasks = await db.query(`
            SELECT 
                'task' as type,
                t.title,
                CONCAT('No projeto ', p.name) as description,
                t.created_at as createdAt,
                t.id as referenceId
            FROM tasks t
            JOIN projects p ON t.projectId = p.id
            ORDER BY t.created_at DESC 
            LIMIT 5
        `);

        // Comentários recentes
        const newComments = await db.query(`
            SELECT 
                'comment' as type,
                c.content as title,
                CONCAT('Por ', u.name) as description,
                c.created_at as createdAt,
                c.id as referenceId
            FROM comments c
            JOIN users u ON c.userId = u.id
            ORDER BY c.created_at DESC 
            LIMIT 5
        `);

        // Combinar e ordenar
        const allActivities = [
            ...newUsers.map(a => ({ ...a, icon: 'user-plus' })),
            ...newProjects.map(a => ({ ...a, icon: 'project-diagram' })),
            ...newTasks.map(a => ({ ...a, icon: 'tasks' })),
            ...newComments.map(a => ({ ...a, icon: 'comment' }))
        ];

        allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allActivities.slice(0, 10));
    } catch (error) {
        console.error('❌ Erro ao carregar atividades:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== SISTEMA - INFORMAÇÕES =====
router.get('/system', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        // Informações do banco
        const [dbSize] = await db.query(`
            SELECT 
                ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb,
                COUNT(DISTINCT table_name) as table_count
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        `);

        // Uptime do servidor
        const uptime = os.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        // Memória
        const totalMem = os.totalmem() / 1024 / 1024 / 1024;
        const freeMem = os.freemem() / 1024 / 1024 / 1024;
        const usedMem = totalMem - freeMem;

        // CPU
        const cpus = os.cpus();
        const cpuCount = cpus.length;
        const cpuModel = cpus[0].model;
        const loadAvg = os.loadavg();

        res.json({
            database: {
                size: dbSize.size_mb || 0,
                tables: dbSize.table_count || 0,
                status: 'online'
            },
            server: {
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                uptime: {
                    days,
                    hours,
                    minutes,
                    total: uptime
                },
                cpu: {
                    count: cpuCount,
                    model: cpuModel,
                    load: loadAvg
                },
                memory: {
                    total: totalMem.toFixed(2),
                    used: usedMem.toFixed(2),
                    free: freeMem.toFixed(2),
                    usagePercent: ((usedMem / totalMem) * 100).toFixed(1)
                }
            },
            node: {
                version: process.version,
                memory: process.memoryUsage()
            }
        });
    } catch (error) {
        console.error('❌ Erro ao carregar sistema:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== LOGS DO SISTEMA =====
router.get('/logs', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { level = 'all', date, limit = 50 } = req.query;

        // Garantir que limit seja um número válido
        const safeLimit = parseInt(limit) || 50;

        // Construir query SEM placeholders
        let query = 'SELECT * FROM system_logs WHERE 1=1';
        
        if (level && level !== 'all') {
            // Escapar aspas simples para evitar SQL injection
            const safeLevel = level.replace(/'/g, "''");
            query += ` AND level = '${safeLevel}'`;
        }

        if (date && date.trim() !== '') {
            const safeDate = date.replace(/'/g, "''");
            query += ` AND DATE(created_at) = '${safeDate}'`;
        }

        query += ' ORDER BY created_at DESC';
        query += ` LIMIT ${safeLimit}`;

        console.log('📝 Query logs:', query);

        // Executar query sem parâmetros
        const logs = await db.query(query);

        // Formatar logs para o frontend
        const formattedLogs = logs.map(log => ({
            id: log.id,
            level: log.level,
            message: log.message,
            user_id: log.user_id,
            userId: log.user_id,
            ip: log.ip,
            route: log.route,
            created_at: log.created_at
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('❌ Erro ao carregar logs:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;