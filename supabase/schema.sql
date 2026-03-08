-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- dietitians table (Extends auth.users implicitly by relying on auth.uid())
create table public.dietitians (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: dietitians
alter table public.dietitians enable row level security;
create policy "Dietitians can view own profile" on public.dietitians for select using (auth.uid() = id);
create policy "Dietitians can update own profile" on public.dietitians for update using (auth.uid() = id);

-- clients table (Danışanlar)
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: clients
alter table public.clients enable row level security;
create policy "Dietitians can manage their own clients" on public.clients
  for all using (auth.uid() = dietitian_id);

-- client_measurements
create table public.client_measurements (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  weight numeric,
  body_fat_percentage numeric,
  muscle_mass numeric,
  measurement_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: client_measurements
alter table public.client_measurements enable row level security;
create policy "Dietitians can manage their clients' measurements" on public.client_measurements
  for all using (auth.uid() = dietitian_id);

-- availabilities (Hangi günler saat kaçta müsait, haftalık rutin bazlı)
create table public.availabilities (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  day_of_week integer not null, -- 0: Sunday, 1: Monday, ..., 6: Saturday
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: availabilities
alter table public.availabilities enable row level security;
create policy "Dietitians can manage their availabilities" on public.availabilities
  for all using (auth.uid() = dietitian_id);
-- Public policy so the widget can fetch the availability for a specific dietitian
create policy "Anyone can read availabilities" on public.availabilities for select using (true);


-- appointments
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade, -- Nullable if client is not registered yet
  client_name text not null,
  client_phone text,
  client_email text,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: appointments
alter table public.appointments enable row level security;
create policy "Dietitians can manage their appointments" on public.appointments
  for all using (auth.uid() = dietitian_id);
-- Public policy so anyone can create an appointment (via widget)
create policy "Anyone can insert appointments" on public.appointments for insert with check (true);


-- form_settings
create table public.form_settings (
  dietitian_id uuid references public.dietitians(id) on delete cascade primary key,
  require_phone boolean default true,
  require_email boolean default false,
  custom_message text default 'Randevu talebiniz alınmıştır, size ulaşacağız.',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: form_settings
alter table public.form_settings enable row level security;
create policy "Dietitians can manage their form settings" on public.form_settings
  for all using (auth.uid() = dietitian_id);
-- Public policy so the widget can read the form settings
create policy "Anyone can read form settings" on public.form_settings for select using (true);

-- Functions and Triggers
-- create a record in dietitians when a new user signs up in auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.dietitians (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- DIET FEATURES (Foods, Recipes, Programs)
-- ==========================================

-- Besin Veritabanı Tablosu
create table public.foods (
  id uuid default uuid_generate_v4() primary key,
  -- null ise global/sistem standart besini; doluysa sadece o diyetisyenin kendi özel eklediği besindir.
  dietitian_id uuid references public.dietitians(id) on delete cascade, 
  name text not null,
  calories numeric not null default 0,
  carbohydrates numeric not null default 0,
  proteins numeric not null default 0,
  fats numeric not null default 0,
  serving_size text, -- "100g", "1 adet", "1 porsiyon" vb.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.foods enable row level security;
create policy "Dietitians can view foods" on public.foods
  for select using (dietitian_id is null or auth.uid() = dietitian_id);
create policy "Dietitians can insert own foods" on public.foods
  for insert with check (auth.uid() = dietitian_id);


-- Tarif Defteri
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  title text not null,
  description text,
  instructions text, -- "1. Soğanları doğrayın\n2. Yağda kavurun..." vb.
  prep_time_minutes integer,
  image_url text,
  is_public boolean default false, -- Widget / genel site için
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recipes enable row level security;
create policy "Dietitians manage own recipes" on public.recipes
  for all using (auth.uid() = dietitian_id);
create policy "Public can read public recipes" on public.recipes
  for select using (is_public = true);


-- Tarif İçerikleri (İçindeki Besinler)
create table public.recipe_ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  food_id uuid references public.foods(id) on delete cascade not null,
  amount numeric not null, -- Örn: 1.5
  unit text, -- "Porsiyon", "Gram", vb.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recipe_ingredients enable row level security;
create policy "Dietitians manage own recipe ingredients" on public.recipe_ingredients
  for all using (
    exists (select 1 from public.recipes where recipes.id = recipe_id and recipes.dietitian_id = auth.uid())
  );


-- Diyet Programları (Listeler)
create table public.diet_programs (
  id uuid default uuid_generate_v4() primary key,
  dietitian_id uuid references public.dietitians(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null, -- Örn: "İlk Hafta Başlangıç"
  start_date date,
  end_date date,
  notes text, -- Genel not veya uyarılar ("Günde en az 3 litre su içilecek")
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.diet_programs enable row level security;
create policy "Dietitians manage own diet programs" on public.diet_programs
  for all using (auth.uid() = dietitian_id);


-- Diyet Programı Öğünleri
create table public.diet_program_meals (
  id uuid default uuid_generate_v4() primary key,
  diet_program_id uuid references public.diet_programs(id) on delete cascade not null,
  day_of_week integer, -- 1: Pzt, 7: Paz, NULL: Her gün
  meal_time text not null, -- "Sabah", "Ara Öğün 1", "Öğle", vb.
  food_id uuid references public.foods(id) on delete set null,
  recipe_id uuid references public.recipes(id) on delete set null,
  amount numeric, -- porsiyon miktarı
  notes text, -- Özel açıklama ("peynir yağsız olsun") veya "1 dilim peynir" formunda fiks metin.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Besin, Tarif veya serbest metinden birisi mutlaka olmak zorunda.
  check (food_id is not null or recipe_id is not null or notes is not null)
);

alter table public.diet_program_meals enable row level security;
create policy "Dietitians manage own diet program meals" on public.diet_program_meals
  for all using (
    exists (select 1 from public.diet_programs where diet_programs.id = diet_program_id and diet_programs.dietitian_id = auth.uid())
  );
