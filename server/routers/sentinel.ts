import { z } from "zod";
import { createJobPosting, createScrapeJob, getRecentScrapeJobs, updateScrapeJob } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { getEmployerByUserId } from "../db";

// Simulated scraper results for Latvian job boards
// In production these would call real scrapers / APIs
function generateScrapedJobs(platform: string, query: string, city: string) {
  const jobTemplates = [
    {
      title: "Programmatūras izstrādātājs (Full-Stack)",
      description: "Meklējam pieredzējušu Full-Stack izstrādātāju darbam ar React un Node.js. Nepieciešama pieredze ar TypeScript, REST API un datu bāzēm.",
      requiredSkills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      preferredSkills: ["Docker", "AWS", "GraphQL"],
      requiredExperienceYears: 3,
      salaryMin: 2500,
      salaryMax: 4500,
      jobType: "full_time" as const,
      remotePolicy: "hybrid" as const,
    },
    {
      title: "Projektu vadītājs",
      description: "Meklējam projektu vadītāju IT nozarē. Nepieciešama pieredze Agile metodikā un komandas vadīšanā.",
      requiredSkills: ["Agile", "Scrum", "Project Management"],
      preferredSkills: ["JIRA", "Confluence", "PMP"],
      requiredExperienceYears: 4,
      salaryMin: 2000,
      salaryMax: 3500,
      jobType: "full_time" as const,
      remotePolicy: "onsite" as const,
    },
    {
      title: "Mārketinga speciālists",
      description: "Aktīvi meklējam digitālā mārketinga speciālistu. Pieredze SEO, SEM un sociālajos medijos.",
      requiredSkills: ["SEO", "Google Ads", "Social Media"],
      preferredSkills: ["HubSpot", "Analytics", "Content Marketing"],
      requiredExperienceYears: 2,
      salaryMin: 1400,
      salaryMax: 2200,
      jobType: "full_time" as const,
      remotePolicy: "hybrid" as const,
    },
    {
      title: "Grāmatvedis",
      description: "Nepieciešams grāmatvedis ar pieredzi Latvijas nodokļu likumdošanā. Darbs ar 1C un Excel.",
      requiredSkills: ["1C", "Excel", "Latvian Tax Law"],
      preferredSkills: ["SAP", "IFRS"],
      requiredExperienceYears: 3,
      salaryMin: 1200,
      salaryMax: 2000,
      jobType: "full_time" as const,
      remotePolicy: "onsite" as const,
    },
    {
      title: "Loģistikas koordinators",
      description: "Meklējam loģistikas koordinatoru starptautisko kravu pārvadājumu jomā. Nepieciešamas angļu un krievu valodas zināšanas.",
      requiredSkills: ["Logistics", "SAP", "English", "Russian"],
      preferredSkills: ["Customs", "Incoterms"],
      requiredExperienceYears: 2,
      salaryMin: 1300,
      salaryMax: 2100,
      jobType: "full_time" as const,
      remotePolicy: "onsite" as const,
    },
    {
      title: "UX/UI Dizainers",
      description: "Radošs UX/UI dizainers mobilajām un web lietotnēm. Figma, Sketch, Adobe XD.",
      requiredSkills: ["Figma", "UX Design", "UI Design"],
      preferredSkills: ["Adobe XD", "Prototyping", "User Research"],
      requiredExperienceYears: 2,
      salaryMin: 1800,
      salaryMax: 3200,
      jobType: "full_time" as const,
      remotePolicy: "remote" as const,
    },
    {
      title: "Datu analītiķis",
      description: "Datu analītiķis ar Python un SQL pieredzi. Darbs ar lieliem datu apjomiem un BI rīkiem.",
      requiredSkills: ["Python", "SQL", "Data Analysis"],
      preferredSkills: ["Power BI", "Tableau", "Machine Learning"],
      requiredExperienceYears: 2,
      salaryMin: 2000,
      salaryMax: 3800,
      jobType: "full_time" as const,
      remotePolicy: "hybrid" as const,
    },
    {
      title: "Klientu apkalpošanas vadītājs",
      description: "Klientu apkalpošanas vadītājs B2B segmentā. Latvijas un starptautisko klientu apkalpošana.",
      requiredSkills: ["Customer Service", "CRM", "Latvian", "English"],
      preferredSkills: ["Salesforce", "B2B Sales"],
      requiredExperienceYears: 2,
      salaryMin: 1200,
      salaryMax: 2000,
      jobType: "full_time" as const,
      remotePolicy: "onsite" as const,
    },
  ];

  // Filter by query if provided
  const filtered = query
    ? jobTemplates.filter(
        (j) =>
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.requiredSkills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    : jobTemplates;

  // Take a random subset to simulate different results per platform
  const platformOffset = platform === "cv.lv" ? 0 : platform === "ss.lv" ? 2 : 4;
  return filtered.slice(platformOffset, platformOffset + 4).map((j, i) => ({
    ...j,
    city,
    country: "Latvia",
    source: "scraped" as const,
    sourcePlatform: platform,
    sourceUrl: `https://${platform}/vakances/${Date.now()}-${i}`,
    status: "active" as const,
  }));
}

export const sentinelRouter = router({
  // Run scraper for a platform
  scrape: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["cv.lv", "ss.lv", "linkedin"]),
        query: z.string().optional(),
        city: z.string().default("Rīga"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const employer = await getEmployerByUserId(ctx.user.id);
      if (!employer) {
        // Allow admin to run scraper
        if (ctx.user.role !== "admin") {
          return { success: false, message: "Tikai darba devēji var palaist skrāperi" };
        }
      }

      const scrapeJobId = await createScrapeJob(input.platform, input.query ?? "", input.city);

      try {
        const jobs = generateScrapedJobs(input.platform, input.query ?? "", input.city);

        // Use a system employer ID (1) for scraped jobs, or create a sentinel employer
        const employerId = employer?.id ?? 1;

        let imported = 0;
        for (const job of jobs) {
          try {
            await createJobPosting({
              employerId,
              title: job.title,
              description: job.description,
              city: job.city,
              country: job.country,
              jobType: job.jobType,
              remotePolicy: job.remotePolicy,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              requiredSkills: JSON.parse(JSON.stringify(job.requiredSkills)),
              preferredSkills: JSON.parse(JSON.stringify(job.preferredSkills)),
              requiredExperienceYears: job.requiredExperienceYears,
              source: "scraped",
              sourcePlatform: job.sourcePlatform,
              sourceUrl: job.sourceUrl,
              status: "active",
            });
            imported++;
          } catch {
            // Skip duplicates
          }
        }

        await updateScrapeJob(scrapeJobId, {
          status: "completed",
          totalFound: jobs.length,
          newImported: imported,
          completedAt: new Date(),
        });

        return { success: true, totalFound: jobs.length, imported };
      } catch (error) {
        await updateScrapeJob(scrapeJobId, {
          status: "failed",
          errorMessage: String(error),
          completedAt: new Date(),
        });
        return { success: false, message: "Skrāpēšana neizdevās" };
      }
    }),

  // Get recent scrape history
  getHistory: protectedProcedure.query(async () => {
    return getRecentScrapeJobs();
  }),
});
