import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { SecretsService } from '../secrets/secrets.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly secretsService: SecretsService) {}

  async sendPasswordRecoveryCode(email: string, code: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Password recovery code',
      text: `Your password recovery code is: ${code}`,
    });
  }

  async sendProfileChangedEmail(oldEmail: string, newEmail: string): Promise<void> {
    await this.send({
      to: oldEmail,
      subject: 'Account data changed',
      text: 'Your account username or email was changed. If it was not you, contact support immediately.',
    });

    await this.send({
      to: newEmail,
      subject: 'Account data update confirmed',
      text: 'Your account information was successfully updated.',
    });
  }

  private async send(payload: { to: string; subject: string; text: string }): Promise<void> {
    try {
      const smtpSecrets = await this.secretsService.getSmtpSecrets();
      const transporter = createTransport({
        host: smtpSecrets.SMTP_HOST,
        port: smtpSecrets.SMTP_PORT,
        secure: false,
        auth: {
          user: smtpSecrets.SMTP_USER,
          pass: smtpSecrets.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: smtpSecrets.SMTP_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
      });
    } catch (error) {
      this.logger.error('Failed to send email', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Email service unavailable');
    }
  }
}
