import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

export interface NavSection {
  id: string;
  label: string;
  subsections?: { id: string; label: string }[];
}

interface SideNavProps {
  sections: NavSection[];
  themeColor?: string;
}

export const SideNav: React.FC<SideNavProps> = ({
  sections,
  themeColor = '#4fffb0',
}) => {
  const [activeId, setActiveId]   = useState<string>(sections[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const allIds = sections.flatMap((s) => [
      s.id,
      ...(s.subsections?.map((sub) => sub.id) ?? []),
    ]);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-1">
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <div key={section.id}>
            <button
              onClick={() => scrollTo(section.id)}
              className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#161b27] font-semibold'
                  : 'text-[#7a849a] hover:bg-[#161b27] hover:text-white'
              }`}
              style={isActive ? { color: themeColor } : undefined}
            >
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 transition-transform duration-150"
                style={{
                  color: isActive ? themeColor : 'transparent',
                  transform: isActive ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              />
              {section.label}
            </button>

            {section.subsections && section.subsections.length > 0 && (
              <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-[#1e2535] pl-3">
                {section.subsections.map((sub) => {
                  const subActive = activeId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => scrollTo(sub.id)}
                      className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors duration-150 ${
                        subActive
                          ? 'font-semibold'
                          : 'text-[#7a849a] hover:text-white'
                      }`}
                      style={subActive ? { color: themeColor } : undefined}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#1e2535] bg-[#111520] text-white shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[#1e2535] bg-[#0b0e14] transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1e2535] px-5 py-4">
          <span className="text-sm font-mono font-bold text-white">Contents</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-[#7a849a] hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <NavContent />
        </div>
      </aside>

      <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
        <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2">
          <p className="mb-3 px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#7a849a]">
            On this page
          </p>
          <NavContent />
        </div>
      </aside>
    </>
  );
};

export default SideNav;
