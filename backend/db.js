// Synergy Reader - database layer (SQLite, built into Node.js 22+)
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'synergy.db');
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// run several SQL statements as one unit: all succeed or none are saved
function transaction(work) {
  db.exec('BEGIN');
  try { const result = work(); db.exec('COMMIT'); return result; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

/* ---------- books and chapters (fixed data, filled once) ---------- */
const BOOKS = JSON.parse(fs.readFileSync(path.join(__dirname, 'books.json'), 'utf8'));
transaction(() => {
  const addBook = db.prepare('INSERT OR REPLACE INTO book VALUES (?, ?, ?, ?)');
  const addChapter = db.prepare('INSERT OR REPLACE INTO chapter VALUES (?, ?, ?, ?, ?)');
  for (const b of BOOKS) {
    addBook.run(b.id, b.title, b.start, b.end);
    for (const c of b.chapters) addChapter.run(b.id, c.no, c.title, c.first, c.last);
  }
});
const BOOK_IDS = new Set(BOOKS.map(b => b.id));

function listBooks() {
  const chapters = db.prepare('SELECT * FROM chapter ORDER BY book_id, chapter_no').all();
  return db.prepare('SELECT * FROM book').all()
    .map(b => ({ ...b, chapters: chapters.filter(c => c.book_id === b.book_id) }));
}

/* ---------- save: the browser sends its whole state, we store it in the tables ---------- */
function saveState(S) {
  if (!S || !Array.isArray(S.users)) throw new Error('Invalid data: users list missing');
  transaction(() => {
    for (const t of ['quiz_flag', 'quiz_result', 'annotation', 'note', 'daily_log', 'student_book', 'student', 'setting'])
      db.exec('DELETE FROM ' + t);

    const setting = db.prepare('INSERT INTO setting VALUES (?, ?)');
    setting.run('ppd', String(S.ppd || 20));
    setting.run('theme', S.theme || '');
    setting.run('pal', S.pal || '');
    setting.run('cur', S.cur || '');

    const addStudent = db.prepare('INSERT INTO student VALUES (?, ?, ?)');
    const addShelf = db.prepare('INSERT INTO student_book VALUES (?, ?, ?, ?, ?)');
    const addNote = db.prepare('INSERT INTO note (student_id, book_id, position, type, content, important) VALUES (?, ?, ?, ?, ?, ?)');
    const addAnn = db.prepare('INSERT INTO annotation (student_id, book_id, page_no, position, tool, colour, shape) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const addQuiz = db.prepare('INSERT INTO quiz_result (student_id, book_id, chapter_no, stars, score, total, taken_at, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const addFlag = db.prepare('INSERT INTO quiz_flag (student_id, book_id, chapter_no, kind, question) VALUES (?, ?, ?, ?, ?)');
    const addDay = db.prepare('INSERT INTO daily_log VALUES (?, ?, ?)');

    for (const u of S.users) {
      addStudent.run(u.id, u.name, u.av);

      // one row per book the student has used (shelf, current page, map position)
      const ids = new Set([...(u.books || []), ...Object.keys(u.pos || {}), ...Object.keys(u.at || {})]);
      for (const id of ids)
        if (BOOK_IDS.has(id))
          addShelf.run(u.id, id, u.pos?.[id] || 0, u.at?.[id] || 0, (u.books || []).includes(id) ? 1 : 0);

      for (const [bk, list] of Object.entries(u.log || {}))            // notes
        if (BOOK_IDS.has(bk))
          list.filter(e => !e.tmp).forEach((e, i) => addNote.run(u.id, bk, i, e.k, String(e.x), e.imp ? 1 : 0));

      for (const [key, list] of Object.entries(u.ann || {})) {          // highlights, underlines, pen
        const [bk, page] = key.split(':');
        if (BOOK_IDS.has(bk))
          list.forEach((a, i) => { const { t, c, ...shape } = a; addAnn.run(u.id, bk, +page, i, t, c, JSON.stringify(shape)); });
      }

      const quizKeys = new Set([...Object.keys(u.qs || {}), ...Object.keys(u.hist || {}), ...Object.keys(u.qd || {})]);
      for (const key of quizKeys) {                                     // quiz results
        const [bk, ci] = key.split(':'), h = u.hist?.[key], q = u.qd?.[key];
        if (BOOK_IDS.has(bk))
          addQuiz.run(u.id, bk, +ci + 1, u.qs?.[key] || 0, h ? h.s : null, h ? h.n : null, h ? h.d : null, q ? JSON.stringify(q) : null);
      }

      for (const [kind, list] of [['mistake', u.mist || []], ['important', u.imp || []]])
        for (const m of list) {                                         // mistakes and important questions
          const { bk, ci, ...question } = m;
          if (BOOK_IDS.has(bk)) addFlag.run(u.id, bk, ci + 1, kind, JSON.stringify(question));
        }

      for (const [date, pages] of Object.entries(u.days || {})) addDay.run(u.id, date, pages);
    }
  });
}

/* ---------- load: read the tables and rebuild the object the browser expects ---------- */
function loadState() {
  const students = db.prepare('SELECT * FROM student ORDER BY rowid').all();
  const setting = Object.fromEntries(db.prepare('SELECT * FROM setting').all().map(r => [r.setting_key, r.setting_value]));
  if (!students.length && !Object.keys(setting).length) return {};

  const S = { ppd: +setting.ppd || 20, theme: setting.theme || '', pal: setting.pal || '', cur: setting.cur || null, users: [] };
  for (const s of students) {
    const u = { id: s.student_id, name: s.name, av: s.avatar, books: [], pos: {}, at: {}, log: {}, ann: {},
                qs: {}, hist: {}, qd: {}, mist: [], imp: [], days: {}, daily: { d: '', n: 0 } };
    const rows = (sql) => db.prepare(sql).all(s.student_id);

    for (const r of rows('SELECT * FROM student_book WHERE student_id = ?')) {
      if (r.on_shelf) u.books.push(r.book_id);
      if (r.current_page) u.pos[r.book_id] = r.current_page;
      if (r.map_level) u.at[r.book_id] = r.map_level;
    }
    for (const r of rows('SELECT * FROM note WHERE student_id = ? ORDER BY book_id, position')) {
      const e = { k: r.type, x: r.content };
      if (r.important) e.imp = true;
      (u.log[r.book_id] = u.log[r.book_id] || []).push(e);
    }
    for (const r of rows('SELECT * FROM annotation WHERE student_id = ? ORDER BY book_id, page_no, position')) {
      const key = r.book_id + ':' + r.page_no;
      (u.ann[key] = u.ann[key] || []).push({ t: r.tool, c: r.colour, ...JSON.parse(r.shape) });
    }
    for (const r of rows('SELECT * FROM quiz_result WHERE student_id = ?')) {
      const key = r.book_id + ':' + (r.chapter_no - 1);
      u.qs[key] = r.stars;
      if (r.total !== null) u.hist[key] = { s: r.score, n: r.total, d: r.taken_at };
      if (r.questions) u.qd[key] = JSON.parse(r.questions);
    }
    for (const r of rows('SELECT * FROM quiz_flag WHERE student_id = ? ORDER BY flag_id')) {
      (r.kind === 'mistake' ? u.mist : u.imp).push({ bk: r.book_id, ci: r.chapter_no - 1, ...JSON.parse(r.question) });
    }
    for (const r of rows('SELECT * FROM daily_log WHERE student_id = ? ORDER BY log_date')) {
      u.days[r.log_date] = r.pages_read;
      const [y, m, d] = r.log_date.split('-').map(Number);           // the newest day = "today's" counter
      u.daily = { d: new Date(y, m - 1, d).toDateString(), n: r.pages_read };
    }
    S.users.push(u);
  }
  return S;
}

/* ---------- one-time import of the old data/state.json (from the earlier JSON-file version) ---------- */
(function importOldFile() {
  const old = path.join(__dirname, 'data', 'state.json');
  if (!fs.existsSync(old) || db.prepare('SELECT COUNT(*) AS n FROM student').get().n > 0) return;
  try { saveState(JSON.parse(fs.readFileSync(old, 'utf8'))); fs.renameSync(old, old + '.imported'); console.log('Old state.json imported into the database'); }
  catch (e) { console.log('Could not import old state.json:', e.message); }
})();

module.exports = { loadState, saveState, listBooks, DB_FILE };
