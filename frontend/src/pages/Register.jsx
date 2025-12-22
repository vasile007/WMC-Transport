import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await register(name, email, password, role);
      navigate(`/${res.role}-dashboard`, { replace: true });
    } catch (e) {
      setError(e.message || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 card fade-in">
      <h1 className="title">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="client">Client</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full">Create account</button>
      </form>
      <p className="mt-3 text-sm">
        Have an account? <Link className="text-blue-600 hover:underline" to="/login">Login</Link>
      </p>
    </div>
  );
}


