create table if not exists aqi_readings (
  id bigserial primary key,
  ts timestamptz not null default now(),
  aqi int, dominant text,
  pm25 numeric, pm10 numeric, o3 numeric, no2 numeric, so2 numeric, co numeric,
  wind_speed numeric, wind_dir numeric, temp numeric
);
create index if not exists aqi_ts_idx on aqi_readings(ts);
alter table aqi_readings enable row level security; -- access only via server (service key)

-- خلاصه‌ی ماهانه (بعد از پاکسازی داده‌های خام، گزارش ماه‌های قبل از اینجا خوانده می‌شود)
create table if not exists aqi_monthly (
  month text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table aqi_monthly enable row level security;
