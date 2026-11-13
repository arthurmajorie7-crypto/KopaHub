import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/groups')
      .then((response) => setGroups(response.data.groups))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Groups</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Community groups</h2>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-premium hover:bg-blue-700">
          + Create group
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
              <span className="badge badge-success">{group.status}</span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Members</span>
                <strong className="text-slate-900">{group.members}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pool</span>
                <strong className="text-slate-900">KSh {group.pool.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Admin</span>
                <strong className="text-slate-900">{group.admin}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
