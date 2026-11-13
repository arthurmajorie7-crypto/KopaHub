import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/loans')
      .then((response) => setLoans(response.data.loans))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading loans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Loans</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Loan overview</h2>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-premium hover:bg-blue-700">
          + Request loan
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loans.map((loan) => (
          <div key={loan.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{loan.member}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">KSh {loan.amount.toLocaleString()}</h3>
              </div>
              <span className={`badge ${loan.status === 'Approved' ? 'badge-success' : loan.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                {loan.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Interest</span>
                <strong>{loan.interestRate}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Due</span>
                <strong>{loan.dueDate}</strong>
              </div>
              <div className="flex justify-between">
                <span>Balance</span>
                <strong>KSh {loan.balance.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
