-- Booking availability checks (most performance-critical query)
create index idx_bookings_room_date        on public.bookings(room_id, date);
create index idx_slot_locks_room_date      on public.slot_locks(room_id, date);
create index idx_blocked_slots_room_date   on public.blocked_slots(room_id, date);

-- Dashboard queries
create index idx_bookings_status           on public.bookings(status);
create index idx_bookings_user_id          on public.bookings(user_id);
create index idx_orders_status             on public.orders(status);
create index idx_orders_user_id            on public.orders(user_id);
create index idx_orders_created_at         on public.orders(created_at desc);

-- Menu queries
create index idx_menu_items_category_id    on public.menu_items(category_id);
create index idx_menu_items_is_available   on public.menu_items(is_available);

-- Slot lock expiry cleanup
create index idx_slot_locks_expires_at     on public.slot_locks(expires_at);
