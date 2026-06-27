# Campus Placement Portal — MVP

MERN stack placement portal connecting students, recruiters, and the
placement cell. Black & white theme, role-based access, resume upload.

## Stack
- MongoDB + Mongoose
- Express (Node.js)
- React (Vite) + React Router
- JWT auth, bcrypt password hashing, Multer for resume PDFs

## Folder structure
```
campus-placement-portal/
├── server/        Express API
│   ├── src/
│   │   ├── models/        User, JobPosting, Application
│   │   ├── routes/        auth, students, jobs, applications
│   │   ├── middleware/    auth (JWT/RBAC), upload (Multer), errorHandler
│   │   └── config/        db.js, token.js
│   └── uploads/resumes/   uploaded resume PDFs (gitignored)
└── client/        React app
    └── src/
        ├── pages/student/     job browse, applications, profile
        ├── pages/recruiter/   job postings, applicants, scheduling
        ├── pages/admin/       application pipeline dashboard
        ├── context/           AuthContext
        └── api/               axios client
```

## Setup

### 1. Server
```bash
cd server
cp .env.example .env     # edit JWT_SECRET and MONGO_URI if needed
npm install
npm run dev               # http://localhost:5000
```
Requires a running MongoDB instance (local `mongod`, or update `MONGO_URI`
in `.env` to point at MongoDB Atlas or another host).

### 2. Client
```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

## Roles
On registration, choose one of:
- **Student** — build profile, upload resume, browse/apply to jobs, track status
- **Recruiter** — post jobs with eligibility criteria, view applicants, schedule interviews
- **Admin** (Placement Cell) — view all applications across all jobs, update status

## Notes on scope
This is an MVP. Deliberately out of scope for now: email notifications
(status changes are visible in-app only), multi-round interviews (single
status field), payment/offer-letter workflows. Resumes are stored on local
disk under `server/uploads/resumes/` — fine for development, but swap for
S3/Cloudinary before any real deployment.
