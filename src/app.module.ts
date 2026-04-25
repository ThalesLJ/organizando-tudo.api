import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnvironment } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { HealthModule } from './modules/health/health.module';
import { NotesModule } from './modules/notes/notes.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    SessionsModule,
    AuthModule,
    UsersModule,
    NotesModule,
    BudgetsModule,
    ExpensesModule,
    HealthModule,
  ],
})
export class AppModule {}
