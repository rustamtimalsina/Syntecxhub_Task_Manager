import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 340, margin: '80px auto', display: 'grid', gap: 12 }}>
      <h1>{isLogin ? 'Log in' : 'Create account'}</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!isLogin && <input placeholder="Name" value={form.name} onChange={set('name')} />}
      <input placeholder="Email" type="email" value={form.email} onChange={set('email')} />
      <input placeholder="Password" type="password" value={form.password} onChange={set('password')} />
      <button>{isLogin ? 'Log in' : 'Register'}</button>
      <p>
        {isLogin ? 'New here? ' : 'Have an account? '}
        <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Register' : 'Log in'}</Link>
      </p>
    </form>
  );
}