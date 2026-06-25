export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key'
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const secret = request.headers.get('x-push-secret');
  if (!process.env.PUSH_SECRET || secret !== process.env.PUSH_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, body, url } = (await request.json()) as {
    title: string;
    body: string;
    url?: string;
  };

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return Response.json({ sent: 0 });

  const payload = JSON.stringify({ title, body, url: url ?? '/' });
  let sent = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        // Remove expired subscriptions
        if ((err as { statusCode?: number }).statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
    })
  );

  return Response.json({ sent });
}
