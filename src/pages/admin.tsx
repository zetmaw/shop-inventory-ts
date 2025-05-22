import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/list-users');
      const json = await res.json();
      if (res.ok) {
        setUsers(json.users || []);
      } else {
        console.error('Error fetching users:', json);
        setErrorMsg('⚠️ Failed to load users — check admin API.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMsg('⚠️ Unexpected error occurred while loading users.');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleAddUser() {
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      setEmail('');
      setPassword('');
      await fetchUsers();
    } else {
      const json = await res.json();
      alert(`Error: ${json.error}`);
    }
  }

  async function handleResetPassword(userId: string) {
    const user = users.find(u => u.id === userId);
    if (!user?.email) return;
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });
    const json = await res.json();
    if (!res.ok) alert(`Reset error: ${json.error}`);
    else alert(`Reset email sent to ${user.email}`);
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const json = await res.json();
    if (!res.ok) alert(`Delete error: ${json.error}`);
    else await fetchUsers();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👤 Admin Panel</h1>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">➕ Add User</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Temporary Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <button
          onClick={handleAddUser}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">👥 Existing Users</h2>
        {loadingUsers && <p className="text-gray-500 italic">Loading users...</p>}
        {errorMsg && <p className="text-red-500 italic mb-2">{errorMsg}</p>}
        {!loadingUsers && users.length === 0 && !errorMsg && (
          <p className="text-gray-600 italic">No users found.</p>
        )}
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="border p-3 rounded shadow-sm">
              <div className="font-medium">{user.email}</div>
              <div className="text-sm text-gray-600">ID: {user.id}</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleResetPassword(user.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}