-- 임원 테이블
CREATE TABLE IF NOT EXISTS executives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '기타',
  dept TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 일정 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exec_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  location TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  type TEXT DEFAULT 'meeting',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exec_id) REFERENCES executives(id) ON DELETE CASCADE
);

-- 출장 테이블
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exec_id INTEGER NOT NULL,
  from_code TEXT NOT NULL,
  to_code TEXT NOT NULL,
  from_name TEXT DEFAULT '',
  to_name TEXT DEFAULT '',
  date TEXT NOT NULL,
  return_date TEXT DEFAULT '',
  route TEXT DEFAULT '',
  hotel TEXT DEFAULT '',
  hotel_area TEXT DEFAULT '',
  transport_note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exec_id) REFERENCES executives(id) ON DELETE CASCADE
);
