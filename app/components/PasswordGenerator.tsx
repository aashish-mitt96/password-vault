'use client';

import { useState } from 'react';

interface Props { onGenerate: (pwd: string) => void }

export default function PasswordGenerator({ onGenerate }: Props) {
  const [length, setLength] = useState(16);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [generatedPwd, setGeneratedPwd] = useState('');

  const generate = () => {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'; 
    const nums = '0123456789';
    const syms = '!@#$%^&*()-_=+[]{};:,.<>?';
    const pool = chars + (numbers ? nums : '') + (symbols ? syms : '');
    if (pool.length === 0) return;
    
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += pool[Math.floor(Math.random() * pool.length)];
    }

    setGeneratedPwd(pwd);
    onGenerate(pwd); 
  };

  return (
    <div className="border p-4 rounded space-y-3 max-w-md mx-auto">
      <h2 className="font-bold text-lg">Password Generator</h2>

      {/* Password Length Slider */}
      <div className="flex items-center space-x-2">
        <label>Length: {length}</label>
        <input type="range" min={8} max={32} value={length} onChange={(e) => setLength(Number(e.target.value))} />
      </div>

      {/* Checkboxes for options */}
      <div className="flex space-x-4">
        <label>
          <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} />
          {' '}
          Numbers
        </label>
        <label>
          <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
          {' '}
          Symbols
        </label>
      </div>

      {/* Generate Button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={generate}
      >
        Generate
      </button>

      {/* Display generated password */}
      {generatedPwd && (
        <div className="mt-2 p-2 bg-gray-100 rounded break-all">{generatedPwd}</div>
      )}
    </div>
  );
}
