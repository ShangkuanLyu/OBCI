-- Applied to project gmglssmdrsackqgkqdbu via MCP apply_migration; mirror copy.
-- 006 · Token-authorised read used by the Stripe checkout action.
create or replace function public.get_application_for_checkout(
  p_application_id bigint,
  p_access_token uuid
) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id,
    'status', a.status,
    'type_name_en', t.name_en,
    'price_annual', t.price_annual,
    'currency', t.currency,
    'email', a.email
  )
  from public.membership_applications a
  join public.membership_types t on t.id = a.membership_type_id
  where a.id = p_application_id
    and a.access_token = p_access_token
$$;
revoke execute on function public.get_application_for_checkout(bigint, uuid) from public;
grant execute on function public.get_application_for_checkout(bigint, uuid) to anon, authenticated, service_role;
