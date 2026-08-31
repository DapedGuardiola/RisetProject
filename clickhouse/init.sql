CREATE DATABASE IF NOT EXISTS analytics;
USE analytics;
CREATE TABLE comments
(
    comment_id UInt64,
    parent_comment_id Nullable(UInt64),
    level integer,
    comment text,
    user_id UInt64,
    video_id UInt64,
    create_time Nullable(Int64),
    __deleted String,
    __table String,
    __lsn Int64
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'kafka:9092',
    kafka_topic_list = 'contents.public.comments',
    kafka_group_name = 'clickhouse_comments_group_v2',
    kafka_format = 'JSONEachRow';

CREATE TABLE comments_storage
(
    comment_id UInt64,
    parent_comment_id Nullable(UInt64),
    level Int32,
    comment String,
    user_id UInt64,
    video_id UInt64,
    create_time Nullable(DateTime64(6))
) ENGINE = MergeTree ORDER BY comment_id;

CREATE MATERIALIZED VIEW comments_mv TO comments_storage AS
SELECT
    comment_id,
    parent_comment_id,
    level,
    comment,
    user_id,
    video_id,
    if(create_time IS NULL, NULL, fromUnixTimestamp64Micro(create_time)) AS create_time
FROM comments
WHERE __deleted = 'false';

-- users 

CREATE TABLE users
(
    user_id UInt64,
    username String,
    nickname String,
    followers_count integer,
    trust_score integer,
    create_time Nullable(Int64),
    __deleted String,
    __table String,
    __lsn Int64
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'kafka:9092',
    kafka_topic_list = 'users.usersDatabase.users',
    kafka_group_name = 'clickhouse_users_group',
    kafka_format = 'JSONEachRow';

CREATE TABLE users_storage
(
    user_id UInt64,
    username String,
    nickname String,
    trust_score integer,
    followers_count integer,
    create_time Nullable(DateTime64(6))
) ENGINE = MergeTree ORDER BY user_id;

CREATE MATERIALIZED VIEW users_mv TO users_storage AS
SELECT
    user_id,
    username,
    nickname,
    followers_count,
    trust_score,
    if(create_time IS NULL, NULL, fromUnixTimestamp64Micro(create_time)) AS create_time
FROM users;

CREATE DICTIONARY users_dict
(
    user_id UInt64,
    trust_score UInt8
)
PRIMARY KEY user_id
SOURCE(CLICKHOUSE(USER  'default' PASSWORD 'root' DB 'analytics' TABLE 'users_storage'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 600);

CREATE TABLE video_comment_totals
(
    video_id UInt64,
    total_comments UInt64
)
ENGINE = SummingMergeTree()
ORDER BY video_id;  

CREATE MATERIALIZED VIEW comments_total_sum
TO video_comment_totals
AS
SELECT
    video_id,
    count() AS total_comments
FROM comments_storage
WHERE dictGet('users_dict', 'trust_score', user_id) > 5
GROUP BY video_id;

CREATE TABLE video_comment_minutes
(   
    minute DateTime,
    comments_this_minute AggregateFunction(count)
)   
ENGINE = AggregatingMergeTree()
ORDER BY minute;

CREATE MATERIALIZED VIEW comments_minute_avg
TO video_comment_minutes
AS
SELECT
    toStartOfMinute(create_time) AS minute,
    countState() AS comments_this_minute
FROM comments_storage
WHERE dictGet('users_dict', 'trust_score', user_id) > 5
GROUP BY minute;

CREATE TABLE bot_comments
(
    bot_comments_count Nullable(UInt64)
)
ENGINE = SummingMergeTree()
ORDER BY tuple();

CREATE MATERIALIZED VIEW bot_comments_mv
TO bot_comments
AS
SELECT
    count() AS bot_comments_count
FROM comments_storage
WHERE dictGet('users_dict', 'trust_score', user_id) < 6;