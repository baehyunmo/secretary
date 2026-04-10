import { Hono } from 'hono';
import { cors } from 'hono/cors';
import executives from './routes/executives';
import schedules from './routes/schedules';
import trips from './routes/trips';

type Env = { Bindings: { DB: D1Database } };

const app = new Hono<Env>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

app.route('/api/executives', executives);
app.route('/api/schedules', schedules);
app.route('/api/trips', trips);

// 통계 API (대시보드용)
app.get('/api/stats', async (c) => {
  const totalExecs = await c.env.DB.prepare('SELECT COUNT(*) as count FROM executives').first();
  const upcomingSchedules = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM schedules WHERE date >= date('now')"
  ).first();
  const upcomingTrips = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM trips WHERE date >= date('now')"
  ).first();
  const thisMonth = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM schedules WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')"
  ).first();

  return c.json({
    totalExecs: (totalExecs as any)?.count || 0,
    upcomingSchedules: (upcomingSchedules as any)?.count || 0,
    upcomingTrips: (upcomingTrips as any)?.count || 0,
    thisMonth: (thisMonth as any)?.count || 0,
  });
});

// 헬스 체크
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default app;
