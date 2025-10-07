'use client';

import { useState, useEffect } from 'react';
import { encryptJSON } from '../utils/cryptoClient';

interface Props { 
  password: string; 
  generatedPassword: string; 
  onAdd: () => void; 
}

export default function VaultForm({ password, onAdd, generatedPassword }: Props) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [vaultPassword, setVaultPassword] = useState(generatedPassword || '');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setVaultPassword(generatedPassword);
  }, [generatedPassword]);

  const submit = async () => {
    try {
      const { ciphertext, iv, salt } = await encryptJSON(
        { title, username, password: vaultPassword, url, notes },
        password
      );
      await fetch('/api/vault', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }, 
        body: JSON.stringify({ ciphertext, iv, salt }) 
      });
      setTitle(''); setUsername(''); setVaultPassword(''); setUrl(''); setNotes('');
      onAdd();
    } catch (err) {
      console.error('Failed to add vault item:', err);
      alert('Failed to add item.');
    }
  };

  return (
    <div className="border p-4 rounded space-y-3">
      <h2 className="font-bold">Add Vault Item</h2>
      <input className="border p-2 w-full" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Password" value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} />
      <input className="border p-2 w-full" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
      <textarea className="border p-2 h-28 w-full" placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={submit}>Add</button>
    </div>
  );
}
