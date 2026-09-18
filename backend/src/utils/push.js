const webpush = require('web-push');
const pool = require('../config/db');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:contato@taylortech.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Manda uma notificacao push pra todos os dispositivos inscritos (equipe).
// Silenciosa em caso de erro - notificacao nunca pode derrubar quem chamou.
async function notificarEquipe(payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  try {
    const [subs] = await pool.query('SELECT id, endpoint, p256dh, auth FROM push_subscriptions');
    await Promise.all(subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pool.query('DELETE FROM push_subscriptions WHERE id = ?', [s.id]);
        } else {
          console.error('Erro ao enviar push:', err.message);
        }
      }
    }));
  } catch (err) {
    console.error('Erro ao notificar equipe:', err.message);
  }
}

module.exports = { notificarEquipe, VAPID_PUBLIC_KEY };
