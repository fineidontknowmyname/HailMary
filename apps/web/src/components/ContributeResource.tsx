import { useState } from 'react';
import { api } from '../lib/api';
import { useAppTheme } from '../lib/ThemeProvider';
import { useAuth } from '../auth/useAuth';

export default function ContributeResource() {
  const { theme } = useAppTheme();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'course',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/api/resources/contribute', {
        title: formData.title,
        link: formData.link,
        type: formData.type,
        description: formData.description,
      });

      setMessage({ type: 'success', text: 'Resource submitted successfully! It will appear once approved.' });
      setFormData({ title: '', link: '', type: 'course', description: '' });

    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to submit resource.' });
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    color: theme.heading,
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-10 rounded-xl border text-center" style={{ background: theme.bgPanel, borderColor: theme.cardBorder }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.heading }}>Contribute a Resource</h1>
        <p style={{ color: theme.muted }}>Sign in to help the community by sharing high-quality tutorials, docs, or tools.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 rounded-xl border" style={{ background: theme.bgPanel, borderColor: theme.cardBorder }}>
      <h1 className="text-3xl font-bold mb-2" style={{ color: theme.heading }}>Contribute a Resource</h1>
      <p className="mb-8" style={{ color: theme.muted }}>Help the community by sharing high-quality tutorials, docs, or tools.</p>

      {message && (
        <div
          className="p-4 mb-6 rounded-lg border"
          style={message.type === 'success'
            ? { background: theme.accentSoftBg, color: theme.accentText, borderColor: theme.accentBorder }
            : { background: 'rgba(239,68,68,0.1)', color: '#F87171', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.body }}>Resource Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full rounded-lg px-4 py-3 outline-none transition-colors"
            style={fieldStyle}
            placeholder="e.g., The Complete Guide to Next.js"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.body }}>URL / Link</label>
          <input
            type="url"
            required
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            className="w-full rounded-lg px-4 py-3 outline-none transition-colors"
            style={fieldStyle}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.body }}>Resource Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full rounded-lg px-4 py-3 outline-none transition-colors"
            style={fieldStyle}
          >
            <option value="course">Course</option>
            <option value="video">Video</option>
            <option value="doc">Documentation</option>
            <option value="practice">Practice / Interactive</option>
            <option value="project">Project Tutorial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.body }}>Short Description</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full rounded-lg px-4 py-3 outline-none transition-colors resize-none"
            style={fieldStyle}
            placeholder="Why is this resource helpful?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          style={{ background: theme.accentText, color: theme.bgBase }}
        >
          {loading ? 'Submitting...' : 'Submit Resource'}
        </button>
      </form>
    </div>
  );
}
