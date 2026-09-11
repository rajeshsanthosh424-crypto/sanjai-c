import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, getStats } from './server/db';
import { compareItemsWithAI, parseNaturalLanguageSearch, analyzeItemWithAI, checkForDuplicates } from './server/gemini';
import { Item, Match, Claim, Message, Notification, ReportAbuse, User } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for item image uploads (base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper: mask sensitive data for public viewing
function sanitizeItemForPublic(item: Item, currentUserId?: string): Item {
  const isOwner = currentUserId && item.reporterId === currentUserId;
  return {
    ...item,
    reporterEmail: isOwner ? item.reporterEmail : undefined,
    identifyingCharacteristics: isOwner ? item.identifyingCharacteristics : undefined,
  };
}

// -------------------------------------------------------------
// AUTH ENDPOINTS (Session-based with quick user switching for testing)
// -------------------------------------------------------------
let activeUserId = 'usr_rajesh'; // Default logged-in user

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === activeUserId) || db.users[0];
  res.json({ user });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    // If not found, create a demo user
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: email || 'guest@example.com',
      name: email ? email.split('@')[0] : 'Guest User',
      role: email?.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    activeUserId = newUser.id;
    return res.json({ user: newUser });
  }
  activeUserId = user.id;
  res.json({ user });
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    activeUserId = user.id;
    return res.json({ user });
  }
  res.status(404).json({ error: 'User not found' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    activeUserId = existing.id;
    return res.json({ user: existing });
  }
  const newUser: User = {
    id: `usr_${Date.now()}`,
    email,
    name,
    role: email.includes('admin') ? 'admin' : 'user',
    phone,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  activeUserId = newUser.id;
  res.json({ user: newUser });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  activeUserId = '';
  res.json({ success: true });
});

// -------------------------------------------------------------
// ITEMS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/items', (req: Request, res: Response) => {
  const { type, category, status, search, reporterId } = req.query;
  let items = db.items.filter(i => !i.isFraudulent);

  if (type && typeof type === 'string' && type !== 'all') {
    items = items.filter(i => i.type === type);
  }
  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (status && typeof status === 'string') {
    items = items.filter(i => i.status === status);
  }
  if (reporterId && typeof reporterId === 'string') {
    items = items.filter(i => i.reporterId === reporterId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.color.toLowerCase().includes(q) ||
        i.brandModel?.toLowerCase().includes(q) ||
        i.location.name.toLowerCase().includes(q)
    );
  }

  // Sanitize sensitive contact info
  const sanitized = items.map(item => sanitizeItemForPublic(item, activeUserId));
  res.json({ items: sanitized });
});

app.get('/api/items/:id', (req: Request, res: Response) => {
  const item = db.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ item: sanitizeItemForPublic(item, activeUserId) });
});

app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const {
      type,
      title,
      category,
      description,
      color,
      brandModel,
      date,
      time,
      location,
      imageUrl,
      identifyingCharacteristics,
      additionalObservations,
    } = req.body;

    if (!title || !category || !type || !location) {
      return res.status(400).json({ error: 'Missing mandatory item fields.' });
    }

    const currentUser = db.users.find(u => u.id === activeUserId) || db.users[0];

    const newItem: Item = {
      id: `item_${Date.now()}`,
      type,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      title,
      category,
      description: description || '',
      color: color || 'Other',
      brandModel: brandModel || '',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      location: {
        name: location.name || 'Reported Location',
        address: location.address || '',
        lat: Number(location.lat) || 40.7527,
        lng: Number(location.lng) || -73.9772,
      },
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      identifyingCharacteristics,
      additionalObservations,
      status: 'active',
      isFraudulent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Duplicate check
    const dupCheck = await checkForDuplicates(newItem, db.items);
    if (dupCheck.isDuplicate) {
      return res.status(409).json({
        error: dupCheck.reason || 'Duplicate report detected.',
        duplicateItemId: dupCheck.duplicateItemId,
      });
    }

    db.items.unshift(newItem);

    // Auto-Trigger AI Matching against opposite items
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const candidateItems = db.items.filter(i => i.type === oppositeType && i.status === 'active');

    const newMatches: Match[] = [];
    for (const candidate of candidateItems) {
      // Evaluate if category or color might match to save token budgets
      const isLost = type === 'lost';
      const lostObj = isLost ? newItem : candidate;
      const foundObj = isLost ? candidate : newItem;

      try {
        const result = await compareItemsWithAI(lostObj, foundObj);
        if (result.matchScore >= 65) {
          const matchRecord: Match = {
            id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            lostItemId: lostObj.id,
            foundItemId: foundObj.id,
            matchScore: result.matchScore,
            breakdown: result.breakdown,
            reasons: result.reasons,
            aiSummary: result.aiSummary,
            status: 'potential',
            createdAt: new Date().toISOString(),
          };
          db.matches.unshift(matchRecord);
          newMatches.push(matchRecord);

          // Create notification for the lost item reporter
          db.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: lostObj.reporterId,
            title: `Potential Match Detected (${result.matchScore}%)`,
            message: `AI identified a potential match for your "${lostObj.title}".`,
            type: 'match_found',
            link: '/matches',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (matchErr) {
        console.warn('Matching failure on candidate:', candidate.id, matchErr);
      }
    }

    res.status(201).json({ item: newItem, createdMatchesCount: newMatches.length });
  } catch (err: any) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: err.message || 'Failed to create item' });
  }
});

