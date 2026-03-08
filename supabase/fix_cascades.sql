-- Fix dietitians -> auth.users
alter table public.dietitians drop constraint if exists dietitians_id_fkey;
alter table public.dietitians add constraint dietitians_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- Fix clients -> dietitians
alter table public.clients drop constraint if exists clients_dietitian_id_fkey;
alter table public.clients add constraint clients_dietitian_id_fkey foreign key (dietitian_id) references public.dietitians(id) on delete cascade;

-- Fix client_measurements -> dietitians
alter table public.client_measurements drop constraint if exists client_measurements_dietitian_id_fkey;
alter table public.client_measurements add constraint client_measurements_dietitian_id_fkey foreign key (dietitian_id) references public.dietitians(id) on delete cascade;

-- Fix availabilities -> dietitians
alter table public.availabilities drop constraint if exists availabilities_dietitian_id_fkey;
alter table public.availabilities add constraint availabilities_dietitian_id_fkey foreign key (dietitian_id) references public.dietitians(id) on delete cascade;

-- Fix appointments -> dietitians and clients
alter table public.appointments drop constraint if exists appointments_dietitian_id_fkey;
alter table public.appointments add constraint appointments_dietitian_id_fkey foreign key (dietitian_id) references public.dietitians(id) on delete cascade;

alter table public.appointments drop constraint if exists appointments_client_id_fkey;
alter table public.appointments add constraint appointments_client_id_fkey foreign key (client_id) references public.clients(id) on delete cascade;

-- Fix form_settings -> dietitians
alter table public.form_settings drop constraint if exists form_settings_dietitian_id_fkey;
alter table public.form_settings add constraint form_settings_dietitian_id_fkey foreign key (dietitian_id) references public.dietitians(id) on delete cascade;
