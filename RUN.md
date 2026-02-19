# How to run the Netflix clone with auth

## Step 1: Install Node.js (if needed)

- If you don’t have Node.js: download the LTS version from https://nodejs.org and install it.
- Close and reopen your terminal/VS Code after installing.

## Step 2: Install dependencies

Open a terminal in this project folder and run:

```bash
npm install
```

## Step 3: Set your database credentials

1. Create a free MySQL database at **https://aiven.io** (sign up → Create service → MySQL).
2. In Aiven, copy the **host**, **port**, **username**, and **password** for your MySQL service.
3. Open the **`.env`** file in this project and replace the placeholders:

   - `DB_HOST` = your Aiven MySQL host (e.g. `my-db-abc123.aivencloud.com`)
   - `DB_USER` = your MySQL username (e.g. `avnadmin`)
   - `DB_PASSWORD` = your Aiven MySQL password
   - `DB_NAME` = your database name (e.g. `defaultdb`)
   - `DB_PORT` = your MySQL port (e.g. `12345`)

Save the file.

## Step 4: Start the backend server

In the same project folder, run:

```bash
npm start
```

Or:

```bash
node backend/server.js
```

You should see:

- `Database ready.`
- `Server running on http://localhost:5000`

If you see an error about missing env vars or connection failed, check that `.env` has the correct Aiven values and that the project folder is the one that contains `backend` and `.env`.

## Step 5: Open the frontend

1. Keep the terminal running (don’t close it).
2. Open the project in your browser:
   - **Option A:** Right‑click `index.html` → “Open with Live Server” (if you use the Live Server extension in VS Code).
   - **Option B:** Double‑click `login.html` or `register.html` to open in your default browser (file:// URL is fine for this project).

## Step 6: Test the flow

1. Open **register.html** → fill the form → submit → you should be redirected to the login page.
2. Open **login.html** → enter your **email or phone** and password → submit → you should be redirected to the Netflix page (**index.html**).
3. If you open **index.html** without logging in, you should be redirected to **login.html**.

---

**Quick checklist**

- [ ] Node.js installed (`node --version` works in terminal)
- [ ] Ran `npm install` in the project folder
- [ ] Updated `.env` with real Aiven MySQL host, user, password, database, port
- [ ] Backend running (`npm start` or `node backend/server.js`) and shows “Server running on http://localhost:5000”
- [ ] Opened `login.html` or `register.html` in the browser

If something fails, say which step and the exact error message and we can fix it.
