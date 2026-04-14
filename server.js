import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.resolve(__dirname, 'exams.json');

// --- Manual .env loading ---
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const parts = trimmedLine.split('=');
      const key = parts.shift().trim();
      const value = parts.join('=').trim();
      if (key) {
        process.env[key] = value;
      }
    }
  });
}
// -----------------------------------------------------------

// Credentials (secured via Environment Variables)
const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.warn("⚠️  WARNING: ADMIN_USERNAME or ADMIN_PASSWORD environment variables are not set.");
  console.warn("⚠️  Login to the dashboard will not work until these are configured.");
}

app.use(cors());
app.use(express.json());

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// --- AUTH API ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// --- EXAMS API ---
app.get('/api/data', (req, res) => {
  try {
    const data = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, 'utf-8') : '{"exams":[]}';
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/data', (req, res) => {
  try {
    const updatedData = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(DATA_FILE, updatedData);
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// For any other route, serve index.html (Client-side routing support)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
