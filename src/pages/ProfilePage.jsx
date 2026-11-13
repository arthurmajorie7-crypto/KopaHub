import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function ProfilePage() {
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    location: 'Nairobi, Kenya',
  });

  useEffect(() => {
    api.get('/profile').then((response) => {
      setForm({
        fullName: response.data.user.fullName,
        phoneNumber: response.data.user.phoneNumber,
        email: response.data.user.email,
        location: response.data.user.location,
      });
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.patch('/profile', form);
    alert('Profile updated successfully.');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Profile</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Manage account</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
        <div className="card p-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            AW
          </div>
          <p className="mt-4 text-center text-xl font-semibold text-slate-900">Aisha Wanjiku</p>
          <p className="text-center text-sm text-slate-500">Finance member</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                className="form-input"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input
                className="form-input"
                value={form.phoneNumber}
                onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="form-input"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input
                className="form-input"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </div>
          </div>

          <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
