import React, { useState } from 'react';
import { FileText, CheckCircle2, ShieldCheck, Database, KeyRound, Server } from 'lucide-react';

export const PrdViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'summary' | 'functional' | 'security' | 'api' | 'data'>('summary');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="brutal-card p-6 bg-white border-2 border-black">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#B575FF] text-white px-2 py-0.5 border-2 border-black font-mono text-xs font-black uppercase">
            Product Requirements Document (PRD)
          </span>
          <span className="font-mono text-xs text-neutral-600 font-bold">
            PRD.md · Status: Approved & Implemented
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
          BenchPulse: AI Benchmark Portal & Eval Lab PRD
        </h1>
        <p className="text-sm text-neutral-700 mt-1 max-w-2xl font-medium">
          Comprehensive product specifications, neo-brutalist UX standards, Firebase Firestore ABAC security contracts, and BenchLM API proxy architecture.
        </p>

        {/* Section Navigation Tabs */}
        <div className="mt-5 pt-4 border-t-2 border-black flex flex-wrap gap-2">
          {[
            { id: 'summary', label: '1. Executive Summary' },
            { id: 'functional', label: '2. Functional Scope & CRUD' },
            { id: 'security', label: '3. Firebase ABAC Rules' },
            { id: 'data', label: '4. Firestore Blueprint Schemas' },
            { id: 'api', label: '5. BenchLM API Proxy Spec' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-1.5 text-xs font-bold border-2 border-black cursor-pointer transition-all ${
                activeSection === sec.id
                  ? 'bg-[#FFE600] shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="brutal-card p-6 bg-white border-2 border-black">
        {activeSection === 'summary' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>1. Executive Summary & Core Objectives</span>
            </h2>
            <p className="text-sm text-neutral-800 leading-relaxed">
              <strong>BenchPulse</strong> is an AI intelligence web portal providing real-time public AI model benchmark exploration paired with an authenticated personal evaluation lab (where users can CRUD their own custom evaluations, prompt tests, and private model notes), and a streamlined role-based administrator dashboard for registered account and system content governance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              <div className="p-4 bg-[#FBF9F1] border-2 border-black">
                <span className="font-mono text-xs font-black uppercase text-neutral-600 block mb-1">Pillar 1</span>
                <h3 className="font-bold text-sm mb-1">Public Benchmark Explorer</h3>
                <p className="text-xs text-neutral-600">On-demand search across 626 benchmarks and 891 models via BenchLM API with live metrics.</p>
              </div>
              <div className="p-4 bg-[#FBF9F1] border-2 border-black">
                <span className="font-mono text-xs font-black uppercase text-neutral-600 block mb-1">Pillar 2</span>
                <h3 className="font-bold text-sm mb-1">User Eval Lab (CRUD)</h3>
                <p className="text-xs text-neutral-600">Private sandbox for recording custom prompts, response snippets, latency, and private notes.</p>
              </div>
              <div className="p-4 bg-[#FBF9F1] border-2 border-black">
                <span className="font-mono text-xs font-black uppercase text-neutral-600 block mb-1">Pillar 3</span>
                <h3 className="font-bold text-sm mb-1">Role-Based Admin Console</h3>
                <p className="text-xs text-neutral-600">Admin dashboard to manage user accounts, toggle permissions, and publish system announcements.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'functional' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00F0FF]" />
              <span>2. Functional Scope & User CRUD Matrix</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-black bg-[#FBF9F1] font-mono uppercase">
                    <th className="py-2.5 px-3">Capability</th>
                    <th className="py-2.5 px-3">Public Visitor</th>
                    <th className="py-2.5 px-3">Registered Member</th>
                    <th className="py-2.5 px-3">Platform Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-medium">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Search BenchLM Models</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full Access</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full Access</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full Access</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Side-by-Side Model Compare</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full Access</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full Access</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full Access</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Create Custom Evaluations</td>
                    <td className="py-2.5 px-3 text-neutral-400">✗ Sign-in required</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Create own</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Create own</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Update / Delete Evaluations</td>
                    <td className="py-2.5 px-3 text-neutral-400">✗ Sign-in required</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Own records only</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Own & system records</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Manage User Accounts</td>
                    <td className="py-2.5 px-3 text-neutral-400">✗ Restricted</td>
                    <td className="py-2.5 px-3 text-neutral-400">✗ Restricted</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Full RBAC Control</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Broadcast Announcements</td>
                    <td className="py-2.5 px-3 text-neutral-400">✗ Read only</td>
                    <td className="py-2.5 px-3 text-neutral-400">✗ Read only</td>
                    <td className="py-2.5 px-3 text-emerald-700">✓ Publish & Edit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF4343]" />
              <span>3. Zero-Trust Firestore Security Architecture</span>
            </h2>
            <p className="text-xs text-neutral-700 font-medium">
              Deployed with mathematically hardened rules matching the 8 pillars of Firestore security:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-neutral-900 text-[#70FF00] border-2 border-black">
                <code>{`// Admin Identity Gate`}</code><br />
                <code>{`function isAdmin() {`}</code><br />
                <code>{`  return isSignedIn() && (`}</code><br />
                <code>{`    exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||`}</code><br />
                <code>{`    (request.auth.token.email == 'adifery80@gmail.com' && request.auth.token.email_verified == true)`}</code><br />
                <code>{`  );`}</code><br />
                <code>{`}`}</code>
              </div>
              <div className="p-3 bg-neutral-900 text-neutral-100 border-2 border-black">
                <code>{`// User Eval Isolation Rule`}</code><br />
                <code>{`match /user_evals/{evalId} {`}</code><br />
                <code>{`  allow read: if isSignedIn() && (resource.data.ownerId == request.auth.uid || isAdmin());`}</code><br />
                <code>{`  allow create: if isSignedIn() && incoming().ownerId == request.auth.uid && isValidUserEval(incoming());`}</code><br />
                <code>{`  allow update: if isSignedIn() && incoming().ownerId == existing().ownerId && (existing().ownerId == request.auth.uid || isAdmin());`}</code><br />
                <code>{`  allow delete: if isSignedIn() && (existing().ownerId == request.auth.uid || isAdmin());`}</code><br />
                <code>{`}`}</code>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-black" />
              <span>4. Data Entities in firebase-blueprint.json</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#FBF9F1] border-2 border-black">
                <span className="font-bold block mb-1">/users/{`{userId}`}</span>
                <span className="text-neutral-600 block">UserProfile</span>
                <p className="text-[11px] text-neutral-500 mt-1">uid, email, displayName, photoURL, role ("member"|"admin"), status ("active"|"suspended"), evalCount, createdAt</p>
              </div>
              <div className="p-3 bg-[#FBF9F1] border-2 border-black">
                <span className="font-bold block mb-1">/admins/{`{adminId}`}</span>
                <span className="text-neutral-600 block">AdminRecord</span>
                <p className="text-[11px] text-neutral-500 mt-1">uid, email, assignedAt</p>
              </div>
              <div className="p-3 bg-[#FBF9F1] border-2 border-black">
                <span className="font-bold block mb-1">/user_evals/{`{evalId}`}</span>
                <span className="text-neutral-600 block">UserEval</span>
                <p className="text-[11px] text-neutral-500 mt-1">id, ownerId, modelName, benchmarkCategory, benchmarkName, score, promptSample, responseSnippet, latencyMs, tokenCost, privateNotes, createdAt, updatedAt</p>
              </div>
              <div className="p-3 bg-[#FBF9F1] border-2 border-black">
                <span className="font-bold block mb-1">/system_content/{`{contentId}`}</span>
                <span className="text-neutral-600 block">SystemContent</span>
                <p className="text-[11px] text-neutral-500 mt-1">id, type, title, body, targetModel, isPublished, updatedBy, updatedAt</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-black" />
              <span>5. BenchLM API Proxy Specification</span>
            </h2>
            <div className="p-3 bg-[#FBF9F1] border-2 border-black space-y-2 text-xs">
              <p><strong>Configured API Credential:</strong> <code className="font-mono bg-white px-1 border border-black font-bold text-emerald-800">Protected via Server Environment Variable (BENCHLM_API_KEY)</code></p>
              <p><strong>Security Model:</strong> API Key is injected exclusively by the Express backend proxy (<code className="font-mono">server.ts</code>), preventing client key leakages and CORS errors.</p>
              <p><strong>Endpoints:</strong></p>
              <ul className="list-disc pl-5 font-mono space-y-1">
                <li><code>GET /api/benchmarks/models?category=&provider=&search=</code></li>
                <li><code>GET /api/benchmarks/search?q=</code></li>
                <li><code>GET /api/benchmarks/status</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
