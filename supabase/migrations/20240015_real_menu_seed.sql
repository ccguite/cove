-- ============================================================
-- Migration 20240015: Real COVE Menu Content
-- Clears all placeholder data and seeds the actual menu.
-- ============================================================

-- 1. Clear existing data (dependency order)
delete from public.booking_food_items;
delete from public.order_items;
delete from public.menu_items;
delete from public.menu_categories;

-- ============================================================
-- 2. Insert Categories (let DB generate UUIDs)
-- ============================================================
insert into public.menu_categories (name, type, display_order) values
  ('Croffles',              'food',  1),
  ('Burgers',               'food',  2),
  ('Sandwiches',            'food',  3),
  ('Fries',                 'food',  4),
  ('Cakes & Pastries',      'food',  5),
  ('Snacks',                'food',  6),
  ('Hot Coffees',           'drink', 7),
  ('Cold Coffees',          'drink', 8),
  ('Shakes',                'drink', 9),
  ('Iced Teas',             'drink', 10),
  ('Cove Signature Drinks', 'drink', 11);

-- ============================================================
-- 3. Insert Menu Items (look up category_id by name)
-- ============================================================

-- ── Croffles ─────────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Classic Butter Croffle',         149, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Cinnamon Sugar Croffle',         159, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Nutella Dream Croffle',          219, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Lotus Biscoff Croffle',          239, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Strawberry Cream Croffle',       229, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Oreo Crunch Croffle',            219, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Caramel Banana Croffle',         209, true from public.menu_categories where name = 'Croffles';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Matcha White Chocolate Croffle', 249, true from public.menu_categories where name = 'Croffles';

-- ── Burgers ──────────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Crispy Chicken Burger',  229, true from public.menu_categories where name = 'Burgers';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Smoky Beef Burger',      269, true from public.menu_categories where name = 'Burgers';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Veggie Delight Burger',  199, true from public.menu_categories where name = 'Burgers';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'BBQ Pulled Pork Burger', 259, true from public.menu_categories where name = 'Burgers';

-- ── Sandwiches ───────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Classic Grilled Cheese',         169, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Chicken Ham & Cheese',           219, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Grilled Chicken Sandwich',       229, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Tuna Mayo Sandwich',             219, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'BBQ Pulled Pork Sandwich',       239, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Roast Beef Sandwich',            249, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Veggie Club Sandwich',           189, true from public.menu_categories where name = 'Sandwiches';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Korean Spicy Chicken Sandwich',  239, true from public.menu_categories where name = 'Sandwiches';

-- ── Fries ────────────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Classic Salted Fries',   149, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Peri Peri Fries',        169, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Cheese Loaded Fries',    199, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Truffle Parmesan Fries', 249, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Korean Spicy Fries',     189, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'BBQ Pulled Pork Fries',  259, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Loaded Beef Fries',      269, true from public.menu_categories where name = 'Fries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Cheesy Jalapeño Fries',  229, true from public.menu_categories where name = 'Fries';

-- ── Cakes & Pastries ─────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Chocolate Truffle Pastry',    189, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Red Velvet Pastry',           199, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Black Forest Pastry',         189, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Tiramisu Pastry',             209, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Classic New York Cheesecake', 229, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Lotus Biscoff Cheesecake',    249, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Blueberry Cheesecake',        239, true from public.menu_categories where name = 'Cakes & Pastries';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Strawberry Cheesecake',       239, true from public.menu_categories where name = 'Cakes & Pastries';

-- ── Snacks ───────────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Wai Wai Kan',         129, true from public.menu_categories where name = 'Snacks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Chicken Popcorn',     199, true from public.menu_categories where name = 'Snacks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Crispy Corn',         179, true from public.menu_categories where name = 'Snacks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Cheesy Garlic Bread', 179, true from public.menu_categories where name = 'Snacks';

-- ── Hot Coffees ──────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Espresso',   129, true from public.menu_categories where name = 'Hot Coffees';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Americano',  149, true from public.menu_categories where name = 'Hot Coffees';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Cappuccino', 179, true from public.menu_categories where name = 'Hot Coffees';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Café Latte', 189, true from public.menu_categories where name = 'Hot Coffees';

-- ── Cold Coffees ─────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Iced Americano',            159, true from public.menu_categories where name = 'Cold Coffees';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Iced Latte',                189, true from public.menu_categories where name = 'Cold Coffees';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Iced Mocha',                209, true from public.menu_categories where name = 'Cold Coffees';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Lotus Biscoff Cold Coffee', 249, true from public.menu_categories where name = 'Cold Coffees';

-- ── Shakes ───────────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Classic Chocolate Shake', 219, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Oreo Shake',              229, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Vanilla Shake',           199, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Strawberry Shake',        219, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Lotus Biscoff Shake',     249, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Peanut Butter Shake',     239, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'KitKat Shake',            249, true from public.menu_categories where name = 'Shakes';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Salted Caramel Shake',    229, true from public.menu_categories where name = 'Shakes';

-- ── Iced Teas ────────────────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Classic Lemon',   159, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Peach',           179, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Lychee',          179, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Green Apple',     179, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Passion Fruit',   189, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Mixed Berry',     189, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Mango',           189, true from public.menu_categories where name = 'Iced Teas';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Blue Raspberry',  199, true from public.menu_categories where name = 'Iced Teas';

-- ── Cove Signature Drinks ────────────────────────────────────
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Seoul Sunset',     219, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Midnight Cove',    229, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Blue Lagoon Fizz', 209, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Berry Eclipse',    219, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Tropical Drift',   219, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Pink Tide',        209, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Aurora Splash',    229, true from public.menu_categories where name = 'Cove Signature Drinks';
insert into public.menu_items (category_id, name, price, is_available)
select id, 'Galaxy Breeze',    239, true from public.menu_categories where name = 'Cove Signature Drinks';
