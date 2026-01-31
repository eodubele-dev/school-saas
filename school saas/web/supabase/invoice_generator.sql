-- INVOICE GENERATION RPC
-- Generates pending invoices for all active students in a tenant

create or replace function public.generate_term_invoices(
  p_term_name text,
  p_tuition_fee numeric,
  p_dev_levy numeric
)
returns json
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_student record;
  v_count integer := 0;
begin
  -- Get current user's tenant
  select tenant_id into v_tenant_id
  from public.profiles
  where id = auth.uid();

  if v_tenant_id is null then
    raise exception 'User not associated with a tenant';
  end if;

  -- Iterate through all students in this tenant
  for v_student in select id from public.students where tenant_id = v_tenant_id
  loop
    -- Insert Invoice
    insert into public.invoices (
      tenant_id,
      student_id,
      term,
      amount,
      status,
      items
    ) values (
      v_tenant_id,
      v_student.id,
      p_term_name,
      (p_tuition_fee + p_dev_levy),
      'pending',
      json_build_array(
        json_build_object('description', 'Tuition Fee', 'amount', p_tuition_fee),
        json_build_object('description', 'Development Levy', 'amount', p_dev_levy)
      )
    );
    
    v_count := v_count + 1;
  end loop;

  return json_build_object('success', true, 'invoices_generated', v_count);
end;
$$;
