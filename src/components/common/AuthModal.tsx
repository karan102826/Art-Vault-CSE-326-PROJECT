import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickSwitch } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'buyer' | 'admin'>('buyer');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName, role);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: 'buyer' | 'admin') => {
    setIsLoading(true);
    try {
      await quickSwitch(targetRole);
      onClose();
    } catch (e: any) {
      setErrorMessage(e.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-[#0F0F16] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-display font-bold text-white">
              {mode === 'login' ? 'Sign In to ArtVault' : 'Create Collector Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-4 bg-[#14141E] border-b border-white/[0.06] space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 block">
            Instant 1-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Buyer (Marcus)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin (Elena)</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/[0.08] text-xs">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-amber-400 text-amber-300 bg-white/[0.02]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-amber-400 text-amber-300 bg-white/[0.02]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-neutral-400">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-[#161622] border border-white/[0.1] focus:border-amber-500 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-neutral-400">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@studio.com"
                className="w-full bg-[#161622] border border-white/[0.1] focus:border-amber-500 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-neutral-400">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161622] border border-white/[0.1] focus:border-amber-500 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-neutral-400">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="buyer">Collector / Technical Artist (Buyer)</option>
                <option value="admin">Platform Administrator (Admin)</option>
              </select>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-1.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : mode === 'login' ? 'Sign In to ArtVault' : 'Register Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
