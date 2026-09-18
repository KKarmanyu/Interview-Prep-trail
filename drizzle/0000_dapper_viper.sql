CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`question` text NOT NULL,
	`created_at` integer NOT NULL,
	`client_hash` text NOT NULL
);
