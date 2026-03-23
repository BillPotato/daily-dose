"use client";

// components/auth/SignUp.jsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

type SignUpFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        name: formData.name,
        email: formData.email
      }));
      localStorage.setItem('tasks', JSON.stringify([]));
      localStorage.setItem('surveys', JSON.stringify([]));
      // Use window.location to avoid React Router navigation issues
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-stone-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#252A27] rounded-2xl shadow-xl p-8 w-full max-w-md border border-stone-200 dark:border-white/15">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-[#F1F3F2] mb-2">Create Account</h1>
          <p className="text-stone-600 dark:text-[#D9DDDC]">Join Daily Dose today</p>
        </div>

        {error && (
          <div className="bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-white/15 text-stone-700 dark:text-[#D9DDDC] px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-[#D9DDDC] mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-stone-300 dark:border-white/15 rounded-lg focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition bg-white dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2] placeholder-stone-500 dark:placeholder-stone-400"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-[#D9DDDC] mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-stone-300 dark:border-white/15 rounded-lg focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition bg-white dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2] placeholder-stone-500 dark:placeholder-stone-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-[#D9DDDC] mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-stone-300 dark:border-white/15 rounded-lg focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition bg-white dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2] placeholder-stone-500 dark:placeholder-stone-400"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-[#D9DDDC] mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-stone-300 dark:border-white/15 rounded-lg focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition bg-white dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2] placeholder-stone-500 dark:placeholder-stone-400"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 dark:disabled:bg-stone-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-stone-600 dark:text-[#D9DDDC]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-800 font-semibold dark:text-emerald-300 dark:hover:text-emerald-200">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
