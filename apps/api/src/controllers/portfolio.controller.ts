import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely coerce a potentially null/undefined value to a usable string. */
const safe = (val: unknown, fallback = ''): string =>
  val === null || val === undefined ? fallback : String(val);

/** Format a date pair like "2022-06 — 2024-01" or "2023-09 — Present". */
const formatDateRange = (start: string | null, end: string | null): string => {
  const s = start || '?';
  const e = end || 'Present';
  return `${s} — ${e}`;
};

const calculateYearsXp = (experiences: any[]): string => {
  const years = experiences
    .map((exp) => Number.parseInt(safe(exp.start_date).slice(0, 4), 10))
    .filter((year) => Number.isFinite(year));

  if (years.length === 0) return '0';

  const earliestYear = Math.min(...years);
  return `${Math.max(new Date().getFullYear() - earliestYear, 0)}+`;
};

const formatNotes = (notes: string | null | undefined, fallback: string): string => {
  const value = safe(notes, fallback).trim();
  return value || fallback;
};

/** Build tech-stack tag HTML for a project.  Cycles through colour classes. */
const buildTechTags = (stack: string[] | null): string => {
  if (!stack || stack.length === 0) return '';
  const colours = ['tag-blue', 'tag-gold', 'tag-green', 'tag-red'];
  return stack
    .map((tech, i) => `<span class="project-tag ${colours[i % colours.length]}">${tech}</span>`)
    .join('\n            ');
};

const projectSkills = (projects: any[]): string[] =>
  Array.from(
    new Set(
      projects
        .flatMap((project) => Array.isArray(project.tech_stack) ? project.tech_stack : [])
        .filter(Boolean)
    )
  );

const buildSkillsMarquee = (projects: any[]): string => {
  const skills = projectSkills(projects);
  if (skills.length === 0) return '';

  return `<div class="marquee-strip" aria-hidden="true">
  <div class="marquee-track">
    ${[...skills, ...skills].map((skill) => `<span class="marquee-item"><span class="m-dot"></span>${skill}</span>`).join('\n    ')}
  </div>
</div>`;
};

const buildSkillsSection = (projects: any[]): string => {
  const skills = projectSkills(projects);
  const tags = skills.length > 0
    ? skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join('\n          ')
    : '<span class="skill-tag">Add project tech stacks to populate this section</span>';

  return `<section id="skills">
  <div class="container">
    <div class="reveal">
      <div class="section-label">Capabilities</div>
      <h2 class="section-heading">What I <em>Build With</em></h2>
    </div>
    <div class="skills-grid reveal">
      <div class="skill-cell">
        <span class="skill-icon">*</span>
        <div class="skill-name">${skills.length > 0 ? 'Project Tech Stack' : 'Skills'}</div>
        <div class="skill-tags">
          ${tags}
        </div>
      </div>
    </div>
  </div>
</section>`;
};

// ─── 404 / Error HTML builders ───────────────────────────────────────────────

