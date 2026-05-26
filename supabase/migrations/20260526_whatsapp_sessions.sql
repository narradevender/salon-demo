-- Session state for the WhatsApp bot (persists across serverless invocations).
-- One row per customer phone; expires after 30 minutes of inactivity.
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone               text PRIMARY KEY,
  salon_id            uuid NOT NULL,
  step                text NOT NULL DEFAULT 'idle',
  selected_service_id uuid,
  selected_slot_id    uuid,
  customer_name       text,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_expires_at
  ON whatsapp_sessions (expires_at);

-- Idempotency: every Meta webhook message has a unique id.
-- We record processed ids so retries (Meta retries up to 21 times) do not
-- cause duplicate replies. Also used for per-phone rate limiting.
CREATE TABLE IF NOT EXISTS whatsapp_processed_messages (
  message_id   text PRIMARY KEY,
  phone        text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_processed_phone_time
  ON whatsapp_processed_messages (phone, processed_at DESC);
