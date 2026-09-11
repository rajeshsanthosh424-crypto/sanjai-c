import { Item, Match, Claim, Message, Notification, ReportAbuse, User, SystemStats } from '../src/types';

// In-memory persistent database with realistic initial seeds
export interface Database {
  users: User[];
  items: Item[];
  matches: Match[];
  claims: Claim[];
  messages: Message[];
  notifications: Notification[];
  reports: ReportAbuse[];
}

export const db: Database = {
  users: [
    {
      id: 'usr_rajesh',
      email: 'rajeshsanthosh424@gmail.com',
      name: 'Rajesh Santhosh',
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'usr_alex',
      email: 'alex.rivera@example.com',
      name: 'Alex Rivera',
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 987-6543',
      createdAt: '2026-09-02T11:30:00Z'
    },
    {
      id: 'usr_sarah',
      email: 'sarah.chen@example.com',
      name: 'Sarah Chen',
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 456-7890',
      createdAt: '2026-09-03T14:15:00Z'
    },
    {
      id: 'usr_admin',
      email: 'admin@lostandfound.local',
      name: 'Admin Supervisor',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (800) 555-HELP',
      createdAt: '2026-09-01T00:00:00Z'
    }
  ],

  items: [
    {
      id: 'item_lost_1',
      type: 'lost',
      reporterId: 'usr_rajesh',
      reporterName: 'Rajesh Santhosh',
      reporterEmail: 'rajeshsanthosh424@gmail.com',
      title: 'Black Fossil Leather Bifold Wallet',
      category: 'Wallet',
      description: 'Black leather bifold wallet with RFID shield. Contains subway transit pass, state driver license, and corporate badge. Lost around Grand Central concourse near Track 17.',
      color: 'Black',
      brandModel: 'Fossil Derrick RFID',
      date: '2026-09-08',
      time: '14:30',
      location: {
        name: 'Grand Central Terminal Concourse',
        address: '89 E 42nd St, New York, NY 10017',
        lat: 40.7527,
        lng: -73.9772
      },
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      identifyingCharacteristics: 'Subtle monogram RS imprinted in silver foil on internal card flap; card slot has tear on upper left seam.',
      additionalObservations: 'Had about $45 in cash and a blue metro card.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-08T15:20:00Z',
      updatedAt: '2026-09-08T15:20:00Z'
    },
    {
      id: 'item_found_1',
      type: 'found',
      reporterId: 'usr_alex',
      reporterName: 'Alex Rivera',
      reporterEmail: 'alex.rivera@example.com',
      title: 'Found Black Leather Bifold Wallet',
      category: 'Wallet',
      description: 'Found a men black leather bifold wallet resting on bench near Grand Central clock tower. Turned in safely; contains cards and identification.',
      color: 'Black',
      brandModel: 'Fossil',
      date: '2026-09-08',
      time: '15:10',
      location: {
        name: 'Grand Central Terminal Station Master Desk',
        address: '89 E 42nd St, New York, NY 10017',
        lat: 40.7529,
        lng: -73.9774
      },
      imageUrl: 'https://images.unsplash.com/photo-1606503828399-a9a3b680c2f8?w=800&auto=format&fit=crop&q=80',
      additionalObservations: 'Stored securely in lost property box with tag #GC-908.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-08T16:00:00Z',
      updatedAt: '2026-09-08T16:00:00Z'
    },
    {
      id: 'item_lost_2',
      type: 'lost',
      reporterId: 'usr_sarah',
      reporterName: 'Sarah Chen',
      reporterEmail: 'sarah.chen@example.com',
      title: 'Titanium Blue iPhone 15 Pro',
      category: 'Mobile Phone',
      description: 'Apple iPhone 15 Pro in blue titanium with transparent MagSafe protective case. Left on outdoor cafe table.',
      color: 'Blue',
      brandModel: 'Apple iPhone 15 Pro 256GB',
      date: '2026-09-09',
      time: '13:15',
      location: {
        name: 'Bryant Park Coffee Pavilion',
        address: '42 W 42nd St, New York, NY 10036',
        lat: 40.7536,
        lng: -73.9832
      },
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      identifyingCharacteristics: 'Lock screen shows a golden retriever named Mochi; back glass has small Mt Rainier hiking sticker visible.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-09T14:00:00Z',
      updatedAt: '2026-09-09T14:00:00Z'
    },
    {
      id: 'item_found_2',
      type: 'found',
      reporterId: 'usr_rajesh',
      reporterName: 'Rajesh Santhosh',
      reporterEmail: 'rajeshsanthosh424@gmail.com',
      title: 'Found Blue Smartphone in Clear Case',
      category: 'Mobile Phone',
      description: 'Discovered a dark metallic blue modern smartphone on the south lawn bench at Bryant Park. Clear case with a mountain sticker.',
      color: 'Blue',
      brandModel: 'Apple',
      date: '2026-09-09',
      time: '14:00',
      location: {
        name: 'Bryant Park South Terrace Bench',
        address: 'Bryant Park, New York, NY 10018',
        lat: 40.7537,
        lng: -73.9836
      },
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      additionalObservations: 'Battery at 48%, phone is in lost mode. Awaiting claimant.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-09T14:45:00Z',
      updatedAt: '2026-09-09T14:45:00Z'
    },
    {
      id: 'item_lost_3',
      type: 'lost',
      reporterId: 'usr_alex',
      reporterName: 'Alex Rivera',
      reporterEmail: 'alex.rivera@example.com',
      title: 'Charcoal Grey Travel Laptop Backpack',
      category: 'Bag',
      description: 'Water-resistant charcoal grey backpack with brown faux-leather pull tabs. Contains college lecture notebooks and a graph notebook.',
      color: 'Grey',
      brandModel: 'Herschel Little America',
      date: '2026-09-07',
      time: '17:00',
      location: {
        name: 'New York Public Library Main Branch',
        address: '476 5th Ave, New York, NY 10018',
        lat: 40.7532,
        lng: -73.9822
      },
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      identifyingCharacteristics: 'Keychain with a mini brass compass attached to side webbing; initials AR written inside top flap.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-07T18:00:00Z',
      updatedAt: '2026-09-07T18:00:00Z'
    },
    {
      id: 'item_found_3',
      type: 'found',
      reporterId: 'usr_sarah',
      reporterName: 'Sarah Chen',
      reporterEmail: 'sarah.chen@example.com',
      title: 'Found Grey Backpack with Buckles',
      category: 'Bag',
      description: 'Found grey canvas backpack left near the research tables on 3rd floor reading room. Checked with security desk.',
      color: 'Grey',
      brandModel: 'Herschel',
      date: '2026-09-07',
      time: '18:15',
      location: {
        name: 'NYPL Rose Main Reading Room',
        address: '476 5th Ave, New York, NY 10018',
        lat: 40.7531,
        lng: -73.9824
      },
      imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
      additionalObservations: 'Contains stationery and study materials, kept at 1st floor security office.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-07T19:00:00Z',
      updatedAt: '2026-09-07T19:00:00Z'
    },
    {
      id: 'item_lost_4',
      type: 'lost',
      reporterId: 'usr_rajesh',
      reporterName: 'Rajesh Santhosh',
      reporterEmail: 'rajeshsanthosh424@gmail.com',
      title: 'Car Key Fob with Red Carabiner',
      category: 'Keys',
      description: 'Toyota smart key fob with house keys and gym membership barcode fob on a matte red climbing carabiner.',
      color: 'Black',
      brandModel: 'Toyota Smart Key',
      date: '2026-09-09',
      time: '18:45',
      location: {
        name: 'Times Square Subway Station',
        address: 'Broadway & 42nd St, New York, NY 10036',
        lat: 40.7580,
        lng: -73.9855
      },
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
      identifyingCharacteristics: 'Black tape wrapped around the secondary silver key; red Black Diamond mini carabiner.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-09T20:00:00Z',
      updatedAt: '2026-09-09T20:00:00Z'
    },
    {
      id: 'item_found_4',
      type: 'found',
      reporterId: 'usr_alex',
      reporterName: 'Alex Rivera',
      reporterEmail: 'alex.rivera@example.com',
      title: 'Found Toyota Key Fob with Red Clip',
      category: 'Keys',
      description: 'Found electronic car remote with three keys on a red carabiner clip near the turnstile entrance.',
      color: 'Black',
      brandModel: 'Toyota',
      date: '2026-09-09',
      time: '19:10',
      location: {
        name: 'Times Square Shuttle Platform',
        address: 'Times Square Subway, New York, NY 10036',
        lat: 40.7578,
        lng: -73.9858
      },
      imageUrl: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=800&auto=format&fit=crop&q=80',
      additionalObservations: 'Handed over to MTA lost and found agent.',
      status: 'active',
      isFraudulent: false,
      createdAt: '2026-09-09T20:30:00Z',
      updatedAt: '2026-09-09T20:30:00Z'
    }
  ],

  matches: [
    {
      id: 'match_1',
      lostItemId: 'item_lost_1',
      foundItemId: 'item_found_1',
      matchScore: 92,
      breakdown: {
        imageScore: 33,
        descriptionScore: 23,
        categoryScore: 10,
        colorScore: 10,
        brandScore: 5,
        locationScore: 9,
        dateTimeScore: 5
      },
      reasons: [
        '✓ Same item category: Wallet',
        '✓ Identical brand: Fossil bifold model',
        '✓ Matching color: Black leather',
        '✓ Highly proximate location (< 150 meters at Grand Central)',
        '✓ Same date reported (Sep 8, 2026 within 40 minutes)'
      ],
      aiSummary: 'Strong multimodal match. Both reports describe a Black Fossil bifold leather wallet lost/found at Grand Central Terminal on Sep 8 within 40 minutes of each other.',
      status: 'potential',
      createdAt: '2026-09-08T16:05:00Z'
    },
    {
      id: 'match_2',
      lostItemId: 'item_lost_2',
      foundItemId: 'item_found_2',
      matchScore: 94,
      breakdown: {
        imageScore: 34,
        descriptionScore: 24,
        categoryScore: 10,
        colorScore: 10,
        brandScore: 5,
        locationScore: 9,
        dateTimeScore: 5
      },
      reasons: [
        '✓ Same category: Mobile Phone',
        '✓ Identical color & model: Blue Apple iPhone with transparent case',
        '✓ Matching observation: Mountain sticker on back plate',
        '✓ Location proximity: Bryant Park South terrace (< 60 meters)',
        '✓ Same afternoon timestamp (within 45 minutes)'
      ],
      aiSummary: 'Extremely high probability match. The visual characteristics (blue titanium, clear MagSafe case, mountain sticker) and Bryant Park location correlate precisely.',
      status: 'potential',
      createdAt: '2026-09-09T14:50:00Z'
    },
    {
      id: 'match_3',
      lostItemId: 'item_lost_3',
      foundItemId: 'item_found_3',
      matchScore: 89,
      breakdown: {
        imageScore: 31,
        descriptionScore: 22,
        categoryScore: 10,
        colorScore: 10,
        brandScore: 5,
        locationScore: 9,
        dateTimeScore: 4
      },
      reasons: [
        '✓ Same category: Bag',
        '✓ Matching brand & aesthetic: Herschel charcoal backpack',
        '✓ Same location: New York Public Library Main Reading Room',
        '✓ Same date (Sep 7, 2026)'
      ],
      aiSummary: 'High probability match for a charcoal grey Herschel bag found in the NYPL main reading room around the time reported lost.',
      status: 'potential',
      createdAt: '2026-09-07T19:05:00Z'
    },
    {
      id: 'match_4',
      lostItemId: 'item_lost_4',
      foundItemId: 'item_found_4',
      matchScore: 91,
      breakdown: {
        imageScore: 32,
        descriptionScore: 23,
        categoryScore: 10,
        colorScore: 10,
        brandScore: 5,
        locationScore: 9,
        dateTimeScore: 5
      },
      reasons: [
        '✓ Same category: Keys',
        '✓ Identical brand: Toyota smart key fob',
        '✓ Distinctive marker: Attached to red carabiner clip',
        '✓ Proximity: Times Square subway platform/turnstiles'
      ],
      aiSummary: 'Very high confidence match. The specific combination of a Toyota fob and red carabiner at Times Square Station aligns tightly.',
      status: 'potential',
      createdAt: '2026-09-09T20:35:00Z'
    }
  ],

  claims: [
    {
      id: 'claim_1',
      lostItemId: 'item_lost_1',
      foundItemId: 'item_found_1',
      lostItemTitle: 'Black Fossil Leather Bifold Wallet',
      foundItemTitle: 'Found Black Leather Bifold Wallet',
      claimantId: 'usr_rajesh',
      claimantName: 'Rajesh Santhosh',
      finderId: 'usr_alex',
      hiddenDetails: 'The interior right sleeve has initials RS embossed in silver. There is a blue metrocard expiring Dec 2026.',
      serialNumberProof: 'Fossil SKU 884-FL-09',
      proofImageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80',
      message: 'Hello! I believe this is my wallet that slipped from my jacket near Track 17. The ID inside confirms my name Rajesh Santhosh.',
      status: 'pending',
      createdAt: '2026-09-08T17:00:00Z',
      updatedAt: '2026-09-08T17:00:00Z'
    }
  ],

  messages: [
    {
      id: 'msg_1',
      threadId: 'claim_1',
      senderId: 'usr_rajesh',
      senderName: 'Rajesh Santhosh',
      recipientId: 'usr_alex',
      content: 'Hi Alex! Thank you so much for turning the wallet in. Does it have the metro card inside?',
      timestamp: '2026-09-08T17:05:00Z'
    },
    {
      id: 'msg_2',
      threadId: 'claim_1',
      senderId: 'usr_alex',
      senderName: 'Alex Rivera',
      recipientId: 'usr_rajesh',
      content: 'Hi Rajesh! Yes, I checked with the station master desk and the driver license matches your name. You can pick it up with your passport or photo ID.',
      timestamp: '2026-09-08T17:20:00Z'
    }
  ],

  notifications: [
    {
      id: 'notif_1',
      userId: 'usr_rajesh',
      title: 'Potential Match Found (92%)',
      message: 'AI detected a potential match for your "Black Fossil Leather Bifold Wallet" at Grand Central Terminal.',
      type: 'match_found',
      link: '/matches',
      read: false,
      createdAt: '2026-09-08T16:05:00Z'
    },
    {
      id: 'notif_2',
      userId: 'usr_sarah',
      title: 'Potential Match Found (94%)',
      message: 'A Blue iPhone matching your lost report was found at Bryant Park.',
      type: 'match_found',
      link: '/matches',
      read: false,
      createdAt: '2026-09-09T14:50:00Z'
    },
    {
      id: 'notif_3',
      userId: 'usr_alex',
      title: 'New Claim Received',
      message: 'Rajesh Santhosh submitted an ownership claim for your found wallet report.',
      type: 'claim_received',
      link: '/dashboard',
      read: true,
      createdAt: '2026-09-08T17:00:00Z'
    }
  ],

  reports: [
    {
      id: 'rep_1',
      reporterId: 'usr_alex',
      itemId: 'item_lost_4',
      itemTitle: 'Car Key Fob with Red Carabiner',
      reason: 'Duplicate listing check',
      details: 'Looks similar to another listing posted earlier, requested admin verification.',
      status: 'pending',
      createdAt: '2026-09-09T21:00:00Z'
    }
  ]
};

export function getStats(): SystemStats {
  const totalLost = db.items.filter(i => i.type === 'lost' && !i.isFraudulent).length;
  const totalFound = db.items.filter(i => i.type === 'found' && !i.isFraudulent).length;
  const totalMatches = db.matches.length;
  const totalClaims = db.claims.length;
  const totalResolved = db.items.filter(i => i.status === 'resolved').length;
  const fraudAlerts = db.reports.filter(r => r.status === 'pending').length;
  const recoveryRate = totalLost > 0 ? Math.round((totalResolved / totalLost) * 100) : 75;

  return {
    totalLost,
    totalFound,
    totalMatches,
    totalClaims,
    totalResolved,
    fraudAlerts,
    recoveryRate
  };
}
