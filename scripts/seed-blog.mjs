/**
 * Blog post seed script — plain ES module, runs with:
 *   node scripts/seed-blog.mjs
 *
 * Run from server/ folder. Posts already in DB (by slug) are skipped.
 */

import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = resolve(__dirname, "../.env");
try {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error("Could not read .env file");
  process.exit(1);
}

const BlogPostSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    excerpt:     { type: String, required: true },
    content:     { type: String, required: true },
    image:       { type: String, default: "" },
    category:    { type: String, required: true },
    readTime:    { type: String, default: "5 min read" },
    author:      { type: String, default: "Alphatrack Team" },
    status:      { type: String, enum: ["draft", "published"], default: "published" },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const BlogPost =
  mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);

const posts = [
  {
    slug: "how-to-skyrocket-your-roi-with-paid-social-campaigns",
    title: "How to Skyrocket Your ROI with Paid Social Campaigns",
    excerpt: "Learn the data-driven strategies that separate profitable paid social campaigns from money pits. From precision targeting to real-time optimisation.",
    image: "https://alphatrack.digital/wp-content/uploads/2025/09/dlxmedia-hu-ZMlcuVf2URA-unsplash-scaled.jpg",
    category: "Paid Social",
    readTime: "5 min read",
    publishedAt: new Date("2025-09-17"),
    content: `<p>In today's fast-paced digital landscape, paid social campaigns are a powerful tool for businesses looking to amplify their reach and drive conversions. At AlphaTrack Digital, we've mastered the art of turning social media engagement into measurable results.</p>
<h2>Why Paid Social is a Must for Your Business</h2>
<p>Social media platforms like Facebook, Instagram, LinkedIn, and TikTok have billions of active users, making them prime real estate for reaching your target audience. Paid social campaigns allow you to cut through the noise, ensuring your brand connects with the right people at the right time.</p>
<h2>Strategies to Maximise Your Paid Social ROI</h2>
<h3>1. Define Clear Campaign Objectives</h3>
<p>Before launching a campaign, clarity is key. Are you aiming for brand awareness, lead generation, or direct sales? Setting specific, measurable goals ensures your campaign is focused and trackable.</p>
<h3>2. Leverage Precision Audience Targeting</h3>
<p>Paid social platforms offer advanced targeting options to reach your ideal customers. Use demographic data, interests, behaviours, and lookalike audiences to ensure your ads hit the mark.</p>
<h3>3. Craft Compelling Creative Content</h3>
<p>Your ad's creative is the hook that grabs attention. Invest in high-quality visuals, concise copy, and a strong CTA. Research shows that 64% of consumers are more likely to engage with visually appealing ads.</p>
<h3>4. Optimise for Conversions</h3>
<p>Driving clicks is only half the battle — conversions are where ROI happens. Ensure your landing pages are optimised for user experience and aligned with your ad's messaging.</p>
<h3>5. Monitor and Optimise in Real-Time</h3>
<p>Paid social campaigns thrive on continuous optimisation. Use platform analytics to track performance and adjust bids, audiences, or creatives as needed.</p>
<h2>Why Partner with AlphaTrack Digital?</h2>
<p>We combine data-driven precision with creative expertise to deliver campaigns that don't just perform — they soar. Our team conducts in-depth audience analysis, optimises ad spend, and provides transparent reporting to ensure every pound drives results.</p>`,
  },
  {
    slug: "the-power-of-no-code-web-design-for-small-businesses",
    title: "The Power of No-Code Web Design for Small Businesses",
    excerpt: "Why modern no-code platforms are levelling the playing field for small business websites — and how to use them to compete with bigger brands.",
    image: "https://alphatrack.digital/wp-content/uploads/2025/09/tekimax-AfwnOr1taq0-unsplash-scaled.jpg",
    category: "Web Development",
    readTime: "4 min read",
    publishedAt: new Date("2025-09-17"),
    content: `<p>For small businesses, a strong online presence is non-negotiable — but building a professional website can seem daunting, especially with limited budgets and technical expertise. Enter no-code web design: a game-changing solution that empowers small businesses to create stunning, high-performing websites without writing a single line of code.</p>
<h2>What is No-Code Web Design?</h2>
<p>No-code web design uses intuitive platforms like Webflow, Wix, or Bubble to build websites through drag-and-drop interfaces and pre-built templates. These tools eliminate the need for coding expertise, making website creation accessible, fast, and cost-effective.</p>
<h2>Benefits for Small Businesses</h2>
<h3>1. Cost-Effective Development</h3>
<p>Traditional web development can cost thousands of pounds, but no-code platforms significantly reduce expenses by eliminating the need for developers.</p>
<h3>2. Rapid Deployment</h3>
<p>No-code platforms allow you to launch a professional website in days, not months.</p>
<h3>3. User-Friendly Management</h3>
<p>No-code platforms empower you to take control of your website without technical skills.</p>
<h3>4. SEO and Mobile Optimisation</h3>
<p>A great website isn't just about looks — it needs to perform. No-code platforms integrate SEO tools and responsive design.</p>
<h3>5. Customisation Without Complexity</h3>
<p>You can create a unique, branded website that reflects your business's identity with custom designs and flexible features.</p>`,
  },
  {
    slug: "why-programmatic-advertising-is-a-game-changer",
    title: "Why Programmatic Advertising is a Game-Changer",
    excerpt: "Programmatic advertising is reshaping how brands reach audiences at scale — here's what you need to know about automated, data-driven ad buying.",
    image: "https://alphatrack.digital/wp-content/uploads/2025/09/alan-w-AP7tG4LTeXA-unsplash-scaled.jpg",
    category: "Paid Media",
    readTime: "6 min read",
    publishedAt: new Date("2025-09-17"),
    content: `<p>In the crowded digital advertising space, reaching the right audience with the right message at the right time is a challenge. Programmatic advertising solves this by using data and automation to deliver precision-targeted ads with unmatched efficiency.</p>
<h2>What is Programmatic Advertising?</h2>
<p>Programmatic advertising uses automated technology — like real-time bidding (RTB) and AI-driven algorithms — to buy and optimise ad placements across digital platforms. Programmatic ad spending is projected to reach $725 billion globally by 2026.</p>
<h2>Key Benefits</h2>
<h3>1. Precision Targeting at Scale</h3>
<p>Programmatic uses data signals to serve ads to the most relevant audiences. You can reach thousands of micro-segments simultaneously.</p>
<h3>2. Real-Time Optimisation</h3>
<p>Unlike traditional media buying, programmatic campaigns optimise in real-time. Algorithms continuously adjust bids, placements, and creative.</p>
<h3>3. Cost Efficiency</h3>
<p>Automated bidding ensures you pay fair market value for each impression. Combined with precise targeting, this means less waste and better returns.</p>
<h3>4. Cross-Channel Reach</h3>
<p>Programmatic extends beyond display ads — video, connected TV, audio, digital out-of-home, and native advertising.</p>`,
  },
  {
    slug: "conversion-tracking-101-what-most-businesses-get-wrong",
    title: "Conversion Tracking 101: What Most Businesses Get Wrong",
    excerpt: "Misconfigured tracking costs businesses thousands in wasted ad spend. Here are the most common mistakes and how to fix them before your next campaign.",
    image: "https://alphatrack.digital/wp-content/uploads/2025/09/growtika-183Yxo3vsGY-unsplash-scaled.jpg",
    category: "Tracking",
    readTime: "7 min read",
    publishedAt: new Date("2025-10-05"),
    content: `<p>Misconfigured conversion tracking is one of the most expensive mistakes a business can make. When your tracking is wrong, every decision you make about ad spend, audience targeting, and creative is based on flawed data.</p>
<h2>The Most Common Tracking Mistakes</h2>
<h3>1. Duplicate Event Firing</h3>
<p>This is the most common issue we see. A single conversion fires multiple times — inflating your numbers and making campaigns look more profitable than they are. The fix: event deduplication through GTM and server-side validation.</p>
<h3>2. Missing Cross-Domain Tracking</h3>
<p>If your checkout or booking system is on a different domain, you're probably losing attribution data. Users appear as "direct" traffic instead of being attributed to the campaign that sent them.</p>
<h3>3. Ignoring Consent Mode</h3>
<p>With GDPR and privacy regulations tightening, consent mode v2 isn't optional. Without it, you're underreporting conversions by 30-50% in many European markets.</p>
<h3>4. Platform Attribution Mismatch</h3>
<p>GA4 says one thing, Meta says another, Google Ads says something else entirely. Without a unified measurement framework, you'll never know the truth.</p>
<h2>How to Fix It</h2>
<p>Start with an audit. We use a systematic approach: audit every event, validate every pixel, test every conversion path, and build a source-of-truth dashboard that reconciles platform data.</p>`,
  },
  {
    slug: "marketing-automation-for-small-teams",
    title: "Marketing Automation for Small Teams: Where to Start",
    excerpt: "You don't need a 50-person marketing department to automate your lead nurturing. Here's a practical framework for teams of 1-5.",
    image: "https://alphatrack.digital/wp-content/uploads/2025/09/jotform-g7kFGOV7VI0-unsplash-scaled.jpg",
    category: "Automation",
    readTime: "5 min read",
    publishedAt: new Date("2025-10-12"),
    content: `<p>Marketing automation isn't just for enterprise companies with dedicated ops teams. If you're a small team drowning in manual follow-ups, missed leads, and repetitive tasks, automation is your biggest lever for growth.</p>
<h2>Where to Start</h2>
<h3>1. Automated Welcome Sequences</h3>
<p>When someone fills out a form or signs up, what happens? If the answer is "we try to email them within a day or two," you're losing leads. Set up a 3-5 email welcome sequence that triggers instantly.</p>
<h3>2. Lead Scoring</h3>
<p>Not all leads are equal. Assign points based on actions (opened email = 1 point, visited pricing page = 5 points, booked a call = 10 points). When a lead hits a threshold, alert your sales team.</p>
<h3>3. Abandoned Form Recovery</h3>
<p>Someone started filling out your contact form but didn't submit? With the right tracking and automation, you can follow up with a gentle reminder email.</p>
<h3>4. Internal Notifications</h3>
<p>Automate Slack or email notifications when high-value actions happen. A new lead from your best-performing campaign? Your team knows instantly.</p>
<h2>Recommended Tools for Small Teams</h2>
<p>We recommend Brevo for most small teams. It combines email marketing, CRM, automation workflows, and transactional emails in one affordable platform — and it's what we use ourselves.</p>`,
  },
  {
    slug: "ga4-vs-meta-attribution-which-numbers-to-trust",
    title: "GA4 vs Meta Attribution: Which Numbers Should You Trust?",
    excerpt: "Your GA4 and Meta Ads Manager will almost never agree on conversions. Here's why that happens and how to build a reporting model you can trust.",
    image: "https://alphatrack.digital/wp-content/uploads/2025/09/creatopy-ZWg3VeYz_Ac-unsplash-scaled.jpg",
    category: "Analytics",
    readTime: "6 min read",
    publishedAt: new Date("2025-11-03"),
    content: `<p>If you've ever compared your GA4 data with your Meta Ads Manager, you've probably noticed they never agree. This isn't a bug — it's a fundamental difference in how each platform measures conversions.</p>
<h2>Why the Numbers Don't Match</h2>
<h3>1. Attribution Windows</h3>
<p>GA4 uses a last-click, session-based model by default. Meta uses a 7-day click, 1-day view window. Someone could click your ad on Monday, come back via Google search on Wednesday, and convert. GA4 credits Google; Meta credits itself.</p>
<h3>2. Conversion Counting</h3>
<p>GA4 can be set to count one conversion per session or one per event. Meta counts every conversion within its attribution window. Same user, different numbers.</p>
<h3>3. Cross-Device Tracking</h3>
<p>Meta has strong cross-device tracking because users are logged in. GA4 relies on cookies and Google Signals, which have gaps — especially on iOS.</p>
<h2>Building a Trustworthy Reporting Model</h2>
<p>The solution isn't to pick one platform over the other. Instead, build a unified measurement framework. Use GA4 as your source of truth for web analytics, use platform data for optimisation signals, and reconcile with server-side conversion data for the real picture.</p>`,
  },
  {
    slug: "google-analytics-4-setup-guide",
    title: "How to Set Up Google Analytics 4 the Right Way",
    excerpt: "Most GA4 setups are missing critical events, have broken data streams, or track the wrong things entirely. Here's the complete setup guide to do it properly.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    category: "Tracking",
    readTime: "8 min read",
    publishedAt: new Date("2025-11-15"),
    content: `<p>Most businesses have GA4 installed. Very few have it set up correctly. A tag that fires doesn't mean data you can trust — there's a significant gap between "GA4 is on the site" and "GA4 is giving us actionable intelligence."</p>
<h2>Step 1: Audit Your Existing Data Stream</h2>
<p>Before building anything new, understand what you have. Check your GA4 property for duplicate data streams, misconfigured event parameters, and inflated session counts from internal traffic.</p>
<h3>Define Internal Traffic Filters</h3>
<p>In GA4 Admin → Data Streams → Configure Tag Settings → Define Internal Traffic. Add your office IP ranges. Then create a filter in Admin → Data Filters to exclude internal traffic from reports.</p>
<h2>Step 2: Configure Key Events Correctly</h2>
<p>Prioritise events that signal clear business intent: form_submit, purchase, schedule_call, file_download, and phone_call_click.</p>
<h3>Use GTM for Event Tracking</h3>
<p>Whenever possible, implement events through Google Tag Manager rather than hardcoded GA4 tags. GTM gives you version control, the ability to test before publishing, and a central hub for all your tracking.</p>
<h2>Step 3: Set Up Enhanced Measurement Carefully</h2>
<p>Review each Enhanced Measurement toggle individually and disable any that conflict with your custom event setup to avoid double-counting and noise in your data.</p>
<h2>Step 4: Connect Google Search Console and Google Ads</h2>
<p>Linking Search Console surfaces organic search queries directly in GA4. Linking Google Ads enables auto-tagging and brings cost data into your reports, allowing true cross-channel ROAS analysis.</p>
<h2>Step 5: Validate With DebugView</h2>
<p>Use GA4's DebugView with the GA Debugger Chrome extension enabled. Walk through every conversion path on your site and confirm events are firing correctly, with the right parameters, at the right moment.</p>`,
  },
  {
    slug: "meta-pixel-setup-guide",
    title: "The Complete Meta Pixel & CAPI Setup Guide for 2025",
    excerpt: "iOS changes killed the basic Meta Pixel. Here's how to set up Conversions API alongside your Pixel to recover lost signal and improve campaign performance.",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop&q=80",
    category: "Tracking",
    readTime: "9 min read",
    publishedAt: new Date("2025-11-22"),
    content: `<p>The Meta Pixel was once the backbone of Facebook and Instagram advertising. Then Apple introduced App Tracking Transparency in iOS 14.5, and everything changed. Cookie-based tracking became unreliable. Conversions disappeared from the platform.</p>
<h2>Why the Pixel Alone Is No Longer Enough</h2>
<p>The standard Meta Pixel fires from the user's browser. When a user has iOS privacy restrictions, an ad blocker, or a privacy-focused browser, the Pixel signal is either blocked or degraded. Studies suggest client-side Pixel tracking underreports conversions by 30–60% in privacy-regulated markets.</p>
<h2>What Is the Conversions API?</h2>
<p>The Conversions API (CAPI) sends conversion data directly from your server to Meta — bypassing the browser entirely. When combined with the browser Pixel using event deduplication, you get the most complete picture of your campaign performance possible.</p>
<h2>Setting Up the Meta Pixel</h2>
<h3>1. Create Your Pixel in Meta Events Manager</h3>
<p>Go to Meta Business Suite → Events Manager → Connect Data Sources → Web. Create a new Pixel and give it a clear name tied to your business.</p>
<h3>2. Install via Google Tag Manager</h3>
<p>Use the Meta Pixel base code as a Custom HTML tag in GTM, firing on All Pages. Then create individual GTM triggers for each key conversion event.</p>
<h3>3. Enable Advanced Matching</h3>
<p>Advanced Matching sends hashed customer data alongside conversion events, improving match rates by 20–40%.</p>
<h2>Setting Up Conversions API</h2>
<p>For custom setups, implement CAPI through a server-side GTM container. This gives you full control and works across any platform. Always pass matching event_id values from both Pixel and CAPI to prevent double-counting.</p>`,
  },
  {
    slug: "linkedin-ads-b2b-strategy-guide",
    title: "LinkedIn Ads for B2B: A Strategy Guide That Actually Works",
    excerpt: "LinkedIn is the most expensive ad platform — and the most misused. Here's how to structure campaigns, target the right decision-makers, and turn clicks into qualified pipeline.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop&q=80",
    category: "Paid Social",
    readTime: "7 min read",
    publishedAt: new Date("2025-12-01"),
    content: `<p>LinkedIn advertising is simultaneously the most powerful and most wasteful B2B channel — depending entirely on how you approach it. The platform's targeting is unmatched: job title, seniority, company size, industry, skills. But CPCs average £8–£15, and a poorly structured campaign burns through budget without a single qualified lead to show for it.</p>
<h2>Start With Objective Clarity</h2>
<p>Most B2B advertisers make the mistake of jumping straight to Lead Gen Forms for cold audiences. The most effective LinkedIn strategy is a layered funnel: Awareness → Consideration → Conversion.</p>
<h2>Audience Targeting: Getting It Right</h2>
<h3>Job Title vs. Job Function</h3>
<p>Unless you're targeting a very specific title, use Job Function + Seniority instead. This gives you broader reach while maintaining relevance.</p>
<h3>Company Size Segmentation</h3>
<p>Create separate campaigns for SMBs, mid-market, and enterprise with tailored messaging.</p>
<h3>Matched Audiences</h3>
<p>Upload your CRM contact list or website visitor audiences. These warm audiences will have significantly lower CPLs and higher conversion rates than cold targeting.</p>
<h2>Ad Formats That Perform</h2>
<h3>Thought Leadership Ads</h3>
<p>Boost organic posts as Thought Leadership Ads. These blend seamlessly into the feed and build brand credibility over time.</p>
<h3>Document Ads</h3>
<p>Document Ads let prospects preview a PDF natively in the feed before downloading — excellent for gated content lead generation.</p>
<h2>Measuring What Matters</h2>
<p>Your North Star metrics should be cost per Marketing Qualified Lead (MQL) and pipeline influence — not vanity metrics like click-through rate or follower growth.</p>`,
  },
  {
    slug: "email-automation-flows-every-business-needs",
    title: "5 Email Automation Flows Every Business Needs (And How to Build Them)",
    excerpt: "Most businesses set up a welcome email and call it automation. Here are the five high-revenue flows you're probably missing — and exactly how to build them.",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&auto=format&fit=crop&q=80",
    category: "Automation",
    readTime: "6 min read",
    publishedAt: new Date("2025-12-10"),
    content: `<p>Email automation is not about sending more emails. It's about sending the right message, to the right person, at exactly the right moment — without manual effort. When done correctly, automated email flows generate revenue 24/7.</p>
<h2>Flow 1: Welcome Sequence</h2>
<p>This is the single highest-ROI automation you can build. A high-converting welcome sequence has 4–6 emails over 7–10 days: deliver what was promised, introduce your brand, address the primary pain point, share social proof, present a clear CTA, and follow up with non-converters.</p>
<h2>Flow 2: Abandoned Cart Recovery</h2>
<p>Between 70–80% of shopping carts are abandoned. A three-email recovery sequence typically recaptures 5–15% of those lost sales. Email 1: gentle reminder (1 hour). Email 2: address objections (24 hours). Email 3: time-limited incentive (72 hours).</p>
<h2>Flow 3: Lead Nurture Sequence</h2>
<p>50% of qualified leads are not yet ready to purchase at initial contact. Segment by interest and intent, then deliver: educational content (top of funnel), case studies (middle of funnel), demos and offers (bottom of funnel).</p>
<h2>Flow 4: Post-Purchase Onboarding</h2>
<p>Post-purchase onboarding reduces churn, increases product adoption, and dramatically improves lifetime value. Confirm the order, set expectations, share usage tips, and plant the seed for the next purchase.</p>
<h2>Flow 5: Re-Engagement (Win-Back)</h2>
<p>A four-email win-back sequence: "We miss you," "Here's what you've missed," "Is this still relevant to you?", and a sunset email. The last email often gets surprisingly high engagement — people respond to finality.</p>`,
  },
  {
    slug: "looker-studio-marketing-dashboard-guide",
    title: "How to Build a Marketing Dashboard in Looker Studio",
    excerpt: "Stop copy-pasting numbers from five different platforms. Here's how to build a single source-of-truth marketing dashboard in Looker Studio that your whole team can use.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    category: "Analytics",
    readTime: "7 min read",
    publishedAt: new Date("2025-12-18"),
    content: `<p>Most marketing teams spend hours every week copy-pasting numbers from Google Ads, Meta, GA4, and their CRM into spreadsheets. Looker Studio eliminates this entirely — pulling live data from every connected source into a single, always-current dashboard.</p>
<h2>Step 1: Define Your Reporting Framework First</h2>
<p>Decide first: Who is this dashboard for? What decisions will it inform? A CEO dashboard looks entirely different from a paid media manager dashboard. Build for the audience, not for completeness.</p>
<h2>Step 2: Connect Your Data Sources</h2>
<p>Looker Studio has native connectors for GA4, Google Ads, Google Search Console, and YouTube. For Meta Ads and LinkedIn Ads, use Supermetrics, Porter Metrics, or Funnel.io.</p>
<h2>Step 3: Structure Your Dashboard Pages</h2>
<p>Page 1 — Executive Summary. Page 2 — Paid Media (spend, ROAS, CPL). Page 3 — Organic (SEO rankings, organic traffic). Page 4 — Email and Automation. Page 5 — Conversion Funnel with drop-off rates at each stage.</p>
<h2>Step 4: Build Calculated Fields for True Metrics</h2>
<p>Build fields that calculate: blended ROAS (total revenue ÷ total ad spend), cost per qualified lead, email contribution to revenue, and channel share of wallet.</p>
<h2>Step 5: Set Up Automated Scheduling</h2>
<p>Schedule automated email delivery to stakeholders every Monday morning. Go to Share → Schedule Email Delivery to configure this. This single habit replaces hours of weekly reporting.</p>`,
  },
  {
    slug: "server-side-tracking-why-your-business-needs-it",
    title: "Server-Side Tracking: Why Your Business Needs It in 2025",
    excerpt: "Ad blockers, iOS privacy changes, and cookie restrictions are breaking client-side tracking across the board. Server-side tagging is no longer optional — here's why and how to implement it.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    category: "Tracking",
    readTime: "8 min read",
    publishedAt: new Date("2026-01-08"),
    content: `<p>In 2019, server-side tracking was a luxury for large enterprises. In 2025, it's a necessity for any business spending meaningfully on digital advertising.</p>
<h2>What Broke Client-Side Tracking</h2>
<p>Three things happened simultaneously: iOS 14.5 introduced App Tracking Transparency (most users declined). Browser vendors — Safari and Firefox — began aggressively restricting third-party cookies. Ad blocker adoption reached 42% globally among desktop users in 2024.</p>
<h2>What Server-Side Tracking Is</h2>
<p>Server-side tracking moves tag execution from the user's browser to your own server. Instead of a user's browser firing a tag directly to Google Ads or Meta, your server receives the event data first, processes it, and then sends it to the advertising platforms. Ad blockers can't block your own server.</p>
<h2>Google Tag Manager Server-Side Container</h2>
<p>The most accessible entry point is a server-side GTM container. Deploy on Google Cloud Run (approximately $20–30/month), point a subdomain (e.g., metrics.yourdomain.com) to the container, update GTM client-side tags to route through your server, and add server-side tags for each platform.</p>
<h2>Meta Conversions API (CAPI)</h2>
<p>CAPI sends conversion events directly from your server to Meta's API, bypassing the browser entirely. When implemented alongside the Meta Pixel with proper event deduplication, businesses typically recover 20–40% of previously untracked conversions.</p>
<h2>Is It Worth the Investment?</h2>
<p>For any business spending over £2,000/month on paid digital advertising, yes — unambiguously. The data quality improvement alone typically pays for the implementation within 60–90 days through better campaign optimisation.</p>`,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI not set. Check server/.env");
    process.exit(1);
  }

  console.log("📡  Connecting to MongoDB...");
  await mongoose.connect(uri, { dbName: "alphatrack" });
  console.log("✅  Connected.\n");

  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    const existing = await BlogPost.findOne({ slug: post.slug });
    if (existing) {
      console.log(`⏭️   Skipped (already exists): ${post.slug}`);
      skipped++;
      continue;
    }
    await BlogPost.create({ ...post, status: "published" });
    console.log(`✅  Inserted: ${post.slug}`);
    inserted++;
  }

  console.log(`\n🎉  Done! ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
