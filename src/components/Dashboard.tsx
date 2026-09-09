'use client';

import React, { useState, useEffect } from 'react';
import { Award, Send, Code, Sliders, LogOut, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import FormSimulator from './FormSimulator';
import AppsScriptGenerator from './AppsScriptGenerator';
import TemplateConfigurator from './TemplateConfigurator';
import CertificateList from './CertificateList';
import AdminLogin from './AdminLogin';

interface DashboardProps {
  onSwitchToStudent?: () => void;
}

export default function Dashboard({ onSwitchToStudent }: DashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'simulator' | 'script' | 'configurator' | 'list'>('simulator');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check-auth');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/check-auth', { method: 'POST' });
      setIsAuthenticated(false);
      if (onSwitchToStudent) onSwitchToStudent();
    } catch (err) {
      console.error('Logout error:', err);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" /> Verifying Admin Access...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} onCancel={onSwitchToStudent} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 pb-16">
      {/* Top Hero / Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CertiVerify Admin Portal
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Automated Certificate Generation Engine
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchToStudent && (
              <button
                onClick={onSwitchToStudent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-xl transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Student Portal
              </button>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl mb-8 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-4 h-4" />
            1. Form Webhook Simulator
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'script'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code className="w-4 h-4" />
            2. Google Apps Script Setup
          </button>

          <button
            onClick={() => setActiveTab('configurator')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'configurator'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            3. Template Coordinates Designer
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            4. Issued Certificates Registry
          </button>
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'simulator' && <FormSimulator />}
        {activeTab === 'script' && <AppsScriptGenerator />}
        {activeTab === 'configurator' && <TemplateConfigurator />}
        {activeTab === 'list' && <CertificateList />}
      </main>
    </div>
  );
}
