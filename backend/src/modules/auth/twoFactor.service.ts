import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { IUser2FARepository } from '../user/interfaces/IUser2FARepository.js';
import { env } from '../../config/env.js';
import { comparePassword } from '../../utils/hash.js';

export class TwoFactorService {
    constructor(private readonly userRepo: IUser2FARepository) { }

    async generateSecret(userId: string, email: string) {
        const secret = speakeasy.generateSecret({
            name: `TaskForge:${email}`,
            issuer: 'TaskForge',
        });

        await this.userRepo.setTempTwoFactorSecret(userId, secret.base32);

        const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url!);

        const response: any = {
            otpauthUrl: secret.otpauth_url,
            qrCodeDataURL,
        };

        if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
            response.secret = secret.base32;
        }

        return response;
    }

    private generateBackupCodes(): { plainCodes: string[]; hashedCodes: string[] } {
        const plainCodes: string[] = [];
        const hashedCodes: string[] = [];

        for (let i = 0; i < 8; i++) {
            const raw = crypto.randomBytes(4).toString('hex').slice(0, 8).toUpperCase();
            const formatted = raw.slice(0, 4) + '-' + raw.slice(4, 8);
            plainCodes.push(formatted);
            hashedCodes.push(bcrypt.hashSync(formatted, 10));
        }

        return { plainCodes, hashedCodes };
    }

    async verifyAndEnable(userId: string, token: string): Promise<{ enabled: boolean; backupCodes?: string[] }> {
        const secretData = await this.userRepo.findTwoFactorSecret(userId);
        if (!secretData?.twoFactorSecret) {
            throw new Error('No pending 2FA configuration found');
        }

        const verified = speakeasy.totp.verify({
            secret: secretData.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2,
        });

        if (verified) {
            const { plainCodes, hashedCodes } = this.generateBackupCodes();
            await this.userRepo.enableTwoFactorWithBackupCodes(userId, hashedCodes);
            return { enabled: true, backupCodes: plainCodes };
        }
        return { enabled: false };
    }

    async validateBackupCode(userId: string, code: string): Promise<boolean> {
        const hashes = await this.userRepo.getBackupCodesHashes(userId);
        for (const hash of hashes) {
            if (bcrypt.compareSync(code, hash)) {
                await this.userRepo.removeBackupCode(userId, hash);
                return true;
            }
        }
        return false;
    }

    async regenerateBackupCodes(userId: string): Promise<string[]> {
        const { plainCodes, hashedCodes } = this.generateBackupCodes();
        await this.userRepo.enableTwoFactorWithBackupCodes(userId, hashedCodes);
        return plainCodes;
    }

    async validateToken(userId: string, token: string): Promise<boolean> {
        const secretData = await this.userRepo.findTwoFactorSecret(userId);
        if (!secretData?.twoFactorSecret || !secretData.twoFactorEnabled) {
            return false;
        }

        return speakeasy.totp.verify({
            secret: secretData.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2,
        });
    }

    async disable(userId: string): Promise<void> {
        await this.userRepo.disableTwoFactor(userId);
    }

    async disableWithPassword(userId: string, password: string): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user || !user.password) {
            throw new Error('User not found or no password set (OAuth account)');
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        await this.userRepo.disableTwoFactor(userId);
    }
}