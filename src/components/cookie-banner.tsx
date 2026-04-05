"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sh_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("sh_cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("sh_cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl shadow-black/40 p-5 md:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">We use cookies</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              ShiftHire uses essential cookies for authentication and session management, and optional analytics cookies (Umami — privacy-friendly, no personal data) to understand how our platform is used.
            </p>

            {expanded && (
              <div className="mt-3 space-y-2 text-xs text-gray-400 border-t border-gray-700 pt-3">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-200 font-medium">Essential cookies</span>
                    <span className="text-gray-400"> — Authentication tokens (Supabase), session state. Required for the app to function. Cannot be disabled.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-200 font-medium">Analytics (optional)</span>
                    <span className="text-gray-400"> — Umami Analytics: page views and feature usage. Fully anonymous, GDPR-compliant, no cross-site tracking, no data sold to third parties.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-200 font-medium">Preferences</span>
                    <span className="text-gray-400"> — UI theme (light/dark), stored in localStorage only.</span>
                  </div>
                </div>
                <p className="text-gray-500 pt-1">
                  We do not use advertising cookies or share your data with third parties for marketing.
                  See our{" "}
                  <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                  {" "}for full details.
                </p>
              </div>
            )}

            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-blue-400 hover:text-blue-300 text-xs mt-1.5 transition-colors"
            >
              {expanded ? "Show less" : "Learn more about our cookies"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 mt-0.5">
            <button
              onClick={decline}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
            >
              Essential only
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
