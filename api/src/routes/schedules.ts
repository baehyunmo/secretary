import { Hono } from 'hono';

type Env = { Bindings: { DB: D1Database } };

const app = new Hono<Env>();

// 전체 일정 조회 (필터: exec_id, date_from, date_to)
app.get('/', async (c) => {
  const execId = c.req.query('exec_id');
  const dateFrom = c.req.query('date_from');
  const dateTo = c.req.query('date_to');

  let sql = `SELECT s.*, e.name as exec_name, e.position as exec_position
    FROM schedules s JOIN executives e ON s.exec_id = e.id WHERE 1=1`;
  const params: string[] = [];

  if (execId) { sql += ' AND s.exec_id = ?'; params.push(execId); }
  if (dateFrom) { sql += ' AND s.date >= ?'; params.push(dateFrom); }
  if (dateTo) { sql += ' AND s.date <= ?'; params.push(dateTo); }

  sql += ' ORDER BY s.date, s.time';

  const stmt = c.env.DB.prepare(sql);
  const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  return c.json(results);
});

// 오늘 일정
app.get('/today', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT s.*, e.name as exec_name, e.position as exec_position
     FROM schedules s JOIN executives e ON s.exec_id = e.id
     WHERE s.date = date('now') ORDER BY s.time`
  ).all();
  return c.json(results);
});

// 월별 일정 날짜 목록 (캘린더용)
app.get('/calendar/:year/:month', async (c) => {
  const { year, month } = c.req.param();
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;

  const { results } = await c.env.DB.prepare(
    `SELECT DISTINCT date FROM schedules WHERE date >= ? AND date <= ? ORDER BY date`
  ).bind(startDate, endDate).all();
  return c.json(results.map((r: any) => r.date));
});

// 일정 등록
app.post('/', async (c) => {
  const body = await c.req.json();
  const { exec_id, title, date, time, end_date, location, notes, type } = body;
  if (!exec_id || !title || !date) return c.json({ error: '임원, 제목, 날짜는 필수입니다' }, 400);

  const result = await c.env.DB.prepare(
    `INSERT INTO schedules (exec_id, title, date, time, end_date, location, notes, type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(exec_id, title, date, time || '', end_date || '', location || '', notes || '', type || 'meeting').run();

  const schedule = await c.env.DB.prepare(
    `SELECT s.*, e.name as exec_name, e.position as exec_position
     FROM schedules s JOIN executives e ON s.exec_id = e.id WHERE s.id = ?`
  ).bind(result.meta.last_row_id).first();
  return c.json(schedule, 201);
});

// 일정 수정
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { exec_id, title, date, time, end_date, location, notes, type } = body;

  await c.env.DB.prepare(
    `UPDATE schedules SET exec_id=?, title=?, date=?, time=?, end_date=?, location=?, notes=?, type=? WHERE id=?`
  ).bind(exec_id, title, date, time || '', end_date || '', location || '', notes || '', type || 'meeting', id).run();

  const schedule = await c.env.DB.prepare(
    `SELECT s.*, e.name as exec_name, e.position as exec_position
     FROM schedules s JOIN executives e ON s.exec_id = e.id WHERE s.id = ?`
  ).bind(id).first();
  return c.json(schedule);
});

// 일정 삭제
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM schedules WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;
