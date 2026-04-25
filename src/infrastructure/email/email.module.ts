import { Module } from '@nestjs/common';
import { SecretsModule } from '../secrets/secrets.module';
import { EmailService } from './email.service';

@Module({
  imports: [SecretsModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
