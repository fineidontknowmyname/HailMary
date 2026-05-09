import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!username) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    }
    
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white font-mono">
        Loading intel...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white font-mono">
        404 - Operative Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-8 text-white font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold border-b border-slate-800 pb-4">
          Uplink Established for Target: {username}
        </h1>
        <div className="bg-[#0a0d14] p-6 rounded-xl border border-slate-800 overflow-auto">
          <pre className="text-emerald-300 text-sm">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
