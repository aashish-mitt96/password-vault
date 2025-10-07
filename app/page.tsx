'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordGenerator from './components/PasswordGenerator';
import VaultForm from './components/VaultForm';
import VaultList from './components/VaultList';

interface VaultItem {
  _id: string;
  ciphertext: string;
  iv: string;
  salt: string;
}

export default function HomePage() {
  const router = useRouter();

  const [vault, setVault] = useState<VaultItem[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVault = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/vault', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const data = await res.json();
      setVault(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchVault();
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      {/* Header: Title + Logout */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="mt-2 pl-6 text-3xl font-bold">🛡️Password Vault</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Panel 1 — Password Generator */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4 border h-[600px] flex flex-col">
          <h2 className="text-lg font-semibold border-b pb-2">🔐 Password Generator</h2>
          <div className="flex-1 overflow-y-auto">
            <PasswordGenerator onGenerate={setGeneratedPassword} />
            {generatedPassword && (
              <div className="border p-3 rounded bg-gray-100 text-sm mt-2">
                <strong>Generated Password:</strong> {generatedPassword}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2 — Vault Form */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4 border h-[600px] flex flex-col">
          <h2 className="text-lg font-semibold border-b pb-2">➕ Add New Vault Item</h2>
          <div className="flex-1 overflow-y-auto">
            <VaultForm
              password={userPassword}
              onAdd={fetchVault}
              generatedPassword={generatedPassword}
            />
          </div>
        </div>

        {/* Panel 3 — Vault List */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4 border h-[600px] flex flex-col">
          <h2 className="text-lg font-semibold border-b pb-2">💼 Your Vault</h2>
          <div className="flex-1 overflow-y-auto">
            <VaultList
              items={vault}
              password={userPassword}
              onRefresh={fetchVault}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
