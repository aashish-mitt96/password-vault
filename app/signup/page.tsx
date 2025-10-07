'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.push('/');
    } else setError(data.error);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 overflow-hidden p-4">
      <div className="w-full max-w-md bg-white border rounded-xl shadow p-6 space-y-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-center">Signup</h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <input
          type="email"
          className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="bg-green-600 text-white px-4 py-3 w-full rounded hover:bg-green-700 transition"
        >
          Signup
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
