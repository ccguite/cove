-- Fix orders check constraint to allow 'pending_payment' status
alter table public.orders drop constraint orders_status_check;

alter table public.orders add constraint orders_status_check 
  check (status in ('pending_payment', 'placed', 'preparing', 'ready', 'dispatched', 'collected'));
