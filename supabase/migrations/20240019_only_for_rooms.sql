-- Add only_for_rooms column to public.menu_items
ALTER TABLE public.menu_items ADD COLUMN only_for_rooms boolean NOT NULL DEFAULT false;

-- Create Combo Packages category
INSERT INTO public.menu_categories (name, type, display_order)
VALUES ('Combo Packages', 'food', 99)
ON CONFLICT (name) DO NOTHING;

-- Seed some combo packages only for room guests
INSERT INTO public.menu_items (category_id, name, description, price, only_for_rooms, is_available)
VALUES 
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Combo Packages' LIMIT 1), 
    'Husk Premium Couple Combo', 
    'Classic Butter Croffle + 2 Hot Special Coffees + Premium Chocolate Cake slice.', 
    499, 
    true, 
    true
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Combo Packages' LIMIT 1), 
    'Movietopia Group Feast', 
    '2 Burgers + Fries Basket + Cinnamon Sugar Croffle + 4 Shakes/Drinks.', 
    999, 
    true, 
    true
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Combo Packages' LIMIT 1), 
    'Serenity Coffee & Croffle Combo', 
    'Any signature Croffle served with a Specialty Latte.', 
    320, 
    true, 
    true
  )
ON CONFLICT DO NOTHING;
