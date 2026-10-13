import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SystemContent,
  auth,
  db,
  syncUserProfile,
  loginWithGoogle,
  loginAsGuestDemo,
  logoutUser
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Navbar } from './components/Navbar';
import { BenchmarkExplorer } from './components/BenchmarkExplorer';
import { UserEvalLab } from './components/UserEvalLab';
import { AdminDashboard } from './components/AdminDashboard';
import { PrdViewer } from './components/PrdViewer';
import { CompareModal } from './components/CompareModal';
import { BenchmarkModel } from '../server';
import { Megaphone, X, Sparkles, Shield, Terminal } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'explorer' | 'evals' | 'admin' | 'prd'>('explorer');
  const [announcements, setAnnouncements] = useState<SystemContent[]>([]);
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([]);
  
  // Model prefill for User Eval Lab
  const [prefillModel, setPrefillModel] = useState<string | null>(null);
  const [prefillCategory, setPrefillCategory] = useState<string | null>(null);

  // Model comparison modal
  const [selectedForCompare, setSelectedForCompare] = useState<BenchmarkModel[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfile(fbUser);
          setCurrentUser(profile);
        } catch (err) {
          console.warn('Profile sync fallback:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to published announcements in real-time
  useEffect(() => {
    const q = query(collection(db, 'system_content'), where('isPublished', '==', true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SystemContent[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setAnnouncements(list);
      },
      (err) => {
        // Quiet fallback if not permitted yet
        console.warn('System content public listener:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSelectForEval = (modelName: string, category: string) => {
    setPrefillModel(modelName);
    setPrefillCategory(category);
    setActiveTab('evals');
  };

  const handleToggleCompare = (model: BenchmarkModel) => {
    if (selectedForCompare.some((m) => m.id === model.id)) {
      setSelectedForCompare(selectedForCompare.filter((m) => m.id !== model.id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare up to 4 models simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, model]);
    }
  };

  const handleOpenCompare = (modelsToCompare: BenchmarkModel[]) => {
    setSelectedForCompare(modelsToCompare);
    setIsCompareModalOpen(true);
  };

  const handleRemoveFromCompare = (modelId: string) => {
    const updated = selectedForCompare.filter((m) => m.id !== modelId);
    setSelectedForCompare(updated);
    if (updated.length === 0) {
      setIsCompareModalOpen(false);
    }
  };

  const handleRequireAuth = () => {
    // Open quick login or guest login
    loginAsGuestDemo('member').then((profile) => setCurrentUser(profile));
  };

  const handleSimulateAdmin = () => {
    loginAsGuestDemo('admin').then((profile) => setCurrentUser(profile));
  };

  const activeNotice = announcements.find((n) => !dismissedNoticeIds.includes(n.id));

  return (
    <div className="min-h-screen bg-[#FBF9F1] flex flex-col text-black antialiased font-sans selection:bg-[#FFE600]">
      
      {/* Broadcast Announcement Bar */}
      {activeNotice && (
        <div className="bg-[#FFE600] border-b-2 border-black px-4 py-2 font-mono text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 shrink-0 text-black" />
            <span className="uppercase font-black bg-black text-[#FFE600] px-1 text-[10px]">
              {activeNotice.type}
            </span>
            <span className="font-extrabold">{activeNotice.title}:</span>
            <span className="text-neutral-800 font-medium truncate">{activeNotice.body}</span>
          </div>
          <button
            onClick={() => setDismissedNoticeIds([...dismissedNoticeIds, activeNotice.id])}
            className="text-black hover:bg-black/10 p-1 shrink-0 font-bold"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Neo-Brutalist Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onUserChange={setCurrentUser}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explorer' && (
          <BenchmarkExplorer
            onSelectForEval={handleSelectForEval}
            onOpenCompare={handleOpenCompare}
            selectedForCompare={selectedForCompare}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {activeTab === 'evals' && (
          <UserEvalLab
            user={currentUser}
            onRequireAuth={handleRequireAuth}
            prefillModel={prefillModel}
            prefillCategory={prefillCategory}
            onClearPrefill={() => {
              setPrefillModel(null);
              setPrefillCategory(null);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onSimulateAdmin={handleSimulateAdmin}
          />
        )}

        {activeTab === 'prd' && <PrdViewer />}
      </main>

      {/* Side-by-Side Model Comparison Modal */}
      {isCompareModalOpen && (
        <CompareModal
          models={selectedForCompare}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveModel={handleRemoveFromCompare}
        />
      )}

      {/* Neo-Brutalist Footer */}
      <footer className="border-t-2 border-black bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="font-black bg-[#FFE600] px-2 py-0.5 border border-black">
              BENCHPULSE
            </span>
            <span className="text-neutral-600">
              BenchLM Data API Integration · Firestore Zero-Trust ABAC
            </span>
          </div>
          <div className="text-neutral-500">
            © {new Date().getFullYear()} BenchPulse Portal. Built with neo-brutalism design discipline.
          </div>
        </div>
      </footer>

    </div>
  );
}
