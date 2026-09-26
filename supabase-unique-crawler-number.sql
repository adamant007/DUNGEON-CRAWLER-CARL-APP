-- Enforce one crawler number per signed-in account.
-- Numbers are stored inside data.details.crawler, so normalize formatting
-- (commas/spaces/leading zero variants) to a numeric value before comparing.
-- Different accounts may use the same crawler number; duplicates are blocked
-- only among characters owned by the same user.
create unique index if not exists crawler_characters_user_crawler_number_unique
on public.crawler_characters (
  user_id,
  ((nullif(regexp_replace(coalesce(data #>> '{details,crawler}', ''), '[^0-9]', '', 'g'), ''))::numeric)
)
where user_id is not null
  and nullif(regexp_replace(coalesce(data #>> '{details,crawler}', ''), '[^0-9]', '', 'g'), '') is not null;
