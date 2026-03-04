import { useState } from 'react';
import api from '../services/api';
import { User, FileText, Camera, ArrowRight, LogOut } from 'lucide-react';

export default function CompleteProfile({ user, onComplete, onLogout }) {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.put('/api/users/profile', { name, bio, profilePicUrl });
            onComplete(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-primary/20 z-50 fixed inset-0">
            <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 animate-slide-up">
                <div className="p-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <User size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Complete Your Profile</h2>
                    <p className="text-gray-500 text-base mb-8">Before you can access the dashboard, we need a few details to personalize your experience.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 pl-11 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="e.g. Jane Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Author Bio</label>
                            <div className="relative">
                                <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 pl-11 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                                    placeholder="Tell your readers a bit about yourself..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Profile Picture URL (Optional)</label>
                            <div className="relative">
                                <Camera size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="url"
                                    value={profilePicUrl}
                                    onChange={(e) => setProfilePicUrl(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 pl-11 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? 'Saving Profile...' : 'Complete Setup'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={onLogout}
                            className="text-gray-500 hover:text-gray-900 font-semibold text-sm flex items-center gap-2 transition-colors"
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
