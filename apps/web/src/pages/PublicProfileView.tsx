import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Portfolio.css';

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    async function fetchData() {
      if (!username) return;
      
      // Fetch Profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !userProfile) {
        setIsLoading(false);
        return;
      }
      setProfile(userProfile);

      // Fetch Experience
      const { data: expData } = await supabase
        .from('hailmary_experience')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .order('start_year', { ascending: false });
      if (expData) setExperiences(expData);

      // Fetch Projects
      const { data: projData } = await supabase
        .from('hailmary_projects')
        .select('*')
        .eq('user_id', userProfile.user_id);
      if (projData) setProjects(projData);

      setIsLoading(false);
    }
    fetchData();
  }, [username]);

  // 2. DOM Manipulation (Cursor Glow, Scroll Reveal, Nav Spy)
  useEffect(() => {
    if (isLoading || !profile) return;

    // Cursor Glow
    const glow = document.getElementById('cursorGlow');
    const moveGlow = (e: MouseEvent) => {
      if (!glow) return;
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', moveGlow);

    // Scroll Reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    // Stagger Projects
    document.querySelectorAll('.project-card.reveal').forEach((el: any, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
    });

    // Active Nav Spy
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const handleScroll = () => {
      let current = '';
      sections.forEach((s: any) => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
      });
      navLinks.forEach((a: any) => {
        a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('mousemove', moveGlow);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [isLoading, profile]);

  if (isLoading) return <div className="flex h-screen items-center justify-center text-white bg-[#0d0f14]">Loading...</div>;
  if (!profile) return <div className="flex h-screen items-center justify-center text-white bg-[#0d0f14]">404 - Portfolio Not Found</div>;

  return (
    <>
      <div className="cursor-glow" id="cursorGlow"></div>

      <nav>
        <a href="#" className="nav-brand">
          {profile.name}
          <span>Portfolio · {profile.bio || 'Developer'}</span>
        </a>
        <ul className="nav-links">
          <li><a href="#experience">Experience</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href={profile.website_url || '#'} className="nav-cta" target="_blank" rel="noopener noreferrer">↓ Resume</a>
      </nav>

      <section id="hero">
        <div className="glow-blob glow-blob-1"></div>
        <div className="glow-blob glow-blob-2"></div>
        <div className="glow-blob glow-blob-3"></div>

        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="dot"></span>
            Available for opportunities
          </div>
          <p className="hero-greeting">Hello, world.</p>
          <h1 className="hero-name">
            I'm <span className="name-accent">{profile.name}</span>
          </h1>
          <div className="hero-title-row">
            <div className="hero-title-bar"></div>
            <span className="hero-role"><span className="role-highlight">✦</span> {profile.bio || 'Software Engineer'}</span>
          </div>
          <p className="hero-bio">{profile.bio}</p>
          
          <div className="hero-ctas">
            <a href="#contact" className="btn-primary">Let's Talk ↗</a>
          </div>

          <div className="hero-social-row">
            {profile.github_url && (
              <a href={profile.github_url} className="social-link" target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            <div className="social-sep"></div>
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} className="social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            )}
          </div>
        </div>

        <div className="hero-right">
          
        </div>
      </section>

      <section id="experience">
        <div className="container">
          <div className="exp-layout">
            <div className="exp-sticky reveal">
              <div className="section-label">Career</div>
              <h2 className="section-heading">Work <em>Experience</em></h2>
            </div>
            <div className="experience-list reveal">
              {experiences.map((exp, index) => (
                <div className="experience-row" key={exp.id}>
                  <div className="exp-number">0{index + 1}</div>
                  <div className="exp-details">
                    <h4>{exp.role || exp.title}</h4>
                    <p>{exp.company}</p>
                  </div>
                  <div className="exp-duration">{exp.start_year} - {exp.end_year || 'Present'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="container">
          <div className="projects-header reveal">
            <div>
              <div className="section-label">Work</div>
              <h2 className="section-heading">Selected <em>Projects</em></h2>
            </div>
          </div>
          <div className="projects-grid">
            {projects.map((proj) => (
              <div className="project-card reveal" key={proj.id}>
                <div className="project-body">
                  <h3>{proj.title}</h3>
                  <p>{proj.description || proj.raw_notes}</p>
                  <div className="project-footer">
                    {proj.live_url && <a href={proj.live_url} className="btn-ghost" target="_blank" rel="noopener noreferrer">View Live ↗</a>}
                    {proj.github_url && <a href={proj.github_url} className="btn-ghost-secondary" target="_blank" rel="noopener noreferrer">Source ⌥</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </>
  );
}
