
'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const openExternal = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('This app link is not configured. Please set the corresponding NEXT_PUBLIC_* URL in your environment.');
    }
  };

  const HR_PORTAL_URL = process.env.NEXT_PUBLIC_HR_PORTAL_URL;
  const QUERY_TRACKER_URL = process.env.NEXT_PUBLIC_QUERY_TRACKER_URL;
  const ASSET_MGMT_URL = process.env.NEXT_PUBLIC_ASSET_MGMT_URL;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
              <p className="text-gray-600">Choose a product to continue</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* HR Portal */}
              <button
                onClick={() => openExternal(HR_PORTAL_URL)}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title="Opens in new tab"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="ri-user-3-line text-pink-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">HR Portal</h3>
                <p className="text-sm text-gray-600">People ops, leaves, policies and more.</p>
              </button>

              {/* Query Tracker */}
              <button
                onClick={() => openExternal(QUERY_TRACKER_URL)}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title="Opens in new tab"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="ri-question-answer-line text-amber-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Query Tracker</h3>
                <p className="text-sm text-gray-600">Track and resolve internal/external queries.</p>
              </button>

              {/* Project Tracker (inside app) */}
              <button
                onClick={() => router.push('/project-tracker')}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="ri-folder-chart-line text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Project Tracker</h3>
                <p className="text-sm text-gray-600">Manage projects, tasks and progress.</p>
              </button>

              {/* Asset Management */}
              <button
                onClick={() => openExternal(ASSET_MGMT_URL)}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title="Opens in new tab"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="ri-archive-2-line text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Asset Management</h3>
                <p className="text-sm text-gray-600">Track company assets and allocations.</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
