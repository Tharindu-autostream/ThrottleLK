import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const STORAGE_KEY = 'throttle_lk_cookie_notice_dismissed';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[#C0392B]/30 bg-[#0A0A0A]/95 px-4 py-4 backdrop-blur-md"
      role="dialog"
      aria-label="Cookie notice"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-sm leading-relaxed text-[#F0EDE8]/75"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          We use cookies and similar technologies for analytics and — where
          approved — advertising (including Google AdSense). See our{' '}
          <Link to="/privacy" className="text-[#C0392B] underline underline-offset-2">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md bg-[#C0392B] px-4 py-2 text-sm font-medium text-[#F0EDE8] hover:bg-[#C0392B]/90"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
