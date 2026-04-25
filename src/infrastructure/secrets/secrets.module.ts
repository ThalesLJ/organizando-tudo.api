import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Secret, SecretSchema } from './schemas/secret.schema';
import { SecretsService } from './secrets.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Secret.name, schema: SecretSchema }])],
  providers: [SecretsService],
  exports: [SecretsService],
})
export class SecretsModule {}
