import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserEval,
  db,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  Terminal,
  Clock,
  Coins,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface UserEvalLabProps {
  user: UserProfile | null;
  onRequireAuth: () => void;
  prefillModel?: string | null;
  prefillCategory?: string | null;
  onClearPrefill: () => void;
}

export const UserEvalLab: React.FC<UserEvalLabProps> = ({
  user,
  onRequireAuth,
  prefillModel,
  prefillCategory,
  onClearPrefill,
}) => {
  const [evals, setEvals] = useState<UserEval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<UserEval | null>(null);

  // Form Fields
  const [formModelName, setFormModelName] = useState('Claude 3.7 Sonnet');
  const [formCategory, setFormCategory] = useState<'Coding' | 'Reasoning' | 'Agentic' | 'Multimodal' | 'General' | 'Custom'>('Coding');
  const [formBenchmarkName, setFormBenchmarkName] = useState('');
  const [formScore, setFormScore] = useState<number>(85);
  const [formPromptSample, setFormPromptSample] = useState('');
  const [formResponseSnippet, setFormResponseSnippet] = useState('');
  const [formLatencyMs, setFormLatencyMs] = useState<number>(450);
  const [formTokenCost, setFormTokenCost] = useState<number>(0.005);
  const [formPrivateNotes, setFormPrivateNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger prefill from leaderboards if passed
  useEffect(() => {
    if (prefillModel) {
      setFormModelName(prefillModel);
      if (prefillCategory && ['Coding', 'Reasoning', 'Agentic', 'Multimodal', 'General', 'Custom'].includes(prefillCategory)) {
        setFormCategory(prefillCategory as any);
      }
      setFormBenchmarkName(`Custom Eval on ${prefillModel}`);
      setEditingEval(null);
      setIsModalOpen(true);
      onClearPrefill();
    }
  }, [prefillModel]);

  // Firestore real-time listener for current user's evals
  useEffect(() => {
    if (!user) {
      setEvals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const path = 'user_evals';
    const q = query(collection(db, path), where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: UserEval[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setEvals(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const openCreateModal = () => {
    setEditingEval(null);
    setFormModelName('Claude 3.7 Sonnet');
    setFormCategory('Coding');
    setFormBenchmarkName('');
    setFormScore(88);
    setFormPromptSample('// Refactor legacy concurrent pool with lock-free ring buffer');
    setFormResponseSnippet('Implemented AtomicCAS ring buffer with zero allocations.');
    setFormLatencyMs(420);
    setFormTokenCost(0.004);
    setFormPrivateNotes('Impressive zero-shot memory layout, no compiler warnings.');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: UserEval) => {
    setEditingEval(item);
    setFormModelName(item.modelName);
    setFormCategory(item.benchmarkCategory);
    setFormBenchmarkName(item.benchmarkName);
    setFormScore(item.score);
    setFormPromptSample(item.promptSample || '');
    setFormResponseSnippet(item.responseSnippet || '');
    setFormLatencyMs(item.latencyMs || 0);
    setFormTokenCost(item.tokenCost || 0);
    setFormPrivateNotes(item.privateNotes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!formBenchmarkName.trim()) {
      setFormError('Please enter a Benchmark Title');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const evalId = editingEval ? editingEval.id : `eval_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const evalPath = `user_evals/${evalId}`;

    const payload: UserEval = {
      id: evalId,
      ownerId: user.uid,
      modelName: formModelName.trim(),
      benchmarkCategory: formCategory,
      benchmarkName: formBenchmarkName.trim(),
      score: Number(formScore),
      promptSample: formPromptSample.trim(),
      responseSnippet: formResponseSnippet.trim(),
      latencyMs: Number(formLatencyMs),
      tokenCost: Number(formTokenCost),
      privateNotes: formPrivateNotes.trim(),
      updatedAt: serverTimestamp(),
      ...(editingEval ? {} : { createdAt: serverTimestamp() }),
    };

    try {
      await setDoc(doc(db, 'user_evals', evalId), payload, { merge: true });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving eval:', err);
      handleFirestoreError(err, editingEval ? OperationType.UPDATE : OperationType.CREATE, evalPath);
      setFormError('Failed to save evaluation to Firestore. Please check permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEval = async (evalId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm('Delete this evaluation record? This action cannot be undone.');
    if (!confirmDelete) return;

    const path = `user_evals/${evalId}`;
    try {
      await deleteDoc(doc(db, 'user_evals', evalId));
    } catch (err) {
      console.error('Delete error:', err);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const filteredEvals = evals.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.benchmarkCategory.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.benchmarkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.privateNotes && item.privateNotes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const avgScore = evals.length > 0 ? (evals.reduce((acc, curr) => acc + curr.score, 0) / evals.length).toFixed(1) : '0';

  if (!user) {
    return (
      <div className="brutal-card-lg p-8 sm:p-12 text-center bg-white border-2 border-black max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-[#FFE600] border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
          Personal Eval Lab Is Locked
        </h2>
        <p className="text-sm text-neutral-700 font-medium mb-6">
          Sign in to create, edit, organize, and delete (CRUD) your own private model evaluations, prompt tests, latency logs, and private architectural notes.
        </p>
        <button
          onClick={onRequireAuth}
          className="brutal-btn px-6 py-3 bg-[#FFE600] text-black font-extrabold uppercase text-sm"
        >
          Sign In / Open Demo Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Workspace Header & KPI Strip */}
      <div className="brutal-card p-6 bg-white border-2 border-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#00F0FF] px-2 py-0.5 border-2 border-black font-mono text-xs font-black uppercase">
                Private Sandbox
              </span>
              <span className="font-mono text-xs text-neutral-600 font-bold">
                Owned by: {user.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
              My Model Evaluation Lab
            </h1>
            <p className="text-sm text-neutral-700 mt-1 font-medium">
              Create, read, update, and delete (CRUD) custom prompt evaluations and private model notes stored in your isolated Firestore collection.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="brutal-btn px-4 py-2.5 bg-[#FFE600] text-black text-xs font-black uppercase flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Eval</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t-2 border-black">
          <div className="p-3 bg-[#FBF9F1] border-2 border-black">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Total Recorded</span>
            <span className="text-2xl font-black font-mono tabular-nums">{evals.length}</span>
          </div>
          <div className="p-3 bg-[#FBF9F1] border-2 border-black">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Average Score</span>
            <span className="text-2xl font-black font-mono text-[#0066FF] tabular-nums">{avgScore}%</span>
          </div>
          <div className="p-3 bg-[#FBF9F1] border-2 border-black">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Unique Models</span>
            <span className="text-2xl font-black font-mono tabular-nums">
              {new Set(evals.map((e) => e.modelName)).size}
            </span>
          </div>
          <div className="p-3 bg-[#FBF9F1] border-2 border-black">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Database Status</span>
            <span className="text-xs font-bold font-mono text-[#00AA00] flex items-center gap-1 mt-2">
              <span className="w-2 h-2 bg-[#70FF00] border border-black inline-block" />
              Synced ABAC
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-5 pt-4 border-t border-neutral-300 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['all', 'Coding', 'Reasoning', 'Agentic', 'Multimodal', 'Custom'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 text-xs font-bold border-2 border-black cursor-pointer transition-all ${
                  filterCategory === cat
                    ? 'bg-[#00F0FF] shadow-[2px_2px_0px_#000] -translate-y-0.5'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {cat === 'all' ? 'All Evals' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search your evaluations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="brutal-input pl-8 pr-3 py-1 text-xs font-medium w-full"
            />
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      {loading ? (
        <div className="brutal-card p-12 text-center bg-white border-2 border-black">
          <p className="font-mono text-sm font-bold uppercase animate-pulse">
            Loading private evaluations from Firestore...
          </p>
        </div>
      ) : filteredEvals.length === 0 ? (
        <div className="brutal-card p-12 text-center bg-white border-2 border-black">
          <Terminal className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-black uppercase mb-1">No Evaluations Found</h3>
          <p className="text-xs text-neutral-600 mb-4 max-w-sm mx-auto font-medium">
            You haven't recorded any benchmark evaluations yet or your filter returned no results.
          </p>
          <button
            onClick={openCreateModal}
            className="brutal-btn px-4 py-2 bg-[#FFE600] text-xs font-black uppercase"
          >
            + Create First Evaluation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvals.map((item) => (
            <div
              key={item.id}
              className="brutal-card bg-white p-5 flex flex-col justify-between hover:shadow-[6px_6px_0px_#000] transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-[#FFE600] px-2 py-0.5 border border-black">
                      {item.benchmarkCategory}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-700">
                      {item.modelName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit"
                      className="brutal-btn p-1 bg-white hover:bg-neutral-100 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEval(item.id)}
                      title="Delete"
                      className="brutal-btn p-1 bg-[#FF4343] text-white hover:bg-red-600 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold tracking-tight mb-2 text-black">
                  {item.benchmarkName}
                </h3>

                {/* Score & Telemetry Ribbon */}
                <div className="flex items-center gap-4 p-2.5 bg-[#FBF9F1] border-2 border-black mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block">Score</span>
                    <span className="text-xl font-black font-mono tabular-nums text-black">{item.score}%</span>
                  </div>
                  {item.latencyMs !== undefined && (
                    <div className="border-l border-neutral-300 pl-3">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">Latency</span>
                      <span className="text-sm font-bold font-mono tabular-nums">{item.latencyMs}ms</span>
                    </div>
                  )}
                  {item.tokenCost !== undefined && (
                    <div className="border-l border-neutral-300 pl-3">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">Cost</span>
                      <span className="text-sm font-bold font-mono tabular-nums">${item.tokenCost}</span>
                    </div>
                  )}
                </div>

                {/* Prompt & Output snippets */}
                {item.promptSample && (
                  <div className="mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-neutral-500 block mb-0.5">
                      Prompt Sample:
                    </span>
                    <p className="text-xs font-mono bg-neutral-50 p-2 border border-black text-neutral-800 line-clamp-2">
                      {item.promptSample}
                    </p>
                  </div>
                )}

                {/* Private Notes */}
                {item.privateNotes && (
                  <div className="mb-3">
                    <span className="text-[10px] font-mono uppercase font-bold text-neutral-500 block mb-0.5">
                      Private Notes:
                    </span>
                    <p className="text-xs text-neutral-700 italic bg-amber-50/50 p-2 border border-black/40">
                      "{item.privateNotes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span>ID: {item.id.slice(0, 14)}...</span>
                <span className="font-bold text-emerald-700">Verified Owner</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Create & Edit Eval */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="brutal-card-lg bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 border-3 border-black relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {editingEval ? 'Edit Evaluation Record' : 'Create Custom Evaluation'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="brutal-btn p-1 bg-white hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 bg-red-100 border-2 border-black text-red-900 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEval} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold font-mono uppercase block mb-1">
                    AI Model Target
                  </label>
                  <input
                    type="text"
                    value={formModelName}
                    onChange={(e) => setFormModelName(e.target.value)}
                    placeholder="e.g. Claude 3.7 Sonnet"
                    className="brutal-input w-full p-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold font-mono uppercase block mb-1">
                    Benchmark Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="brutal-input w-full p-2 text-xs font-bold bg-white"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="Agentic">Agentic</option>
                    <option value="Multimodal">Multimodal</option>
                    <option value="General">General</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">
                  Benchmark Title / Test Scenario
                </label>
                <input
                  type="text"
                  value={formBenchmarkName}
                  onChange={(e) => setFormBenchmarkName(e.target.value)}
                  placeholder="e.g. Async WebSocket Stress Test Suite"
                  className="brutal-input w-full p-2 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold font-mono uppercase block mb-1">
                    Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    className="brutal-input w-full p-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold font-mono uppercase block mb-1">
                    Latency (ms)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formLatencyMs}
                    onChange={(e) => setFormLatencyMs(Number(e.target.value))}
                    className="brutal-input w-full p-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold font-mono uppercase block mb-1">
                    Token Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formTokenCost}
                    onChange={(e) => setFormTokenCost(Number(e.target.value))}
                    className="brutal-input w-full p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">
                  Prompt Sample
                </label>
                <textarea
                  rows={2}
                  value={formPromptSample}
                  onChange={(e) => setFormPromptSample(e.target.value)}
                  placeholder="Input prompt given to the model..."
                  className="brutal-input w-full p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">
                  Response Output Snippet
                </label>
                <textarea
                  rows={2}
                  value={formResponseSnippet}
                  onChange={(e) => setFormResponseSnippet(e.target.value)}
                  placeholder="Model execution result..."
                  className="brutal-input w-full p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">
                  Private Notes & Evaluation Commentary
                </label>
                <textarea
                  rows={3}
                  value={formPrivateNotes}
                  onChange={(e) => setFormPrivateNotes(e.target.value)}
                  placeholder="Private notes, reasoning edge-cases, failure modes..."
                  className="brutal-input w-full p-2 text-xs font-sans"
                />
              </div>

              <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="brutal-btn px-4 py-2 bg-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="brutal-btn px-5 py-2 bg-[#FFE600] text-black text-xs font-black uppercase flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : editingEval ? 'Update Record' : 'Save Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
