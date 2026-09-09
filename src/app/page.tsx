'use client';

import React, { useState, useEffect } from 'react';
import StudentPortal from '@/components/StudentPortal';
import AdminLogin from '@/components/AdminLogin';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [view, setView] = useState<'student' | 'admin_login' | 'admin_dashboard'>('student');

  useEffect(() => {
    // Check if admin is already logged in
    fetch('/api/admin/check-auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && view === 'admin_login') {
          setView('admin_dashboard');
        }
      })
      .catch(() => {});
  }, [view]);

  if (view === 'admin_dashboard') {
    return <Dashboard onSwitchToStudent={() => setView('student')} />;
  }

  if (view === 'admin_login') {
    return <AdminLogin onSuccess={() => setView('admin_dashboard')} onCancel={() => setView('student')} />;
  }

  return <StudentPortal onOpenAdminLogin={() => setView('admin_login')} />;
}
