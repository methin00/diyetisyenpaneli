-- client_notes table
create table public.client_notes (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: client_notes
alter table public.client_notes enable row level security;
create policy "Dietitians can manage their clients' notes" on public.client_notes
  for all using (auth.uid() = dietitian_id);