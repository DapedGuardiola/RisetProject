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
    kafka_topic_list = 'analytics.public.comments',
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