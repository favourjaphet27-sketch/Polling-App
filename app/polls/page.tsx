"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function PollsDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const { signOut } = useAuth();
  const [logoutLoading, setLogoutLoading] = React.useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await signOut();
    router.push('/auth/login');
    setLogoutLoading(false);
  };

  const isEmailVerified = user?.email_confirmed_at || user?.confirmed_at;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls Dashboard</h1>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
        >
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {!isEmailVerified && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          Please verify your email address to access all features. Check your inbox for a verification email.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sample poll cards - these would be dynamically generated from data */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Favorite Programming Language</h2>
          <p className="text-gray-600 mb-4">Created 2 days ago · 42 votes</p>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Vote Now
            </button>
          </div>
        </div>
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Best Frontend Framework</h2>
          <p className="text-gray-600 mb-4">Created 5 days ago · 128 votes</p>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Vote Now
            </button>
          </div>
        </div>
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Preferred Development Environment</h2>
          <p className="text-gray-600 mb-4">Created 1 week ago · 85 votes</p>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Vote Now
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
          <span>Create New Poll</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}