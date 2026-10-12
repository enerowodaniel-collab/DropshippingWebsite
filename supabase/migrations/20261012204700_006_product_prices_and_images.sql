UPDATE products
SET
  name = 'Mini Bluetooth Speaker',
  short_description = 'Portable Bluetooth speaker with rich sound and a compact design.',
  description = 'Take your music anywhere with this compact portable Bluetooth speaker. Its textured cylindrical design and rechargeable battery make it a great companion at home or on the go.',
  price = 55.00,
  images = ARRAY['/products/mini-bluetooth-speaker.png'],
  updated_at = now()
WHERE slug = 'pulse-mini-bluetooth-speaker';

UPDATE products
SET
  short_description = '15W fast wireless charging pad for compatible phones.',
  description = 'Charge compatible phones wirelessly with this slim 15W fast charging pad. The magnetic-style round pad connects by cable and keeps your desk or bedside table tidy.',
  images = ARRAY['/products/15w-wireless-charger.png'],
  updated_at = now()
WHERE slug = 'chargepad-pro-wireless-charger';

UPDATE products
SET
  price = 92.68,
  updated_at = now()
WHERE slug = 'studio-over-ear-headphones';
