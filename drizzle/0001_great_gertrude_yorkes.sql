CREATE TABLE `candidate_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` text,
	`phone` varchar(32),
	`city` varchar(128),
	`country` varchar(64) DEFAULT 'Latvia',
	`headline` text,
	`summary` text,
	`skills` json,
	`languages` json,
	`experienceYears` int DEFAULT 0,
	`educationLevel` enum('none','secondary','vocational','bachelor','master','phd') DEFAULT 'none',
	`salaryMin` int,
	`salaryMax` int,
	`salaryCurrency` varchar(8) DEFAULT 'EUR',
	`jobTypes` json,
	`commuteRadius` int DEFAULT 30,
	`remotePreference` enum('onsite','hybrid','remote','any') DEFAULT 'any',
	`cvFileKey` text,
	`cvFileUrl` text,
	`cvParsedAt` timestamp,
	`isActive` boolean DEFAULT true,
	`isAnonymous` boolean DEFAULT true,
	`gdprConsent` boolean DEFAULT false,
	`gdprConsentAt` timestamp,
	`gdprDeleteRequestedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` text NOT NULL,
	`companySize` enum('1-10','11-50','51-200','201-500','500+') DEFAULT '1-10',
	`industry` varchar(128),
	`website` text,
	`description` text,
	`logoKey` text,
	`logoUrl` text,
	`city` varchar(128),
	`country` varchar(64) DEFAULT 'Latvia',
	`subscriptionTier` enum('free','pro','enterprise') DEFAULT 'free',
	`subscriptionStatus` enum('active','trialing','past_due','canceled','none') DEFAULT 'none',
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`subscriptionEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employer_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gdpr_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` enum('consent_given','consent_withdrawn','data_export_requested','data_deletion_requested','data_deleted','profile_unlocked','profile_viewed','data_accessed') NOT NULL,
	`details` json,
	`ipAddress` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gdpr_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interview_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`candidateId` int NOT NULL,
	`jobId` int NOT NULL,
	`questions` json,
	`answers` json,
	`aiEvaluation` text,
	`aiApproved` boolean,
	`status` enum('pending','in_progress','completed','abandoned') DEFAULT 'pending',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interview_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employerId` int NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`requiredSkills` json,
	`preferredSkills` json,
	`requiredExperienceYears` int DEFAULT 0,
	`requiredEducation` enum('none','secondary','vocational','bachelor','master','phd') DEFAULT 'none',
	`requiredLanguages` json,
	`city` varchar(128),
	`country` varchar(64) DEFAULT 'Latvia',
	`jobType` enum('full_time','part_time','contract','internship','freelance') DEFAULT 'full_time',
	`remotePolicy` enum('onsite','hybrid','remote') DEFAULT 'onsite',
	`salaryMin` int,
	`salaryMax` int,
	`salaryCurrency` varchar(8) DEFAULT 'EUR',
	`source` enum('manual','scraped') DEFAULT 'manual',
	`sourceUrl` text,
	`sourcePlatform` varchar(64),
	`status` enum('active','paused','closed','draft') DEFAULT 'active',
	`aiParsedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_postings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`jobId` int NOT NULL,
	`score` float NOT NULL,
	`skillsScore` float DEFAULT 0,
	`experienceScore` float DEFAULT 0,
	`salaryScore` float DEFAULT 0,
	`locationScore` float DEFAULT 0,
	`status` enum('pending','notified','interviewing','unlocked','rejected','hired') DEFAULT 'pending',
	`isUnlocked` boolean DEFAULT false,
	`unlockedAt` timestamp,
	`notifiedAt` timestamp,
	`notificationChannel` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('match_found','interview_request','profile_unlocked','system') NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`relatedMatchId` int,
	`relatedJobId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scrape_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(64) NOT NULL,
	`searchQuery` text,
	`city` varchar(128),
	`totalFound` int DEFAULT 0,
	`newImported` int DEFAULT 0,
	`status` enum('running','completed','failed') DEFAULT 'running',
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `scrape_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`tier` enum('free','pro','enterprise') NOT NULL,
	`priceMonthly` int NOT NULL,
	`priceYearly` int NOT NULL,
	`currency` varchar(8) DEFAULT 'EUR',
	`stripePriceIdMonthly` varchar(128),
	`stripePriceIdYearly` varchar(128),
	`features` json,
	`jobPostingsLimit` int DEFAULT 3,
	`candidateViewsLimit` int DEFAULT 10,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('candidate','employer','unset') DEFAULT 'unset' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD CONSTRAINT `candidate_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD CONSTRAINT `employer_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gdpr_audit_log` ADD CONSTRAINT `gdpr_audit_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_sessions` ADD CONSTRAINT `interview_sessions_matchId_matches_id_fk` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_sessions` ADD CONSTRAINT `interview_sessions_candidateId_candidate_profiles_id_fk` FOREIGN KEY (`candidateId`) REFERENCES `candidate_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interview_sessions` ADD CONSTRAINT `interview_sessions_jobId_job_postings_id_fk` FOREIGN KEY (`jobId`) REFERENCES `job_postings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_postings` ADD CONSTRAINT `job_postings_employerId_employer_profiles_id_fk` FOREIGN KEY (`employerId`) REFERENCES `employer_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_candidateId_candidate_profiles_id_fk` FOREIGN KEY (`candidateId`) REFERENCES `candidate_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_jobId_job_postings_id_fk` FOREIGN KEY (`jobId`) REFERENCES `job_postings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;