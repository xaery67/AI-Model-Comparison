import React, { useState, useEffect } from 'react';
import { BenchmarkModel } from '../../server';
import { Search, Sparkles, Filter, ExternalLink, Scale, Check, ArrowUpDown, Zap, Code2, BrainCircuit, Bot, Info } from 'lucide-react';

interface BenchmarkExplorerProps {
  onSelectForEval: (modelName: string, category: string) => void;
  onOpenCompare: (models: BenchmarkModel[]) => void;
  selectedForCompare: BenchmarkModel[];
  onToggleCompare: (model: BenchmarkModel) => void;
}

export const BenchmarkExplorer: React.FC<BenchmarkExplorerProps> = ({
  onSelectForEval,
  onOpenCompare,
  selectedForCompare,
  onToggleCompare,
}) => {
  const [models, setModels] = useState<BenchmarkModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [provider, setProvider] = useState('all');
  const [apiStatus, setApiStatus] = useState<any>(null);

  useEffect(() => {
    fetchModels();
    fetchStatus();
  }, [category, provider]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/benchmarks/status');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch API status:', e);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (provider !== 'all') params.append('provider', provider);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/benchmarks/models?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (err) {
      console.error('Failed to load benchmark models:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchModels();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & BenchLM API Grounding Strip */}
      <div className="brutal-card p-4 sm:p-6 bg-white border-2 border-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FFE600] px-2 py-0.5 border-2 border-black font-mono text-xs font-extrabold uppercase">
                Public Leaderboard
              </span>
              <span className="bg-black text-white px-2 py-0.5 font-mono text-xs font-semibold">
                BenchLM Grounded
              </span>
              <span className="font-mono text-xs text-neutral-600">
                Tracking 626 Benchmarks · 891 AI Models
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
              State of the Art AI Model Benchmarks
            </h1>
            <p className="text-sm text-neutral-700 mt-1 max-w-2xl font-medium">
              Real-time programmatic evaluations aggregated from provider model cards, SWE-bench verified suites, and independent reasoning benchmarks via the BenchLM Data API.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-[#FBF9F1] p-3 border-2 border-black shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#70FF00] border border-black inline-block" />
              <span className="font-mono text-xs font-bold uppercase">BenchLM API Connected</span>
            </div>
            <span className="font-mono text-[11px] text-neutral-600">
              Direct On-Demand Search Active
            </span>
            {selectedForCompare.length > 0 && (
              <button
                onClick={() => onOpenCompare(selectedForCompare)}
                className="brutal-btn px-3 py-1 bg-[#00F0FF] text-black text-xs font-bold flex items-center gap-1.5 mt-1"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Selected ({selectedForCompare.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-5 border-t-2 border-black flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Category Tabs (Neo-Brutalist segmented controls) */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All SOTA' },
              { id: 'coding', label: 'Coding (SWE-bench)' },
              { id: 'math', label: 'Math & Logic' },
              { id: 'reasoning', label: 'MMLU-Pro' },
              { id: 'agentic', label: 'Agentic Tools' },
              { id: 'speed', label: 'Throughput' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 text-xs font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                  category === cat.id
                    ? 'bg-[#FFE600] shadow-[2px_2px_0px_#000] -translate-y-0.5'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search model (e.g. Claude, GPT, DeepSeek)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="brutal-input pl-9 pr-3 py-1.5 text-xs font-medium w-full"
              />
            </div>
            <button
              type="submit"
              className="brutal-btn px-3 py-1.5 bg-black text-white text-xs font-bold"
            >
              Search
            </button>
          </form>

        </div>
      </div>

      {/* Model Cards Grid */}
      {loading ? (
        <div className="brutal-card p-12 text-center bg-white border-2 border-black">
          <p className="font-mono text-sm font-bold uppercase animate-pulse">
            Fetching BenchLM data & verifying telemetry...
          </p>
        </div>
      ) : models.length === 0 ? (
        <div className="brutal-card p-12 text-center bg-white border-2 border-black">
          <p className="font-bold text-lg mb-1">No models found</p>
          <p className="text-sm text-neutral-600 mb-4">Try adjusting your search query or category filters.</p>
          <button
            onClick={() => { setSearch(''); setCategory('all'); setProvider('all'); }}
            className="brutal-btn px-4 py-2 bg-[#FFE600] text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, idx) => {
            const isCompared = selectedForCompare.some(m => m.id === model.id);
            return (
              <div
                key={model.id}
                className="brutal-card bg-white p-5 flex flex-col justify-between hover:shadow-[6px_6px_0px_#000] transition-shadow relative"
              >
                {/* Header: Rank + Model Title */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 border border-black">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-neutral-600 uppercase">
                        {model.provider}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleCompare(model)}
                        title={isCompared ? 'Remove from compare' : 'Add to compare'}
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 border border-black cursor-pointer flex items-center gap-1 ${
                          isCompared ? 'bg-[#00F0FF] text-black' : 'bg-neutral-100 hover:bg-neutral-200'
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        <span>{isCompared ? 'Added' : 'Compare'}</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight mb-1 text-black">
                    {model.name}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mb-4">
                    {model.architecture}
                  </p>

                  {/* Highlight Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#FBF9F1] border-2 border-black mb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        BenchLM Score
                      </span>
                      <span className="text-2xl font-black font-mono tracking-tight text-black tabular-nums">
                        {model.overallScore.toFixed(1)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        SWE-bench Ver.
                      </span>
                      <span className="text-xl font-black font-mono text-[#0066FF] tabular-nums">
                        {model.benchmarks.sweBenchVerified.toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        MMLU-Pro
                      </span>
                      <span className="text-sm font-bold font-mono text-neutral-800 tabular-nums">
                        {model.benchmarks.mmluPro.toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        MATH-500
                      </span>
                      <span className="text-sm font-bold font-mono text-neutral-800 tabular-nums">
                        {model.benchmarks.math500.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Telemetry and specs */}
                  <div className="space-y-1.5 text-xs font-mono mb-4 border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Throughput:</span>
                      <span className="font-bold tabular-nums">{model.performance.throughputTokensSec} tok/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Context Window:</span>
                      <span className="font-bold tabular-nums">{model.performance.contextWindowK}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Price (In / Out):</span>
                      <span className="font-bold tabular-nums">
                        ${model.performance.inputPricePerMillion} / ${model.performance.outputPricePerMillion} per 1M
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {model.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono uppercase px-1.5 py-0.5 border border-black bg-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t-2 border-black flex gap-2">
                  <button
                    onClick={() => onSelectForEval(model.name, 'Coding')}
                    className="brutal-btn w-full py-1.5 bg-[#FFE600] text-black text-xs font-extrabold uppercase hover:bg-yellow-400"
                  >
                    + Log Custom Eval
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
