UPDATE products
SET
  name = 'JBL Mini Speaker',
  price = 55.00,
  images = ARRAY['/products/jbl-mini-speaker.jpg'],
  updated_at = now()
WHERE slug = 'pulse-mini-bluetooth-speaker';

UPDATE products
SET
  images = ARRAY['/products/15w-wireless-charger.png'],
  updated_at = now()
WHERE slug = 'chargepad-pro-wireless-charger';

UPDATE products
SET
  price = 92.68,
  images = ARRAY['/products/sony-headphones.jpg'],
  updated_at = now()
WHERE slug = 'studio-over-ear-headphones';
