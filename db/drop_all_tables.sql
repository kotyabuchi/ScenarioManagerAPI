PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- テーブル名を動的に取得し、DROP TABLE文を生成して実行
SELECT 'DROP TABLE IF EXISTS ' || name || ';'
FROM sqlite_master
WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
ORDER BY name;

DROP TABLE IF EXISTS video_links; 
DROP TABLE IF EXISTS user_scenario_preferences;
DROP TABLE IF EXISTS user_reviews;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS session_participants;
DROP TABLE IF EXISTS scenarios;
DROP TABLE IF EXISTS scenario_tags;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS game_schedules;
DROP TABLE IF EXISTS d1_migrations;
DROP TABLE IF EXISTS _cf_KV;

COMMIT;

PRAGMA foreign_keys=on;