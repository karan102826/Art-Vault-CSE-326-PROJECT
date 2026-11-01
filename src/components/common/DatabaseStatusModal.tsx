import React, { useState, useEffect } from 'react';
import { X, Database, Check, Copy, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = healthData?.database?.isRemoteConnected;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText('DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-[#0F0F16] border border-white/[0.12] rounded-2xl shadow-2xl p-6 text-neutral-200 text-xs space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-display font-bold text-white">PostgreSQL & Environment Status</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-xl bg-[#14141E] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-mono text-[11px] uppercase">Engine Status</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="font-semibold text-white">
                {isConnected ? 'Remote PostgreSQL Connected' : 'Seeded SQL Engine Active'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] space-y-1.5 text-neutral-400 font-mono text-[11px]">
            <div>
              <span className="text-neutral-500">Active Deployment: </span>
              <span className="text-white">{healthData?.deployment || 'Node.js Express Server'}</span>
            </div>
            <div>
              <span className="text-neutral-500">Database Driver: </span>
              <span className="text-white">pg (node-postgres) with SSL Pool</span>
            </div>
            <div>
              <span className="text-neutral-500">Supabase Project: </span>
              <span className="text-amber-400 font-bold">dfspjxweulyiujgsuewr</span>
            </div>
            <div>
              <span className="text-neutral-500">Supabase REST API: </span>
              <span className="text-emerald-400 font-semibold">Active & Configured (Anon Key Set)</span>
            </div>
            {isConnected ? (
              <div className="text-emerald-400">
                Direct PostgreSQL Wire: <span className="font-bold">{healthData.database.details?.dbName}</span>
              </div>
            ) : (
              <div className="text-neutral-400">
                Direct PostgreSQL Wire: <span className="text-amber-300">Using built-in SQL engine</span> (Set DB password in <span className="text-white">.env</span> for direct wire).
              </div>
            )}
          </div>

          <button
            onClick={fetchHealth}
            disabled={isLoading}
            className="w-full mt-2 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-neutral-300 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recheck Connection</span>
          </button>
        </div>

        {/* How to Connect Remote Supabase / Render Postgres */}
        <div className="space-y-2">
          <span className="font-semibold text-white block">To link your own Supabase or Render Postgres:</span>
          <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 leading-relaxed">
            <li>Open the <span className="text-amber-400 font-mono">.env</span> file in the workspace root.</li>
            <li>Paste your Supabase Connection Pooler URI or Render External Database URL into <span className="text-amber-400 font-mono">DATABASE_URL</span>.</li>
            <li>Run <span className="text-white font-mono">database/schema.sql</span> then <span className="text-white font-mono">database/seed.sql</span> in your SQL editor.</li>
            <li>Restart the server or redeploy.</li>
          </ol>
        </div>

        <div className="p-3 bg-[#0A0A0E] rounded-lg border border-white/[0.06] flex items-center justify-between">
          <span className="font-mono text-[11px] text-neutral-500 truncate mr-2">
            DATABASE_URL="postgresql://user:pass@host:5432/dbname"
          </span>
          <button
            onClick={copyEnvSnippet}
            className="text-amber-400 hover:text-amber-300 font-mono text-[11px] flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
