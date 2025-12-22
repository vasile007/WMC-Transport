import { NavLink } from 'react-router-dom';

export default function SideNavDriver() {
  const base = 'block px-3 py-2 rounded-md text-sm font-medium';
  const idle = 'text-gray-600 hover:text-slate-900 hover:bg-gray-100';
  const active = 'text-blue-700 bg-blue-50 border border-blue-200';
  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="bg-white border border-slate-200 rounded-xl p-3 sticky top-20 shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
        <div className="text-xs uppercase text-gray-500 px-2 mb-2">Driver</div>
        <NavLink to="/driver" className={({isActive})=>`${base} ${isActive?active:idle}`}>Dashboard</NavLink>
      </div>
    </aside>
  );
}
