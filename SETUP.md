# Authentication setup

## 1. Install dependencies (project root)

```bash
npm install
```

(If you don’t have a `package.json` yet: `npm init -y` then `npm install express mysql2 cors dotenv`.)

## 2. Database (Aiven MySQL)

1. Create a free MySQL service on [Aiven](https://aiven.io).
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
3. Edit `.env` with your Aiven MySQL values:
   - **DB_HOST** – host from Aiven (e.g. `your-service.aivencloud.com`)
   - **DB_USER** – username (e.g. `avnadmin`)
   - **DB_PASSWORD** – password from Aiven
   - **DB_NAME** – database name (e.g. `defaultdb`)
   - **DB_PORT** – port from Aiven (e.g. `12345`)

The `users` table is created automatically on first run.

## 3. Run the backend

From the project root:

```bash
node backend/server.js
```

You should see: `Database ready.` and `Server running on http://localhost:5000`.

## 4. Open the frontend

- Open `index.html`, `login.html`, or `register.html` in a browser (e.g. via Live Server or by opening the file).
- If you open `index.html` without being logged in, you will be redirected to `login.html`.

## Flow

1. **Register** → open `register.html` → fill form → submit → redirect to `login.html`.
2. **Login** → open `login.html` → enter email or phone + password → submit → redirect to `index.html` (Netflix page).
3. **Logout** → on the Netflix page click “Sign Out”, or on `login.html` click “Sign out (clear login state)”.

## API base URL

Frontend auth calls go to `http://localhost:5000`. If your backend runs on another host/port, change `API_BASE` in `auth.js`.
