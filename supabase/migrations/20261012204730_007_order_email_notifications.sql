ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS email_notification_sent_at timestamptz;
