import React, { useEffect, useMemo, useState } from 'react'

const starterTasks = [
  { id: 1, title: 'Map the onboarding journey', project: 'Northstar', priority: 'High', status: 'In progress', due: 'Sep 24', tag: 'Research', accent: 'coral' },
  { id: 2, title: 'Polish the empty states', project: 'TaskForge', priority: 'Medium', status: 'In progress', due: 'Sep 26', tag: 'Design', accent: 'mint' },
  { id: 3, title: 'Set up production monitoring', project: 'Launchpad', priority: 'Low', status: 'To do', due: 'Sep 29', tag: 'Engineering', accent: 'blue' },
  { id: 4, title: 'Review Q3 customer themes', project: 'Northstar', priority: 'High', status: 'Done', due: 'Sep 20', tag: 'Strategy', accent: 'yellow' },
  { id: 5, title: 'Write the release notes', project: 'TaskForge', priority: 'Medium', status: 'To do', due: 'Oct 01', tag: 'Content', accent: 'purple' },
  { id: 6, title: 'QA the mobile navigation', project: 'Launchpad', priority: 'High', status: 'To do', due: 'Oct 03', tag: 'Engineering', accent: 'blue' },
]

const storageKey = 'taskforge-tasks'

function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem(storageKey)) || starterTasks)
  const [activeView, setActiveView] = useState('Overview')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All tasks')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  }, [tasks])

  const counts = useMemo(() => ({
    total: tasks.length,
    progress: tasks.filter((task) => task.status === 'In progress').length,
    done: tasks.filter((task) => task.status === 'Done').length,
    due: tasks.filter((task) => task.status !== 'Done').length,
  }), [tasks])

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesView = activeView === 'Overview' || (activeView === 'Today' ? task.due === 'Sep 20' : task.project === activeView)
    const matchesFilter = filter === 'All tasks' || task.status === filter
    const search = `${task.title} ${task.project} ${task.tag}`.toLowerCase()
    return matchesView && matchesFilter && search.includes(query.toLowerCase())
  }), [tasks, activeView, filter, query])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function saveTask(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const task = {
      id: editingTask?.id || Date.now(),
      title: form.get('title'), project: form.get('project'), priority: form.get('priority'),
      status: form.get('status'), due: form.get('due'), tag: form.get('tag'), accent: editingTask?.accent || 'mint',
    }
    setTasks((current) => editingTask ? current.map((item) => item.id === editingTask.id ? task : item) : [task, ...current])
    setShowModal(false)
    setEditingTask(null)
    notify(editingTask ? 'Task updated' : 'Task created')
  }

  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    notify('Task removed')
  }

  function cycleStatus(task) {
    const next = task.status === 'To do' ? 'In progress' : task.status === 'In progress' ? 'Done' : 'To do'
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: next } : item))
  }

  const pageTitle = activeView === 'Overview' ? 'Good morning, Rajib' : activeView
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">tf</span><span>taskforge</span></div>
        <button className="workspace-switcher"><span className="workspace-dot" /> Rajib&apos;s workspace <span className="chevron">⌄</span></button>
        <nav className="main-nav" aria-label="Main navigation">
          {['Overview', 'Today', 'Northstar', 'TaskForge', 'Launchpad'].map((item, index) => (
            <button key={item} className={`nav-item ${activeView === item ? 'active' : ''}`} onClick={() => setActiveView(item)}>
              <span className="nav-icon">{['⌂', '◷', '✦', '▦', '↗'][index]}</span>{item}
              {item === 'Today' && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><span className="nav-icon">⚙</span>Settings</button>
          <div className="upgrade-card"><span className="spark">✦</span><strong>Make room for bigger ideas.</strong><small>You&apos;re using 68% of your workspace.</small><button onClick={() => notify('Upgrade flow ready for your next release')}>Explore plans <span>→</span></button></div>
          <div className="user-row"><div className="avatar">RC</div><div><strong>Rajib Chandra</strong><small>Free plan</small></div><button className="more-button" onClick={() => setProfileOpen(!profileOpen)}>•••</button></div>
          {profileOpen && <div className="profile-menu"><button onClick={() => notify('Profile settings opened')}>Profile settings</button><button onClick={() => notify('You are already signed in')}>Sign out</button></div>}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="crumb"><span>Workspace</span><b>/</b><span className="current">{activeView}</span></div><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => notify('You are all caught up')}>♢<i /></button><button className="help-button" onClick={() => notify('Shortcuts: N creates a task, / focuses search')}>?</button><div className="mini-avatar">RC</div></div></header>
        <section className="content-wrap">
          <div className="welcome-row"><div><p className="eyebrow">Sunday, September 20, 2026</p><h1>{pageTitle}</h1><p className="subheading">Here&apos;s what&apos;s happening across your projects.</p></div><button className="primary-button" onClick={() => { setEditingTask(null); setShowModal(true) }}><span>+</span> New task</button></div>
          <div className="stats-row"><div className="stat-card"><span className="stat-label">All tasks</span><strong>{counts.total}</strong><small><span className="trend up">↗ 12%</span> vs last week</small></div><div className="stat-card"><span className="stat-label">In progress</span><strong>{counts.progress}</strong><small><span className="trend neutral">→ 4%</span> vs last week</small></div><div className="stat-card"><span className="stat-label">Completed</span><strong>{counts.done}</strong><small><span className="trend up">↗ 28%</span> vs last week</small></div><div className="stat-card focus-stat"><div><span className="stat-label">Focus score</span><strong>82%</strong><small><span className="trend up">↗ 8%</span> this week</small></div><div className="ring"><span>82</span></div></div></div>
          <div className="section-heading"><div><h2>{activeView === 'Overview' ? 'Your tasks' : `${activeView} tasks`}</h2><span className="task-total">{visibleTasks.length} tasks</span></div><div className="view-switcher"><button className="selected">≡ List</button><button>▦ Board</button></div></div>
          <div className="toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." /></label><div className="filter-buttons">{['All tasks', 'To do', 'In progress', 'Done'].map((item) => <button key={item} className={filter === item ? 'active-filter' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="filter-icon" onClick={() => setFilter('All tasks')}>☷</button></div>
          <div className="task-list">{visibleTasks.length ? visibleTasks.map((task) => <TaskRow key={task.id} task={task} onCycle={cycleStatus} onEdit={(item) => { setEditingTask(item); setShowModal(true) }} onDelete={removeTask} />) : <div className="empty-state"><span>⌕</span><h3>No tasks found</h3><p>Try another search or create a new task.</p></div>}</div>
          <div className="list-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><div><button disabled>←</button><button className="page-active">1</button><button disabled>→</button></div></div>
        </section>
      </main>
      {showModal && <TaskModal task={editingTask} onClose={() => { setShowModal(false); setEditingTask(null) }} onSave={saveTask} />}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}

function TaskRow({ task, onCycle, onEdit, onDelete }) {
  return <article className="task-row"><button className={`status-check ${task.status === 'Done' ? 'checked' : ''}`} onClick={() => onCycle(task)} aria-label={`Mark ${task.title} status`}>{task.status === 'Done' ? '✓' : ''}</button><div className="task-main"><strong className={task.status === 'Done' ? 'completed-title' : ''}>{task.title}</strong><div className="task-meta"><span className={`project-dot ${task.accent}`} />{task.project}<span className="dot-separator">·</span><span className="tag">{task.tag}</span></div></div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><span className={`status-pill ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span><span className="due-date">{task.due}</span><div className="row-actions"><button onClick={() => onEdit(task)} aria-label="Edit task">✎</button><button onClick={() => onDelete(task.id)} aria-label="Delete task">×</button></div></article>
}

function TaskModal({ task, onClose, onSave }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal" onSubmit={onSave}><div className="modal-header"><div><p className="eyebrow">{task ? 'Edit task' : 'New task'}</p><h2>{task ? 'Shape the next step' : 'Add a task to your flow'}</h2></div><button type="button" className="close-button" onClick={onClose}>×</button></div><label>Task title<input name="title" defaultValue={task?.title} placeholder="What needs doing?" required /></label><div className="form-grid"><label>Project<select name="project" defaultValue={task?.project || 'TaskForge'}><option>TaskForge</option><option>Northstar</option><option>Launchpad</option></select></label><label>Tag<input name="tag" defaultValue={task?.tag || 'General'} /></label><label>Priority<select name="priority" defaultValue={task?.priority || 'Medium'}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status<select name="status" defaultValue={task?.status || 'To do'}><option>To do</option><option>In progress</option><option>Done</option></select></label><label>Due date<input name="due" defaultValue={task?.due || 'Oct 05'} /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{task ? 'Save changes' : 'Create task'}</button></div></form></div>
}

export default App
