// src/components/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  const linkStyle = (path: string) =>
    `px-4 py-2 rounded hover:bg-gray-100 ${
      location.pathname === path ? 'bg-gray-200 font-semibold' : ''
    }`;

  return (
    <nav className="flex items-center gap-2 px-6 py-3 bg-white border-b shadow text-sm">
      <Link to="/admin" className={linkStyle('/admin')}>Admin</Link>
      <Link to="/inventory" className={linkStyle('/inventory')}>Inventory</Link>
      <Link to="/planner" className={linkStyle('/planner')}>Guitar Planner</Link>
      <Link to="/workflow" className="hover:underline">Workflow</Link>
      <div className="flex-grow" />
      <Link to="/login" className="text-red-600 hover:underline">Log Out</Link>
    </nav>
  );
}