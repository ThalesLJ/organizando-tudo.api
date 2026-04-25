import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    const isDatabaseConnected = this.connection.readyState === 1;

    return {
      status: isDatabaseConnected ? 'ok' : 'degraded',
      database: isDatabaseConnected ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
