-- Create public storage bucket for user avatars.
-- Upload/delete is gated server-side via service role key in the upload API route.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
