# Run CircularMatch on Your Own Computer

This package runs fully in **Demo Mode** without Supabase or Gemini credentials.

## What you need

1. **Node.js 20 or newer**
   - Check with: `node --version`
   - Download: https://nodejs.org/

2. **Python 3.10 or newer**
   - Check with: `python --version` on Windows or `python3 --version` on macOS/Linux
   - Download: https://www.python.org/downloads/

3. An internet connection for the first `npm install` and `pip install`.

---

## Windows — easiest method

1. Extract the ZIP file.
2. Open the extracted `circularmatch` folder.
3. Double-click **`start-local.bat`**.
4. Two command windows will open:
   - CircularMatch API
   - CircularMatch Website
5. Wait until the Website terminal shows a URL similar to:

   ```text
   http://localhost:5173
   ```

6. Open this in Chrome, Edge, or any browser:

   **http://localhost:5173**

Keep both command windows open while using the app. Close them to stop the app.

> If Windows says `py` is not recognized, install Python from python.org and select **Add Python to PATH** during installation. Then restart the script.

---

## macOS / Linux

1. Extract the ZIP file.
2. Open Terminal in the extracted `circularmatch` folder.
3. Run:

   ```bash
   chmod +x start-local.sh
   ./start-local.sh
   ```

4. Open:

   **http://localhost:5173**

Press `Ctrl + C` in Terminal to stop both the API and website.

---

## Manual method — any operating system

Open two terminals in the extracted project folder.

### Terminal 1 — API

```bash
cd apps/api
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

On Windows, use `py` or `python` instead of `python3` if needed:

```bat
cd apps\api
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Terminal 2 — Website

```bash
cd apps/web
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## Demo credentials and workflow

No password is needed in Demo Mode.

- The app starts as **Generator demo**.
- Use the selector at the top right to switch between:
  - Generator demo
  - Buyer demo
  - Admin demo

Try this path:

```text
My listings → PET listing → Material Passport → Find buyers → ReLoop Polymers
```

---

## Optional real integrations

The project works without secrets. To later connect real services, copy:

```text
apps/api/.env.example → apps/api/.env
apps/web/.env.example → apps/web/.env
```

Add real Supabase and Gemini credentials only when you are ready. Do not commit `.env` files to Git.

---

## If something does not work

| Problem | Fix |
|---|---|
| `npm` is not recognized | Install Node.js 20+ and restart the terminal. |
| `python` / `py` is not recognized | Install Python 3.10+ and add it to PATH. |
| Website loads but API shows an error | Make sure the API terminal is still running on port 8000. |
| Port 5173 is already in use | Stop another Vite app, or change the port in `apps/web/vite.config.ts`. |
| Port 8000 is already in use | Stop another API, or change the backend port and the Vite proxy target together. |

For more technical details, see `README.md` and `docs/04-trusted-pilot-core.md`.
