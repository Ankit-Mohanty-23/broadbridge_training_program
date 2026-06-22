/* ============================================
   Student Portal — Storage Engine
   Acts like a JSON "database file" using
   localStorage under the hood, with
   import / export to a real .json file.
   ============================================ */

const DB_KEY = "student_portal_db";

/* Default database shape */
const DEFAULT_DB = {
  students: [],   // {id, name, email, rollNo, password, createdAt}
  events: [],     // {id, title, description, date, venue, seats, registered:[]}
  feedback: [],   // {id, studentEmail, studentName, eventId, rating, message, createdAt}
  attendance: [], // {id, eventId, studentEmail, studentName, status, markedAt}
  nextIds: { student: 1, event: 1, feedback: 1, attendance: 1 }
};

/* Seed a few sample events the first time the site loads */
const SEED_EVENTS = [
  {
    title: "Annual Tech Symposium",
    description: "A full day of talks on AI, web development, and emerging technologies, hosted by final year CSE students.",
    date: "2026-07-10",
    venue: "Main Auditorium",
    seats: 120
  },
  {
    title: "Inter-College Hackathon",
    description: "24-hour build sprint. Teams of up to 4. Prizes for best overall project and best UI.",
    date: "2026-07-18",
    venue: "Innovation Lab, Block C",
    seats: 80
  },
  {
    title: "Career Guidance Workshop",
    description: "Resume reviews, mock interviews, and a Q&A session with alumni working in product and engineering roles.",
    date: "2026-08-02",
    venue: "Seminar Hall 2",
    seats: 60
  }
];

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = structuredClone(DEFAULT_DB);
    SEED_EVENTS.forEach(e => {
      fresh.events.push({
        id: fresh.nextIds.event++,
        registered: [],
        ...e
      });
    });
    saveDB(fresh);
    return fresh;
  }
  try {
    const db = JSON.parse(raw);
    // Migrate older saved data that predates the attendance feature
    if (!db.attendance) db.attendance = [];
    if (!db.nextIds.attendance) db.nextIds.attendance = 1;
    return db;
  } catch (e) {
    console.error("Corrupt DB, resetting.", e);
    const fresh = structuredClone(DEFAULT_DB);
    saveDB(fresh);
    return fresh;
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/* ---------- Students ---------- */
function registerStudent({ name, email, rollNo, password }) {
  const db = loadDB();
  email = email.trim().toLowerCase();

  if (db.students.some(s => s.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  if (db.students.some(s => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase())) {
    return { ok: false, error: "An account with this roll number already exists." };
  }

  const student = {
    id: db.nextIds.student++,
    name: name.trim(),
    email,
    rollNo: rollNo.trim(),
    password, // plain text — fine for a local demo, never do this in production
    createdAt: new Date().toISOString()
  };
  db.students.push(student);
  saveDB(db);
  return { ok: true, student };
}

function loginStudent({ email, password }) {
  const db = loadDB();
  email = email.trim().toLowerCase();
  const student = db.students.find(s => s.email === email);
  if (!student) return { ok: false, error: "No account found with that email." };
  if (student.password !== password) return { ok: false, error: "Incorrect password." };
  return { ok: true, student };
}

function getCurrentStudent() {
  const raw = sessionStorage.getItem("current_student");
  return raw ? JSON.parse(raw) : null;
}

function setCurrentStudent(student) {
  sessionStorage.setItem("current_student", JSON.stringify(student));
}

function logoutStudent() {
  sessionStorage.removeItem("current_student");
}

function requireLogin() {
  const student = getCurrentStudent();
  if (!student) {
    window.location.href = "index.html";
    return null;
  }
  return student;
}

/* ---------- Events ---------- */
function getEvents() {
  return loadDB().events;
}

function getEvent(id) {
  return loadDB().events.find(e => e.id === Number(id));
}

function registerForEvent(eventId, studentEmail) {
  const db = loadDB();
  const event = db.events.find(e => e.id === Number(eventId));
  if (!event) return { ok: false, error: "Event not found." };
  if (event.registered.includes(studentEmail)) {
    return { ok: false, error: "You are already registered for this event." };
  }
  if (event.registered.length >= event.seats) {
    return { ok: false, error: "This event is full." };
  }
  event.registered.push(studentEmail);
  saveDB(db);
  return { ok: true, event };
}

function unregisterFromEvent(eventId, studentEmail) {
  const db = loadDB();
  const event = db.events.find(e => e.id === Number(eventId));
  if (!event) return { ok: false, error: "Event not found." };
  event.registered = event.registered.filter(em => em !== studentEmail);
  saveDB(db);
  return { ok: true, event };
}

/* ---------- Attendance ---------- */

// Get the attendance record for one student at one event, if it exists
function getAttendanceRecord(eventId, studentEmail) {
  const db = loadDB();
  return db.attendance.find(
    a => a.eventId === Number(eventId) && a.studentEmail === studentEmail
  );
}

// Get every attendance record for a given event
function getAttendanceForEvent(eventId) {
  const db = loadDB();
  return db.attendance.filter(a => a.eventId === Number(eventId));
}

// Mark / update a single student's attendance status for an event.
// status is one of: "present", "absent"
function markAttendance(eventId, studentEmail, studentName, status) {
  const db = loadDB();
  eventId = Number(eventId);

  const event = db.events.find(e => e.id === eventId);
  if (!event) return { ok: false, error: "Event not found." };
  if (!event.registered.includes(studentEmail)) {
    return { ok: false, error: "This student is not registered for the event." };
  }

  let record = db.attendance.find(
    a => a.eventId === eventId && a.studentEmail === studentEmail
  );

  if (record) {
    // already has a record for this event — just update it
    record.status = status;
    record.markedAt = new Date().toISOString();
  } else {
    // no record yet — create a new one
    record = {
      id: db.nextIds.attendance++,
      eventId,
      studentEmail,
      studentName,
      status,
      markedAt: new Date().toISOString()
    };
    db.attendance.push(record);
  }

  saveDB(db);
  return { ok: true, record };
}

// Build a ready-to-render list of every registered student for an event,
// each paired with their current attendance status ("present" / "absent" / "unmarked")
function getAttendanceRoster(eventId) {
  const db = loadDB();
  eventId = Number(eventId);
  const event = db.events.find(e => e.id === eventId);
  if (!event) return [];

  return event.registered.map(email => {
    const student = db.students.find(s => s.email === email);
    const record = db.attendance.find(
      a => a.eventId === eventId && a.studentEmail === email
    );
    return {
      email,
      name: student ? student.name : email,
      rollNo: student ? student.rollNo : "—",
      status: record ? record.status : "unmarked",
      markedAt: record ? record.markedAt : null
    };
  });
}

// Quick summary counts for an event: how many present / absent / unmarked
function getAttendanceSummary(eventId) {
  const roster = getAttendanceRoster(eventId);
  return {
    total: roster.length,
    present: roster.filter(r => r.status === "present").length,
    absent: roster.filter(r => r.status === "absent").length,
    unmarked: roster.filter(r => r.status === "unmarked").length
  };
}


function addFeedback({ studentEmail, studentName, eventId, rating, message }) {
  const db = loadDB();
  const entry = {
    id: db.nextIds.feedback++,
    studentEmail,
    studentName,
    eventId: eventId ? Number(eventId) : null,
    rating: Number(rating),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };
  db.feedback.push(entry);
  saveDB(db);
  return { ok: true, entry };
}

function getFeedbackForStudent(email) {
  return loadDB().feedback.filter(f => f.studentEmail === email);
}

/* ---------- Export / Import full JSON "file" ---------- */
function exportDB() {
  const db = loadDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_portal_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDB(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.students || !data.events || !data.feedback) {
        throw new Error("Invalid data file.");
      }
      if (!data.attendance) data.attendance = [];
      saveDB(data);
      callback(true);
    } catch (err) {
      console.error(err);
      callback(false);
    }
  };
  reader.readAsText(file);
}

/* ---------- Nav helper: shows logged in user + logout on every page ---------- */
function renderNavUser() {
  const el = document.getElementById("nav-user");
  if (!el) return;
  const student = getCurrentStudent();
  if (student) {
    el.innerHTML = `${escapeHTML(student.name)} (${escapeHTML(student.rollNo)}) &nbsp;|&nbsp; <a href="#" id="logout-link">Logout</a>`;
    document.getElementById("logout-link").addEventListener("click", function (e) {
      e.preventDefault();
      logoutStudent();
      window.location.href = "index.html";
    });
  } else {
    el.innerHTML = `<a href="index.html">Login</a>`;
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

document.addEventListener("DOMContentLoaded", renderNavUser);
