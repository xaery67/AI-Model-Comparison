import React from 'react';
import { BenchmarkModel } from '../../server';
import { X, Scale, Zap } from 'lucide-react';

interface CompareModalProps {
  models: BenchmarkModel[];
  onClose: () => void;
  onRemoveModel: (modelId: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  models,
  onClose,
  onRemoveModel,
}) => {
  if (models.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="brutal-card-lg bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border-3 border-black relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-5">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-black" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Side-by-Side Model Comparator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="brutal-btn p-1 bg-white hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-[#FBF9F1]">
                <th className="py-3 px-3 font-mono uppercase text-neutral-500 w-44">
                  Benchmark Metric
                </th>
                {models.map((m) => (
                  <th key={m.id} className="py-3 px-3 min-w-[180px]">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-sm text-black">{m.name}</span>
                      <button
                        onClick={() => onRemoveModel(m.id)}
                        className="text-neutral-400 hover:text-black font-mono font-bold"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-neutral-500">
                      {m.provider}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr className="bg-amber-50/40">
                <td className="py-2.5 px-3 font-bold font-mono uppercase">Overall BenchLM Score</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-black text-base font-mono tabular-nums text-black">
                    {m.overallScore.toFixed(1)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">SWE-bench Verified</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-bold font-mono text-[#0066FF] tabular-nums">
                    {m.benchmarks.sweBenchVerified.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">HumanEval</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-bold font-mono tabular-nums">
                    {m.benchmarks.humanEval.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">MMLU-Pro</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-bold font-mono tabular-nums">
                    {m.benchmarks.mmluPro.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">MATH-500</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-bold font-mono tabular-nums">
                    {m.benchmarks.math500.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">ToolBench (Agentic)</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-bold font-mono tabular-nums">
                    {m.benchmarks.toolBench.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">Throughput</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-mono tabular-nums font-bold">
                    {m.performance.throughputTokensSec} tokens/sec
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">Context Window</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-mono tabular-nums">
                    {m.performance.contextWindowK}K tokens
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">Input Price (1M)</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-mono tabular-nums">
                    ${m.performance.inputPricePerMillion}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">Output Price (1M)</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-mono tabular-nums">
                    ${m.performance.outputPricePerMillion}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-600 font-mono">License</td>
                {models.map((m) => (
                  <td key={m.id} className="py-2.5 px-3 font-mono text-[11px]">
                    {m.license}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-5 border-t-2 border-black flex justify-end">
          <button
            onClick={onClose}
            className="brutal-btn px-4 py-2 bg-[#FFE600] text-xs font-black uppercase"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
