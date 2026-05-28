-- Add ffl_meetup as a valid shipping method for firearms with local FFL handoff.
alter table public.waffles
  drop constraint waffles_shipping_method_check;

alter table public.waffles
  add constraint waffles_shipping_method_check
  check (shipping_method in ('ship', 'meetup', 'ffl', 'ffl_meetup'));

-- Update the RPC to allow the new value.
drop function if exists public.create_waffle(text,text,text,integer,integer,boolean,draw_style,draw_type,timestamptz,text,jsonb);

create or replace function public.create_waffle(
  p_title text,
  p_description text,
  p_category text,
  p_seat_price integer,
  p_total_seats integer,
  p_allow_seat_choice boolean,
  p_draw_style draw_style,
  p_draw_type draw_type,
  p_deadline timestamptz,
  p_shipping_method text,
  p_item jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_waffle_id uuid;
  v_item_id uuid;
  v_declared_value integer;
  v_total_pot integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if p_shipping_method not in ('ship', 'meetup', 'ffl', 'ffl_meetup') then
    raise exception 'invalid shipping method' using errcode = '22023';
  end if;

  v_declared_value := (p_item->>'declared_value')::integer;

  if p_seat_price < 500 then
    raise exception 'seat price must be at least $5.00' using errcode = '22023';
  end if;
  if p_total_seats < 10 then
    raise exception 'must have at least 10 seats' using errcode = '22023';
  end if;
  if v_declared_value < 5000 then
    raise exception 'item value must be at least $50.00' using errcode = '22023';
  end if;

  v_total_pot := p_seat_price * p_total_seats;

  if v_total_pot > (v_declared_value * 110) / 100 then
    raise exception 'total pot cannot exceed 110%% of declared item value'
      using errcode = '22023';
  end if;

  insert into public.waffles (
    chef_id, title, description, category,
    seat_price, total_seats, allow_seat_choice,
    draw_style, draw_type, deadline,
    shipping_method, status
  ) values (
    v_user_id, p_title, p_description, p_category,
    p_seat_price, p_total_seats, p_allow_seat_choice,
    p_draw_style, p_draw_type, p_deadline,
    p_shipping_method, 'active'
  ) returning id into v_waffle_id;

  insert into public.waffle_items (
    waffle_id, title, description, condition,
    is_new, declared_value, sort_order
  ) values (
    v_waffle_id,
    p_item->>'title',
    p_item->>'description',
    (p_item->>'condition')::item_condition,
    coalesce((p_item->>'is_new')::boolean, false),
    v_declared_value,
    0
  ) returning id into v_item_id;

  insert into public.seats (waffle_id, seat_number, status)
  select v_waffle_id, gs.n, 'available'::seat_status
  from generate_series(1, p_total_seats) as gs(n);

  return jsonb_build_object(
    'waffle_id', v_waffle_id,
    'item_id', v_item_id
  );
end;
$$;

revoke all on function public.create_waffle(text,text,text,integer,integer,boolean,draw_style,draw_type,timestamptz,text,jsonb) from public;
grant execute on function public.create_waffle(text,text,text,integer,integer,boolean,draw_style,draw_type,timestamptz,text,jsonb) to authenticated;
