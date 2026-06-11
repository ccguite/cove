-- Rooms
insert into public.rooms (name, slug, min_pax, max_pax, price_per_hour, description)
values
  ('Husk',  'husk',  1, 2, 599,  'The Couple Room — an intimate space designed for two.'),
  ('Haven', 'haven', 3, 8, 1499, 'The Group Room — a social space for 3 to 8 guests.')
on conflict (slug) do nothing;

-- Menu categories
insert into public.menu_categories (name, type, display_order)
values
  ('Hot Coffees',      'drink', 1),
  ('Cold Coffees',     'drink', 2),
  ('Shakes',           'drink', 3),
  ('Iced Tea',         'drink', 4),
  ('Signature Drinks', 'drink', 5),
  ('Cakes & Pastries', 'food',  6),
  ('Croffles',         'food',  7),
  ('Sandwiches',       'food',  8),
  ('Fries',            'food',  9),
  ('Burgers',          'food',  10),
  ('Snacks',           'food',  11)
on conflict (name) do nothing;

-- Menu items
insert into public.menu_items (category_id, name, description, price, is_available, is_seasonal, image_url)
values
  -- Cakes & Pastries
  ((select id from public.menu_categories where name = 'Cakes & Pastries' limit 1),
   'Matcha Mille Crepe', 'Delicate handmade crepes layered with premium Uji matcha infused cream.', 240, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuD6KhHz5oWy4_xAnytElGONetbG5OEGnuKtItCj_tl8NO8XDCN-JOnrsEwxrsJRLn5cSHyzEKlVYWd9It_FVzkc_x0f5ro6zLt7eVNr5kI2EUOJOw2m2MfxNFNV-vz5Zy6YvEgAd60Wuh2fB1lWZ1HS1-wDs2YkLwCAe9usu1s_p_zM3qPelxLd_kg9OPARelzim4uG0EiOuoC1F7auYM8-N1UGXy9ol8qPRKmxG5ktXjeNPcGh0oR_FdnD6vW6XNcnSU3oGz6jFzGG'),
  
  ((select id from public.menu_categories where name = 'Cakes & Pastries' limit 1),
   'Basque Burnt Cheesecake', 'Caramelized exterior with a meltingly soft, rich cream cheese center.', 260, false, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDdzvNjEBhINIagvJNVE5woQhxyPHM4tVO3yjZYIEDotmRnobqBT3UUtyijNydQ2Fk7iF15pEwHY1DJl0BWKwvVVkgtQI2tqB0nxOmCydBjjUANrobn5C_Q7TkYdWDPeMSbvKalwG3ECiCE1eAc8JqErSozMWn1wpMDIuFSEmBR8FWuuleLDISI72cCqkiwaCquLnBFZhPkMTd21YPbm2LjFrT7OVPmv2SrmtM5FGGieu189r2S0sSLhXh3I0s6-rWXqncR4Z08bCww'),

  ((select id from public.menu_categories where name = 'Cakes & Pastries' limit 1),
   'Valrhona Chocolate Tart', 'Warm dark chocolate ganache encased in a buttery tart shell.', 280, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3iTn0cNjk1CwEgESvkmJ40Oj4gbvyQ1FA2u63UZH_iNKnNhJ2nvapbw3ZGdkYT6rTJVvS07x-ELLbqd-MPGPyzeashMrDKR2B_XD6J8FwFM7T3EkRAkrgth8x1o4nIsiWpPZtw-feLA7Aau0yXOShdznUGmQCFPK2avLE5secYi-Uqtn1l3qR0CLfrsXNCjJX57OyhhDWcV3cN7TeJzM1tWtLKqU7rc9WwWvi3ERfwo0LEUR0llNBun1wrX-_zE0GB-AMpw3hznK'),

  -- Croffles
  ((select id from public.menu_categories where name = 'Croffles' limit 1),
   'Strawberry Cream Croffle', 'Buttery croffle topped with fresh local organic strawberries and vanilla whipped cream.', 210, true, true,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuD6KhHz5oWy4_xAnytElGONetbG5OEGnuKtItCj_tl8NO8XDCN-JOnrsEwxrsJRLn5cSHyzEKlVYWd9It_FVzkc_x0f5ro6zLt7eVNr5kI2EUOJOw2m2MfxNFNV-vz5Zy6YvEgAd60Wuh2fB1lWZ1HS1-wDs2YkLwCAe9usu1s_p_zM3qPelxLd_kg9OPARelzim4uG0EiOuoC1F7auYM8-N1UGXy9ol8qPRKmxG5ktXjeNPcGh0oR_FdnD6vW6XNcnSU3oGz6jFzGG'),

  ((select id from public.menu_categories where name = 'Croffles' limit 1),
   'Brown Cheese Croffle', 'Korean-style croffle dusted with caramelized Norwegian brown cheese shavings and maple syrup.', 230, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRrG0vcTM3nCkgyE3YRmt74yrbu48D_ABS8h8Eq2pml1fx2TEA2SpXltGG2mezlTY8ZrvcaLUFDAOW1AfPs00kAkIosFajkV8CBT8orQcRhdjA-6zQRXp_0ylJs7IkRtMK6hSulp4SyVyMRZM2cH8hvs1XbbJM1lb77tRCMzmMUAuFxQxsjKMkh65syfqux8t7liAARCuvOga5mXGJBsGjvuNR4TVQgmPQNeAA9w8iBghD-0Q2HF58u53UFszDnOPGLAaPDQUK1TE'),

  -- Signature Drinks
  ((select id from public.menu_categories where name = 'Signature Drinks' limit 1),
   'Specialty Einspänner', 'Double shot espresso topped with a thick, rich layer of sweet cold cream, served in Seoul style.', 180, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAy4stc3v1ZsXHPI11viJ9OaOcga4yoNinUm81wBV69w7opV7ZGdnpHkvvP9FLaHgouX-md1MywR_xi2-eTaM4CYptsgJNMfxlWxvZSNl4Mou5keIHfN2Fwp4e4JyLlsLcUjQu64m2DGPNoWUaKOfvJyJlew2D-QJjNyTUlz8404jiGLkw6lB0YuNhOBQRyt-yk-2ZfNJ73etBshM8nv-r1kRBMB7kmyHkbXCKivn_DQafMx2KrFMbqkkWIIIBxUNCD4gN9MgdnyNH-'),

  ((select id from public.menu_categories where name = 'Signature Drinks' limit 1),
   'Jeju Matcha Latte', 'Ceremonial-grade green tea latte whisked with steamed organic milk and sweet cane syrup.', 190, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB4zrpROIgKvD3zfXD7FO4Jjoasv0Dd-3ZfGyo9p04oZmbOAhL-UAS7KM6QKPCrwkGgiD29ytcUohXyMuY5BPmR1yctX1VGs_WWaspFc4FGeweM2Cs37IvAJvV-AxnmT9973Tf8svyQkb-f8NS8XUJ3NFIdDKNNeKp1uvm9IQ18C-ZiGsk6Hf-d_kVvT953wOrm87--LnyMzw9FhYneYlh_I_B88oZfkMNwDlEssMsZOvjthw4Gd39ZtZz4x82TN9xkzqAuhxjpQ8Q3'),

  -- Hot Coffees
  ((select id from public.menu_categories where name = 'Hot Coffees' limit 1),
   'Café Latte', 'Double espresso shot with smooth velvety microfoam, featuring balanced local honey tones.', 160, true, false,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRrG0vcTM3nCkgyE3YRmt74yrbu48D_ABS8h8Eq2pml1fx2TEA2SpXltGG2mezlTY8ZrvcaLUFDAOW1AfPs00kAkIosFajkV8CBT8orQcRhdjA-6zQRXp_0ylJs7IkRtMK6hSulp4SyVyMRZM2cH8hvs1XbbJM1lb77tRCMzmMUAuFxQxsjKMkh65syfqux8t7liAARCuvOga5mXGJBsGjvuNR4TVQgmPQNeAA9w8iBghD-0Q2HF58u53UFszDnOPGLAaPDQUK1TE')
on conflict do nothing;
