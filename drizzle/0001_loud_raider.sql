CREATE TABLE `audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`code` text NOT NULL,
	`selectedCriteria` text NOT NULL,
	`payloadHash` varchar(64) NOT NULL,
	`status` enum('approved','rejected') NOT NULL,
	`globalScore` int NOT NULL,
	`reportJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audits_id` PRIMARY KEY(`id`)
);
