import type { HailMaryResumeData } from './types';

export const mockResumeData: HailMaryResumeData = {
  identity: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    websiteUrl: 'https://johndoe.dev'
  },
  education: [
    {
      institution: 'Tech University',
      degree: 'B.S. Computer Science',
      cgpa: '3.9/4.0',
      startDate: '2020-08',
      endDate: '2024-05'
    }
  ],
  experience: [
    {
      company: 'Future Tech',
      role: 'Full Stack Engineer',
      startDate: '2023-06',
      endDate: 'Present',
      bullets: [
        'Built a high-performance PDF engine using React-PDF.',
        'Optimized API response times by 40% through Redis caching.',
        'Mentored junior developers on best practices in TypeScript.'
      ]
    }
  ],
  projects: [
    {
      title: 'Hail Mary',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      bullets: [
        'Developed a comprehensive developer portfolio and resume builder.',
        'Implemented dynamic CORS and edge-ready portfolio serving.'
      ]
    }
  ]
};
