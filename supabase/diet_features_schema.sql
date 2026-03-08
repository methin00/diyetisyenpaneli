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
