'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TimezoneSync({ currentTimezone }) {
  const router = useRouter();

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!browserTimezone || browserTimezone === currentTimezone) return;

    let cancelled = false;

    fetch('/api/timezone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: browserTimezone }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('timezone sync failed');
        return response.json();
      })
      .then(() => {
        if (!cancelled) router.refresh();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentTimezone, router]);

  return null;
}
