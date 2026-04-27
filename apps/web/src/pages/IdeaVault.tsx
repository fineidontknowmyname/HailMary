import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function IdeaVault() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] md:h-screen flex items-center justify-center bg-[#0b0e14]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0b0e14]">
          <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
          <p className="text-sm font-mono text-[#7a849a]">Loading Idea Vault...</p>
        </div>
      )}
      <iframe
        src="https://idea-vault-gules.vercel.app/"
        className={`w-full h-full border-none transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        title="Idea Vault"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
