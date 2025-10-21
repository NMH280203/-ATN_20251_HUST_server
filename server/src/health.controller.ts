// server/src/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

const READY_STATE_TEXT: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

@Controller('health') // base path
export class HealthController {
  constructor(@InjectConnection() private readonly conn: Connection) {}

  // GET /health
  @Get()
  root() {
    return { ok: true, message: 'API is alive' };
  }

  // GET /health/db
  @Get('db')
  async db() {
    const state = READY_STATE_TEXT[this.conn.readyState] ?? 'unknown';

    // Guard: đảm bảo có handle DB
    const db = this.conn.db;
    if (!db) {
      return { ok: false, state, error: 'No DB handle (not connected yet)' };
    }

    try {
      // Ping trực tiếp Mongo
      await db.admin().command({ ping: 1 });
      return { ok: true, state };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, state, error: msg };
    }
  }
}
