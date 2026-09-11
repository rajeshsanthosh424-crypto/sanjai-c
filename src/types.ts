export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Mobile Phone'
  | 'Wallet'
  | 'ID Card'
  | 'Bag'
  | 'Keys'
  | 'Laptop'
  | 'Earphones'
  | 'Documents'
  | 'Jewelry'
  | 'Books'
  | 'Clothing'
  | 'Other';

export interface LocationData {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface Item {
  id: string;
  type: ItemType;
  reporterId: string;
  reporterName: string;
  reporterEmail?: string; // Private
  title: string;
  category: ItemCategory;
  description: string;
  color: string;
  brandModel: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: LocationData;
  imageUrl: string;
  identifyingCharacteristics?: string; // Hidden/private to reporter
  additionalObservations?: string;
  status: 'active' | 'claim_pending' | 'resolved' | 'flagged';
  isFraudulent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatchBreakdown {
  imageScore: number;
  descriptionScore: number;
  categoryScore: number;
  colorScore: number;
  brandScore: number;
  locationScore: number;
  dateTimeScore: number;
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItem?: Item;
  foundItem?: Item;
  matchScore: number; // 0 - 100
  breakdown: MatchBreakdown;
  reasons: string[];
  aiSummary: string;
  status: 'potential' | 'verified' | 'dismissed';
  createdAt: string;
}

export interface Claim {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItemTitle: string;
  foundItemTitle: string;
  claimantId: string;
  claimantName: string;
  finderId: string;
  hiddenDetails: string;
  serialNumberProof?: string;
  proofImageUrl?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match_found' | 'claim_received' | 'claim_status' | 'message_received' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ReportAbuse {
  id: string;
  reporterId: string;
  itemId: string;
  itemTitle: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface SystemStats {
  totalLost: number;
  totalFound: number;
  totalMatches: number;
  totalClaims: number;
  totalResolved: number;
  fraudAlerts: number;
  recoveryRate: number;
}

export interface SmartSearchQuery {
  naturalQuery: string;
  parsedCriteria?: {
    type?: ItemType | 'all';
    category?: string;
    color?: string;
    brand?: string;
    locationKeywords?: string[];
    dateRange?: string;
  };
}
