import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const initialData = {
  welcome: 'Welcome back, Aisha',
  totalSavings: 1260000,
  activeLoans: 3,
  nextPayment: 35000,
  groupInfo: { name: 'Nairobi Hustlers', members: 28, status: 'On track' },
  recentActivity: [],
  notifications: [],
  stats: [],
};

export default function DashboardPage() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Overview</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{data.welcome}</h2>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-premium hover:bg-blue-700">
          Download summary
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Savings', value: `KSh ${data.totalSavings.toLocaleString()}`, change: '+12.4%' },
          { label: 'Active Loans', value: data.activeLoans.toString(), change: '+2 new' },
          { label: 'Next Payment', value: `KSh ${data.nextPayment.toLocaleString()}`, change: 'Due in 6 days' },
          { label: 'Group', value: data.groupInfo.name, change: `${data.groupInfo.members} members` },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">{item.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
            <span className="text-sm text-slate-500">Last 7 days</span>
          </div>

          <div className="space-y-4">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.subtitle}</p>
                </div>
                <span className="text-sm font-medium text-slate-600">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{data.notifications.length} active</span>
          </div>

          <div className="space-y-3">
            {data.notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
