'use client';
import { useState, useEffect } from 'react';
import { decryptJSON, encryptJSON } from '../utils/cryptoClient';

interface VaultItem {
  _id: string;
  ciphertext: string;
  iv: string;
  salt: string;
}

interface DecryptedItem {
  title: string;
  username: string;
  password: string;
  url?: string;
}

interface Props {
  items: VaultItem[];
  password: string;
  onRefresh: () => void;
}

export default function VaultList({ items, password, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [decryptedItems, setDecryptedItems] = useState<{ [key: string]: DecryptedItem }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DecryptedItem>({
    title: '',
    username: '',
    password: '',
    url: '',
  });

  // Auto-decrypt items for search
  useEffect(() => {
    if (!search.trim()) return;

    const decryptForSearch = async () => {
      await Promise.all(
        items.map(async (item) => {
          setDecryptedItems(prev => {
            if (prev[item._id]) return prev; // already decrypted
            decryptJSON(item.ciphertext, item.iv, item.salt, password)
              .then(data => {
                setDecryptedItems(prev2 => ({ ...prev2, [item._id]: data }));
              })
              .catch(err => console.warn(`Failed to decrypt item ${item._id}:`, err));
            return prev;
          });
        })
      );
    };

    decryptForSearch();
  }, [search, items, password]);

  // Decrypt single item manually
  const decryptItem = async (item: VaultItem) => {
    try {
      const data = await decryptJSON(item.ciphertext, item.iv, item.salt, password);
      setDecryptedItems(prev => ({ ...prev, [item._id]: data }));
    } catch (err) {
      console.error('Failed to decrypt item', item._id, err);
      alert('Failed to decrypt this item. Possibly wrong password.');
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      await fetch('/api/vault', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ id }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to delete item', id, err);
      alert('Failed to delete item.');
    }
  };

  // Copy password to clipboard
  const copyPassword = (password: string, id: string) => {
    navigator.clipboard.writeText(password)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => {
          if (document.hasFocus()) {
            navigator.clipboard.writeText('').catch(() => console.warn('Failed to clear clipboard'));
          }
          setCopiedId(null);
        }, 10000);
      })
      .catch(err => console.error('Failed to copy password', err));
  };

  // Filtered list for search
  const filtered = items.filter(item => {
    const data = decryptedItems[item._id];
    if (!search.trim()) return true;
    if (!data) return false;
    return (
      data.title.toLowerCase().includes(search.toLowerCase()) ||
      data.username.toLowerCase().includes(search.toLowerCase()) ||
      (data.url?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  });

  const formatURL = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  // Start editing
  const startEdit = (id: string) => {
    const data = decryptedItems[id];
    if (!data) return alert('Decrypt the item first to edit.');
    setEditingItem(id);
    setEditForm({ ...data });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save edited item
  const saveEdit = async () => {
    if (!editingItem) return;
    try {
      // Type-cast to satisfy encryptJSON
      const { ciphertext, iv, salt } = await encryptJSON(editForm as unknown as Record<string, unknown>, password);
      await fetch('/api/vault', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ id: editingItem, ciphertext, iv, salt }),
      });
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to save edited item', editingItem, err);
      alert('Failed to save changes.');
    }
  };

  return (
    <div className="border p-4 rounded space-y-4">
      <input
        className="border p-2 w-full rounded"
        placeholder="Search by title, username, or URL..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="max-h-[400px] overflow-y-auto space-y-2 scrollbar-hide">
        {filtered.map(item => {
          const data = decryptedItems[item._id];
          return (
            <div
              key={item._id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center border-b py-2"
            >
              <div className="flex-1 space-y-1">
                <div className="font-semibold">{data?.title || '••••••'}</div>
                <div className="text-sm text-gray-600">{data?.username || '••••••'}</div>
                {data?.url && (
                  <a
                    href={formatURL(data.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm"
                  >
                    {data.url}
                  </a>
                )}
              </div>

              <div className="flex space-x-2 mt-2 md:mt-0">
                {!data ? (
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() => decryptItem(item)}
                  >
                    View
                  </button>
                ) : (
                  <>
                    <button
                      className={`px-2 py-1 rounded ${copiedId === item._id
                        ? 'bg-gray-400 text-black'
                        : 'bg-green-600 text-white'
                        }`}
                      onClick={() => copyPassword(data.password, item._id)}
                    >
                      {copiedId === item._id ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => startEdit(item._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => deleteItem(item._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded p-4 w-80 space-y-2">
            <h3 className="text-lg font-bold text-center">Edit Vault Item</h3>

            <input
              className="border p-2 w-full rounded"
              placeholder="Title"
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Username"
              name="username"
              value={editForm.username}
              onChange={handleEditChange}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="Password"
              name="password"
              value={editForm.password}
              onChange={handleEditChange}
            />
            <input
              className="border p-2 w-full rounded"
              placeholder="URL"
              name="url"
              value={editForm.url || ''}
              onChange={handleEditChange}
            />

            <div className="flex justify-between pt-2">
              <button
                className="bg-gray-400 text-black px-3 py-1 rounded"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Hide scrollbar for all browsers */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
