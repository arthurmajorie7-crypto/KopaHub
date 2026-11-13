import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/payments')
      .then((response) => setPayments(response.data.payments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Payments</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Payment activity</h2>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-premium hover:bg-blue-700">
          + Add payment
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-cell text-left font-semibold text-slate-700">Member</th>
              <th className="table-cell text-left font-semibold text-slate-700">Method</th>
              <th className="table-cell text-left font-semibold text-slate-700">Amount</th>
              <th className="table-cell text-left font-semibold text-slate-700">Reference</th>
              <th className="table-cell text-left font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="table-cell">{payment.member}</td>
                <td className="table-cell">{payment.method}</td>
                <td className="table-cell">KSh {payment.amount.toLocaleString()}</td>
                <td className="table-cell">{payment.reference}</td>
                <td className="table-cell">
                  <span className={`badge ${payment.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
