import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import { useAuth } from '../AuthContext.jsx';

const EMPTY = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };
const LANES = [
  { key: 'todo', label: 'To do' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tasks').then((res) => setTasks(res.data));
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    setError('');
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  // Moves a task to another lane. The screen updates first, then the server;
  // if the server fails, the old state comes back.
  const updateStatus = async (task, status) => {
    const before = tasks;
    setTasks(tasks.map((t) => (t._id === task._id ? { ...t, status } : t)));
    try {
      await api.put(`/tasks/${task._id}`, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        status,
      });
    } catch {
      setTasks(before);
    }
  };

  const move = (t, direction) => {
    const index = LANES.findIndex((l) => l.key === t.status) + direction;
    if (index < 0 || index >= LANES.length) return;
    updateStatus(t, LANES[index].key);
  };

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return; // dropped outside any lane
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || task.status === destination.droppableId) return;
    updateStatus(task, destination.droppableId);
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    await api.delete(`/tasks/${t._id}`);
    setTasks(tasks.filter((x) => x._id !== t._id));
  };

  const today = new Date(new Date().toDateString());
  const isOverdue = (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < today;
  const overdueCount = tasks.filter(isOverdue).length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <>
      <header className="app-top">
        <div className="brand">Lanes</div>
        <div className="who">
          <span>{user.name}</span>
          <button className="chip-btn" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="wrap">
        <div className="hero">
          <div>
            <h1>Your lanes</h1>
            <div className="stats">
              <span className="stat"><b>{tasks.length}</b>total</span>
              <span className="stat"><b>{doneCount}</b>done</span>
              <span className={`stat ${overdueCount ? 'warn' : ''}`}><b>{overdueCount}</b>overdue</span>
            </div>
          </div>
          {!showForm && <button className="btn-main" onClick={openNew}>+ New task</button>}
        </div>

        {showForm && (
          <form className="composer" onSubmit={submit}>
            <h2>{editingId ? 'Edit task' : 'New task'}</h2>
            {error && <p className="form-error">{error}</p>}
            <label>Title<input value={form.title} onChange={set('title')} maxLength={120} /></label>
            <label>Notes<textarea rows={2} value={form.description} onChange={set('description')} /></label>
            <div className="form-row">
              <label>Lane
                <select value={form.status} onChange={set('status')}>
                  {LANES.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </label>
              <label>Priority
                <select value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>Due date<input type="date" value={form.dueDate} onChange={set('dueDate')} /></label>
            </div>
            <div className="form-actions">
              <button className="btn-main">{editingId ? 'Save changes' : 'Add task'}</button>
              <button type="button" className="btn-plain" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="lanes">
            {LANES.map((lane, laneIndex) => {
              const items = tasks.filter((t) => t.status === lane.key);
              return (
                <section key={lane.key} className={`lane ${lane.key}`}>
                  <div className="lane-head">
                    <h2>{lane.label}</h2>
                    <span className="count">{items.length}</span>
                  </div>

                  <Droppable droppableId={lane.key}>
                    {(drop, dropSnap) => (
                      <div
                        ref={drop.innerRef}
                        {...drop.droppableProps}
                        className={`drop-zone ${dropSnap.isDraggingOver ? 'over' : ''}`}
                      >
                        {items.length === 0 && !dropSnap.isDraggingOver && (
                          <div className="lane-empty">Drop a task here</div>
                        )}

                        {items.map((t, index) => (
                          <Draggable key={t._id} draggableId={t._id} index={index}>
                            {(drag, dragSnap) => (
                              <article
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className={`card ${t.priority} ${t.status === 'done' ? 'finished' : ''} ${dragSnap.isDragging ? 'dragging' : ''}`}
                              >
                                <h3>{t.title}</h3>
                                {t.description && <p>{t.description}</p>}
                                <div className="tags">
                                  <span className="tag">{t.priority}</span>
                                  {t.dueDate && (
                                    <span className={`tag ${isOverdue(t) ? 'late' : ''}`}>
                                      {isOverdue(t) ? 'Overdue · ' : 'Due '}
                                      {new Date(t.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <div className="card-actions">
                                  {laneIndex > 0 && <button className="mini" onClick={() => move(t, -1)}>←</button>}
                                  {laneIndex < LANES.length - 1 && <button className="mini" onClick={() => move(t, 1)}>→</button>}
                                  <button className="mini" onClick={() => edit(t)}>Edit</button>
                                  <button className="mini del" onClick={() => remove(t)}>Delete</button>
                                </div>
                              </article>
                            )}
                          </Draggable>
                        ))}
                        {drop.placeholder}
                      </div>
                    )}
                  </Droppable>
                </section>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}