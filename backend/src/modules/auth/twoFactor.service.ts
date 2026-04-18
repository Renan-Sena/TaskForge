import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import type { IUser2FARepository } from '../user/interfaces/IUserRepository.js';
import { env } from '../../config/env.js';

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

    async verifyAndEnable(userId: string, token: string): Promise<boolean> {

        const secretData = await this.userRepo.findTwoFactorSecret(userId);
        console.log('Secret descriptografado:', secretData?.twoFactorSecret);
        console.log('Token recebido:', token);
        if (!secretData?.twoFactorSecret) {
            throw new Error('Nenhuma configuração 2FA pendente encontrada');
        }

        const verified = speakeasy.totp.verify({
            secret: secretData.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2,
        });

        if (verified) {
            await this.userRepo.enableTwoFactor(userId);
            return true;
        }
        return false;
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
}