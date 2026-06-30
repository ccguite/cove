-- Customer write policies for bookings, booking_food_items, orders, order_items, and slot_locks
-- and the confirm_payment_via_webhook RPC helper function

-- 1. Bookings policies
create policy "bookings: customer insert own"
  on public.bookings for insert
  with check (user_id = auth.uid());

create policy "bookings: customer update own"
  on public.bookings for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid() and 
    (status is distinct from 'confirmed' or (select status from public.bookings where id = bookings.id) = 'confirmed')
  );

-- 2. Booking food items policies
create policy "booking_food_items: customer insert own"
  on public.booking_food_items for insert
  with check (
    exists (
      select 1 from public.bookings
      where id = booking_id and user_id = auth.uid()
    )
  );

-- 3. Orders policies
create policy "orders: customer insert own"
  on public.orders for insert
  with check (user_id = auth.uid());

create policy "orders: customer update own"
  on public.orders for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid() and 
    (status is distinct from 'placed' or (select status from public.orders where id = orders.id) = 'placed')
  );

-- 4. Order items policies
create policy "order_items: customer insert own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

-- 5. Slot locks policies
create policy "slot_locks: authenticated insert"
  on public.slot_locks for insert
  with check (auth.uid() is not null);

create policy "slot_locks: authenticated delete"
  on public.slot_locks for delete
  using (auth.uid() is not null);

-- 6. RPC Payment Confirmation function
create or replace function public.confirm_payment_via_webhook(
  p_razorpay_order_id text,
  p_secret text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_secret != 'cove_secure_webhook_secret_2026' then
    raise exception 'Unauthorized';
  end if;

  -- 1. Try to confirm booking
  update public.bookings
  set status = 'confirmed'
  where razorpay_order_id = p_razorpay_order_id
    and status = 'pending_payment';

  if found then
    -- Delete matching slot locks
    delete from public.slot_locks
    where (room_id, date, start_time) in (
      select room_id, date, start_time
      from public.bookings
      where razorpay_order_id = p_razorpay_order_id
    );
    return true;
  end if;

  -- 2. Try to confirm food order
  update public.orders
  set status = 'placed'
  where razorpay_order_id = p_razorpay_order_id
    and status = 'pending_payment';

  return found;
end;
$$;
