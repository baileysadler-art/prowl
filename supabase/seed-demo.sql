-- ============================================================================
-- Prowl Demo Seed Data
-- ============================================================================
-- Run this AFTER the initial migration and AFTER creating a user via signup.
-- Replace the placeholder UUIDs below with your actual org/user IDs.
--
-- Usage:
--   1. Sign up at the app to create your auth user
--   2. Note your organization_id from the organizations table
--   3. Replace 'YOUR_ORG_ID' below with the real UUID
--   4. Run: psql <connection_string> -f supabase/seed-demo.sql
-- ============================================================================

-- Set your org ID here (replace after signup)
\set org_id '''00000000-0000-0000-0000-000000000001'''

-- ============================================================================
-- SUBSCRIPTION (upgrade to Professional for demo)
-- ============================================================================
UPDATE public.subscriptions
SET plan_tier = 'professional',
    status = 'active',
    competitor_limit = 10,
    scrape_interval_hours = 6,
    current_period_start = now() - interval '15 days',
    current_period_end = now() + interval '15 days'
WHERE organization_id = :org_id::uuid;

-- ============================================================================
-- COMPETITORS
-- ============================================================================
INSERT INTO public.competitors (id, organization_id, name, website_url, status, product_count, last_scraped_at) VALUES
  ('c0000001-0000-0000-0000-000000000001', :org_id::uuid, 'TechDirect UK',    'https://www.techdirect.co.uk',    'active', 24, now() - interval '2 hours'),
  ('c0000002-0000-0000-0000-000000000002', :org_id::uuid, 'GadgetZone',        'https://www.gadgetzone.com',       'active', 18, now() - interval '4 hours'),
  ('c0000003-0000-0000-0000-000000000003', :org_id::uuid, 'ElectroMart',       'https://www.electromart.co.uk',    'active', 31, now() - interval '1 hour'),
  ('c0000004-0000-0000-0000-000000000004', :org_id::uuid, 'PriceSlash Digital', 'https://www.priceslash.digital',  'active', 15, now() - interval '6 hours'),
  ('c0000005-0000-0000-0000-000000000005', :org_id::uuid, 'MegaByte Store',    'https://www.megabytestore.co.uk',  'paused',  9, now() - interval '2 days');

-- ============================================================================
-- COMPETITOR PAGES
-- ============================================================================
INSERT INTO public.competitor_pages (competitor_id, url, page_type, label) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'https://www.techdirect.co.uk/smartphones',   'collection', 'Smartphones'),
  ('c0000001-0000-0000-0000-000000000001', 'https://www.techdirect.co.uk/laptops',       'collection', 'Laptops'),
  ('c0000002-0000-0000-0000-000000000002', 'https://www.gadgetzone.com/phones',           'collection', 'Phones'),
  ('c0000002-0000-0000-0000-000000000002', 'https://www.gadgetzone.com/audio',            'collection', 'Audio'),
  ('c0000003-0000-0000-0000-000000000003', 'https://www.electromart.co.uk/all-products',  'collection', 'All Products'),
  ('c0000004-0000-0000-0000-000000000004', 'https://www.priceslash.digital/deals',        'collection', 'Deals'),
  ('c0000005-0000-0000-0000-000000000005', 'https://www.megabytestore.co.uk/shop',        'collection', 'Shop');