app.put('/api/items/:id', (req: Request, res: Response) => {
  const index = db.items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Item not found' });

  const existing = db.items[index];
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.items[index] = updated;
  res.json({ item: updated });
});

app.delete('/api/items/:id', (req: Request, res: Response) => {
  const index = db.items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Item not found' });
  db.items.splice(index, 1);
  // Also clean up related matches
  db.matches = db.matches.filter(m => m.lostItemId !== req.params.id && m.foundItemId !== req.params.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// MATCHES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/matches', (req: Request, res: Response) => {
  const { minScore, userId } = req.query;
  const threshold = minScore ? Number(minScore) : 70;

  // Hydrate matches with item data
  let list = db.matches
    .filter(m => m.matchScore >= threshold)
    .map(m => {
      const lostItem = db.items.find(i => i.id === m.lostItemId);
      const foundItem = db.items.find(i => i.id === m.foundItemId);
      return {
        ...m,
        lostItem: lostItem ? sanitizeItemForPublic(lostItem, activeUserId) : undefined,
        foundItem: foundItem ? sanitizeItemForPublic(foundItem, activeUserId) : undefined,
      };
    })
    .filter(m => m.lostItem && m.foundItem);

  if (userId && typeof userId === 'string') {
    list = list.filter(
      m => m.lostItem?.reporterId === userId || m.foundItem?.reporterId === userId
    );
  }

  res.json({ matches: list });
});

app.post('/api/matches/compare', async (req: Request, res: Response) => {
  const { lostItemId, foundItemId } = req.body;
  const lostItem = db.items.find(i => i.id === lostItemId);
  const foundItem = db.items.find(i => i.id === foundItemId);

  if (!lostItem || !foundItem) {
    return res.status(404).json({ error: 'One or both items not found.' });
  }

  const result = await compareItemsWithAI(lostItem, foundItem);
  res.json({ result });
});

// -------------------------------------------------------------
// SMART NATURAL LANGUAGE SEARCH
// -------------------------------------------------------------
app.post('/api/search/smart', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string required.' });
  }

  const parsed = await parseNaturalLanguageSearch(query);

  let results = db.items.filter(i => !i.isFraudulent);

  if (parsed.type && parsed.type !== 'all') {
    results = results.filter(i => i.type === parsed.type);
  }
  if (parsed.category) {
    results = results.filter(i => i.category.toLowerCase().includes(parsed.category!.toLowerCase()));
  }
  if (parsed.color) {
    results = results.filter(
      i =>
        i.color.toLowerCase().includes(parsed.color!.toLowerCase()) ||
        i.description.toLowerCase().includes(parsed.color!.toLowerCase())
    );
  }
  if (parsed.brand) {
    results = results.filter(
      i =>
        i.brandModel.toLowerCase().includes(parsed.brand!.toLowerCase()) ||
        i.title.toLowerCase().includes(parsed.brand!.toLowerCase())
    );
  }

  // Keyword relevance scoring
  const keywords = parsed.keywords.map(k => k.toLowerCase());
  const scored = results.map(item => {
    let matchCount = 0;
    const fullText = `${item.title} ${item.description} ${item.category} ${item.location.name} ${item.color}`.toLowerCase();
    keywords.forEach(k => {
      if (fullText.includes(k)) matchCount++;
    });
    return { item: sanitizeItemForPublic(item, activeUserId), score: matchCount };
  });

  scored.sort((a, b) => b.score - a.score);

  res.json({
    parsed,
    results: scored.map(s => s.item),
  });
});

// -------------------------------------------------------------
// AI ITEM AUTO-ANALYSIS & ASSISTANT
// -------------------------------------------------------------
app.post('/api/ai/analyze-item', async (req: Request, res: Response) => {
  const { title, description, imageBase64, mimeType } = req.body;
  const analysis = await analyzeItemWithAI({ title, description, imageBase64, mimeType });
  res.json({ analysis });
});

// -------------------------------------------------------------
// CLAIMS & VERIFICATION
// -------------------------------------------------------------
app.get('/api/claims', (req: Request, res: Response) => {
  const { userId } = req.query;
  let claims = db.claims;
  if (userId && typeof userId === 'string') {
    claims = claims.filter(c => c.claimantId === userId || c.finderId === userId);
  }
  res.json({ claims });
});

