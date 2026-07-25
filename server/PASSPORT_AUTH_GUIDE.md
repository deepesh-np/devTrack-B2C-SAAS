# Passport.js Authentication Setup Guide

This backend implementation features **Passport.js** authentication with support for:
1. **Local Authentication** (Username/Email & Password via `passport-local`)
2. **Google OAuth 2.0** (`passport-google-oauth20`)
3. **GitHub OAuth 2.0** (`passport-github2`)
4. **JWT Protected Routes** (`passport-jwt`)

---

## 🛠️ Step 1: Environment Setup

Update your `.env` file inside the `server/` directory:

```env
DATABASE_URL="postgresql://devtrack:devtrack123@localhost:5433/devtrack"
PORT=5000
NODE_ENV="development"
JWT_SECRET="devtrack_super_secret_jwt_key_2026"
CLIENT_URL="http://localhost:5173"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="<YOUR_GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<YOUR_GOOGLE_CLIENT_SECRET>"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# GitHub OAuth Credentials
GITHUB_CLIENT_ID="<YOUR_GITHUB_CLIENT_ID>"
GITHUB_CLIENT_SECRET="<YOUR_GITHUB_CLIENT_SECRET>"
GITHUB_CALLBACK_URL="http://localhost:5000/api/auth/github/callback"
```

---

## 🚀 Step 2: Database Migration & Dependency Installation

Run the following commands inside `server/`:

```bash
npm install
npx prisma db push
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

---

## 📡 Step 3: API Endpoint Reference & Testing

### 1️⃣ Register User (Local Auth)
- **URL**: `POST http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "username": "janedoe",
  "password": "securepassword123"
}
```
- **Response**: Returns JWT token & User Object.

---

### 2️⃣ Login (Local Auth via Passport)
- **URL**: `POST http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "identifier": "janedoe",
  "password": "securepassword123"
}
```
*(Note: `identifier` can be either the username `janedoe` or email `jane@example.com`)*
- **Response**: Returns JWT token & sets `access_token` HTTP-only cookie.

---

### 3️⃣ Get Profile (Protected by Passport JWT)
- **URL**: `GET http://localhost:5000/api/auth/me`
- **Headers**: `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Response**: Returns authenticated user details.

---

### 4️⃣ Google OAuth 2.0 (Passport Google Strategy)
1. Register your app in **Google Cloud Console**:
   - Authorized Redirect URI: `http://localhost:5000/api/auth/google/callback`
2. Open in browser: `http://localhost:5000/api/auth/google`
3. After Google sign-in, Passport completes authentication, creates/links user, and redirects to your frontend with JWT token.

---

### 5️⃣ GitHub OAuth 2.0 (Passport GitHub Strategy)
1. Register a new OAuth App in **GitHub Developer Settings**:
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
2. Open in browser: `http://localhost:5000/api/auth/github`
3. Passport authenticates the GitHub profile, retrieves user details, creates/links user, and returns JWT token.

---

### 6️⃣ Logout
- **URL**: `POST http://localhost:5000/api/auth/logout`
- **Response**: Clears `access_token` cookie.
