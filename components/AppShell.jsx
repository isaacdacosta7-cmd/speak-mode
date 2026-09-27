import Link from 'next/link';
import Brand from '@/components/Brand';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  ['⌂', 'Home', '/dashboard'],
  ['▶', 'Train', '/train'],
  ['●', 'Speak', '/speak'],
  ['✦', 'Phrases', '/phrases'],
  ['◉', 'Live', '/live'],
  ['◎', 'Profile', '/profile'],
];

function initials(name, email) {
  const source = name?.trim() || email?.trim() || 'SM';
  const words = source.split(/\s+/).filter(Boolean);
  const value = words.length > 1
    ? `${words[0][0]}${words[1][0]}`
    : source.slice(0, 2);

  return value.toUpperCase();
}

function readableMode(mode) {
  if (!mode) return 'PLACEMENT PENDING';
  return mode.replaceAll('_', ' ');
}

export default function AppShell({ children, user }) {
  const mode = readableMode(user?.placementMode);
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Student';
  const visibleNav = ['coach', 'admin'].includes(user?.role)
    ? [...navItems, ['◇', 'Coach', '/coach/live']]
    : navItems;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand"><Brand /></Link>

        <nav className="sidebar-nav">
          {visibleNav.map(([icon, label, href]) => (
            <Link href={href} key={href} className="nav-link">
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-level">
            <span className="tiny-label">CURRENT MODE</span>
            <strong>{mode}</strong>
            <span>{user?.placementScore == null ? 'Take your placement test' : `Score · ${user.placementScore}/100`}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">SPEAK MODE</span>
            <span className="topbar-status"><i /> Training active</span>
          </div>

          <Link href="/profile" className="profile-chip">
            <div className="avatar">{initials(user?.fullName, user?.email)}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{mode}</span>
            </div>
          </Link>
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
