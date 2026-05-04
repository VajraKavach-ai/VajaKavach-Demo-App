CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`user_name` text,
	`user_address` text,
	`delivery_date` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`inventory` integer DEFAULT 0 NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`delivery_days` integer DEFAULT 5 NOT NULL
);
