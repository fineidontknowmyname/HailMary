import React from 'react';

interface TutorialHeroProps {
  title: string;
  subtitle: string;
  accentWord: string;
  themeColor: string;
  tags: string[];
}

export const TutorialHero: React.FC<TutorialHeroProps> = ({
  title,
  subtitle,
  accentWord,
  themeColor,
  tags,
}) => {
  const titleParts = title.split(accentWord);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-[#1e2535] bg-[#0b0e14] px-8 py-14 md:px-14"
      style={{ '--theme': themeColor } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-[120px] opacity-20"
        style={{ backgroundColor: themeColor }}
      />

      <div className="relative z-10 flex flex-col gap-6 max-w-3xl">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider"
              style={{
                borderColor: `${themeColor}40`,
                backgroundColor: `${themeColor}10`,
                color: themeColor,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
          {titleParts[0]}
          <span style={{ color: themeColor }}>{accentWord}</span>
          {titleParts[1]}
        </h1>

        <p className="text-base text-[#7a849a] leading-relaxed max-w-xl">
          {subtitle}
        </p>

        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: themeColor }}
          />
          <span className="text-xs font-mono text-[#7a849a] uppercase tracking-widest">
            Interactive Tutorial
          </span>
        </div>
      </div>
    </div>
  );
};

export default TutorialHero;
