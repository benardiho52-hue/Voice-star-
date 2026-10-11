SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'artists',
    'songs',
    'follows',
    'live_rooms',
    'chat_messages'
  )
ORDER BY table_name, ordinal_position;
