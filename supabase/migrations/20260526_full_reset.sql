-- =============================================================
-- Full schema reset + dummy seed for the salon-demo app.
-- Safe to run on an empty project; existing tables are dropped
-- via CASCADE so foreign keys don't block the rebuild.
-- whatsapp_sessions / whatsapp_processed_messages are kept
-- as-is (IF NOT EXISTS) so you don't lose bot state.
-- =============================================================

-- gen_random_uuid() lives in pgcrypto; Supabase enables it by default
-- but enable defensively in case the project is brand new.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- DROP (children first) ----------
DROP TABLE IF EXISTS appointments         CASCADE;
DROP TABLE IF EXISTS availability_slots   CASCADE;
DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS customers            CASCADE;
DROP TABLE IF EXISTS services             CASCADE;
DROP TABLE IF EXISTS users                CASCADE;
DROP TABLE IF EXISTS salons               CASCADE;

-- ---------- salons ----------
CREATE TABLE salons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  description     text,
  address         text,
  phone           text,
  whatsapp_number text,
  logo_url        text,
  brand_colors    jsonb,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- services ----------
CREATE TABLE services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id         uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  duration_minutes integer NOT NULL,
  price            numeric(10,2) NOT NULL,
  benefits         text,
  category         text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_services_salon ON services(salon_id);

-- ---------- customers ----------
CREATE TABLE customers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name       text NOT NULL,
  phone      text,
  email      text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_salon ON customers(salon_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ---------- users (dashboard staff; not auth.users) ----------
CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   uuid REFERENCES salons(id) ON DELETE SET NULL,
  email      text,
  name       text,
  role       text,
  avatar_url text,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- availability_slots ----------
CREATE TABLE availability_slots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time   timestamptz NOT NULL,
  capacity   integer NOT NULL DEFAULT 1,
  is_blocked boolean NOT NULL DEFAULT false,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_slots_lookup
  ON availability_slots (salon_id, service_id, start_time);

-- ---------- appointments ----------
CREATE TABLE appointments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id          uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  service_id        uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_id       uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  staff_id          uuid REFERENCES users(id) ON DELETE SET NULL,
  slot_id           uuid NOT NULL REFERENCES availability_slots(id) ON DELETE RESTRICT,
  booking_reference text NOT NULL UNIQUE,
  status            text NOT NULL DEFAULT 'pending',
  scheduled_start   timestamptz NOT NULL,
  scheduled_end     timestamptz NOT NULL,
  price             numeric(10,2) NOT NULL,
  notes             text,
  source            text NOT NULL DEFAULT 'web',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_salon_date
  ON appointments (salon_id, scheduled_start DESC);

-- ---------- notifications ----------
CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id   uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text NOT NULL,
  title      text NOT NULL,
  message    text NOT NULL,
  payload    jsonb,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- whatsapp bot tables (kept) ----------
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

CREATE TABLE IF NOT EXISTS whatsapp_processed_messages (
  message_id   text PRIMARY KEY,
  phone        text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_processed_phone_time
  ON whatsapp_processed_messages (phone, processed_at DESC);

-- =============================================================
-- SEED: matches NEXT_PUBLIC_SALON_ID in .env so the app finds it.
-- =============================================================

INSERT INTO salons (id, slug, name, description, address, phone, whatsapp_number, is_active)
VALUES (
  '31a03469-079e-4fa3-830c-2603c9869fcd',
  'glow-studio',
  'Glow Studio',
  'A premium salon experience with WhatsApp booking, live availability, and modern customer journeys.',
  '12 MG Road, Hyderabad',
  '+1 (555) 651-8177',
  '+1 (555) 651-8177',
  true
);

-- Owner user (the dashboard uses env-var auth, but other queries
-- expect at least one user row for FK satisfaction in notifications).
INSERT INTO users (id, salon_id, email, name, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '31a03469-079e-4fa3-830c-2603c9869fcd',
  'owner@glowstudio.test',
  'Salon Owner',
  'owner'
);

-- Services (fixed UUIDs so re-running the seed is idempotent if you
-- clear data with DELETEs instead of DROP).
INSERT INTO services (id, salon_id, name, description, duration_minutes, price, category, is_active) VALUES
  ('a0000001-0000-0000-0000-000000000001', '31a03469-079e-4fa3-830c-2603c9869fcd',
   'Boys Hair Wash',       'Relaxing shampoo and conditioning treatment.',         20,  299, 'hair', true),
  ('a0000001-0000-0000-0000-000000000002', '31a03469-079e-4fa3-830c-2603c9869fcd',
   'Boys Hair Cut',        'Classic or modern cut by a senior stylist.',           30,  399, 'hair', true),
  ('a0000001-0000-0000-0000-000000000003', '31a03469-079e-4fa3-830c-2603c9869fcd',
   'Girls Hair Cut',       'Precision cut and finish styling.',                    45,  799, 'hair', true),
  ('a0000001-0000-0000-0000-000000000004', '31a03469-079e-4fa3-830c-2603c9869fcd',
   'Boys Facial',          'Deep-cleanse facial with cooling mask.',               45,  899, 'face', true),
  ('a0000001-0000-0000-0000-000000000005', '31a03469-079e-4fa3-830c-2603c9869fcd',
   'Girls Hair Styling',   'Blow-dry, curls or straightening for any occasion.',   60, 1299, 'hair', true);

-- Availability slots: 3 slots per service for today, tomorrow, and day after.
-- Built relative to now() so they're always in the future when you re-seed.
-- end_time = start_time + service.duration_minutes.
INSERT INTO availability_slots (salon_id, service_id, start_time, end_time)
SELECT
  s.salon_id,
  s.id,
  slot_start,
  slot_start + (s.duration_minutes || ' minutes')::interval
FROM services s
CROSS JOIN LATERAL (
  VALUES
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '11 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '15 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '18 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '1 day  10 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '1 day  14 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '1 day  17 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '2 days 10 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '2 days 14 hours'),
    (date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '2 days 17 hours')
) AS t(slot_start)
WHERE s.salon_id = '31a03469-079e-4fa3-830c-2603c9869fcd';

-- Demo customer + appointment so the dashboard isn't empty on first load.
INSERT INTO customers (id, salon_id, name, phone, email)
VALUES (
  'c0000001-0000-0000-0000-000000000001',
  '31a03469-079e-4fa3-830c-2603c9869fcd',
  'Demo Customer',
  '+15555550100',
  'demo@example.com'
);

WITH first_slot AS (
  SELECT id, start_time, end_time
  FROM availability_slots
  WHERE salon_id = '31a03469-079e-4fa3-830c-2603c9869fcd'
    AND service_id = 'a0000001-0000-0000-0000-000000000002'
  ORDER BY start_time ASC
  LIMIT 1
)
INSERT INTO appointments (
  salon_id, service_id, customer_id, slot_id, booking_reference,
  status, scheduled_start, scheduled_end, price, source
)
SELECT
  '31a03469-079e-4fa3-830c-2603c9869fcd',
  'a0000001-0000-0000-0000-000000000002',
  'c0000001-0000-0000-0000-000000000001',
  fs.id,
  'SALON-DEMO-0001',
  'confirmed',
  fs.start_time,
  fs.end_time,
  399,
  'web'
FROM first_slot fs;
