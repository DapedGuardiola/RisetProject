CREATE TABLE `users` (
	`user_id` int AUTO_INCREMENT PRIMARY KEY,
	`username` varchar(255),
	`password` varchar(255) NOT NULL,
	`nickname` varchar(255),
	`followers_count` int,
	`create_time` date,
	CONSTRAINT `username_unique` UNIQUE INDEX(`username`)
);
