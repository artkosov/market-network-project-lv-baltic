ALTER TABLE `candidate_profiles` MODIFY COLUMN `skills` json;--> statement-breakpoint
ALTER TABLE `candidate_profiles` MODIFY COLUMN `languages` json;--> statement-breakpoint
ALTER TABLE `candidate_profiles` MODIFY COLUMN `jobTypes` json;--> statement-breakpoint
ALTER TABLE `interview_sessions` MODIFY COLUMN `questions` json;--> statement-breakpoint
ALTER TABLE `interview_sessions` MODIFY COLUMN `answers` json;--> statement-breakpoint
ALTER TABLE `job_postings` MODIFY COLUMN `requiredSkills` json;--> statement-breakpoint
ALTER TABLE `job_postings` MODIFY COLUMN `preferredSkills` json;--> statement-breakpoint
ALTER TABLE `job_postings` MODIFY COLUMN `requiredLanguages` json;--> statement-breakpoint
ALTER TABLE `subscription_plans` MODIFY COLUMN `features` json;