-- ============================================================================
-- PRODUCTS — Smartphones
-- ============================================================================
INSERT INTO public.products (id, competitor_id, name, url, current_price, original_price, currency, in_stock, is_on_sale, category, last_checked_at) VALUES
  -- TechDirect UK
  ('p0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'iPhone 15 Pro 256GB',         'https://www.techdirect.co.uk/iphone-15-pro',          999.00, 1099.00, 'GBP', true,  true,  'Smartphones', now() - interval '2 hours'),
  ('p0000002-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Samsung Galaxy S24 Ultra',     'https://www.techdirect.co.uk/galaxy-s24-ultra',       1199.00, 1299.00, 'GBP', true,  true,  'Smartphones', now() - interval '2 hours'),
  ('p0000003-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Google Pixel 8 Pro',           'https://www.techdirect.co.uk/pixel-8-pro',             849.00,  999.00, 'GBP', true,  true,  'Smartphones', now() - interval '2 hours'),
  ('p0000004-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', 'MacBook Air M3 15"',           'https://www.techdirect.co.uk/macbook-air-m3',         1299.00, 1299.00, 'GBP', true,  false, 'Laptops',     now() - interval '2 hours'),
  ('p0000005-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001', 'MacBook Pro M3 Pro 14"',       'https://www.techdirect.co.uk/macbook-pro-m3',         1799.00, 1999.00, 'GBP', true,  true,  'Laptops',     now() - interval '2 hours'),
  ('p0000006-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000001', 'AirPods Pro 2',                'https://www.techdirect.co.uk/airpods-pro-2',           229.00,  249.00, 'GBP', true,  true,  'Audio',       now() - interval '2 hours'),
  ('p0000007-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000001', 'iPad Pro 12.9" M2',            'https://www.techdirect.co.uk/ipad-pro-m2',            1099.00, 1199.00, 'GBP', true,  true,  'Tablets',     now() - interval '2 hours'),
  ('p0000008-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000001', 'Sony WH-1000XM5',             'https://www.techdirect.co.uk/sony-xm5',                289.00,  349.00, 'GBP', true,  true,  'Audio',       now() - interval '2 hours'),

  -- GadgetZone
  ('p0000009-0000-0000-0000-000000000009', 'c0000002-0000-0000-0000-000000000002', 'iPhone 15 Pro 256GB',         'https://www.gadgetzone.com/iphone-15-pro',            1049.00, 1099.00, 'GBP', true,  true,  'Smartphones', now() - interval '4 hours'),
  ('p0000010-0000-0000-0000-000000000010', 'c0000002-0000-0000-0000-000000000002', 'Samsung Galaxy S24 Ultra',     'https://www.gadgetzone.com/galaxy-s24-ultra',         1249.00, 1299.00, 'GBP', true,  true,  'Smartphones', now() - interval '4 hours'),
  ('p0000011-0000-0000-0000-000000000011', 'c0000002-0000-0000-0000-000000000002', 'Google Pixel 8 Pro',           'https://www.gadgetzone.com/pixel-8-pro',               899.00,  999.00, 'GBP', true,  true,  'Smartphones', now() - interval '4 hours'),
  ('p0000012-0000-0000-0000-000000000012', 'c0000002-0000-0000-0000-000000000002', 'AirPods Pro 2',                'https://www.gadgetzone.com/airpods-pro-2',             239.00,  249.00, 'GBP', true,  true,  'Audio',       now() - interval '4 hours'),
  ('p0000013-0000-0000-0000-000000000013', 'c0000002-0000-0000-0000-000000000002', 'Sony WH-1000XM5',             'https://www.gadgetzone.com/sony-xm5',                  319.00,  349.00, 'GBP', true,  true,  'Audio',       now() - interval '4 hours'),
  ('p0000014-0000-0000-0000-000000000014', 'c0000002-0000-0000-0000-000000000002', 'Samsung Galaxy Buds3 Pro',     'https://www.gadgetzone.com/galaxy-buds3-pro',          219.00,  219.00, 'GBP', true,  false, 'Audio',       now() - interval '4 hours'),

  -- ElectroMart
  ('p0000015-0000-0000-0000-000000000015', 'c0000003-0000-0000-0000-000000000003', 'iPhone 15 Pro 256GB',         'https://www.electromart.co.uk/iphone-15-pro',          979.00, 1099.00, 'GBP', true,  true,  'Smartphones', now() - interval '1 hour'),
  ('p0000016-0000-0000-0000-000000000016', 'c0000003-0000-0000-0000-000000000003', 'Samsung Galaxy S24 Ultra',     'https://www.electromart.co.uk/galaxy-s24-ultra',      1179.00, 1299.00, 'GBP', true,  true,  'Smartphones', now() - interval '1 hour'),
  ('p0000017-0000-0000-0000-000000000017', 'c0000003-0000-0000-0000-000000000003', 'Google Pixel 8 Pro',           'https://www.electromart.co.uk/pixel-8-pro',            869.00,  999.00, 'GBP', true,  true,  'Smartphones', now() - interval '1 hour'),
  ('p0000018-0000-0000-0000-000000000018', 'c0000003-0000-0000-0000-000000000003', 'MacBook Air M3 15"',           'https://www.electromart.co.uk/macbook-air-m3',        1249.00, 1299.00, 'GBP', true,  true,  'Laptops',     now() - interval '1 hour'),
  ('p0000019-0000-0000-0000-000000000019', 'c0000003-0000-0000-0000-000000000003', 'Dell XPS 15',                  'https://www.electromart.co.uk/dell-xps-15',           1449.00, 1599.00, 'GBP', true,  true,  'Laptops',     now() - interval '1 hour'),
  ('p0000020-0000-0000-0000-000000000020', 'c0000003-0000-0000-0000-000000000003', 'AirPods Pro 2',                'https://www.electromart.co.uk/airpods-pro-2',          219.00,  249.00, 'GBP', true,  true,  'Audio',       now() - interval '1 hour'),
  ('p0000021-0000-0000-0000-000000000021', 'c0000003-0000-0000-0000-000000000003', 'Sony WH-1000XM5',             'https://www.electromart.co.uk/sony-xm5',               299.00,  349.00, 'GBP', true,  true,  'Audio',       now() - interval '1 hour'),
  ('p0000022-0000-0000-0000-000000000022', 'c0000003-0000-0000-0000-000000000003', 'iPad Air M2',                  'https://www.electromart.co.uk/ipad-air-m2',            599.00,  649.00, 'GBP', true,  true,  'Tablets',     now() - interval '1 hour'),
  ('p0000023-0000-0000-0000-000000000023', 'c0000003-0000-0000-0000-000000000003', 'Nintendo Switch OLED',         'https://www.electromart.co.uk/switch-oled',            299.00,  309.00, 'GBP', true,  true,  'Gaming',      now() - interval '1 hour'),
  ('p0000024-0000-0000-0000-000000000024', 'c0000003-0000-0000-0000-000000000003', 'PS5 Slim Digital Edition',     'https://www.electromart.co.uk/ps5-slim',               389.00,  389.00, 'GBP', false, false, 'Gaming',      now() - interval '1 hour'),

  -- PriceSlash Digital
  ('p0000025-0000-0000-0000-000000000025', 'c0000004-0000-0000-0000-000000000004', 'iPhone 15 Pro 256GB',         'https://www.priceslash.digital/iphone-15-pro',        1029.00, 1099.00, 'GBP', true,  true,  'Smartphones', now() - interval '6 hours'),
  ('p0000026-0000-0000-0000-000000000026', 'c0000004-0000-0000-0000-000000000004', 'Samsung Galaxy S24 Ultra',     'https://www.priceslash.digital/galaxy-s24-ultra',     1219.00, 1299.00, 'GBP', true,  true,  'Smartphones', now() - interval '6 hours'),
  ('p0000027-0000-0000-0000-000000000027', 'c0000004-0000-0000-0000-000000000004', 'MacBook Air M3 15"',           'https://www.priceslash.digital/macbook-air-m3',       1269.00, 1299.00, 'GBP', true,  true,  'Laptops',     now() - interval '6 hours'),
  ('p0000028-0000-0000-0000-000000000028', 'c0000004-0000-0000-0000-000000000004', 'AirPods Pro 2',                'https://www.priceslash.digital/airpods-pro-2',         235.00,  249.00, 'GBP', true,  true,  'Audio',       now() - interval '6 hours');

-- ============================================================================
-- PRICE HISTORY (last 14 days, daily snapshots)
-- ============================================================================

-- iPhone 15 Pro — TechDirect (dropped from £1099 → £999 over 2 weeks)
INSERT INTO public.price_history (product_id, price, original_price, recorded_at) VALUES
  ('p0000001-0000-0000-0000-000000000001', 1099.00, 1099.00, now() - interval '14 days'),
  ('p0000001-0000-0000-0000-000000000001', 1099.00, 1099.00, now() - interval '13 days'),
  ('p0000001-0000-0000-0000-000000000001', 1079.00, 1099.00, now() - interval '12 days'),
  ('p0000001-0000-0000-0000-000000000001', 1079.00, 1099.00, now() - interval '11 days'),
  ('p0000001-0000-0000-0000-000000000001', 1049.00, 1099.00, now() - interval '10 days'),
  ('p0000001-0000-0000-0000-000000000001', 1049.00, 1099.00, now() - interval '9 days'),
  ('p0000001-0000-0000-0000-000000000001', 1049.00, 1099.00, now() - interval '8 days'),
  ('p0000001-0000-0000-0000-000000000001', 1029.00, 1099.00, now() - interval '7 days'),
  ('p0000001-0000-0000-0000-000000000001', 1029.00, 1099.00, now() - interval '6 days'),
  ('p0000001-0000-0000-0000-000000000001', 1009.00, 1099.00, now() - interval '5 days'),
  ('p0000001-0000-0000-0000-000000000001',  999.00, 1099.00, now() - interval '4 days'),
  ('p0000001-0000-0000-0000-000000000001',  999.00, 1099.00, now() - interval '3 days'),
  ('p0000001-0000-0000-0000-000000000001',  999.00, 1099.00, now() - interval '2 days'),
  ('p0000001-0000-0000-0000-000000000001',  999.00, 1099.00, now() - interval '1 day');

-- iPhone 15 Pro — ElectroMart (aggressive undercut: £1099 → £979)
INSERT INTO public.price_history (product_id, price, original_price, recorded_at) VALUES
  ('p0000015-0000-0000-0000-000000000015', 1099.00, 1099.00, now() - interval '14 days'),
  ('p0000015-0000-0000-0000-000000000015', 1069.00, 1099.00, now() - interval '12 days'),
  ('p0000015-0000-0000-0000-000000000015', 1039.00, 1099.00, now() - interval '10 days'),
  ('p0000015-0000-0000-0000-000000000015', 1019.00, 1099.00, now() - interval '8 days'),
  ('p0000015-0000-0000-0000-000000000015',  999.00, 1099.00, now() - interval '6 days'),
  ('p0000015-0000-0000-0000-000000000015',  989.00, 1099.00, now() - interval '4 days'),
  ('p0000015-0000-0000-0000-000000000015',  979.00, 1099.00, now() - interval '2 days'),
  ('p0000015-0000-0000-0000-000000000015',  979.00, 1099.00, now() - interval '1 day');

-- Samsung Galaxy S24 Ultra — TechDirect (stable then drop)
INSERT INTO public.price_history (product_id, price, original_price, recorded_at) VALUES
  ('p0000002-0000-0000-0000-000000000002', 1299.00, 1299.00, now() - interval '14 days'),
  ('p0000002-0000-0000-0000-000000000002', 1299.00, 1299.00, now() - interval '12 days'),
  ('p0000002-0000-0000-0000-000000000002', 1299.00, 1299.00, now() - interval '10 days'),
  ('p0000002-0000-0000-0000-000000000002', 1249.00, 1299.00, now() - interval '8 days'),
  ('p0000002-0000-0000-0000-000000000002', 1249.00, 1299.00, now() - interval '6 days'),
  ('p0000002-0000-0000-0000-000000000002', 1199.00, 1299.00, now() - interval '4 days'),
  ('p0000002-0000-0000-0000-000000000002', 1199.00, 1299.00, now() - interval '2 days'),
  ('p0000002-0000-0000-0000-000000000002', 1199.00, 1299.00, now() - interval '1 day');

-- MacBook Air M3 — ElectroMart (slight dip)
INSERT INTO public.price_history (product_id, price, original_price, recorded_at) VALUES
  ('p0000018-0000-0000-0000-000000000018', 1299.00, 1299.00, now() - interval '14 days'),
  ('p0000018-0000-0000-0000-000000000018', 1299.00, 1299.00, now() - interval '12 days'),
  ('p0000018-0000-0000-0000-000000000018', 1279.00, 1299.00, now() - interval '10 days'),
  ('p0000018-0000-0000-0000-000000000018', 1279.00, 1299.00, now() - interval '8 days'),
  ('p0000018-0000-0000-0000-000000000018', 1249.00, 1299.00, now() - interval '6 days'),
  ('p0000018-0000-0000-0000-000000000018', 1249.00, 1299.00, now() - interval '4 days'),
  ('p0000018-0000-0000-0000-000000000018', 1249.00, 1299.00, now() - interval '2 days'),
  ('p0000018-0000-0000-0000-000000000018', 1249.00, 1299.00, now() - interval '1 day');

-- AirPods Pro 2 — TechDirect (small drops)
INSERT INTO public.price_history (product_id, price, original_price, recorded_at) VALUES
  ('p0000006-0000-0000-0000-000000000006', 249.00, 249.00, now() - interval '14 days'),
  ('p0000006-0000-0000-0000-000000000006', 249.00, 249.00, now() - interval '12 days'),
  ('p0000006-0000-0000-0000-000000000006', 239.00, 249.00, now() - interval '10 days'),
  ('p0000006-0000-0000-0000-000000000006', 239.00, 249.00, now() - interval '8 days'),
  ('p0000006-0000-0000-0000-000000000006', 229.00, 249.00, now() - interval '6 days'),
  ('p0000006-0000-0000-0000-000000000006', 229.00, 249.00, now() - interval '4 days'),
  ('p0000006-0000-0000-0000-000000000006', 229.00, 249.00, now() - interval '2 days'),
  ('p0000006-0000-0000-0000-000000000006', 229.00, 249.00, now() - interval '1 day');

-- Sony WH-1000XM5 — ElectroMart (flash sale pattern)
INSERT INTO public.price_history (product_id, price, original_price, recorded_at) VALUES
  ('p0000021-0000-0000-0000-000000000021', 349.00, 349.00, now() - interval '14 days'),
  ('p0000021-0000-0000-0000-000000000021', 349.00, 349.00, now() - interval '12 days'),
  ('p0000021-0000-0000-0000-000000000021', 349.00, 349.00, now() - interval '10 days'),
  ('p0000021-0000-0000-0000-000000000021', 279.00, 349.00, now() - interval '8 days'),
  ('p0000021-0000-0000-0000-000000000021', 279.00, 349.00, now() - interval '7 days'),
  ('p0000021-0000-0000-0000-000000000021', 349.00, 349.00, now() - interval '6 days'),
  ('p0000021-0000-0000-0000-000000000021', 319.00, 349.00, now() - interval '4 days'),
  ('p0000021-0000-0000-0000-000000000021', 299.00, 349.00, now() - interval '2 days'),
  ('p0000021-0000-0000-0000-000000000021', 299.00, 349.00, now() - interval '1 day');

-- ============================================================================
-- PRODUCT CHANGES (recent activity)
-- ============================================================================
INSERT INTO public.product_changes (product_id, change_type, old_value, new_value, percentage_change, detected_at) VALUES
  -- Price drops
  ('p0000001-0000-0000-0000-000000000001', 'price_decrease', '1009.00', '999.00',   -0.99, now() - interval '4 days'),
  ('p0000001-0000-0000-0000-000000000001', 'sale_started',    NULL,      NULL,        NULL, now() - interval '12 days'),
  ('p0000015-0000-0000-0000-000000000015', 'price_decrease', '989.00',  '979.00',   -1.01, now() - interval '2 days'),
  ('p0000015-0000-0000-0000-000000000015', 'price_decrease', '999.00',  '989.00',   -1.00, now() - interval '4 days'),
  ('p0000002-0000-0000-0000-000000000002', 'price_decrease', '1249.00', '1199.00',  -4.00, now() - interval '4 days'),
  ('p0000002-0000-0000-0000-000000000002', 'sale_started',    NULL,      NULL,        NULL, now() - interval '8 days'),
  ('p0000016-0000-0000-0000-000000000016', 'price_decrease', '1229.00', '1179.00',  -4.07, now() - interval '1 day'),
  ('p0000018-0000-0000-0000-000000000018', 'price_decrease', '1279.00', '1249.00',  -2.35, now() - interval '6 days'),
  ('p0000018-0000-0000-0000-000000000018', 'sale_started',    NULL,      NULL,        NULL, now() - interval '10 days'),
  ('p0000006-0000-0000-0000-000000000006', 'price_decrease', '239.00',  '229.00',   -4.18, now() - interval '6 days'),
  ('p0000020-0000-0000-0000-000000000020', 'price_decrease', '249.00',  '219.00',  -12.05, now() - interval '3 days'),
  ('p0000021-0000-0000-0000-000000000021', 'price_decrease', '319.00',  '299.00',   -6.27, now() - interval '2 days'),
  ('p0000021-0000-0000-0000-000000000021', 'sale_started',    NULL,      NULL,        NULL, now() - interval '8 days'),

  -- Price increases
  ('p0000010-0000-0000-0000-000000000010', 'price_increase', '1199.00', '1249.00',   4.17, now() - interval '3 days'),
  ('p0000013-0000-0000-0000-000000000013', 'price_increase', '299.00',  '319.00',    6.69, now() - interval '5 days'),

  -- Stock changes
  ('p0000024-0000-0000-0000-000000000024', 'out_of_stock',    NULL,      NULL,        NULL, now() - interval '1 day'),

  -- New products detected
  ('p0000014-0000-0000-0000-000000000014', 'new_product',     NULL,      NULL,        NULL, now() - interval '7 days'),
  ('p0000023-0000-0000-0000-000000000023', 'new_product',     NULL,      NULL,        NULL, now() - interval '5 days'),

  -- Sale ended
  ('p0000005-0000-0000-0000-000000000005', 'sale_ended',      NULL,      NULL,        NULL, now() - interval '1 day');

-- ============================================================================
-- SCRAPE JOBS (recent successful runs)
-- ============================================================================
INSERT INTO public.scrape_jobs (competitor_id, status, pages_scraped, products_found, changes_detected, started_at, completed_at) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'completed', 2, 24, 3, now() - interval '2 hours 5 minutes',  now() - interval '2 hours'),
  ('c0000002-0000-0000-0000-000000000002', 'completed', 2, 18, 1, now() - interval '4 hours 8 minutes',  now() - interval '4 hours'),
  ('c0000003-0000-0000-0000-000000000003', 'completed', 1, 31, 4, now() - interval '1 hour 3 minutes',   now() - interval '1 hour'),
  ('c0000004-0000-0000-0000-000000000004', 'completed', 1, 15, 0, now() - interval '6 hours 4 minutes',  now() - interval '6 hours'),
  ('c0000001-0000-0000-0000-000000000001', 'completed', 2, 24, 2, now() - interval '8 hours 6 minutes',  now() - interval '8 hours'),
  ('c0000003-0000-0000-0000-000000000003', 'completed', 1, 30, 5, now() - interval '7 hours 4 minutes',  now() - interval '7 hours'),
  ('c0000002-0000-0000-0000-000000000002', 'completed', 2, 17, 2, now() - interval '10 hours 7 minutes', now() - interval '10 hours');

