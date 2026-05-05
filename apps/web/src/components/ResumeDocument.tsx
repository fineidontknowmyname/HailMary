/**
 * ResumeDocument.tsx
 *
 * The @react-pdf/renderer PDF template.
 * Design rules:
 *  - Single column. No sidebars. No graphics. No skill bars.
 *  - ATS-safe: pure text, logical heading hierarchy, standard fonts.
 *  - Typography: Helvetica family (built into react-pdf, zero download).
 */
import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience } from '../types/resume';

// ─── Palette & Constants ──────────────────────────────────────────────────────

const BLACK  = '#111111';
const DARK   = '#222222';
const MID    = '#444444';
const LIGHT  = '#666666';
const RULE   = '#cccccc';
const PAGE_H = '#333333';

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily:  'Helvetica',
    fontSize:    10,
    color:       BLACK,
    paddingTop:  36,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight:  1.45,
    backgroundColor: '#ffffff',
  },

  // ── Header ──
  header: { alignItems: 'center', marginBottom: 10 },
  name:   { fontSize: 22, fontFamily: 'Helvetica-Bold', color: BLACK, letterSpacing: 0.5 },
  tagline:{ fontSize: 9.5, color: MID, marginTop: 2 },
  contactRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 0, marginTop: 5,
  },
  contactItem: { fontSize: 8.5, color: LIGHT, marginHorizontal: 6 },
  contactLink: { fontSize: 8.5, color: '#1a56db', textDecoration: 'none' },
  divider: {
    borderBottomWidth: 0.5, borderBottomColor: RULE,
    marginTop: 10, marginBottom: 6,
  },

  // ── Section ──
  section:     { marginBottom: 10 },
  sectionHead: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', color: PAGE_H,
    textTransform: 'uppercase', letterSpacing: 1.1,
    borderBottomWidth: 0.5, borderBottomColor: RULE,
    paddingBottom: 2, marginBottom: 5,
  },

  // ── Row entry (experience / project) ──
  entry:     { marginBottom: 6 },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryTitle:{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },
  entryMeta: { fontSize: 8.5, color: LIGHT },
  entryDate: { fontSize: 8.5, color: LIGHT, textAlign: 'right' },
  entryOrg:  { fontSize: 9, color: MID, marginTop: 0.5 },
  bullet:    { flexDirection: 'row', marginTop: 1.5 },
  bulletDot: { fontSize: 10, color: MID, marginRight: 4, marginTop: 0 },
  bulletText:{ fontSize: 9, color: DARK, flex: 1 },

  // ── Education ──
  eduEntry:  { marginBottom: 5 },
  eduTitle:  { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },
  eduSub:    { fontSize: 9, color: MID, marginTop: 0.5 },
  eduGrade:  { fontSize: 8.5, color: LIGHT, marginTop: 0.5 },

  // ── Skills ──
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  skillItem: { fontSize: 9, color: DARK, marginRight: 6 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  // Accept raw strings like "2020-08" or "Present"
  if (d.toLowerCase() === 'present') return 'Present';
  const parts = d.split('-');
  if (parts.length >= 2) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m] ?? ''} ${parts[0]}`;
  }
  return d;
}

function dateRange(start: string | null, end: string | null): string {
  const s = formatDate(start);
  const e = end ? formatDate(end) : 'Present';
  if (!s && !e) return '';
  if (!s) return e;
  return `${s} – ${e}`;
}

/** Split raw_notes on newlines into bullet strings, stripping empty lines */
function toBullets(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={S.section}>
      <Text style={S.sectionHead}>{title}</Text>
      {children}
    </View>
  );
}

// ─── BulletList ───────────────────────────────────────────────────────────────

function BulletList({ notes }: { notes: string | null }) {
  const bullets = toBullets(notes);
  if (bullets.length === 0) return null;
  return (
    <>
      {bullets.map((b, i) => (
        <View key={i} style={S.bullet}>
          <Text style={S.bulletDot}>•</Text>
          <Text style={S.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ResumeDocumentProps {
  profile:    Partial<UserProfile>;
  education:  HailMaryEducation[];
  experience: HailMaryExperience[];
  projects:   HailMaryProject[];   // only those with sync_to_resume === true
}

// ─── Main Document ────────────────────────────────────────────────────────────

export function ResumeDocument({
  profile,
  education,
  experience,
  projects,
}: ResumeDocumentProps) {

  // Collect all tech tags from included projects for a Skills section
  const allTech = Array.from(
    new Set(projects.flatMap((p) => p.tech_stack))
  ).slice(0, 24); // cap to keep it tidy

  return (
    <Document title={`${profile.name ?? 'Resume'} — Resume`} author={profile.name ?? ''}>
      <Page size="A4" style={S.page}>

        {/* ── HEADER ── */}
        <View style={S.header}>
          <Text style={S.name}>{profile.name ?? 'Your Name'}</Text>
          {profile.bio && <Text style={S.tagline}>{profile.bio}</Text>}

          <View style={S.contactRow}>
            {profile.location && (
              <Text style={S.contactItem}>{profile.location}</Text>
            )}
            {profile.github_url && (
              <Link src={profile.github_url} style={S.contactLink}>
                {profile.github_url.replace('https://', '')}
              </Link>
            )}
            {profile.linkedin_url && (
              <Link src={profile.linkedin_url} style={S.contactLink}>
                {' '}| {profile.linkedin_url.replace('https://www.linkedin.com/in/', 'linkedin.com/in/')}
              </Link>
            )}
            {profile.website_url && (
              <Link src={profile.website_url} style={S.contactLink}>
                {' '}| {profile.website_url.replace('https://', '')}
              </Link>
            )}
          </View>
        </View>

        <View style={S.divider} />

        {/* ── EDUCATION ── */}
        {education.length > 0 && (
          <Section title="Education">
            {education.map((edu) => (
              <View key={edu.id} style={S.eduEntry}>
                <View style={S.entryHead}>
                  <Text style={S.eduTitle}>{edu.degree}</Text>
                  <Text style={S.entryDate}>{dateRange(edu.start_year, edu.end_year)}</Text>
                </View>
                <Text style={S.eduSub}>{edu.institution}</Text>
                {edu.cgpa && <Text style={S.eduGrade}>GPA / CGPA: {edu.cgpa}</Text>}
              </View>
            ))}
          </Section>
        )}

        {/* ── EXPERIENCE ── */}
        {experience.length > 0 && (
          <Section title="Experience">
            {experience.map((exp) => (
              <View key={exp.id} style={S.entry}>
                <View style={S.entryHead}>
                  <Text style={S.entryTitle}>{exp.role}</Text>
                  <Text style={S.entryDate}>{dateRange(exp.start_year, exp.end_year)}</Text>
                </View>
                <Text style={S.entryOrg}>{exp.company}</Text>
                <BulletList notes={exp.raw_notes} />
              </View>
            ))}
          </Section>
        )}

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <Section title="Projects">
            {projects.map((proj) => (
              <View key={proj.id} style={S.entry}>
                <View style={S.entryHead}>
                  <Text style={S.entryTitle}>{proj.title}</Text>
                  {proj.live_url && (
                    <Link src={proj.live_url} style={S.contactLink}>
                      {proj.live_url.replace('https://', '')}
                    </Link>
                  )}
                </View>
                {proj.tech_stack.length > 0 && (
                  <Text style={S.entryMeta}>
                    Stack: {proj.tech_stack.join(' · ')}
                  </Text>
                )}
                <BulletList notes={proj.technical_challenges} />
                {proj.metrics && (
                  <View style={S.bullet}>
                    <Text style={S.bulletDot}>•</Text>
                    <Text style={S.bulletText}>{proj.metrics}</Text>
                  </View>
                )}
              </View>
            ))}
          </Section>
        )}

        {/* ── SKILLS (derived from project tech stacks) ── */}
        {allTech.length > 0 && (
          <Section title="Technical Skills">
            <View style={S.skillsRow}>
              {allTech.map((t) => (
                <Text key={t} style={S.skillItem}>{t}</Text>
              ))}
            </View>
          </Section>
        )}

      </Page>
    </Document>
  );
}

export default ResumeDocument;
