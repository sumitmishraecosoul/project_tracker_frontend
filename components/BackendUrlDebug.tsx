'use client';

import { config } from '../lib/config';

export default function BackendUrlDebug() {
  // Only show in development
  if (!config.features.enableDebugLogging) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs text-blue-800 max-w-xs z-50">
      <div className="font-semibold mb-1">🔧 Backend URL Debug</div>
      <div className="mb-1">
        <strong>Environment:</strong> {process.env.NODE_ENV}
      </div>
      <div className="mb-1">
        <strong>API URL:</strong> {config.getApiUrl()}
      </div>
      <div className="text-xs opacity-75">
        This debug info only shows in development
      </div>
    </div>
  );
}
