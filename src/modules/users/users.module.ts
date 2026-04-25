import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HashService } from '../../infrastructure/crypto/hash.service';
import { EmailModule } from '../../infrastructure/email/email.module';
import { SessionsModule } from '../sessions/sessions.module';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), SessionsModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule {}
