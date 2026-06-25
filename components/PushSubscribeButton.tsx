'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

type ButtonState = 'idle' | 'subscribed' | 'loading' | 'unsupported';

export default function PushSubscribeButton() {
  const [state, setState] = useState<ButtonState>('idle');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setState('subscribed');
      })
      .catch(() => {});
  }, []);

  async function subscribe() {
    setState('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      setState('subscribed');
    } catch {
      setState('idle');
    }
  }

  async function unsubscribe() {
    setState('loading');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('idle');
    } catch {
      setState('subscribed');
    }
  }

  if (state === 'unsupported') return null;

  return (
    <button
      onClick={state === 'subscribed' ? unsubscribe : subscribe}
      disabled={state === 'loading'}
      title={state === 'subscribed' ? 'Turn off notifications' : 'Get notified of new AI incidents'}
      className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        state === 'subscribed'
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/10'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <span aria-hidden="true">{state === 'subscribed' ? '🔔' : '🔕'}</span>
      <span className="hidden sm:inline">
        {state === 'loading' ? '…' : state === 'subscribed' ? 'Notifying' : 'Notify me'}
      </span>
    </button>
  );
}
