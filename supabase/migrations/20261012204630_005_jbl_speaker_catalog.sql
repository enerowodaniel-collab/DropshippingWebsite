UPDATE products
SET
  name = 'JBL Mini Speaker',
  short_description = 'Portable Bluetooth speaker with rich sound and a compact design.',
  description = 'Take your music anywhere with this compact portable Bluetooth speaker. Its textured cylindrical design and rechargeable battery make it a great companion at home or on the go.',
  price = 55.00,
  images = ARRAY['/products/jbl-mini-speaker.jpg'],
  updated_at = now()
WHERE slug = 'pulse-mini-bluetooth-speaker';
