import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabaseAdmin = createClient(
  'https://vwzhzycagqqhcxbopjtc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3emh6eWNhZ3FxaGN4Ym9wanRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2Mjg2MSwiZXhwIjoyMDkwMTM4ODYxfQ.b07eMHXUVXOeqQtWnsWTk7F5VFFaRbIwHGc_iay6tiE'
);

app.post('/delete-user', async (req, res) => {
  const { user_id, student_number } = req.body;

  try {
    await supabaseAdmin.auth.admin.deleteUser(user_id);

    await supabaseAdmin.from('profiles')
      .delete()
      .eq('id', user_id);

    await supabaseAdmin.from('students_masterlist')
      .update({ is_registered: false })
      .eq('student_number', student_number);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () =>
  console.log('Admin API running on http://localhost:3000')
);
