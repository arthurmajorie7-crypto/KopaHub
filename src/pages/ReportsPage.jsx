import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState({ monthly: [], summary: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports')
      .then((response) => setReports(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Performance insights</h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Export PDF</button>
          <button className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Export Excel</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Savings report', value: `KSh ${reports.summary?.savings?.toLocaleString() ?? 0}` },
          { label: 'Loan report', value: `KSh ${reports.summary?.loans?.toLocaleString() ?? 0}` },
          { label: 'Payment report', value: `KSh ${reports.summary?.payments?.toLocaleString() ?? 0}` },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-cell text-left font-semibold text-slate-700">Month</th>
              <th className="table-cell text-left font-semibold text-slate-700">Savings</th>
              <th className="table-cell text-left font-semibold text-slate-700">Loans</th>
              <th className="table-cell text-left font-semibold text-slate-700">Payments</th>
            </tr>
          </thead>
          <tbody>
            {(reports.monthly ?? []).map((month) => (
              <tr key={month.month}>
                <td className="table-cell">{month.month}</td>
                <td className="table-cell">KSh {month.savings.toLocaleString()}</td>
                <td className="table-cell">KSh {month.loans.toLocaleString()}</td>
                <td className="table-cell">KSh {month.payments.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
