import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AdminPage() {
  const [summary, setSummary] = useState({ members: 0, groups: 0, loans: 0, payments: 0 });

  useEffect(() => {
    api.get('/admin').then((response) => setSummary(response.data.summary));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Admin</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Admin overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Users', value: summary.members },
          { label: 'Groups', value: summary.groups },
          { label: 'Loans', value: summary.loans },
          { label: 'Payments', value: summary.payments },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold text-slate-900">Audit log</h3>
        <div className="mt-4 space-y-3">
          {[
            'Loan request for Grace Wanjiku approved by Patrick Kariuki',
            'Group savings batch processed for Nairobi Hustlers',
            'Manual payment approved for Aisha Wanjiku',
          ].map((log) => (
            <div key={log} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
