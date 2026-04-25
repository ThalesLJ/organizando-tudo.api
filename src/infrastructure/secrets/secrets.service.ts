import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Secret, type SecretDocument } from './schemas/secret.schema';

const requiredSmtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] as const;

type SmtpKey = (typeof requiredSmtpKeys)[number];

export interface SmtpSecrets {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
}

@Injectable()
export class SecretsService {
  constructor(@InjectModel(Secret.name) private readonly secretModel: Model<SecretDocument>) {}

  async getSmtpSecrets(): Promise<SmtpSecrets> {
    const documents = await this.secretModel.find({ key: { $in: requiredSmtpKeys } }).lean();
    const map = new Map(documents.map((document) => [document.key, document.value]));

    requiredSmtpKeys.forEach((key: SmtpKey) => {
      if (!map.get(key)) {
        throw new InternalServerErrorException('Email service unavailable');
      }
    });

    const smtpPort = Number(map.get('SMTP_PORT'));
    if (Number.isNaN(smtpPort) || smtpPort <= 0) {
      throw new InternalServerErrorException('Email service unavailable');
    }

    return {
      SMTP_HOST: map.get('SMTP_HOST') as string,
      SMTP_PORT: smtpPort,
      SMTP_USER: map.get('SMTP_USER') as string,
      SMTP_PASS: map.get('SMTP_PASS') as string,
      SMTP_FROM: map.get('SMTP_FROM') as string,
    };
  }
}
