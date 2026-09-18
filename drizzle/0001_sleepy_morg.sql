ALTER TABLE `submissions` ADD `name` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `email` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `email_status` text DEFAULT 'pending' NOT NULL;