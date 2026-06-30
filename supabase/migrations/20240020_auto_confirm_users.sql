-- Create function to auto-confirm new users
create or replace function public.auto_confirm_new_users()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

-- Create the before insert trigger on auth.users
drop trigger if exists trg_auto_confirm_new_users on auth.users;
create trigger trg_auto_confirm_new_users
  before insert on auth.users
  for each row
  execute function public.auto_confirm_new_users();

-- Update any existing unconfirmed users to be confirmed
update auth.users
set 
  email_confirmed_at = coalesce(email_confirmed_at, created_at, now())
where email_confirmed_at is null;
