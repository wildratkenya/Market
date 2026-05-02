import crypto from 'crypto';

const SUPABASE_URL = 'https://nualwgobuhklnoaeawrz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-fallback-do-not-use-in-production';
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;

function snakeToCamel(obj) {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  const result = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, function(m, c) { return c.toUpperCase(); });
    result[camelKey] = snakeToCamel(obj[key]);
  }
  return result;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return 'pbkdf2:' + salt + ':' + hash;
}

function verifyPassword(password, stored) {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false;
  const derived = crypto.pbkdf2Sync(password, parts[1], 100000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(parts[2], 'hex'));
  } catch { return false; }
}

function createAdminToken(payload) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return data + '.' + sig;
}

function verifyAdminToken(token) {
  const dotIdx = token.indexOf('.');
  if (dotIdx === -1) return null;
  const data = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig + '===', 'base64url'), Buffer.from(expectedSig + '===', 'base64url'))) return null;
  } catch { return null; }
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch { return null; }
}

async function supabaseQuery(table, query) {
  const url = SUPABASE_URL + '/rest/v1/' + table + '?' + query;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Supabase error: ' + res.status);
  }
  return res.json();
}

async function supabaseInsert(table, body) {
  const url = SUPABASE_URL + '/rest/v1/' + table;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Supabase error: ' + res.status);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function supabaseUpdate(table, id, body) {
  const url = SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Supabase error: ' + res.status);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function supabaseDelete(table, id) {
  const url = SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
    },
  });
  if (!res.ok) {
    throw new Error('Supabase error: ' + res.status);
  }
  return {};
}

function getAuthToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function requireAuth(req, res) {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  return payload;
}

