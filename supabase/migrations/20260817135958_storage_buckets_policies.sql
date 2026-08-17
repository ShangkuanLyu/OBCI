-- Applied to project gmglssmdrsackqgkqdbu via MCP apply_migration; mirror copy.
-- 004 · Storage: media (public) and member-documents (private) buckets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760,
   array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml']),
  ('member-documents', 'member-documents', false, 20971520,
   array['application/pdf','image/jpeg','image/png',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

-- media: world-readable, staff-writable.
create policy "media_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

create policy "media_staff_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (select private.role_in(array['admin','editor','event_manager','membership_manager']))
  );

create policy "media_staff_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and (select private.role_in(array['admin','editor','event_manager','membership_manager']))
  )
  with check (
    bucket_id = 'media'
    and (select private.role_in(array['admin','editor','event_manager','membership_manager']))
  );

create policy "media_staff_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (select private.role_in(array['admin','editor','event_manager','membership_manager']))
  );

-- member-documents: applicants (incl. anonymous) may upload under
-- applications/…; only membership staff may read or delete. No public reads.
create policy "memberdocs_applicant_upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'member-documents'
    and (storage.foldername(name))[1] = 'applications'
  );

create policy "memberdocs_staff_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'member-documents'
    and (select private.role_in(array['admin','membership_manager']))
  );

create policy "memberdocs_staff_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'member-documents'
    and (select private.role_in(array['admin','membership_manager']))
  );
