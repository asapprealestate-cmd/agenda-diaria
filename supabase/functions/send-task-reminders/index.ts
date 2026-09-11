// Corre cada 1 minuto (disparado por pg_cron + pg_net, ver migración
// `schedule_reminder_cron`). Busca tareas cuyo aviso está por vencer
// (public.due_task_reminders()) y les manda una notificación push a
// todos los dispositivos suscriptos del usuario dueño de la tarea.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (_req: Request) => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: secrets, error: secretsError } = await supabase
    .from("app_secrets")
    .select("key, value")
    .in("key", ["vapid_public_key", "vapid_private_key"]);

  if (secretsError || !secrets || secrets.length < 2) {
    return new Response(JSON.stringify({ error: "Faltan las claves VAPID" }), { status: 500 });
  }
  const vapidPublicKey = secrets.find((s) => s.key === "vapid_public_key")!.value;
  const vapidPrivateKey = secrets.find((s) => s.key === "vapid_private_key")!.value;
  webpush.setVapidDetails("mailto:soporte@agenda-diaria.app", vapidPublicKey, vapidPrivateKey);

  const { data: dueTasks, error: dueError } = await supabase.rpc("due_task_reminders");
  if (dueError) {
    return new Response(JSON.stringify({ error: dueError.message }), { status: 500 });
  }
  if (!dueTasks || dueTasks.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  let sent = 0;
  const staleEndpoints: string[] = [];

  for (const task of dueTasks) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", task.user_id);

    const payload = JSON.stringify({
      title: task.title,
      body: task.alarm_enabled ? `⏰ Alarma · ${task.time_label}` : `🔔 Recordatorio · ${task.time_label}`,
      tag: task.task_id,
      alarm: task.alarm_enabled
    });

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          staleEndpoints.push(sub.endpoint);
        }
      }
    }

    await supabase.from("tasks").update({ notified_at: new Date().toISOString() }).eq("id", task.task_id);
  }

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  return new Response(JSON.stringify({ sent, tasks: dueTasks.length }), {
    headers: { "Content-Type": "application/json" }
  });
});