const html404 = (username: string): string => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio Not Found</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  body{background:#0d0f14;color:#e8eaf2;font-family:'Space Mono',monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:2rem}
  h1{font-size:5rem;color:#e8c97d;margin:0 0 1rem}
  p{color:#6b7280;font-size:.85rem;max-width:420px;line-height:1.8}
  a{color:#5b8fff;text-decoration:none;border-bottom:1px solid rgba(91,143,255,.3);transition:border-color .2s}
  a:hover{border-color:#5b8fff}
</style></head><body>
<h1>404</h1>
<p>No portfolio found for <strong style="color:#e8c97d">"${username}"</strong>. Double-check the username or ask the owner to set one in their HailMary profile.</p>
</body></html>`;

const html500 = (msg: string): string => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio Error</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  body{background:#0d0f14;color:#e8eaf2;font-family:'Space Mono',monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:2rem}
  h1{font-size:3rem;color:#ff5f5f;margin:0 0 1rem}
  p{color:#6b7280;font-size:.8rem;max-width:460px;line-height:1.8}
</style></head><body>
<h1>Oops</h1>
<p>${msg}</p>
</body></html>`;

// ─── Controller ──────────────────────────────────────────────────────────────

export const PortfolioController = {
  /**
   * GET /api/portfolio/:username
   *
   * 1. Reads the raw HTML template from disk.
   * 2. Fetches the user's profile, experience, and projects from Supabase.
   * 3. Compiles the template via regex-based string replacement.
   * 4. Returns the compiled HTML with Content-Type: text/html.
   */
  serve: catchAsync(async (req: Request, res: Response) => {
    const { username } = req.params;

    // ── 1. Read Template ──────────────────────────────────────────────────────
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'portfolio.html');

    if (!fs.existsSync(templatePath)) {
      return res
        .status(500)
        .setHeader('Content-Type', 'text/html')
        .send(html500('Portfolio template file is missing on the server. Please contact support.'));
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // ── 2. Fetch Data from Supabase ───────────────────────────────────────────
    // Lookup user by their `username` slug in user_profiles.
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileErr || !profile) {
      return res
        .status(404)
        .setHeader('Content-Type', 'text/html')
        .send(html404(username));
    }

    const userId: string = profile.user_id;

    // Fetch resume data & portfolio-flagged projects concurrently.
    const [eduRes, expRes, projRes] = await Promise.all([
      supabase
        .from('hailmary_education')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false }),
      supabase
        .from('hailmary_experience')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false }),
      supabase
        .from('hailmary_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('sync_to_portfolio', true)
        .order('created_at', { ascending: false }),
    ]);

    const education: any[] = eduRes.data || [];
    const experiences: any[] = expRes.data || [];
    const projects: any[] = projRes.data || [];

    // ── 3. Compile — Singular Replacements ────────────────────────────────────

    const fullName  = safe(profile.name, 'Anonymous Developer');
    const roleTitle = safe(profile.bio, 'Developer');  // bio doubles as the role tagline
    const greeting  = `Hello, World —`;

    // Build a short hero bio from the profile bio, or a default.
    const heroBio = safe(
      profile.bio,
      'Passionate developer building things that matter.'
    );

    // Hero bullets — derived from experience count, project count, and skills.
    const bullet1 = `${experiences.length} professional experience${experiences.length !== 1 ? 's' : ''} and counting`;
    const bullet2 = `${projects.length} curated project${projects.length !== 1 ? 's' : ''} in portfolio`;
    const totalProjects = String(projects.length);
    const yearsXp = calculateYearsXp(experiences);
    const skillsMarquee = buildSkillsMarquee(projects);
    const skillsSection = buildSkillsSection(projects);
    const bullet3 = safe(profile.location, 'Remote') + ' · Open to opportunities';

    // Social links — fallback to '#' for null values.
    const githubLink   = safe(profile.github_url, '#');
    const linkedinLink = safe(profile.linkedin_url, '#');
    const resumeLink   = safe(profile.website_url, '#'); // website_url as resume fallback
    const profileImage = safe(profile.avatar_url, '');

    // Page title
    const pageTitle = `${fullName} · Portfolio`;

    // Testimonial placeholders — gracefully blank if no data exists.
    const testimonialQuote   = safe(profile.testimonial_quote, 'Great things are built by great teams.');
    const testimonialAuthor  = safe(profile.testimonial_author, '');
    const testimonialRole    = safe(profile.testimonial_role, '');
    const testimonialCompany = safe(profile.testimonial_company, '');
    const testimonialAvatar  = safe(profile.testimonial_avatar_url, '');

    // Perform all singular replacements.
    html = html
      .replace(/\{\{PAGE_TITLE\}\}/g, pageTitle)
      .replace(/\{\{FULL_NAME\}\}/g, fullName)
      .replace(/\{\{ROLE_TITLE\}\}/g, roleTitle)
      .replace(/\{\{GREETING\}\}/g, greeting)
      .replace(/\{\{HERO_BIO\}\}/g, heroBio)
      .replace(/\{\{HERO_BULLET_1\}\}/g, bullet1)
      .replace(/\{\{HERO_BULLET_2\}\}/g, bullet2)
      .replace(/\{\{HERO_BULLET_3\}\}/g, bullet3)
      .replace(/\{\{TOTAL_PROJECTS\}\}/g, totalProjects)
      .replace(/\{\{YEARS_XP\}\}/g, yearsXp)
      .replace(/\{\{SKILLS_MARQUEE\}\}/g, skillsMarquee)
      .replace(/\{\{SKILLS_SECTION\}\}/g, skillsSection)
      .replace(/\{\{GITHUB_LINK\}\}/g, githubLink)
      .replace(/\{\{LINKEDIN_LINK\}\}/g, linkedinLink)
      .replace(/\{\{RESUME_LINK\}\}/g, resumeLink)
      .replace(/\{\{PROFILE_IMAGE_URL\}\}/g, profileImage)
      .replace(/\{\{TESTIMONIAL_QUOTE\}\}/g, testimonialQuote)
      .replace(/\{\{TESTIMONIAL_AUTHOR\}\}/g, testimonialAuthor)
      .replace(/\{\{TESTIMONIAL_ROLE\}\}/g, testimonialRole)
      .replace(/\{\{TESTIMONIAL_COMPANY\}\}/g, testimonialCompany)
      .replace(/\{\{TESTIMONIAL_AVATAR_URL\}\}/g, testimonialAvatar);

    // ── 4. Compile — Experience Loop ──────────────────────────────────────────

    const expLoopRegex = /<!-- EXPERIENCE LOOP START -->([\s\S]*?)<!-- EXPERIENCE LOOP END -->/;
    const expMatch = html.match(expLoopRegex);

    if (expMatch) {
      const expTemplate = expMatch[1]; // The repeatable block between the markers

      const compiledExperiences = experiences.map((exp, idx) => {
        return expTemplate
          .replace(/\{\{EXP_INDEX\}\}/g, String(idx + 1).padStart(2, '0'))
          .replace(/\{\{EXP_ROLE\}\}/g, safe(exp.role, 'Role'))
          .replace(/\{\{EXP_COMPANY\}\}/g, safe(exp.company, 'Company'))
          .replace(/\{\{EXP_BULLETS\}\}/g, formatNotes(exp.raw_notes, 'Impact details coming soon.'))
          .replace(/\{\{EXP_DATE\}\}/g, formatDateRange(exp.start_date, exp.end_date));
      });

      // Replace the entire block (including markers) with the compiled entries.
      html = html.replace(
        /<!-- EXPERIENCE LOOP START -->[\s\S]*?<!-- EXPERIENCE LOOP END -->/,
        compiledExperiences.join('\n')
      );
    }

    // ── 5. Compile — Projects Loop ────────────────────────────────────────────

    const eduLoopRegex = /<!-- EDUCATION LOOP START -->([\s\S]*?)<!-- EDUCATION LOOP END -->/;
    const eduMatch = html.match(eduLoopRegex);

    if (eduMatch) {
      const eduTemplate = eduMatch[1];

      const compiledEducation = education.map((edu, idx) => {
        const cgpa = safe(edu.cgpa);

        return eduTemplate
          .replace(/\{\{EDU_INDEX\}\}/g, String(idx + 1).padStart(2, '0'))
          .replace(/\{\{EDU_INSTITUTION\}\}/g, safe(edu.institution, 'Institution'))
          .replace(/\{\{EDU_DEGREE\}\}/g, safe(edu.degree, 'Degree'))
          .replace(/\{\{EDU_CGPA\}\}/g, cgpa ? `GPA / CGPA: ${cgpa}` : '')
          .replace(/\{\{EDU_DATE\}\}/g, formatDateRange(edu.start_date, edu.end_date));
      });

      html = html.replace(
        /<!-- EDUCATION LOOP START -->[\s\S]*?<!-- EDUCATION LOOP END -->/,
        compiledEducation.join('\n')
      );
    }

    const projLoopRegex = /<!-- PROJECTS LOOP START -->([\s\S]*?)<!-- PROJECTS LOOP END -->/;
    const projMatch = html.match(projLoopRegex);

    if (projMatch) {
      const projTemplate = projMatch[1]; // The repeatable block between the markers

      const compiledProjects = projects.map((proj) => {
        return projTemplate
          .replace(/\{\{PROJECT_TITLE\}\}/g, safe(proj.title, 'Untitled Project'))
          .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, safe(proj.raw_notes, 'No description provided.'))
          .replace(/\{\{PROJECT_TECH_STACK\}\}/g, buildTechTags(proj.tech_stack))
          .replace(/\{\{PROJECT_LIVE_URL\}\}/g, safe(proj.live_url, '#'))
          .replace(/\{\{PROJECT_GITHUB_URL\}\}/g, safe(proj.github_url, '#'));
      });

      // Replace the entire block (including markers) with the compiled entries.
      html = html.replace(
        /<!-- PROJECTS LOOP START -->[\s\S]*?<!-- PROJECTS LOOP END -->/,
        compiledProjects.join('\n')
      );
    }

    // ── 6. Serve ──────────────────────────────────────────────────────────────

    return res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
      .send(html);
  }),
};
