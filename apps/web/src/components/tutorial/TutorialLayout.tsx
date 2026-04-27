import React from 'react';
import { TutorialHero } from './TutorialHero';
import { SideNav } from './SideNav';
import type { NavSection } from './SideNav';

interface TutorialLayoutProps {
  title: string;
  subtitle: string;
  accentWord: string;
  themeColor: string;
  tags: string[];
  sections: NavSection[];
  children: React.ReactNode;
}

export const TutorialLayout: React.FC<TutorialLayoutProps> = ({
  title,
  subtitle,
  accentWord,
  themeColor,
  tags,
  sections,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white selection:text-black"
      style={{ '--theme': themeColor, 'selectionBackgroundColor': themeColor } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 flex flex-col gap-10">

        <TutorialHero
          title={title}
          subtitle={subtitle}
          accentWord={accentWord}
          themeColor={themeColor}
          tags={tags}
        />

        <div className="flex items-start gap-10 lg:gap-14">
          <SideNav sections={sections} themeColor={themeColor} />

          <main className="min-w-0 flex-1">
            <div className="prose prose-invert max-w-none">
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};

export default TutorialLayout;
