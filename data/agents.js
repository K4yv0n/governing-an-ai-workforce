/*
 * The Tech Plate: agent register (single source of truth)
 * BANA6020 Unit 7 Individual Project, Kayvon Jafarzadeh
 *
 * Each record describes one real production agent and is read by the
 * Bot Register and the Bot Accountability Auditor. The "profile" scores
 * are design-intent estimates (0 to 100), not live telemetry, and are
 * used only to visualize where each agent's accountability is strong or thin.
 *
 * Risk levels: low (cyan), med (gold), high (red).
 */
window.AGENTS = [
  {
    id: "transcribe",
    name: "Notion Transcribe Worker",
    runtime: "notion",
    runtimeLabel: "Notion cloud",
    model: "Claude Opus",
    riskLevel: "med",
    role: "Turn a raw video into a clean transcript and then into three platform ready scripts for Instagram Reels, short form, and YouTube.",
    io: "In: a video URL in a Notion row. Out: a transcript plus three voice matched script drafts, each in its own Notion database.",
    assets: "Authority to read source video, to access the v7 voice rules, and to speak by drafting scripts in the brand voice.",
    obligations: "Be faithful to what the speaker actually said, stay on voice, and never let a draft be treated as final.",
    speech: "Yes. It writes scripts. Speech obligations apply in full: relevant, faithful, intelligible.",
    revenueObligation: "Save the operator drafting time without trading away voice or accuracy. It exists to speed up a human, not to replace the human's judgment.",
    outside: "A human review gate in Notion before any draft is used, an in progress lock so repeated button clicks cannot double process, and every failure written back to the row.",
    inside: "The voice rules are loaded fresh on every run so the model is re engineered toward the current voice rather than a stale one.",
    risk: "Off voice drift if the voice documents go stale, and no validation that the video URL actually resolves before it tries to transcribe.",
    profile: { transparency: 80, reversibility: 90, costControl: 50, humanInLoop: 95, auditability: 75 }
  },
  {
    id: "worker1",
    name: "YouTube Factory: Worker 1",
    runtime: "cloudflare",
    runtimeLabel: "Cloudflare, 1 min cron",
    model: "Detection pipeline",
    riskLevel: "med",
    role: "Watch a set of creator channels and surface the videos that are real performance outliers, so a human or a downstream agent can decide what is worth learning from.",
    io: "In: channel IDs from a Notion source list. Out: outlier videos with transcript and a score, written to a Source Outliers database.",
    assets: "Authority to read public channel data, to call paid APIs, and to label a video as a candidate worth attention.",
    obligations: "Surface real signal, not noise, and never silently drop work on the floor.",
    speech: "Limited. It speaks internally through labels and scores, not to the public.",
    revenueObligation: "Feed the script stage with inputs that are actually worth turning into content. A bad input here wastes every stage after it.",
    outside: "Retries with exponential backoff, no hard Failed status (failures route to Manual Review instead), a KV cache, and rate limits on every paid call.",
    inside: "DB driven design: it re reads the source list fresh each tick, so adding or pausing a channel takes effect immediately without a redeploy.",
    risk: "A static 2.0x outlier threshold that is never tuned per channel, and a dead RSS lane that still runs and wastes quota.",
    profile: { transparency: 70, reversibility: 85, costControl: 60, humanInLoop: 60, auditability: 70 }
  },
  {
    id: "worker2",
    name: "YouTube Factory: Worker 2",
    runtime: "cloudflare",
    runtimeLabel: "Cloudflare, daily cron",
    model: "Claude Opus, prompt cached",
    riskLevel: "high",
    role: "Take a hot outlier and write three title options, a hook, and a full script in the brand voice.",
    io: "In: hot rows from the Source Outliers database. Out: title options, hook, and a full script written into the Scripts database.",
    assets: "Authority to spend compute, to draft public facing scripts, and to write them directly into the Scripts database.",
    obligations: "Stay on voice, stay grounded, stay inside the budget, and never let a draft become published speech without a human in between.",
    speech: "Heavily. This is the agent that writes what an audience of 550K plus may eventually hear. Full speech obligations apply.",
    revenueObligation: "Produce scripts good enough to publish, not just scripts. Producing volume is not the obligation; producing publishable, on voice, truthful scripts is.",
    outside: "An 8 dollar per day hard spend cap, title length checks, banned phrase and no em dash hard rejects, a link free constraint, and a cost ledger on every run.",
    inside: "Local calibration before deploy: scripts are tuned against the operator's critiques until two consecutive batches pass with no change, so the agent earns the right to run live.",
    risk: "There is no human review gate between this agent and the published Scripts database. A hot but misleading angle could pass straight through. This is the headline finding of the whole project.",
    profile: { transparency: 80, reversibility: 65, costControl: 95, humanInLoop: 30, auditability: 80 }
  },
  {
    id: "clip",
    name: "Clip Machine",
    runtime: "gce",
    runtimeLabel: "Google Compute VM",
    model: "Gemini 2.5 Flash",
    riskLevel: "med",
    role: "Label raw footage, organize it into A roll and B roll, and serve clip requests so an editor can find the right shot fast.",
    io: "In: video files in a Drive inbox and clip requests in Notion. Out: labeled, organized footage and Drive shortcuts dropped in an editor folder.",
    assets: "Authority to read and move files in Drive, to call a vision model, and to attach labels that downstream editors trust.",
    obligations: "Label honestly, never guess facts it cannot see, and stay inside the monthly budget.",
    speech: "Yes, through labels. A label is a claim about what a clip is, so it must be relevant, faithful, and intelligible.",
    revenueObligation: "Make footage findable on the first query. The whole point is to save editor hours, so a wrong label is a broken promise.",
    outside: "A 250 dollar per month hard cap with a soft warning at 80 percent, a cost ledger on every run, and idempotency through a state file so a re run never duplicates work.",
    inside: "Camera and date come only from file metadata, never from a model guess. The agent is structurally forbidden from inventing facts it cannot read.",
    risk: "Silent failure if the Drive share to the service account is revoked, since the agent then sees no new footage and reports nothing wrong.",
    profile: { transparency: 75, reversibility: 80, costControl: 90, humanInLoop: 55, auditability: 80 }
  },
  {
    id: "cmo",
    name: "AI CMO",
    runtime: "local",
    runtimeLabel: "Local Node cron",
    model: "Claude, composer",
    riskLevel: "high",
    role: "Run brand deal outreach: find prospects, personalize cold emails, and draft replies, all under the brand name.",
    io: "In: a Notion CRM of brands. Out: personalized cold emails, follow ups, and reply drafts that wait for human approval.",
    assets: "Authority to send mail as the brand, to speak to strangers in the brand's name, and to spend the brand's reputation with every send.",
    obligations: "Avoid unfair or deceptive practices, never imply a human wrote what a bot wrote without a human standing behind it, and never send to an unverified address.",
    speech: "Heavily, and to strangers. This is the highest stakes speech in the firm because a bad send burns trust with a real person and the domain.",
    revenueObligation: "Open real partnership conversations without damaging the brand or the sender domain. It must never chase a send at the cost of the relationship.",
    outside: "A DRY_RUN flag that is true by default so going live is one deliberate human act, a warm up ramp from 0 to 25 per day over eight weeks, a bounce circuit breaker that halts all sends, address verification, suppression of signed partners, and a human approval gate on every reply.",
    inside: "Output checks the agent must pass before it can send: zero em dashes, no links in the automated sequence, no fake subjects, and a real human, the partnerships VA, who fronts and answers the conversation.",
    risk: "A fragile web scraping prospector and a hard dependency on an outside email verifier, either of which can stall or mislead the pipeline.",
    profile: { transparency: 85, reversibility: 40, costControl: 70, humanInLoop: 75, auditability: 90 }
  },
  {
    id: "refimg",
    name: "Reference Images Uploader",
    runtime: "github",
    runtimeLabel: "GitHub Actions",
    model: "Claude vision, validate",
    riskLevel: "low",
    role: "Keep a reference image gallery stocked with clean, usable images, either from a folder or by finding them for a brief.",
    io: "In: a local folder or a Notion request. Out: validated gallery pages in Notion.",
    assets: "Authority to add images to a shared gallery and to label their category.",
    obligations: "Only add images that are actually usable and not duplicates.",
    speech: "Minimal. It labels and categorizes rather than addressing an audience.",
    revenueObligation: "Give the team a gallery it can trust, so a low quality or duplicate image is a small but real breach.",
    outside: "A duplicate check before adding, plus resolution and watermark validation so junk never enters the gallery.",
    inside: "Category is inferred from the image content with a manual override path, so the human can always correct the model.",
    risk: "Low. Worst case is a mislabeled or low value image that a human can remove.",
    profile: { transparency: 70, reversibility: 85, costControl: 60, humanInLoop: 50, auditability: 60 }
  },
  {
    id: "music",
    name: "Music Library Downloader",
    runtime: "local",
    runtimeLabel: "Local CLI",
    model: "Source rippers",
    riskLevel: "low",
    role: "Acquire music from many sources at the best available quality and file it in a Notion music library.",
    io: "In: a source URL or a natural language vibe brief. Out: a music library row with the track at the best available format.",
    assets: "Authority to download files and to add them to the shared library.",
    obligations: "Avoid duplicates, prefer the highest available quality, and respect what the operator may actually use.",
    speech: "None to an audience.",
    revenueObligation: "Keep a clean, deduped library so the team is not re downloading or re searching the same track.",
    outside: "An idempotency check against Notion before any download, so the same track is never pulled twice.",
    inside: "A quality ladder that prefers lossless only where the source legitimately offers it.",
    risk: "Low. The main standing duty is to keep usage rights in view, which stays a human decision.",
    profile: { transparency: 65, reversibility: 80, costControl: 60, humanInLoop: 40, auditability: 55 }
  },
  {
    id: "glowup",
    name: "AI Glow Up",
    runtime: "local",
    runtimeLabel: "Remotion, local",
    model: "Claude plus upscaler",
    riskLevel: "med",
    role: "Turn a trend into a set of edited video variants, then let a human pick the winner before anything is published.",
    io: "In: a trend query and source clips. Out: rendered video variants organized on a review board for a human vote.",
    assets: "Authority to download, edit, and render video, and to propose a publishable cut.",
    obligations: "Never publish on its own. Its authority ends at proposing; a human chooses.",
    speech: "Yes, a finished video is public speech, which is exactly why the human vote gate exists before publish.",
    revenueObligation: "Produce variants worth a human's time to choose between. Flooding the board with weak cuts wastes the very review it depends on.",
    outside: "A human vote on a review board before any variant is published, so the publish decision never belongs to the agent.",
    inside: "Idempotent rendering and a clear variant structure so the human review is fast and the choice is real.",
    risk: "Fragile trend and niche matching, which can produce off target variants that still need a human to catch.",
    profile: { transparency: 70, reversibility: 75, costControl: 60, humanInLoop: 90, auditability: 65 }
  }
];

/* Labels for the auditor's accountability meters, in display order. */
window.PROFILE_DIMENSIONS = [
  { key: "transparency", label: "Transparency", help: "How visible the agent's actions are through logs and ledgers." },
  { key: "reversibility", label: "Reversibility", help: "How easily an action can be undone after the fact." },
  { key: "costControl", label: "Cost control", help: "How hard a spend or volume cap binds the agent." },
  { key: "humanInLoop", label: "Human in the loop", help: "Whether a human approves before an action reaches the world." },
  { key: "auditability", label: "Auditability", help: "Quality of the trail left behind for later review." }
];
