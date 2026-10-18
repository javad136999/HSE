window.CATS = [
  { k: 'fire_truck', i: '🚒', n: 'خودروی آتش‌نشانی' },
  { k: 'ladder', i: '🪜', n: 'خودروی نردبان (لادر)' },
  { k: 'foam_truck', i: '🫧', n: 'خودروی فوم' },
  { k: 'water_tanker', i: '🚛', n: 'تانکر آب' },
  { k: 'command_car', i: '📡', n: 'خودروی فرماندهی' },
  { k: 'rescue', i: '🦺', n: 'خودروی امداد و نجات' },
  { k: 'hazmat', i: '☣️', n: 'تیم/خودروی مواد خطرناک' },
  { k: 'ambulance', i: '🚑', n: 'آمبولانس' },
  { k: 'fire_boat', i: '🚤', n: 'شناور آتش‌نشانی' },
  { k: 'portable_pump', i: '💧', n: 'پمپ سیار' },
  { k: 'monitor', i: '🚿', n: 'مانیتور/توپ آب سیار' },
  { k: 'extinguisher', i: '🧯', n: 'کپسول چرخ‌دار' },
  { k: 'scba', i: '😷', n: 'ست تنفسی (SCBA)' },
  { k: 'foam_stock', i: '🧪', n: 'ذخیره‌ی فوم (لیتر)' },
  { k: 'firefighters', i: '👨‍🚒', n: 'نیروی آتش‌نشان (نفر)' }
];
window.CAT = Object.fromEntries(CATS.map(c => [c.k, c]));
window.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
