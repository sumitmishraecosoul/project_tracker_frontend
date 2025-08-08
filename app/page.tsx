
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Tracker</h1>
            <p className="text-xl text-gray-600 mb-8">Comprehensive Project Management System</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-folder-line text-3xl text-blue-600"></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Management</h3>
                <p className="text-gray-600">Create, track, and manage projects with team assignments and progress monitoring.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-task-line text-3xl text-green-600"></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Tracking</h3>
                <p className="text-gray-600">Assign tasks, track progress, and monitor completion with detailed reporting.</p>
              </div>
            </div>

            <div className="space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
