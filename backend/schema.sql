-- Synergy Reader database (SQLite). Created automatically when the server starts.

CREATE TABLE IF NOT EXISTS book (
  book_id     TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  start_page  INTEGER NOT NULL,
  end_page    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chapter (
  book_id     TEXT NOT NULL REFERENCES book(book_id),
  chapter_no  INTEGER NOT NULL,
  title       TEXT NOT NULL,
  first_page  INTEGER NOT NULL,
  last_page   INTEGER NOT NULL,
  PRIMARY KEY (book_id, chapter_no)
);

CREATE TABLE IF NOT EXISTS student (
  student_id  TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  avatar      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_book (
  student_id    TEXT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  book_id       TEXT NOT NULL REFERENCES book(book_id),
  current_page  INTEGER NOT NULL DEFAULT 0,
  map_level     INTEGER NOT NULL DEFAULT 0,
  on_shelf      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (student_id, book_id)
);

CREATE TABLE IF NOT EXISTS note (
  note_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  book_id     TEXT NOT NULL REFERENCES book(book_id),
  position    INTEGER NOT NULL,
  type        TEXT NOT NULL,            -- n = note, q = question, a = AI answer, i = image
  content     TEXT NOT NULL,
  important   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS annotation (
  ann_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  book_id     TEXT NOT NULL REFERENCES book(book_id),
  page_no     INTEGER NOT NULL,
  position    INTEGER NOT NULL,
  tool        TEXT NOT NULL,            -- h = highlight, u = underline, p = pen
  colour      TEXT NOT NULL,
  shape       TEXT NOT NULL             -- position/size of the mark as JSON
);

CREATE TABLE IF NOT EXISTS quiz_result (
  result_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  book_id     TEXT NOT NULL REFERENCES book(book_id),
  chapter_no  INTEGER NOT NULL,
  stars       INTEGER NOT NULL DEFAULT 0,
  score       INTEGER,
  total       INTEGER,
  taken_at    INTEGER,                  -- time of the last attempt (milliseconds)
  questions   TEXT,                     -- the 5 questions as JSON, used for "Retake"
  UNIQUE (student_id, book_id, chapter_no)
);

CREATE TABLE IF NOT EXISTS quiz_flag (
  flag_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  book_id     TEXT NOT NULL REFERENCES book(book_id),
  chapter_no  INTEGER NOT NULL,
  kind        TEXT NOT NULL,            -- mistake or important
  question    TEXT NOT NULL             -- question, options, answer and reason as JSON
);

CREATE TABLE IF NOT EXISTS daily_log (
  student_id  TEXT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  log_date    TEXT NOT NULL,            -- YYYY-MM-DD
  pages_read  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (student_id, log_date)
);

CREATE TABLE IF NOT EXISTS setting (
  setting_key    TEXT PRIMARY KEY,      -- ppd (pages per day), theme, pal (colour), cur (current student)
  setting_value  TEXT NOT NULL
);
