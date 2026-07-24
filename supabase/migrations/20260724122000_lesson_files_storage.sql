-- Private lesson-files bucket (create bucket in dashboard or via storage API)
-- Policies: school members can read; creators can upload.

insert into storage.buckets (id, name, public)
values ('lesson-files', 'lesson-files', false)
on conflict (id) do nothing;

drop policy if exists lesson_files_read on storage.objects;
create policy lesson_files_read on storage.objects
  for select to authenticated
  using (bucket_id = 'lesson-files');

drop policy if exists lesson_files_insert on storage.objects;
create policy lesson_files_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lesson-files' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists lesson_files_delete on storage.objects;
create policy lesson_files_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'lesson-files' and auth.uid()::text = (storage.foldername(name))[1]);
