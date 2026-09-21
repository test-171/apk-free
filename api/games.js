import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // إعدادات CORS للسماح بالطلبات
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. جلب الألعاب (متاح للجميع)
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('id', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Server error fetching data' });
    }
  }

  // التحقق من كلمة سر الأدمن للعمليات المتقدمة
  const adminPass = req.headers['authorization'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'غير مصرح لك (كلمة السر خاطئة)' });
  }

  // 2. إضافة لعبة جديدة (للأدمن فقط)
  if (req.method === 'POST') {
    try {
      const { title, category, description, image_url, mega_url } = req.body;
      
      if (!title || !mega_url) {
        return res.status(400).json({ error: 'يرجى إدخال الاسم ورابط MEGA' });
      }

      const { data, error } = await supabase
        .from('games')
        .insert([{ title, category, description, image_url, mega_url }])
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ error: 'Server error inserting data' });
    }
  }

  // 3. حذف لعبة (للأدمن فقط)
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'مُعرّف اللعبة مطلوب' });

      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Server error deleting data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
