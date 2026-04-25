import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { HashService } from '../../infrastructure/crypto/hash.service';
import { EmailModule } from '../../infrastructure/email/email.module';
import { SessionsModule } from '../sessions/sessions.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Code, CodeSchema } from './schemas/code.schema';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Code.name, schema: CodeSchema },
    ]),
    SessionsModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, HashService],
  exports: [AuthService],
})
export class AuthModule {}
