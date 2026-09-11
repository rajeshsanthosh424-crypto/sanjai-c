import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { MatchesPage } from './pages/MatchesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ClaimModal } from './components/ClaimModal';
import { MessagingModal } from './components/MessagingModal';
import { ReportAbuseModal } from './components/ReportAbuseModal';
import { AuthModal } from './components/AuthModal';
import { Item, Match, ItemType } from './types';
import { api } from './services/api';
import { Sparkles, CheckCircle2, Shield } from 'lucide-react';

function MainContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Item | null>(null);
  const [claimTarget, setClaimTarget] = useState<Item | Match | null>(null);
  const [flaggedItem, setFlaggedItem] = useState<Item | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [chatThread, setChatThread] = useState<{
    threadId: string;
    recipientId: string;
    recipientName: string;
  } | null>(null);

  // Notification Toast banner
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, matchesRes] = await Promise.all([
        api.getItems(),
        api.getMatches({ minScore: 50 }),
      ]);
      setItems(itemsRes.items || []);
      setMatches(matchesRes.matches || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenReportModal = (type: 'lost' | 'found') => {
    setCurrentTab(type === 'lost' ? 'report-lost' : 'report-found');
  };

  const handleItemCreated = (item: Item, createdMatchesCount: number) => {
    loadData();
    setToastMessage({
      title: `${item.type === 'lost' ? 'Lost' : 'Found'} Item Report Submitted!`,
      subtitle:
        createdMatchesCount > 0
          ? `Gemini identified ${createdMatchesCount} possible matches with existing reports!`
          : 'Report registered in the public recovery catalog.',
    });
    setTimeout(() => setToastMessage(null), 5000);

    if (createdMatchesCount > 0) {
      setCurrentTab('matches');
    } else {
      setCurrentTab(item.type === 'lost' ? 'lost' : 'found');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-indigo-900 text-white p-4 shadow-2xl border border-indigo-700/80 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold">{toastMessage.title}</h4>
            <p className="text-[11px] text-indigo-200 mt-0.5">{toastMessage.subtitle}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-indigo-300 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Sticky Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenReportModal={handleOpenReportModal}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'home' && (
          <HomePage
            items={items}
            matches={matches}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenReportModal={handleOpenReportModal}
            onViewItemDetails={(item) => setSelectedItemForDetails(item)}
            onInitiateClaim={(target) => setClaimTarget(target)}
            onOpenMessage={(threadId, recipientId, recipientName) =>
              setChatThread({ threadId, recipientId, recipientName })
            }
          />
        )}

        {currentTab === 'lost' && (
          <LostItemsPage
            items={items}
            onViewDetails={(item) => setSelectedItemForDetails(item)}
            onOpenReportModal={handleOpenReportModal}
            onReportAbuse={(item) => setFlaggedItem(item)}
          />
        )}

        {currentTab === 'found' && (
          <FoundItemsPage
            items={items}
            onViewDetails={(item) => setSelectedItemForDetails(item)}
            onInitiateClaim={(item) => setClaimTarget(item)}
            onOpenReportModal={handleOpenReportModal}
            onReportAbuse={(item) => setFlaggedItem(item)}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesPage
            matches={matches}
            onInitiateClaim={(match) => setClaimTarget(match)}
            onOpenMessage={(threadId, recipientId, recipientName) =>
              setChatThread({ threadId, recipientId, recipientName })
            }
            onViewItemDetails={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            items={items}
            matches={matches}
            onViewItemDetails={(item) => setSelectedItemForDetails(item)}
            onInitiateClaim={(target) => setClaimTarget(target)}
            onOpenMessage={(threadId, recipientId, recipientName) =>
              setChatThread({ threadId, recipientId, recipientName })
            }
            onOpenReportModal={handleOpenReportModal}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage onRefreshData={loadData} />
        )}

        {currentTab === 'report-lost' && (
          <ReportItemPage
            initialType="lost"
            onItemCreated={handleItemCreated}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'report-found' && (
          <ReportItemPage
            initialType="found"
            onItemCreated={handleItemCreated}
            onCancel={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* Modals */}
      {selectedItemForDetails && (
        <ItemDetailsModal
          item={selectedItemForDetails}
          onClose={() => setSelectedItemForDetails(null)}
          onInitiateClaim={(item) => {
            setSelectedItemForDetails(null);
            setClaimTarget(item);
          }}
          onOpenMessage={(threadId, recipientId, recipientName) => {
            setSelectedItemForDetails(null);
            setChatThread({ threadId, recipientId, recipientName });
          }}
          onReportAbuse={(item) => {
            setSelectedItemForDetails(null);
            setFlaggedItem(item);
          }}
        />
      )}

      {claimTarget && (
        <ClaimModal
          itemOrMatch={claimTarget}
          onClose={() => setClaimTarget(null)}
          onClaimSubmitted={() => {
            setClaimTarget(null);
            loadData();
          }}
        />
      )}

      {chatThread && (
        <MessagingModal
          threadId={chatThread.threadId}
          recipientId={chatThread.recipientId}
          recipientName={chatThread.recipientName}
          onClose={() => setChatThread(null)}
        />
      )}

      {flaggedItem && (
        <ReportAbuseModal
          item={flaggedItem}
          onClose={() => setFlaggedItem(null)}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Lost &amp; Found</span>
            <span>—</span>
            <span>Smart Item Recovery System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-600" /> Secure Verification
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Gemini Hybrid Matcher
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
