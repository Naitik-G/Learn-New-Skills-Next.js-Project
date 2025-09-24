'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();


  const [displayName, setDisplayName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        const name =
          (data.user?.user_metadata?.full_name as string) ||
          (data.user?.user_metadata?.name as string) ||
          data.user?.email;

        setDisplayName(name ?? 'Guest');
      }
    };

    fetchUser();
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const { error } = await supabase.auth.updateUser({
      data: { full_name: newName },
    });

    if (error) {
      alert(error.message);
    } else {
      setDisplayName(newName);
      setNewName('');
      alert('Display name updated successfully!');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold">Welcome, {displayName}</h1>
      

      {!displayName?.includes('@') && displayName !== 'Guest' ? null : (
        <form onSubmit={handleSaveName} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter display name"
            className="border p-2 rounded"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Save
          </button>
        </form>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
