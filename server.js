const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// 🔐 must match your HTML
const ADMIN_KEY = "secret123";

// 🔥 Supabase Admin (KEEP HERE ONLY)
const supabaseAdmin = createClient(
  'https://vwzhzycagqqhcxbopjtc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3emh6eWNhZ3FxaGN4Ym9wanRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2Mjg2MSwiZXhwIjoyMDkwMTM4ODYxfQ.b07eMHXUVXOeqQtWnsWTk7F5VFFaRbIwHGc_iay6tiE'
);

// 🔒 Middleware
function checkAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
}

// 📊 Stats
app.get('/stats', checkAdmin, async (req, res) => {
  const { count, error } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) return res.status(500).json({ error });

  res.json({ totalUsers: count });
});

// 📋 Students
app.get('/students', checkAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('students_masterlist')
    .select('*');

  if (error) return res.status(500).json({ error });

  res.json(data);
});

// ➕ Add student
app.post('/add-student', checkAdmin, async (req, res) => {
  const { student_number, full_name } = req.body;

  const { error } = await supabaseAdmin
    .from('students_masterlist')
    .insert({ student_number, full_name, is_registered: false });

  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

// ✏️ Update student
app.post('/update-student', checkAdmin, async (req, res) => {
  const { id, student_number, full_name } = req.body;

  const { error } = await supabaseAdmin
    .from('students_masterlist')
    .update({ student_number, full_name })
    .eq('id', id);

  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

// ❌ Delete student
app.post('/delete-student', checkAdmin, async (req, res) => {
  const { id } = req.body;

  const { error } = await supabaseAdmin
    .from('students_masterlist')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

// 👥 Users
app.get('/all-users', checkAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*');

  if (error) return res.status(500).json({ error });

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
