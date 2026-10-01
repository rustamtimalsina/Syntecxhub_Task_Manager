import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
  e.preventDefault();
  setError('');
  if (!isLogin && !form.name.trim()) return setError('Enter your name.');
  if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
  if (form.password.length < 6) return setError('Password must be at least 6 characters.');
  setLoading(true);
  try {
    if (isLogin) await login(form.email, form.password);
    else await register(form.name, form.email, form.password);
    navigate('/');
  } catch (err) {
    setError(err.response?.data?.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="auth">
      <section className="auth-art">
        <div className="brand">Lanes</div>
        <h2 className="art-title">Get it out of your head.</h2>
        <div className="slips" aria-hidden="true">
          <div className="slip s1">Ship the API<small>High priority</small></div>
          <div className="slip s2">Design the dashboard<small>Due Friday</small></div>
          <div className="slip s3">Write the README<small>Done</small></div>
        </div>
      </section>

      <section className="auth-side">
        <ThemeToggle className="btn-plain theme-float" />
        <form className="auth-card" onSubmit={submit}>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="muted">{isLogin ? 'Log in to see your lanes.' : 'Start sorting your tasks into lanes.'}</p>
          {error && <p className="alert">{error}</p>}
          {!isLogin && (
            <label>Name<input value={form.name} onChange={set('name')} /></label>
          )}
          <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
          <label>Password<input type="password" value={form.password} onChange={set('password')} /></label>
          <button className="btn-main" disabled={loading}>
  {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
</button>
          <p className="muted">
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}