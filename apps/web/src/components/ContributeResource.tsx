import { useState } from 'react';
import { supabase } from '../lib/supabase'; 

export default function ContributeResource() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'course', // Default value
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Insert the resource into Supabase with a status of 'pending'
      // so you can review it before it goes live to the public
      const { error } = await supabase.from('resources').insert([
        {
          title: formData.title,
          link: formData.link,
          type: formData.type,
          description: formData.description,
          status: 'pending' 
        }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Resource submitted successfully! It will appear once approved.' });
      setFormData({ title: '', link: '', type: 'course', description: '' }); // Clear form

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit resource.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-[#13161e] border border-gray-800 rounded-xl">
      <h1 className="text-3xl font-bold text-white mb-2">Contribute a Resource</h1>
      <p className="text-gray-400 mb-8">Help the community by sharing high-quality tutorials, docs, or tools.</p>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Resource Title</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            placeholder="e.g., The Complete Guide to Next.js"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">URL / Link</label>
          <input 
            type="url" 
            required
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Resource Type</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
          >
            <option value="course">Course</option>
            <option value="video">Video</option>
            <option value="doc">Documentation</option>
            <option value="practice">Practice / Interactive</option>
            <option value="project">Project Tutorial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
          <textarea 
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Why is this resource helpful?"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Resource'}
        </button>
      </form>
    </div>
  );
}
