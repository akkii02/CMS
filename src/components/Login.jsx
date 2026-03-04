import { useState } from 'react';

export default function Login({ onLogin }) {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = mode === 'login'
            ? 'https://cms-backend-csry.onrender.com/api/auth/login'
            : 'https://cms-backend-csry.onrender.com/api/auth/register';

        const body = mode === 'login'
            ? { email, password }
            : { email, password, companyName };

        try {
            console.log("url", url);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem('user', JSON.stringify(data));
                onLogin(data);
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error. Is backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center animate-fade-in w-full h-full min-h-[60vh]">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md animate-slide-up bg-surface border border-border shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-textMain tracking-tight">
                        {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                    </h2>
                    <p className="text-textMuted mt-2">
                        {mode === 'login' ? 'Enter your details to manage your blog' : 'Create your SaaS blog account'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-semibold text-textMain mb-1.5 ml-1">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-surfaceHover border border-border px-4 py-3 rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:border-primary transition-all shadow-sm"
                                placeholder="e.g. Acme Inc"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-textMain mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surfaceHover border border-border px-4 py-3 rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:border-primary transition-all shadow-sm"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-textMain mb-1.5 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surfaceHover border border-border px-4 py-3 rounded-xl text-textMain placeholder-textMuted focus:outline-none focus:border-primary transition-all shadow-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-textMuted text-sm font-medium">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="ml-2 text-primary hover:underline font-bold"
                        >
                            {mode === 'login' ? 'Create Account' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