-- ============================================================================
-- ALERT CONFIGS
-- ============================================================================
INSERT INTO public.alert_configs (organization_id, name, alert_type, threshold, channels, is_active) VALUES
  (:org_id::uuid, 'Major Price Drops',      'price_decrease', 5.00,  '{email,slack}', true),
  (:org_id::uuid, 'Any Price Increase',      'price_increase', NULL,  '{email}',       true),
  (:org_id::uuid, 'New Products Detected',   'new_product',    NULL,  '{email,slack}', true),
  (:org_id::uuid, 'Out of Stock Alerts',     'out_of_stock',   NULL,  '{slack}',       true),
  (:org_id::uuid, 'Flash Sale Detection',    'sale_started',   NULL,  '{email,slack}', true);

-- ============================================================================
-- ALERTS (sent notifications)
-- ============================================================================
INSERT INTO public.alerts (organization_id, product_id, competitor_id, title, message, severity, change_type, is_read, created_at) VALUES
  (:org_id::uuid, 'p0000020-0000-0000-0000-000000000020', 'c0000003-0000-0000-0000-000000000003',
    'Major Price Drop: AirPods Pro 2',
    'ElectroMart dropped AirPods Pro 2 by 12.05% from £249 to £219. This is the lowest price tracked across all competitors.',
    'critical', 'price_decrease', false, now() - interval '3 days'),

  (:org_id::uuid, 'p0000016-0000-0000-0000-000000000016', 'c0000003-0000-0000-0000-000000000003',
    'Price Drop: Samsung Galaxy S24 Ultra',
    'ElectroMart reduced Samsung Galaxy S24 Ultra by £50 to £1,179. Now £20 cheaper than TechDirect.',
    'warning', 'price_decrease', false, now() - interval '1 day'),

  (:org_id::uuid, 'p0000021-0000-0000-0000-000000000021', 'c0000003-0000-0000-0000-000000000003',
    'Price Drop: Sony WH-1000XM5',
    'ElectroMart dropped Sony WH-1000XM5 by 6.27% to £299. Previously flash-sold at £279 last week.',
    'warning', 'price_decrease', true, now() - interval '2 days'),

  (:org_id::uuid, 'p0000010-0000-0000-0000-000000000010', 'c0000002-0000-0000-0000-000000000002',
    'Price Increase: Samsung Galaxy S24 Ultra',
    'GadgetZone raised Samsung Galaxy S24 Ultra by £50 to £1,249. All other competitors still under £1,220.',
    'info', 'price_increase', true, now() - interval '3 days'),

  (:org_id::uuid, 'p0000024-0000-0000-0000-000000000024', 'c0000003-0000-0000-0000-000000000003',
    'Out of Stock: PS5 Slim Digital Edition',
    'ElectroMart PS5 Slim Digital Edition is now out of stock. This may indicate a supplier shortage.',
    'warning', 'out_of_stock', false, now() - interval '1 day'),

  (:org_id::uuid, 'p0000014-0000-0000-0000-000000000014', 'c0000002-0000-0000-0000-000000000002',
    'New Product: Samsung Galaxy Buds3 Pro',
    'GadgetZone listed a new product: Samsung Galaxy Buds3 Pro at £219.',
    'info', 'new_product', true, now() - interval '7 days'),

  (:org_id::uuid, 'p0000023-0000-0000-0000-000000000023', 'c0000003-0000-0000-0000-000000000003',
    'New Product: Nintendo Switch OLED',
    'ElectroMart added Nintendo Switch OLED at £299 (£10 off RRP).',
    'info', 'new_product', true, now() - interval '5 days');

