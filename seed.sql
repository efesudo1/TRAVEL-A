-- ============================================
-- DIGIBUS - Seed Data
-- Demo companies, buses, trips, stops, bookings
-- ============================================

-- Companies
INSERT INTO companies (id, name, logo_url, slug, theme_colors) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Metro Turizm', null, 'metro-turizm', '{"primary": "#FF6B35", "secondary": "#0A1628"}'),
  ('c1000000-0000-0000-0000-000000000002', 'Kamil Koç', null, 'kamil-koc', '{"primary": "#E31E24", "secondary": "#1A1A2E"}');

-- Buses
INSERT INTO buses (id, company_id, plate_number, capacity, model, is_active, current_location) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '34 MT 2024', 45, 'Mercedes Travego', true, '{"lng": 29.0, "lat": 41.0}'),
  ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', '34 MT 2025', 50, 'MAN Lions Coach', true, '{"lng": 32.8, "lat": 39.9}'),
  ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', '06 KK 1001', 45, 'Neoplan Tourliner', true, '{"lng": 28.9, "lat": 41.0}'),
  ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', '06 KK 1002', 40, 'Setra S 517 HD', true, '{"lng": 30.4, "lat": 40.7}');

-- Trips (Istanbul-Ankara, Ankara-Istanbul, Istanbul-Izmir, Ankara-Antalya, Istanbul-Bursa, Bursa-Istanbul)
INSERT INTO trips (id, bus_id, company_id, route_name, travel_number, departure_time, estimated_arrival_time, status, route_json) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'İstanbul → Ankara', 'TRP-101', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '6 hours', 'on_time',
   '[{"lng": 29.0175, "lat": 41.1055}, {"lng": 29.9, "lat": 40.7}, {"lng": 30.4, "lat": 40.4}, {"lng": 31.5, "lat": 40.1}, {"lng": 32.85, "lat": 39.92}]'),

  ('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
   'Ankara → İstanbul', 'TRP-102', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '7 hours', 'scheduled',
   '[{"lng": 32.85, "lat": 39.92}, {"lng": 31.5, "lat": 40.1}, {"lng": 30.4, "lat": 40.4}, {"lng": 29.9, "lat": 40.7}, {"lng": 29.0175, "lat": 41.1055}]'),

  ('e1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002',
   'İstanbul → İzmir', 'TRP-103', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '9 hours', 'scheduled',
   '[{"lng": 29.0175, "lat": 41.1055}, {"lng": 29.4, "lat": 40.2}, {"lng": 28.9, "lat": 39.6}, {"lng": 27.8, "lat": 38.9}, {"lng": 27.14, "lat": 38.42}]'),

  ('e1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002',
   'Ankara → Antalya', 'TRP-104', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '6 hours', 'delayed',
   '[{"lng": 32.85, "lat": 39.92}, {"lng": 32.0, "lat": 39.0}, {"lng": 31.2, "lat": 38.2}, {"lng": 30.7, "lat": 37.5}, {"lng": 30.71, "lat": 36.89}]'),

  ('e1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'İstanbul → Bursa', 'TRP-105', NOW() + INTERVAL '5 hours', NOW() + INTERVAL '8 hours', 'scheduled',
   '[{"lng": 29.0175, "lat": 41.1055}, {"lng": 29.3, "lat": 40.6}, {"lng": 29.0, "lat": 40.2}]'),

  ('e1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002',
   'Bursa → İstanbul', 'TRP-106', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '1 hour', 'on_time',
   '[{"lng": 29.0, "lat": 40.2}, {"lng": 29.3, "lat": 40.6}, {"lng": 29.0175, "lat": 41.1055}]');

-- Stops for Trip 1 (Istanbul → Ankara)
INSERT INTO stops (trip_id, location_name, coordinates, planned_arrival, actual_arrival, duration_minutes, stop_order) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'İstanbul Otogar', '{"lng": 29.0175, "lat": 41.1055}', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour', 15, 1),
  ('e1000000-0000-0000-0000-000000000001', 'Bolu Dağı Dinlenme', '{"lng": 31.5, "lat": 40.7}', NOW() + INTERVAL '3 hours', null, 20, 2),
  ('e1000000-0000-0000-0000-000000000001', 'Eskişehir Kavşağı', '{"lng": 30.4, "lat": 40.4}', NOW() + INTERVAL '4 hours', null, 10, 3),
  ('e1000000-0000-0000-0000-000000000001', 'Ankara AŞTİ', '{"lng": 32.85, "lat": 39.92}', NOW() + INTERVAL '6 hours', null, 0, 4);

