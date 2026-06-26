// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axios';
// import useStore from '../store/useStore';


// export default function Admin() {
//   const [challenges, setChallenges] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [tab, setTab] = useState('challenges');
//   const [form, setForm] = useState({
//     title: '', description: '', difficulty: 'beginner',
//     level_required: 1, xp_reward: 30, topic_tag: '', group_id: '',
//     test_cases: [{ input: '', expected_output: '', is_sample: true }]
//   });
//   const [message, setMessage] = useState('');
//   const { user } = useStore();
//   const navigate = useNavigate();


//   useEffect(() => {
//     if (user?.role !== 'admin') { navigate('/dashboard'); return; }
//     fetchData();
//   }, []);


//   const fetchData = async () => {
//     const [cRes, uRes, gRes] = await Promise.all([
//       api.get('/admin/challenges'),
//       api.get('/admin/users'),
//       api.get('/challenges'),
//     ]);
//     setChallenges(cRes.data);
//     setUsers(uRes.data);
//     setGroups(gRes.data);
//   };


//   const handleAddTestCase = () => {
//     setForm({ ...form, test_cases: [...form.test_cases, { input: '', expected_output: '', is_sample: false }] });
//   };


//   const handleTestCaseChange = (index, field, value) => {
//     const updated = [...form.test_cases];
//     updated[index][field] = value;
//     setForm({ ...form, test_cases: updated });
//   };


//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     try {
//       await api.post('/admin/challenges', {
//         ...form,
//         group_id: form.group_id ? parseInt(form.group_id) : null,
//         level_required: parseInt(form.level_required),
//         xp_reward: parseInt(form.xp_reward),
//       });
//       setMessage('Challenge created successfully.');
//       fetchData();
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Error creating challenge.');
//     }
//   };


//   const handleDelete = async (id) => {
//     if (!confirm('Delete this challenge?')) return;
//     await api.delete(`/admin/challenges/${id}`);
//     fetchData();
//   };


//   const handlePublishToggle = async (c) => {
//     await api.put(`/admin/challenges/${c.id}`, { ...c, is_published: c.is_published ? 0 : 1 });
//     fetchData();
//   };


//   return (
//     <div className="admin-page">
//       <button onClick={() => navigate('/dashboard')}>← Back</button>
//       <h2>⚙️ Admin Panel</h2>
//       <div className="admin-tabs">
//         <button className={tab === 'challenges' ? 'active' : ''} onClick={() => setTab('challenges')}>Challenges</button>
//         <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>Create Challenge</button>
//         <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
//       </div>


//       {tab === 'challenges' && (
//         <div className="admin-list">
//           {challenges.map(c => (
//             <div key={c.id} className="admin-item">
//               <span>{c.title}</span>
//               <span className={`difficulty ${c.difficulty}`}>{c.difficulty}</span>
//               <span>{c.is_published ? '✅ Published' : '⏸ Draft'}</span>
//               <button onClick={() => handlePublishToggle(c)}>
//                 {c.is_published ? 'Unpublish' : 'Publish'}
//               </button>
//               <button className="delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
//             </div>
//           ))}
//         </div>
//       )}


//       {tab === 'create' && (
//         <form className="admin-form" onSubmit={handleCreate}>
//           {message && <p className="form-message">{message}</p>}
//           <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
//           <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
//           <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
//             <option value="beginner">Beginner</option>
//             <option value="intermediate">Intermediate</option>
//             <option value="advanced">Advanced</option>
//           </select>
//           <select value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})}>
//             <option value="">No Group</option>
//             {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
//           </select>
//           <input type="number" placeholder="Level Required" value={form.level_required} onChange={e => setForm({...form, level_required: e.target.value})} />
//           <input type="number" placeholder="XP Reward" value={form.xp_reward} onChange={e => setForm({...form, xp_reward: e.target.value})} />
//           <input placeholder="Topic Tag" value={form.topic_tag} onChange={e => setForm({...form, topic_tag: e.target.value})} required />
//           <h4>Test Cases</h4>
//           {form.test_cases.map((tc, i) => (
//             <div key={i} className="test-case-form">
//               <input placeholder="Input (leave empty if none)" value={tc.input} onChange={e => handleTestCaseChange(i, 'input', e.target.value)} />
//               <input placeholder="Expected Output" value={tc.expected_output} onChange={e => handleTestCaseChange(i, 'expected_output', e.target.value)} required />
//               <label>
//                 <input type="checkbox" checked={tc.is_sample} onChange={e => handleTestCaseChange(i, 'is_sample', e.target.checked)} />
//                 Sample test case
//               </label>
//             </div>
//           ))}
//           <button type="button" onClick={handleAddTestCase}>+ Add Test Case</button>
//           <button type="submit">Create Challenge</button>
//         </form>
//       )}


