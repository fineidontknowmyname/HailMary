// ─── TemplateFAANG — ATS-optimized, single-column FAANG-style resume ─────────
//
// Design rules:
//  • Single column. NO sidebars, NO background colours, NO graphics.
//  • Times-Roman family (built into react-pdf, zero network requests).
//  • Conservative padding (30pt). Maximum information density.
//  • Section order: Identity → Education → Experience → Projects.
//  • ATS-safe: pure text, logical heading hierarchy, standard fonts.

import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import type { HailMaryResumeData } from '../types';
import { SectionHeader } from '../components/SectionHeader';
import { SplitRow } from '../components/SplitRow';
import { BulletList } from '../components/BulletList';

// ─── Colour palette ──────────────────────────────────────────────────────────

const BLACK = '#000000';
const DARK  = '#222222';
const MID   = '#444444';

// ─── Stylesheet ──────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: BLACK,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 30,
    lineHeight: 1.4,
    backgroundColor: '#ffffff',
  },

  // ── Identity header ──
  headerWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 18,
    color: BLACK,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  contactText: {
    fontFamily: 'Times-Roman',
    fontSize: 9.5,
    color: MID,
  },
  contactLink: {
    fontFamily: 'Times-Roman',
    fontSize: 9.5,
    color: '#1a0dab',   // classic link blue
    textDecoration: 'none',
  },
  contactSep: {
    fontFamily: 'Times-Roman',
    fontSize: 9.5,
    color: MID,
    marginHorizontal: 4,
  },

  // ── Entry blocks ──
  entryBlock: {
    marginBottom: 6,
  },
  subLine: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
    color: DARK,
    marginTop: 1,
  },
  techLine: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
    color: MID,
    marginTop: 1,
  },
  cgpaLine: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: MID,
    marginTop: 1,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  if (!d) return '';
  if (d.toLowerCase() === 'present') return 'Present';
  const parts = d.split('-');
  if (parts.length >= 2) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m] ?? parts[1]} ${parts[0]}`;
  }
  return d;
}

function dateRange(start: string, end: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!s && !e) return '';
  if (!s) return e;
  return `${s} – ${e}`;
}

/** Strip the protocol prefix for compact display. */
function stripUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}

// ─── Component ───────────────────────────────────────────────────────────────

interface TemplateFAANGProps {
  data: HailMaryResumeData;
}

export function TemplateFAANG({ data }: TemplateFAANGProps) {
  const { identity, education, experience, projects } = data;

  // Build the contact items array (only non-empty values).
  const contactItems: Array<{ text: string; href?: string }> = [];

  if (identity.email) {
    contactItems.push({ text: identity.email, href: `mailto:${identity.email}` });
  }
  if (identity.phone) {
    contactItems.push({ text: identity.phone });
  }
  if (identity.githubUrl) {
    contactItems.push({ text: stripUrl(identity.githubUrl), href: identity.githubUrl });
  }
  if (identity.linkedinUrl) {
    contactItems.push({ text: stripUrl(identity.linkedinUrl), href: identity.linkedinUrl });
  }
  if (identity.websiteUrl) {
    contactItems.push({ text: stripUrl(identity.websiteUrl), href: identity.websiteUrl });
  }

  return (
    <Document
      title={`${identity.fullName} — Resume`}
      author={identity.fullName}
    >
      <Page size="A4" style={S.page}>

        {/* ── IDENTITY HEADER ── */}
        <View style={S.headerWrap}>
          <Text style={S.name}>{identity.fullName}</Text>

          {contactItems.length > 0 && (
            <View style={S.contactRow}>
              {contactItems.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row' }}>
                  {idx > 0 && <Text style={S.contactSep}>|</Text>}
                  {item.href ? (
                    <Link src={item.href} style={S.contactLink}>{item.text}</Link>
                  ) : (
                    <Text style={S.contactText}>{item.text}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── EDUCATION ── */}
        {education.length > 0 && (
          <View>
            <SectionHeader title="Education" />
            {education.map((edu, idx) => (
              <View key={idx} style={S.entryBlock}>
                <SplitRow
                  leftContent={edu.institution}
                  rightContent={dateRange(edu.startDate, edu.endDate)}
                />
                <Text style={S.subLine}>{edu.degree}</Text>
                {edu.cgpa ? (
                  <Text style={S.cgpaLine}>GPA / CGPA: {edu.cgpa}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ── EXPERIENCE ── */}
        {experience.length > 0 && (
          <View>
            <SectionHeader title="Experience" />
            {experience.map((exp, idx) => (
              <View key={idx} style={S.entryBlock} wrap={false}>
                <SplitRow
                  leftContent={exp.role}
                  rightContent={dateRange(exp.startDate, exp.endDate)}
                />
                <Text style={S.subLine}>{exp.company}</Text>
                <BulletList items={exp.bullets} />
              </View>
            ))}
          </View>
        )}

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <View>
            <SectionHeader title="Projects" />
            {projects.map((proj, idx) => (
              <View key={idx} style={S.entryBlock} wrap={false}>
                <SplitRow
                  leftContent={proj.title}
                  rightContent={[
                    proj.liveUrl ? stripUrl(proj.liveUrl) : '',
                    proj.githubUrl ? stripUrl(proj.githubUrl) : '',
                  ].filter(Boolean).join(' | ')}
                />
                {proj.techStack.length > 0 && (
                  <Text style={S.techLine}>{proj.techStack.join(', ')}</Text>
                )}
                <BulletList items={proj.bullets} />
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}