-- Stops for Trip 2 (Ankara → Istanbul)
INSERT INTO stops (trip_id, location_name, coordinates, planned_arrival, actual_arrival, duration_minutes, stop_order) VALUES
  ('e1000000-0000-0000-0000-000000000002', 'Ankara AŞTİ', '{"lng": 32.85, "lat": 39.92}', NOW() + INTERVAL '2 hours', null, 15, 1),
  ('e1000000-0000-0000-0000-000000000002', 'Bolu Dağı Dinlenme', '{"lng": 31.5, "lat": 40.7}', NOW() + INTERVAL '4 hours', null, 20, 2),
  ('e1000000-0000-0000-0000-000000000002', 'Sabiha Gökçen', '{"lng": 29.3, "lat": 40.9}', NOW() + INTERVAL '6 hours', null, 10, 3),
  ('e1000000-0000-0000-0000-000000000002', 'İstanbul Otogar', '{"lng": 29.0175, "lat": 41.1055}', NOW() + INTERVAL '7 hours', null, 0, 4);

-- Stops for Trip 3 (Istanbul → Izmir)
INSERT INTO stops (trip_id, location_name, coordinates, planned_arrival, actual_arrival, duration_minutes, stop_order) VALUES
  ('e1000000-0000-0000-0000-000000000003', 'İstanbul Otogar', '{"lng": 29.0175, "lat": 41.1055}', NOW() + INTERVAL '3 hours', null, 15, 1),
  ('e1000000-0000-0000-0000-000000000003', 'Bursa Terminali', '{"lng": 29.0, "lat": 40.2}', NOW() + INTERVAL '5 hours', null, 20, 2),
  ('e1000000-0000-0000-0000-000000000003', 'Balıkesir', '{"lng": 27.8, "lat": 39.6}', NOW() + INTERVAL '7 hours', null, 15, 3),
  ('e1000000-0000-0000-0000-000000000003', 'Manisa', '{"lng": 27.4, "lat": 38.6}', NOW() + INTERVAL '8 hours', null, 10, 4),
  ('e1000000-0000-0000-0000-000000000003', 'İzmir Otogar', '{"lng": 27.14, "lat": 38.42}', NOW() + INTERVAL '9 hours', null, 0, 5);

-- Stops for Trip 4 (Ankara → Antalya) - DELAYED
INSERT INTO stops (trip_id, location_name, coordinates, planned_arrival, actual_arrival, duration_minutes, stop_order) VALUES
  ('e1000000-0000-0000-0000-000000000004', 'Ankara AŞTİ', '{"lng": 32.85, "lat": 39.92}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', 15, 1),
  ('e1000000-0000-0000-0000-000000000004', 'Konya Otogar', '{"lng": 32.0, "lat": 37.87}', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 25 minutes', 20, 2),
  ('e1000000-0000-0000-0000-000000000004', 'Isparta', '{"lng": 30.29, "lat": 37.76}', NOW() + INTERVAL '4 hours', null, 10, 3),
  ('e1000000-0000-0000-0000-000000000004', 'Burdur', '{"lng": 30.29, "lat": 37.72}', NOW() + INTERVAL '5 hours', null, 10, 4),
  ('e1000000-0000-0000-0000-000000000004', 'Antalya Otogar', '{"lng": 30.71, "lat": 36.89}', NOW() + INTERVAL '6 hours', null, 0, 5);

-- Bookings with PNR codes
INSERT INTO bookings (trip_id, pnr_code, seat_number, passenger_name, passenger_phone, status) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'DEMO01', 12, 'Ahmet Yılmaz', '+905551234567', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000001', 'DEMO02', 15, 'Zeynep Kaya', '+905559876543', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000001', 'ABC123', 22, 'Mehmet Demir', '+905553334444', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000002', 'DEMO03', 8, 'Fatma Çelik', '+905552223333', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000002', 'XYZ789', 33, 'Ali Öztürk', '+905551112222', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000003', 'DEMO04', 5, 'Ayşe Arslan', '+905554445555', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000003', 'TEST01', 18, 'Can Yıldız', '+905556667777', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000003', 'TEST02', 27, 'Deniz Koç', '+905558889999', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000004', 'DEMO05', 3, 'Elif Şahin', '+905551119999', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000004', 'DELAY1', 14, 'Burak Aydın', '+905552228888', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000005', 'DEMO06', 10, 'Selin Güneş', '+905553337777', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000005', 'BURSA1', 20, 'Emre Kurt', '+905554446666', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000006', 'DEMO07', 7, 'Yasemin Ak', '+905555555555', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000006', 'IST001', 25, 'Murat Tan', '+905556664444', 'confirmed'),
  ('e1000000-0000-0000-0000-000000000006', 'IST002', 31, 'Hakan Eren', '+905557773333', 'completed');

-- Loyalty points sample
-- INSERT INTO loyalty_points (passenger_id, company_id, points_count, total_trips) VALUES
  -- These will reference real user IDs when auth users are created
  -- For demo, we skip this and handle via the app
