import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 SERVICE ROLE — SERVER ONLY (never in HTML)
const supabaseAdmin = createClient(
  'https://vwzhzycagqqhcxbopjtc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3emh6eWNhZ3FxaGN4Ym9wanRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2Mjg2MSwiZXhwIjoyMDkwMTM4ODYxfQ.b07eMHXUVXOeqQtWnsWTk7F5VFFaRbIwHGc_iay6tiE'
);



// ✅ GET ALL USERS (for Admin panel)
app.get('/all-users', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('full_name');

    if (error) throw error;

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



// ✅ DELETE USER
app.post('/delete-user', async (req, res) => {
  const { user_id, student_number } = req.body;

  if (!user_id || !student_number) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // 1. Delete from Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (authError) throw authError;

    // 2. Delete from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id);
    if (profileError) throw profileError;

    // 3. Reset masterlist registration flag
    const { error: masterError } = await supabaseAdmin
      .from('students_masterlist')
      .update({ is_registered: false })
      .eq('student_number', student_number);
    if (masterError) throw masterError;

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



app.listen(3000, () => {
  console.log('Admin API running on http://localhost:3000');
});
