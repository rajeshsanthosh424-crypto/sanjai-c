import React, { useState, useEffect } from 'react';
import {
  Package,
  Sparkles,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Trash2,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Item, Match, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { MatchCard } from '../components/MatchCard';

interface DashboardPageProps {
  items: Item[];
  matches: Match[];
  onViewItemDetails: (item: Item) => void;
  onInitiateClaim: (itemOrMatch: Item | Match) => void;
  onOpenMessage: (threadId: string, recipientId: string, recipientName: string) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onRefreshData: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  items,
  matches,
  onViewItemDetails,
  onInitiateClaim,
  onOpenMessage,
  onOpenReportModal,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'matches' | 'claims'>('lost');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimResolutionNotes, setClaimResolutionNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = async () => {
    if (!user) return;
    setLoadingClaims(true);
    try {
      const res = await api.getClaims();
      setClaims(res.claims || []);
    } catch (err) {
      console.warn('Error fetching claims:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <Shield className="h-12 w-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Sign in to access your dashboard</h3>
        <p className="text-xs text-slate-500">
          Track your reported belongings, view ownership claims, and communicate safely.
        </p>
      </div>
    );
  }

  // Filter user's specific items
  const myLostItems = items.filter((i) => i.reporterId === user.id && i.type === 'lost');
  const myFoundItems = items.filter((i) => i.reporterId === user.id && i.type === 'found');

  // Filter matches involving current user
  const myMatches = matches.filter(
    (m) => m.lostItem?.reporterId === user.id || m.foundItem?.reporterId === user.id
  );

  // Filter claims where user is finder (needs review) or claimant (submitted)
  const claimsOnMyFoundItems = claims.filter((c) => c.foundItem?.reporterId === user.id);
  const claimsISubmitted = claims.filter((c) => c.claimantId === user.id);

  const handleResolveClaim = async (claimId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(claimId);
    try {
      const notes = claimResolutionNotes[claimId] || '';
      await api.updateClaimStatus(claimId, status, notes);
      await fetchClaims();
      onRefreshData();
    } catch (err) {
      console.error('Failed to update claim:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkResolved = async (itemId: string) => {
    if (!window.confirm('Mark this item as recovered / resolved?')) return;
    try {
      await api.updateItem(itemId, { status: 'resolved' });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to remove this report?')) return;
    try {
      await api.deleteItem(itemId);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Dashboard Top Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Quick Report CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportModal('lost')}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            + Report Lost Item
          </button>
          <button
            onClick={() => onOpenReportModal('found')}
            className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            + Report Found Item
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'lost'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Lost Reports ({myLostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'found'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Found Reports ({myFoundItems.length})
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Possible Matches ({myMatches.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'claims'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Ownership Claims ({claimsOnMyFoundItems.length + claimsISubmitted.length})
        </button>
      </div>

      {/* Tab: My Lost Items */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          {myLostItems.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No lost reports yet</h3>
              <p className="text-xs text-slate-500 mt-1">If you lost an item, create a report to activate AI matching.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myLostItems.map((item) => (
                <div key={item.id} className="relative flex flex-col">
                  <ItemCard
                    item={item}
                    onViewDetails={onViewItemDetails}
                  />
                  {/* Management actions */}
                  <div className="mt-2 flex items-center gap-2">
                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkResolved(item.id)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        Mark as Recovered
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Found Items */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          {myFoundItems.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No found reports yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Help someone recover their valuable item by reporting items you found in public places.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myFoundItems.map((item) => (
                <div key={item.id} className="relative flex flex-col">
                  <ItemCard
                    item={item}
                    onViewDetails={onViewItemDetails}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkResolved(item.id)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        Mark as Returned to Owner
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Possible Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {myMatches.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8">
              <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No matches found for your reports yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Our Gemini matching engine regularly evaluates newly submitted reports against your items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {myMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onInitiateClaim={onInitiateClaim}
                  onOpenMessage={onOpenMessage}
                  onViewItemDetails={onViewItemDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Claims Management */}
      {activeTab === 'claims' && (
        <div className="space-y-8">
          {/* Section A: Claims submitted on items I found */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Claims on Items You Found (Require Your Verification)</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                {claimsOnMyFoundItems.length}
              </span>
            </h3>

            {claimsOnMyFoundItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No incoming claims on items you found.</p>
            ) : (
              <div className="space-y-4">
                {claimsOnMyFoundItems.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-600">Claimant Verification</span>
                        <h4 className="text-sm font-bold text-slate-900">{c.claimantName} claimed "{c.foundItem?.title}"</h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                          c.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    {/* Proof Review Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-700">Claimant's Secret Identifying Proof:</span>
                        <p className="text-slate-800 mt-0.5">{c.hiddenDetails}</p>
                      </div>
                      {c.serialNumberProof && (
                        <div>
                          <span className="font-bold text-slate-700">Serial Number Provided:</span>
                          <p className="text-slate-800 mt-0.5">{c.serialNumberProof}</p>
                        </div>
                      )}
                      {c.proofImageUrl && (
                        <div>
                          <span className="font-bold text-slate-700">Proof Receipt / Image:</span>
                          <img
                            src={c.proofImageUrl}
                            alt="Claim proof"
                            className="mt-1 h-24 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Finder Resolution Actions */}
                    {c.status === 'pending' && (
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Optional notes for claimant..."
                          value={claimResolutionNotes[c.id] || ''}
                          onChange={(e) =>
                            setClaimResolutionNotes({
                              ...claimResolutionNotes,
                              [c.id]: e.target.value,
                            })
                          }
                          className="w-full sm:w-80 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none"
                        />

                        <div className="flex items-center gap-2 self-end">
                          <button
                            onClick={() =>
                              onOpenMessage(c.id, c.claimantId, c.claimantName)
                            }
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat Claimant
                          </button>
                          <button
                            onClick={() => handleResolveClaim(c.id, 'rejected')}
                            disabled={actionLoading === c.id}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                          >
                            Reject Claim
                          </button>
                          <button
                            onClick={() => handleResolveClaim(c.id, 'accepted')}
                            disabled={actionLoading === c.id}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                          >
                            Accept Claim &amp; Verify Return
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Claims I submitted */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Claims You Submitted</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {claimsISubmitted.length}
              </span>
            </h3>

            {claimsISubmitted.length === 0 ? (
              <p className="text-xs text-slate-400 italic">You haven't submitted any ownership claims.</p>
            ) : (
              <div className="space-y-3">
                {claimsISubmitted.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">Claim for "{c.foundItem?.title}"</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Submitted on {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[11px] ${
                          c.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Status: {c.status}
                      </span>

                      {c.foundItem && (
                        <button
                          onClick={() =>
                            onOpenMessage(c.id, c.foundItem.reporterId, c.foundItem.reporterName)
                          }
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold"
                        >
                          Message Finder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
