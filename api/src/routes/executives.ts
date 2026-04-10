import { Hono } from 'hono';

type Env = { Bindings: { DB: D1Database } };

const app = new Hono<Env>();

// 전체 임원 조회
app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT e.*,
      (SELECT COUNT(*) FROM schedules s WHERE s.exec_id = e.id AND s.date >= date('now')) as upcoming_schedules,
      (SELECT COUNT(*) FROM trips t WHERE t.exec_id = e.id AND t.date >= date('now')) as upcoming_trips
    FROM executives e ORDER BY
      CASE e.position
        WHEN '회장' THEN 1 WHEN '부회장' THEN 2 WHEN '대표이사' THEN 3
        WHEN '사장' THEN 4 WHEN '부사장' THEN 5 WHEN '전무' THEN 6
        WHEN '상무' THEN 7 WHEN '이사' THEN 8 ELSE 9 END`
  ).all();
  return c.json(results);
});

// 임원 상세 조회
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const exec = await c.env.DB.prepare('SELECT * FROM executives WHERE id = ?').bind(id).first();
  if (!exec) return c.json({ error: '임원을 찾을 수 없습니다' }, 404);

  const { results: schedules } = await c.env.DB.prepare(
    'SELECT * FROM schedules WHERE exec_id = ? AND date >= date("now") ORDER BY date, time'
  ).bind(id).all();

  const { results: trips } = await c.env.DB.prepare(
    'SELECT * FROM trips WHERE exec_id = ? AND date >= date("now") ORDER BY date'
  ).bind(id).all();

  return c.json({ ...exec, schedules, trips });
});

// 임원 등록
app.post('/', async (c) => {
  const body = await c.req.json();
  const { name, position, dept, phone, email, note } = body;
  if (!name) return c.json({ error: '이름은 필수입니다' }, 400);

  const result = await c.env.DB.prepare(
    'INSERT INTO executives (name, position, dept, phone, email, note) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(name, position || '기타', dept || '', phone || '', email || '', note || '').run();

  const exec = await c.env.DB.prepare('SELECT * FROM executives WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return c.json(exec, 201);
});

// 임원 수정
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { name, position, dept, phone, email, note } = body;

  await c.env.DB.prepare(
    'UPDATE executives SET name = ?, position = ?, dept = ?, phone = ?, email = ?, note = ? WHERE id = ?'
  ).bind(name, position, dept || '', phone || '', email || '', note || '', id).run();

  const exec = await c.env.DB.prepare('SELECT * FROM executives WHERE id = ?').bind(id).first();
  return c.json(exec);
});

// 임원 삭제
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM executives WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

export default app;
