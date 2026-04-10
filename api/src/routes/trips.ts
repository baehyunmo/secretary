import { Hono } from 'hono';

type Env = { Bindings: { DB: D1Database } };

const app = new Hono<Env>();

// 전체 출장 조회
app.get('/', async (c) => {
  const execId = c.req.query('exec_id');
  let sql = `SELECT t.*, e.name as exec_name, e.position as exec_position
    FROM trips t JOIN executives e ON t.exec_id = e.id WHERE 1=1`;
  const params: string[] = [];

  if (execId) { sql += ' AND t.exec_id = ?'; params.push(execId); }
  sql += ' ORDER BY t.date DESC';

  const stmt = c.env.DB.prepare(sql);
  const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  return c.json(results);
});

// 예정된 출장
app.get('/upcoming', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT t.*, e.name as exec_name, e.position as exec_position
     FROM trips t JOIN executives e ON t.exec_id = e.id
     WHERE t.date >= date('now') ORDER BY t.date`
  ).all();
  return c.json(results);
});

// 출장 등록
app.post('/', async (c) => {
  const body = await c.req.json();
  const { exec_id, from_code, to_code, from_name, to_name, date, return_date, route, hotel, hotel_area, transport_note } = body;
  if (!exec_id || !from_code || !to_code || !date) {
    return c.json({ error: '임원, 출발지, 도착지, 출발일은 필수입니다' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO trips (exec_id, from_code, to_code, from_name, to_name, date, return_date, route, hotel, hotel_area, transport_note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(exec_id, from_code, to_code, from_name || '', to_name || '', date, return_date || '', route || '', hotel || '', hotel_area || '', transport_note || '').run();

  // 일정에도 자동 등록
  await c.env.DB.prepare(
    `INSERT INTO schedules (exec_id, title, date, end_date, location, notes, type)
     VALUES (?, ?, ?, ?, ?, ?, 'trip')`
  ).bind(exec_id, `해외 출장: ${to_name || to_code}`, date, return_date || '', `${from_name || from_code} → ${to_name || to_code}`, `노선: ${route || '미정'} | 호텔: ${hotel || '미정'}`).run();

  const trip = await c.env.DB.prepare(
    `SELECT t.*, e.name as exec_name, e.position as exec_position
     FROM trips t JOIN executives e ON t.exec_id = e.id WHERE t.id = ?`
  ).bind(result.meta.last_row_id).first();
  return c.json(trip, 201);
});

// 출장 삭제
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM trips WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;