app.post('/api/claims', (req: Request, res: Response) => {
  const { lostItemId, foundItemId, hiddenDetails, serialNumberProof, proofImageUrl, message } = req.body;
  const lostItem = db.items.find(i => i.id === lostItemId);
  const foundItem = db.items.find(i => i.id === foundItemId);

  if (!lostItem || !foundItem) {
    return res.status(404).json({ error: 'Referenced lost or found item not found.' });
  }

  const currentUser = db.users.find(u => u.id === activeUserId) || db.users[0];

  const newClaim: Claim = {
    id: `claim_${Date.now()}`,
    lostItemId,
    foundItemId,
    lostItemTitle: lostItem.title,
    foundItemTitle: foundItem.title,
    claimantId: currentUser.id,
    claimantName: currentUser.name,
    finderId: foundItem.reporterId,
    hiddenDetails: hiddenDetails || '',
    serialNumberProof,
    proofImageUrl,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.claims.unshift(newClaim);

  // Update item statuses to claim_pending
  lostItem.status = 'claim_pending';
  foundItem.status = 'claim_pending';

  // Notify the finder
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: foundItem.reporterId,
    title: 'New Ownership Claim Submitted',
    message: `${currentUser.name} submitted an ownership claim for "${foundItem.title}". Review their proof to accept or reject.`,
    type: 'claim_received',
    link: '/dashboard',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ claim: newClaim });
});

app.put('/api/claims/:id/status', (req: Request, res: Response) => {
  const { status, resolutionNotes } = req.body;
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found.' });

  claim.status = status;
  claim.resolutionNotes = resolutionNotes;
  claim.updatedAt = new Date().toISOString();

  const lostItem = db.items.find(i => i.id === claim.lostItemId);
  const foundItem = db.items.find(i => i.id === claim.foundItemId);

  if (status === 'accepted') {
    if (lostItem) lostItem.status = 'resolved';
    if (foundItem) foundItem.status = 'resolved';

    // Notify claimant
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: claim.claimantId,
      title: 'Ownership Claim Accepted! 🎉',
      message: `Your ownership claim for "${claim.foundItemTitle}" was verified and approved by the finder.`,
      type: 'claim_status',
      link: '/dashboard',
      read: false,
      createdAt: new Date().toISOString(),
    });
  } else if (status === 'rejected') {
    if (lostItem) lostItem.status = 'active';
    if (foundItem) foundItem.status = 'active';

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: claim.claimantId,
      title: 'Claim Status Update',
      message: `Your claim for "${claim.foundItemTitle}" was not accepted. Check notes: ${resolutionNotes || 'Insufficient proof.'}`,
      type: 'claim_status',
      link: '/dashboard',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({ claim });
});

// -------------------------------------------------------------
// PRIVATE IN-APP MESSAGING
// -------------------------------------------------------------
app.get('/api/messages/:threadId', (req: Request, res: Response) => {
  const threadMessages = db.messages.filter(m => m.threadId === req.params.threadId);
  res.json({ messages: threadMessages });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { threadId, recipientId, content } = req.body;
  if (!threadId || !content) {
    return res.status(400).json({ error: 'Thread ID and message content are required.' });
  }

  const currentUser = db.users.find(u => u.id === activeUserId) || db.users[0];

  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    threadId,
    senderId: currentUser.id,
    senderName: currentUser.name,
    recipientId: recipientId || '',
    content,
    timestamp: new Date().toISOString(),
  };

  db.messages.push(newMsg);

  if (recipientId) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: recipientId,
      title: `New message from ${currentUser.name}`,
      message: content.length > 60 ? `${content.substring(0, 60)}...` : content,
      type: 'message_received',
      link: '/dashboard',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.status(201).json({ message: newMsg });
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
app.get('/api/notifications', (req: Request, res: Response) => {
  const userNotifs = db.notifications.filter(n => n.userId === activeUserId);
  res.json({ notifications: userNotifs });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.put('/api/notifications/read-all', (_req: Request, res: Response) => {
  db.notifications.forEach(n => {
    if (n.userId === activeUserId) n.read = true;
  });
  res.json({ success: true });
});

// -------------------------------------------------------------
// REPORT ABUSE / FRAUD
// -------------------------------------------------------------
app.post('/api/reports', (req: Request, res: Response) => {
  const { itemId, reason, details } = req.body;
  const item = db.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found.' });

  const currentUser = db.users.find(u => u.id === activeUserId) || db.users[0];

  const newReport: ReportAbuse = {
    id: `rep_${Date.now()}`,
    reporterId: currentUser.id,
    itemId,
    itemTitle: item.title,
    reason: reason || 'Suspicious activity',
    details: details || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(newReport);
  res.status(201).json({ report: newReport });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  res.json({ stats: getStats() });
});

app.get('/api/admin/reports', (_req: Request, res: Response) => {
  res.json({ reports: db.reports });
});

app.put('/api/admin/reports/:id', (req: Request, res: Response) => {
  const { status, action } = req.body;
  const rep = db.reports.find(r => r.id === req.params.id);
  if (!rep) return res.status(404).json({ error: 'Report not found.' });

  rep.status = status || 'resolved';

  if (action === 'remove_item') {
    const item = db.items.find(i => i.id === rep.itemId);
    if (item) {
      item.isFraudulent = true;
      item.status = 'flagged';
    }
  }

  res.json({ report: rep });
});

app.get('/api/admin/users', (_req: Request, res: Response) => {
  res.json({ users: db.users });
});

// -------------------------------------------------------------
// VITE INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lost & Found Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