-- ============================================================================
-- NOTIFICATION SETTINGS
-- ============================================================================
INSERT INTO public.notification_settings (organization_id, email_enabled, email_frequency, slack_enabled, slack_webhook_url)
VALUES (:org_id::uuid, true, 'instant', true, 'https://hooks.slack.com/services/DEMO/WEBHOOK/URL')
ON CONFLICT (organization_id) DO UPDATE
SET email_enabled = true, email_frequency = 'instant', slack_enabled = true;

-- ============================================================================
-- REPORTS (pre-generated)
-- ============================================================================
INSERT INTO public.reports (organization_id, title, report_type, period_start, period_end, status, summary, created_at) VALUES
  (:org_id::uuid, 'Weekly Intelligence Report — Feb 3-9', 'weekly',
    '2026-02-03', '2026-02-09', 'ready',
    '{"total_changes": 23, "price_decreases": 14, "price_increases": 5, "new_products": 3, "out_of_stock": 1, "top_mover": "AirPods Pro 2 (-12%)", "most_active_competitor": "ElectroMart", "summary": "Aggressive pricing across the board this week. ElectroMart is leading a price war on audio products, with AirPods Pro 2 hitting an all-time low of £219. TechDirect followed with modest reductions. GadgetZone bucked the trend, raising Galaxy S24 Ultra by £50."}'::jsonb,
    now() - interval '7 days'),

  (:org_id::uuid, 'Weekly Intelligence Report — Feb 10-16', 'weekly',
    '2026-02-10', '2026-02-16', 'ready',
    '{"total_changes": 19, "price_decreases": 11, "price_increases": 2, "new_products": 2, "out_of_stock": 1, "sale_events": 3, "top_mover": "Sony WH-1000XM5 (-14%)", "most_active_competitor": "ElectroMart", "summary": "ElectroMart continues its aggressive pricing strategy. Sony WH-1000XM5 saw a flash sale drop to £279 before settling at £299. Samsung Galaxy S24 Ultra prices converging across competitors around £1,180-1,200. PS5 Slim went out of stock at ElectroMart — potential supply issue."}'::jsonb,
    now() - interval '1 day'),

  (:org_id::uuid, 'Monthly Intelligence Report — January 2026', 'monthly',
    '2026-01-01', '2026-01-31', 'ready',
    '{"total_changes": 87, "price_decreases": 52, "price_increases": 18, "new_products": 11, "out_of_stock": 4, "back_in_stock": 2, "avg_price_change": -3.2, "most_volatile_product": "Sony WH-1000XM5", "most_active_competitor": "ElectroMart", "cheapest_competitor": "ElectroMart", "summary": "January saw a post-holiday pricing correction with 52 price decreases across tracked competitors. ElectroMart emerged as the most aggressive pricer, consistently undercutting on key SKUs. Audio category was most volatile with an average 6.5% price swing. Smartphone prices stabilised mid-month after initial January sales ended."}'::jsonb,
    now() - interval '16 days');

-- ============================================================================
-- Done! Your demo environment is ready.
-- ============================================================================
