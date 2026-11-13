import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function LoginPage() {
  const [token, setToken] = useState(localStorage.getItem('kopahub_token') || sessionStorage.getItem('kopahub_token') || '');

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  return <div className="text-slate-500">API ready</div>;
}
