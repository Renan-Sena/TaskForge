import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const User = {
    async create({ name, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();
        
        await db.query(
            `INSERT INTO users (id, name, email, password, avatar) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, name, email, hashedPassword, `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`]
        );
        
        return this.findById(id);
    },

    async findByEmail(email) {
        const user = await db.queryOne(
            'SELECT id, name, email, password, avatar, created_at as createdAt FROM users WHERE email = ?', 
            [email]
        );
        return user;
    },

    async findById(id) {
        const user = await db.queryOne(
            'SELECT id, name, email, avatar, created_at as createdAt FROM users WHERE id = ?', 
            [id]
        );
        return user;
    },

    async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
};