import Link from 'next/link';
import Brand from '@/components/Brand';

const navItems = [
  ['⌂', 'Home', '/dashboard'],
  ['▶', 'Train', '/train'],
  ['●', 'Speak', '/speak'],
  ['✦', 'Phrases', '/phrases'],
  ['◉', 'Live', '/live'],
  ['◎', 'Profile', '/profile'],
];

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand"><Brand /></Link>
        <nav className="sidebar-nav">
          {navItems.map(([icon, label, href]) => (
            <Link href={href} key={href} className="nav-link">
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-level">
          <span className="tiny-label">CURRENT MODE</span>
          <strong>START MODE</strong>
          <span>Level 01 · Foundation</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">SPEAK MODE</span>
            <span className="topbar-status"><i /> Training active</span>
          </div>
          <div className="profile-chip">
            <div className="avatar">ID</div>
            <div><strong>Isaac</strong><span>START MODE</span></div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      <nav className="mobile-nav">
        {navItems.slice(0, 5).map(([icon, label, href]) => (
          <Link href={href} key={href} className="mobile-nav-link">
            <span>{icon}</span><small>{label}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
