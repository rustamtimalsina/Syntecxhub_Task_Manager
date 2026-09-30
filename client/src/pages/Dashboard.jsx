import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext.jsx';

const EMPTY = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };
const STATUS = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tasks').then((res) => setTasks(res.data));
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Give the task a title.');
    const body = { ...form, dueDate: form.dueDate || null };
    try {
      if (editingId) {
        const { data } = await api.put(`/tasks/${editingId}`, body);
        setTasks(tasks.map((t) => (t._id === editingId ? data : t)));
      } else {
        const { data } = await api.post('/tasks', body);
        setTasks([data, ...tasks]);
      }
      setForm(EMPTY);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const edit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
  };

  const changeStatus = async (t, status) => {
    const { data } = await api.put(`/tasks/${t._id}`, { ...t, status });
    setTasks(tasks.map((x) => (x._id === t._id ? data : x)));
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    await api.delete(`/tasks/${t._id}`);
    setTasks(tasks.filter((x) => x._id !== t._id));
  };

  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="page">
      <header className="top">
        <h1>Tasks</h1>
        <div>
          {user.name} <button onClick={logout}>Log out</button>
        </div>
      </header>

      <form className="box" onSubmit={submit}>
        <h2>{editingId ? 'Edit task' : 'New task'}</h2>
        {error && <p className="error">{error}</p>}
        <input placeholder="Title" value={form.title} onChange={set('title')} />
        <textarea placeholder="Notes" rows={2} value={form.description} onChange={set('description')} />
        <div className="row">
          <select value={form.status} onChange={set('status')}>
            {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={form.priority} onChange={set('priority')}>
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input type="date" value={form.dueDate} onChange={set('dueDate')} />
        </div>
        <div className="row">
          <button>{editingId ? 'Save changes' : 'Add task'}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>
          )}
        </div>
      </form>

      <div className="row filters">
        {['all', 'todo', 'in-progress', 'done'].map((f) => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : STATUS[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 && <p>No tasks here yet.</p>}

      {visible.map((t) => (
        <div key={t._id} className={`task ${t.priority} ${t.status === 'done' ? 'done' : ''}`}>
          <div>
            <h3>{t.title}</h3>
            {t.description && <p>{t.description}</p>}
            <small>
              {t.priority} priority{t.dueDate && ` · due ${new Date(t.dueDate).toLocaleDateString()}`}
            </small>
          </div>
          <div className="row">
            <select value={t.status} onChange={(e) => changeStatus(t, e.target.value)}>
              {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={() => edit(t)}>Edit</button>
            <button onClick={() => remove(t)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}