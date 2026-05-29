-- Add 'reserved' to seat_status enum (Phase 1 sandbox claimed state).
alter type public.seat_status add value if not exists 'reserved' after 'available';

-- Atomic seat claim. Works for both pick-your-seat (p_seat_numbers non-empty)
-- and random assignment (p_seat_numbers empty, uses p_quantity).
create or replace function public.claim_seats(
  p_waffle_id    uuid,
  p_seat_numbers integer[],  -- specific seats; empty array = random
  p_quantity     integer     -- used only when p_seat_numbers is empty
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id      uuid    := auth.uid();
  v_waffle       record;
  v_claimed      integer[];
  v_filled_count integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Lock waffle row to prevent concurrent over-fill
  select * into v_waffle
  from public.waffles
  where id = p_waffle_id
  for update;

  if not found then
    raise exception 'waffle not found' using errcode = 'P0002';
  end if;

  if v_waffle.status <> 'active' then
    raise exception 'waffle is not accepting seats right now' using errcode = '22023';
  end if;

  if v_waffle.chef_id = v_user_id then
    raise exception 'chef cannot claim seats in their own waffle' using errcode = '22023';
  end if;

  if array_length(p_seat_numbers, 1) > 0 then
    -- ── Specific seat selection ──────────────────────────────────────────────

    -- All requested seats must still be available
    if (
      select count(*)
      from public.seats
      where waffle_id = p_waffle_id
        and seat_number = any(p_seat_numbers)
        and status = 'available'
    ) <> array_length(p_seat_numbers, 1) then
      raise exception 'one or more seats are no longer available' using errcode = '22023';
    end if;

    with updated as (
      update public.seats
      set status = 'reserved', holder_id = v_user_id, updated_at = now()
      where waffle_id = p_waffle_id
        and seat_number = any(p_seat_numbers)
        and status = 'available'
      returning seat_number
    )
    select array_agg(seat_number) into v_claimed from updated;

  else
    -- ── Random assignment ────────────────────────────────────────────────────

    if coalesce(p_quantity, 0) < 1 then
      raise exception 'quantity must be at least 1' using errcode = '22023';
    end if;

    with picked as (
      select id
      from public.seats
      where waffle_id = p_waffle_id
        and status = 'available'
      order by random()
      limit p_quantity
      for update skip locked
    ),
    updated as (
      update public.seats s
      set status = 'reserved', holder_id = v_user_id, updated_at = now()
      from picked p
      where s.id = p.id
      returning s.seat_number
    )
    select array_agg(seat_number) into v_claimed from updated;

    if coalesce(array_length(v_claimed, 1), 0) < p_quantity then
      raise exception 'not enough seats available' using errcode = '22023';
    end if;
  end if;

  -- Check if waffle is now fully filled
  select count(*) into v_filled_count
  from public.seats
  where waffle_id = p_waffle_id
    and status <> 'available';

  if v_filled_count = v_waffle.total_seats then
    update public.waffles
    set status = 'filled'
    where id = p_waffle_id;
  end if;

  return jsonb_build_object(
    'claimed_seats',  v_claimed,
    'waffle_filled',  v_filled_count = v_waffle.total_seats
  );
end;
$$;

revoke all on function public.claim_seats from public;
grant execute on function public.claim_seats to authenticated;
