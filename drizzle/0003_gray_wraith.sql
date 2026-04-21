ALTER TABLE `candidate_profiles` ADD `consentMatching` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `consentMatchingAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `consentEmployerView` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `consentEmployerViewAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `consentMarketing` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `consentMarketingAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `consentVersion` varchar(16) DEFAULT '1.0';--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `lastActivityAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `retentionFlaggedAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD `pseudonymousId` varchar(32);--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `gdprConsent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `gdprConsentAt` timestamp;--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `dpaAccepted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `dpaAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `consentVersion` varchar(16) DEFAULT '1.0';--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `consentMarketing` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `employer_profiles` ADD `consentMarketingAt` timestamp;