//       {tab === 'users' && (
//         <div className="admin-list">
//           {users.map(u => (
//             <div key={u.id} className="admin-item">
//               <span>{u.display_name}</span>
//               <span>{u.email}</span>
//               <span className={u.role === 'admin' ? 'admin-badge' : ''}>{u.role}</span>
//               <span>Level {u.current_level}</span>
//               <span>{u.problems_solved} solved</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';

export default function Admin() {
  const [challenges, setChallenges] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tab, setTab] = useState('challenges');
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'beginner',
    level_required: 1, xp_reward: 30, topic_tag: '', group_id: '', solution_code: '',
    test_cases: [{ input: '', expected_output: '', is_sample: true }]
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const { user, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    const [cRes, uRes, gRes] = await Promise.all([
      api.get('/admin/challenges'),
      api.get('/admin/users'),
      api.get('/challenges'),
    ]);
    setChallenges(cRes.data);
    setUsers(uRes.data);
    setGroups(gRes.data);
  };

  const handleAddTestCase = () => {
    setForm({ ...form, test_cases: [...form.test_cases, { input: '', expected_output: '', is_sample: false }] });
  };

  const handleRemoveTestCase = (index) => {
    const updated = form.test_cases.filter((_, i) => i !== index);
    setForm({ ...form, test_cases: updated });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...form.test_cases];
    updated[index][field] = value;
    setForm({ ...form, test_cases: updated });
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', difficulty: 'beginner',
      level_required: 1, xp_reward: 30, topic_tag: '', group_id: '', solution_code: '',
      test_cases: [{ input: '', expected_output: '', is_sample: true }]
    });
    setEditingChallenge(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const selectedGroup = groups.find(g => g.id === parseInt(form.group_id));
      const autoLevel = selectedGroup ? selectedGroup.order_index : 1;
      await api.post('/admin/challenges', {
        ...form,
        group_id: form.group_id ? parseInt(form.group_id) : null,
        level_required: autoLevel,
        xp_reward: parseInt(form.xp_reward),
      });
      setMessage('Challenge created successfully! It is saved as a Draft. Click below to go publish it.');
      setMessageType('success');
      resetForm();
      fetchData();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error creating challenge.'));
      setMessageType('error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const selectedGroup = groups.find(g => g.id === parseInt(form.group_id));
      const autoLevel = selectedGroup ? selectedGroup.order_index : 1;
      await api.put(`/admin/challenges/${editingChallenge.id}`, {
        ...form,
        group_id: form.group_id ? parseInt(form.group_id) : null,
        level_required: autoLevel,
        xp_reward: parseInt(form.xp_reward),
      });
      setMessage('Challenge updated successfully! Check the Challenges tab to publish/unpublish it.');
      setMessageType('success');
      fetchData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error updating challenge.'));
      setMessageType('error');
    }
  };

  const handleEdit = (c) => {
    setEditingChallenge(c);
    setForm({
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      level_required: c.level_required,
      xp_reward: c.xp_reward,
      topic_tag: c.topic_tag,
      group_id: c.group_id || '',
      solution_code: c.solution_code || '',
      test_cases: c.test_cases?.length > 0
        ? c.test_cases.map(tc => ({ input: tc.input || '', expected_output: tc.expected_output, is_sample: !!tc.is_sample }))
        : [{ input: '', expected_output: '', is_sample: true }],
    });
    setMessage('');
    setTab('create');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this challenge? This cannot be undone.')) return;
    await api.delete(`/admin/challenges/${id}`);
    fetchData();
  };

  const handlePublishToggle = async (c) => {
    await api.put(`/admin/challenges/${c.id}`, {
      title: c.title, description: c.description, difficulty: c.difficulty,
      level_required: c.level_required, xp_reward: c.xp_reward, topic_tag: c.topic_tag,
      solution_code: c.solution_code || null, group_id: c.group_id || null,
      is_published: c.is_published ? 0 : 1
    });
    fetchData();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>⚙️ Admin Panel</h2>
        <div style={{display:'flex', gap:'0.75rem'}}>
          <button className="admin-user-btn" onClick={() => navigate('/dashboard')}>👤 View as Student</button>
          <button className="admin-user-btn" style={{background:'#ef4444'}} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'challenges' ? 'active' : ''} onClick={() => { setTab('challenges'); setMessage(''); }}>
          📋 Challenges ({challenges.length})
        </button>
        <button className={tab === 'create' ? 'active' : ''} onClick={() => { if (!editingChallenge) resetForm(); setTab('create'); setMessage(''); }}>
          ➕ {editingChallenge ? 'Edit Challenge' : 'Create Challenge'}
        </button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          👥 Users ({users.length})
        </button>
      </div>

      {tab === 'challenges' && (
        <div>
          <div className="admin-legend">
          </div>
          <div className="admin-list">
            {challenges.length === 0 && <p style={{color:'#94a3b8'}}>No challenges yet. Create one!</p>}
            {challenges.map(c => (
              <div key={c.id} className="admin-item">
                <div className="admin-item-info">
                  <span className="admin-item-title">{c.title}</span>
                  <span className={`difficulty ${c.difficulty}`}>{c.difficulty}</span>
                  <span className="admin-xp">🏆 {c.xp_reward} XP reward</span>
                  <span className={c.is_published ? 'status-published' : 'status-draft'}>
                    {c.is_published ? '✅ Published' : '⏸ Draft'}
                  </span>
                </div>
                <div className="admin-item-actions">
                  <button onClick={() => handleEdit(c)}>✏️ Edit</button>
                  <button onClick={() => handlePublishToggle(c)} className={c.is_published ? 'unpublish-btn' : 'publish-btn'}>
                    {c.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(c.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'create' && (
        <form className="admin-form" onSubmit={editingChallenge ? handleUpdate : handleCreate}>
          <h3>{editingChallenge ? `Editing: ${editingChallenge.title}` : 'Create New Challenge'}</h3>
          <label>Challenge Title *</label>
          <input placeholder="e.g. Hello World" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />

          <label>Description * (explain what the student must do)</label>
          <textarea placeholder='e.g. Print "Hello, World!" to the console.' value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />

          <label>Difficulty Level *</label>
          <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <label>Challenge Group (which group does this belong to?)</label>
          <select value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})}>
            <option value="">No Group</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <p style={{color:'#94a3b8', fontSize:'0.85rem'}}>Level requirement is set automatically based on the group (Group A = Level 1, B = Level 2, C = Level 3, and so on).</p>

          <label>XP Reward (points student earns for solving this)</label>
          <input type="number" min="10" step="10" value={form.xp_reward} onChange={e => setForm({...form, xp_reward: e.target.value})} />

          <label>Topic Tag * (e.g. basics, loops, arrays)</label>
          <input placeholder="e.g. basics" value={form.topic_tag} onChange={e => setForm({...form, topic_tag: e.target.value})} required />

          <label>Solution Code (shown to students after 3 failed attempts)</label>
          <textarea placeholder="Paste the correct Java solution here..." value={form.solution_code || ''} onChange={e => setForm({...form, solution_code: e.target.value})} style={{fontFamily:'monospace'}} />

          <h4>Test Cases *</h4>
          <p className="test-case-hint">Test cases are used to check if the student's code is correct. At least one is required. Mark the first 1-2 as "sample" so students can see them.</p>
          {form.test_cases.map((tc, i) => (
            <div key={i} className="test-case-form">
              <span className="test-case-label">Test Case {i + 1}</span>
              <input placeholder="Input (leave empty if the program needs no input)" value={tc.input} onChange={e => handleTestCaseChange(i, 'input', e.target.value)} />
              <input placeholder="Expected Output (exactly what the program should print)" value={tc.expected_output} onChange={e => handleTestCaseChange(i, 'expected_output', e.target.value)} required />
              <label style={{display:'flex', gap:'0.5rem', alignItems:'center', cursor:'pointer'}}>
                <input type="checkbox" checked={tc.is_sample} onChange={e => handleTestCaseChange(i, 'is_sample', e.target.checked)} />
                Show this test case to students (sample test case)
              </label>
              {form.test_cases.length > 1 && (
                <button type="button" onClick={() => handleRemoveTestCase(i)} style={{background:'#7f1d1d', color:'white', border:'none', borderRadius:'6px', padding:'0.3rem 0.7rem', cursor:'pointer', alignSelf:'flex-start'}}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddTestCase} style={{background:'#334155'}}>+ Add Another Test Case</button>

          <div style={{display:'flex', gap:'1rem'}}>
            <button type="submit" style={{flex:1}}>
              {editingChallenge ? 'Save Changes' : 'Create Challenge (saves as Draft)'}
            </button>
            {editingChallenge && (
              <button type="button" onClick={resetForm} style={{background:'#334155'}}>Cancel Edit</button>
            )}
          </div>
          {message && (
            <div className={messageType === 'success' ? 'form-message' : 'form-message-error'}>
              {message}
              {messageType === 'success' && (
                <button type="button" className="goto-challenges-btn" onClick={() => { setTab('challenges'); setMessage(''); }}>
                  Go to Challenges tab
                </button>
              )}
            </div>
          )}
        </form>
      )}

      {tab === 'users' && (
        <div className="admin-list">
          {users.map(u => (
            <div key={u.id} className="admin-item">
              <div className="admin-item-info">
                <span className="admin-item-title">{u.display_name}</span>
                <span style={{color:'#94a3b8'}}>{u.email}</span>
                <span className={u.role === 'admin' ? 'admin-badge' : ''}>{u.role === 'admin' ? '⚙️ Admin' : '👤 Student'}</span>
                <span>Level {u.current_level}</span>
                <span>{u.problems_solved} solved</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}