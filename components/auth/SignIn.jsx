"use client";

// components/auth/SignIn.jsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (formData.email === 'test@test.com' && formData.password === 'password') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({
          name: 'Test User',
          email: formData.email
        }));
        router.push('/');
      } else {
        setError('Invalid credentials. Use: test@test.com / password');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* Header for mobile */}
      <div className="lg:hidden text-center mb-8">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-white/20 bg-emerald-800 mx-auto mb-4 flex items-center justify-center p-2">
          <img
            src="/daily_dose3.png"
            alt="Daily Dose Logo"
            className="w-full h-full object-cover transform scale-150 translate-y-2"
          />
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-[#F1F3F2]">
          DAILY DOSE
        </h1>
        <p className="text-stone-600 dark:text-[#D9DDDC] text-sm">Fuel Your Best Day</p>
      </div>

      <div className="bg-white dark:bg-[#252A27] rounded-3xl shadow-2xl p-8 border border-stone-100 dark:border-white/15">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-[#F1F3F2] mb-2">Welcome Back</h1>
          <p className="text-stone-600 dark:text-[#D9DDDC]">Sign in to your Daily Dose account</p>
        </div>

        {error && (
          <div className="bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-white/15 text-stone-700 dark:text-[#D9DDDC] px-4 py-3 rounded-xl mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-[#D9DDDC]">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-4 border border-stone-200 dark:border-white/15 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all duration-300 bg-white dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2] placeholder-stone-500 dark:placeholder-stone-400 hover:border-stone-300 dark:hover:border-white/25"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-[#D9DDDC]">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-4 border border-stone-200 dark:border-white/15 rounded-xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all duration-300 bg-white dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2] placeholder-stone-500 dark:placeholder-stone-400 hover:border-stone-300 dark:hover:border-white/25"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 dark:disabled:bg-stone-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-stone-600 dark:text-[#D9DDDC]">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-emerald-700 hover:text-emerald-800 font-semibold dark:text-emerald-300 dark:hover:text-emerald-200 transition-colors duration-200">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            <strong>Demo Credentials:</strong><br />
            test@test.com / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
