import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HashService } from '../../infrastructure/crypto/hash.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SessionsService } from './sessions.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [SessionsService, HashService],
  exports: [SessionsService],
})
export class SessionsModule {}
