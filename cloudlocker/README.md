# CloudLocker

A private, per-user file locker. Register an account, log in, upload files,
and delete them — backed by AWS S3 for storage and DynamoDB for metadata
and users. MVC-structured Express backend + React (Vite) frontend. Deploys
to a single EC2 instance behind CloudFront. See the full build guide for
the AWS console steps (IAM, S3, DynamoDB, EC2, CloudFront) — this repo is
just the app code.

## What it does

- Create an account / log in (JWT-based auth, passwords hashed with bcrypt)
- Upload a file — goes straight from your browser to S3 via a presigned URL
- See a list of **only your own** files
- Download or delete any file you own
- Deleting removes both the S3 object and its DynamoDB metadata row

## Project structure

```
cloudlocker/
├── backend/
│   ├── server.js                 # entry point
│   ├── .env.example              # copy to .env and fill in
│   └── src/
│       ├── app.js                # express app + route mounting
│       ├── config/awsClients.js  # S3 / DynamoDB SDK clients
│       ├── controllers/          # request handlers (auth, files)
│       ├── middleware/           # JWT auth middleware
│       ├── models/               # DynamoDB data access (User, File)
│       └── routes/               # express routers
└── frontend/
    ├── index.html
    ├── vite.config.js            # proxies /api to backend in dev
    └── src/
        ├── main.jsx
        ├── App.jsx               # routes: /login /register /dashboard
        ├── api/client.js         # axios instance, attaches JWT
        ├── pages/                # LoginPage, RegisterPage, DashboardPage
        └── components/           # UploadForm, FileList
```

## Prerequisites (AWS side)

You need these already created (see the AWS build guide):
- An S3 bucket (private, "block all public access" ON)
- Two DynamoDB tables: `Users` (partition key `username`) and `Files` (partition key `id`)
- Either:
  - **Local dev**: an IAM access key/secret for your AWS user, or
  - **EC2 deploy**: an IAM role attached to the instance with S3 + DynamoDB permissions

## Running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=4000
AWS_REGION=us-east-2
S3_BUCKET=your-actual-bucket-name
JWT_SECRET=<run: openssl rand -hex 32>
AWS_ACCESS_KEY_ID=<your local IAM access key>
AWS_SECRET_ACCESS_KEY=<your local IAM secret key>
```

```bash
npm run dev
```

Backend runs at `http://localhost:4000`. Visit `http://localhost:4000/api/health`
to confirm it's up.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies all `/api/*` calls to
the backend on port 4000 (configured in `vite.config.js`). Open that URL,
register a user, log in, upload a file, then download or delete it.

## API summary

All `/api/files/*` routes require `Authorization: Bearer <token>`.

| Method | Path                        | Does                                      |
|--------|-----------------------------|--------------------------------------------|
| POST   | `/api/register`             | Create an account                          |
| POST   | `/api/login`                | Log in, returns a JWT                      |
| POST   | `/api/files/upload-url`     | Get a presigned S3 PUT URL + create record |
| GET    | `/api/files`                | List your own files                        |
| GET    | `/api/files/download-url/:id` | Get a presigned S3 GET URL for one file  |
| DELETE | `/api/files/:id`            | Delete the S3 object + its DynamoDB record |

## Deploying to EC2

1. Copy both `backend/` and `frontend/` folders to your EC2 instance
   (`scp -i your-key.pem -r cloudlocker ubuntu@<EC2-IP>:~/app`)
2. On the instance:
   ```bash
   cd ~/app/frontend
   npm install
   npm run build          # outputs static files to frontend/dist

   cd ~/app/backend
   npm install
   ```
3. Serve the built frontend from Express by adding one line to
   `backend/src/app.js` (above the API routes):
   ```javascript
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../../frontend/dist')));
   ```
4. On EC2, don't create a `.env` with access keys — leave
   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` unset entirely. The
   attached IAM role provides credentials automatically. You only need
   `PORT=80`, `AWS_REGION`, `S3_BUCKET`, and `JWT_SECRET` in `.env` on EC2.
5. Start it:
   ```bash
   sudo env "PATH=$PATH" pm2 start server.js --name cloudlocker
   pm2 save && pm2 startup
   ```
6. Point CloudFront's origin at the EC2 public DNS as described in the
   build guide.

## Security notes (for your report)

- Passwords are hashed with bcrypt before ever touching DynamoDB.
- JWTs are used for stateless auth; secret is an env var, never hardcoded.
- File uploads/downloads use short-lived (5 min) S3 presigned URLs — the
  bucket itself stays fully private, and files never pass through the
  Express server, keeping bandwidth costs down.
- Every file record has an `uploader` field; the backend checks it on
  every download and delete request, so one user can never touch another
  user's files even by guessing an id.
- On EC2, AWS credentials come from the attached IAM role (temporary,
  auto-rotated) rather than static access keys anywhere in the code or config.