function readBody(req) {
  return new Promise(function(resolve, reject) {
    let body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      try { resolve(JSON.parse(body)); } catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    // ========== PUBLIC ROUTES ==========
    if (path === '/api/books' && method === 'GET') {
      const data = await supabaseQuery('books', 'order=id.asc');
      return res.status(200).json(snakeToCamel(data));
    }

    if (path === '/api/podcasts/latest') {
      const data = await supabaseQuery('podcasts', 'order=published_at.desc&limit=3');
      return res.status(200).json(snakeToCamel(data));
    }

    if (path.startsWith('/api/pages/')) {
      const pageName = path.replace('/api/pages/', '');
      const data = await supabaseQuery('site_pages', 'page_name=eq.' + pageName);
      const result = Array.isArray(data) ? data[0] || null : data;
      return res.status(200).json(snakeToCamel(result));
    }

    // ========== ADMIN AUTH ==========
    if (path === '/api/admin/login' && method === 'POST') {
      const body = await readBody(req);
      const login = (body.login || '').toLowerCase().trim();
      const password = body.password || '';
      if (!login || !password) {
        return res.status(400).json({ error: 'Login and password are required' });
      }
      const users = await supabaseQuery('admin_users', 'or=(email.eq.' + login + ',username.eq.' + login + ')');
      const user = Array.isArray(users) ? users[0] : users;
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const passwordHash = user.password_hash;
      if (!verifyPassword(password, passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = createAdminToken({
        uid: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      return res.json({
        token: token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      });
    }

    if (path === '/api/admin/me' && method === 'GET') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const users = await supabaseQuery('admin_users', 'username=eq.' + auth.username);
      const user = Array.isArray(users) ? users[0] : users;
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    }

    // ========== BOOKS CRUD ==========
    if (path === '/api/books' && method === 'POST') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const body = await readBody(req);
      const result = await supabaseInsert('books', {
        title: body.title,
        subtitle: body.subtitle || null,
        description: body.description,
        author: body.author,
        cover_image: body.coverImage || null,
        type: body.type,
        hardcopy_price: body.hardcopyPrice || null,
        ebook_price: body.ebookPrice || null,
        currency: body.currency || 'KES',
        is_latest: body.isLatest || false,
        published_year: body.publishedYear || null,
        category: body.category || null,
      });
      return res.status(201).json(snakeToCamel(result));
    }

    if (path.match(/^\/api\/books\/\d+$/) && (method === 'PATCH' || method === 'PUT')) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const id = parseInt(path.split('/').pop());
      const body = await readBody(req);
      const updates = {};
      if (body.title !== undefined) updates.title = body.title;
      if (body.subtitle !== undefined) updates.subtitle = body.subtitle;
      if (body.description !== undefined) updates.description = body.description;
      if (body.author !== undefined) updates.author = body.author;
      if (body.coverImage !== undefined) updates.cover_image = body.coverImage;
      if (body.type !== undefined) updates.type = body.type;
      if (body.hardcopyPrice !== undefined) updates.hardcopy_price = body.hardcopyPrice;
      if (body.ebookPrice !== undefined) updates.ebook_price = body.ebookPrice;
      if (body.currency !== undefined) updates.currency = body.currency;
      if (body.isLatest !== undefined) updates.is_latest = body.isLatest;
      if (body.publishedYear !== undefined) updates.published_year = body.publishedYear;
      if (body.category !== undefined) updates.category = body.category;
      const result = await supabaseUpdate('books', id, updates);
      return res.json(snakeToCamel(result));
    }

    if (path.match(/^\/api\/books\/\d+$/) && method === 'DELETE') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const id = parseInt(path.split('/').pop());
      await supabaseDelete('books', id);
      return res.status(204).end();
    }

    // ========== ORDERS CRUD ==========
    if (path === '/api/orders' && method === 'POST') {
      const body = await readBody(req);
      const result = await supabaseInsert('orders', {
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone || null,
        book_id: body.bookId,
        order_type: body.orderType,
        quantity: body.quantity || 1,
        total_amount: body.totalAmount,
        status: 'pending',
        delivery_address: body.deliveryAddress || null,
        delivery_city: body.deliveryCity || null,
        notes: body.notes || null,
      });
      return res.status(201).json(snakeToCamel(result));
    }

    if (path === '/api/orders' && method === 'GET') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const data = await supabaseQuery('orders', 'order=created_at.desc');
      return res.status(200).json(snakeToCamel(data));
    }

    if (path.match(/^\/api\/orders\/\d+$/) && method === 'PATCH') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const id = parseInt(path.split('/').pop());
      const body = await readBody(req);
      const updates = {};
      if (body.status) updates.status = body.status;
      if (body.notes !== undefined) updates.notes = body.notes;
      const result = await supabaseUpdate('orders', id, updates);
      return res.json(snakeToCamel(result));
    }

    // ========== SUBSCRIBERS ==========
    if (path === '/api/subscribers' && method === 'POST') {
      const body = await readBody(req);
      const result = await supabaseInsert('subscribers', {
        name: body.name || null,
        email: body.email,
        phone: body.phone || null,
        wants_whatsapp: body.wantsWhatsapp || false,
        whatsapp_approved: false,
      });
      return res.status(201).json(snakeToCamel(result));
    }

    if (path === '/api/subscribers' && method === 'GET') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const data = await supabaseQuery('subscribers', 'order=subscribed_at.desc');
      return res.status(200).json(snakeToCamel(data));
    }

    if (path.match(/^\/api\/subscribers\/\d+\/whatsapp$/) && method === 'PATCH') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const id = parseInt(path.split('/')[2]);
      const body = await readBody(req);
      const result = await supabaseUpdate('subscribers', id, {
        whatsapp_approved: body.approved || false,
      });
      return res.json(snakeToCamel(result));
    }

    // ========== MESSAGES ==========
    if (path === '/api/messages' && method === 'POST') {
      const body = await readBody(req);
      const result = await supabaseInsert('messages', {
        type: body.type || 'contact',
        subject: body.subject || null,
        body: body.body,
        sender_email: body.senderEmail || null,
      });
      return res.status(201).json(snakeToCamel(result));
    }

    if (path === '/api/messages' && method === 'GET') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const data = await supabaseQuery('messages', 'order=created_at.desc');
      return res.status(200).json(snakeToCamel(data));
    }

    if (path.match(/^\/api\/messages\/\d+\/read$/) && method === 'PATCH') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const id = parseInt(path.split('/')[2]);
      const result = await supabaseUpdate('messages', id, {
        read_at: new Date().toISOString(),
      });
      return res.json(snakeToCamel(result));
    }

    // ========== STATS ==========
    if (path === '/api/stats/summary' && method === 'GET') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const books = await supabaseQuery('books', 'select=count');
      const orders = await supabaseQuery('orders', 'select=count');
      const subscribers = await supabaseQuery('subscribers', 'select=count');
      return res.json({
        totalBooks: books[0] ? books[0].count : 0,
        totalOrders: orders[0] ? orders[0].count : 0,
        totalSubscribers: subscribers[0] ? subscribers[0].count : 0,
      });
    }

    // ========== PODCASTS CRUD ==========
    if (path === '/api/podcasts' && method === 'GET') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const data = await supabaseQuery('podcasts', 'order=published_at.desc');
      return res.status(200).json(snakeToCamel(data));
    }

    // ========== PAGES CRUD ==========
    if (path.startsWith('/api/pages/') && method === 'PATCH') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const pageName = path.split('/api/pages/')[1];
      const body = await readBody(req);
      const updates = {};
      if (body.content !== undefined) updates.content = body.content;
      if (body.title !== undefined) updates.title = body.title;
      if (body.heroImage !== undefined) updates.hero_image = body.heroImage;
      const data = await supabaseQuery('site_pages', 'page_name=eq.' + pageName);
      const page = Array.isArray(data) ? data[0] : data;
      if (!page) {
        const result = await supabaseInsert('site_pages', Object.assign({ page_name: pageName }, updates));
        return res.json(snakeToCamel(result));
      }
      const result = await supabaseUpdate('site_pages', page.id, updates);
      return res.json(snakeToCamel(result));
    }

    return res.status(404).json({ error: 'Not found', path });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
