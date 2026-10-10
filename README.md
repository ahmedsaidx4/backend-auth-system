# Backend Auth System

An Express and MongoDB authentication API with JWT access tokens, secure refresh-token sessions, email verification, password recovery, avatar uploads, and role-based administration.

## Features

- User registration with optional JPG, PNG, or WEBP avatar upload
- Email verification through Gmail SMTP
- Login with a short-lived access token and an HTTP-only refresh-token cookie
- Refresh-token rotation and token-family reuse detection
- Logout from the current session or all sessions
- Forgot-password and reset-password flows
- Authenticated profile read and update
- Admin and instructor user-management endpoints
- Helmet, CORS, request logging, JSON body limits, and rate limiting

## Requirements

- Node.js 18 or newer
- MongoDB
- A Gmail account or SMTP-compatible credentials for email delivery

## Installation

```bash
git clone <repository-url>
cd backend-auth-system
npm install
```

Create `src/config/.env` with the required configuration:

```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/backend-auth-system

JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret

CLIENT_URL=http://localhost:5173
USER_MAIL=your-email@gmail.com
USER_PASS=your-gmail-app-password
```

Optional cookie settings:

```env
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
# COOKIE_DOMAIN=example.com
```

For Gmail, use an App Password rather than your regular account password. Do not commit the `.env` file.

## Running the project

Development mode with Nodemon:

```bash
npm run run:dev
```

Production-style start:

```bash
npm run run:pro
```

The API is available at `http://localhost:5000` when `PORT=5000`.

Run the test command with:

```bash
npm test
```

## Docker

Build and run the container:

```bash
docker build -t backend-auth-system .
docker run --env-file src/config/.env -p 5000:5000 backend-auth-system
```

The container currently starts with `npm run run:dev`. Make sure MongoDB is reachable from the container, and use a MongoDB hostname that is resolvable from Docker when MongoDB is not running in the same container.

## API

All routes are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account. Send `multipart/form-data` with `first_name`, `last_name`, `email`, `password`, and optional `image`. |
| POST | `/auth/login` | Public | Log in and receive an access token. Sets the refresh-token cookie. |
| POST | `/auth/logout` | Public | Revoke the current refresh session and clear cookies. |
| POST | `/auth/logout-all` | Bearer token | Revoke all refresh sessions for the current user. |
| POST | `/auth/refreshToken` | Refresh cookie | Rotate the refresh token and receive a new access token. |
| POST | `/auth/emailVerify/:userId/:tokenVerify` | Public | Confirm a user's email address. |
| POST | `/auth/forgot-password` | Public | Send a password-reset email when the address exists. |
| POST | `/auth/reset-password/:userId/:token` | Public | Set a new password using the reset token. |
| POST | `/auth/change-password` | Bearer token | Change the current user's password. |

### User profile

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users/me` | Bearer token | Return the authenticated user's profile. |
| PATCH | `/users/me` | Bearer token | Update `first_name` and/or `last_name`. |

### Administration

| Method | Endpoint | Required role | Description |
| --- | --- | --- | --- |
| GET | `/admins/getAllAdmin` | Admin | List administrators. |
| GET | `/admins/getAllUser` | Admin or Instructor | List all users. |
| GET | `/admins/getSingleUser/:userId` | Admin or Instructor | Get one user. |
| DELETE | `/admins/deleteUser/:userId` | Admin | Delete a user. |
| POST | `/admins/addAdmin/:userId` | Admin | Promote a user to Admin. |
| PATCH | `/admins/users/:userId/status` | Admin | Set `accountStatus` to `Active` or `inActive`. |

## Authentication details

Protected endpoints expect the access token in the `Authorization` header:

```http
Authorization: Bearer <access-token>
```

Access tokens expire after 15 minutes. Refresh tokens expire after 7 days and are stored in an HTTP-only `refreshToken` cookie. The refresh endpoint rotates refresh tokens and revokes a token family if reuse is detected.

Because the API uses cookies, browser clients should send credentials with requests, for example:

```js
fetch("http://localhost:5000/api/v1/auth/refreshToken", {
  method: "POST",
  credentials: "include",
});
```

## Uploads

Avatar files are stored in `src/uploads/avatars` and served at:

```text
/uploads/avatars/<filename>
```

Only JPG, PNG, and WEBP files up to 2 MB are accepted.

## Project structure

```text
src/
├── config/                 MongoDB configuration
├── Middleware/             Auth, validation, role, and error middleware
├── Modules/
│   ├── Admin/               Admin controllers, routes, and validation
│   ├── Auth/                Authentication controllers, routes, email, uploads
│   ├── RefreshSession/      Refresh-session model
│   └── User/                User controller, model, routes, and validation
├── utils/                   Tokens, cookies, hashing, roles, and errors
├── app.js                   Express app and middleware setup
└── server.js                Environment loading, database connection, and startup
```

## Security notes

- Use long, unique values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Set `COOKIE_SECURE=true` and use HTTPS in production.
- Set `COOKIE_SAMESITE` and `CLIENT_URL` according to the frontend deployment.
- Keep SMTP credentials and environment files outside version control.
- The API applies a limit of 100 requests per 15-minute window per client.
