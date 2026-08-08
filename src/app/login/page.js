'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem('student', JSON.stringify(data.student));
      router.push('/dashboard');
    } else {
      setMessage(data.error);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
        <div className="absolute -top-32 -left-20 w-[30rem] h-[30rem] bg-blue-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[30rem] h-[30rem] bg-blue-200/50 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-8 left-8 z-10">
        <p className="text-xs uppercase tracking-widest text-blue-700 font-medium mb-1">
          University of Ghana
        </p>
        <h1 className="text-xl font-semibold text-slate-800 leading-snug">
          Computer Engineering Department Portal
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl shadow-black/10 w-full max-w-md mx-6"
      >
        <h2 className="text-xl font-semibold mb-1 text-gray-900">Student Login</h2>
        <p className="text-sm text-gray-500 mb-6">Welcome back &mdash; sign in to continue</p>

        <label className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block mb-1.5 text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2.5 rounded-md font-medium hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}

        <p className="mt-5 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-700 font-medium hover:underline">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}