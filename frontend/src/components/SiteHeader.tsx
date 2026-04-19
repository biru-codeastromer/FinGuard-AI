import { Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function SiteHeader() {
  const location = useLocation();
  const onWorkspace = location.pathname.startsWith('/workspace');

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark" />
          FinGuard
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <a href={onWorkspace ? '/#signals' : '#signals'}>Signals</a>
          <a href={onWorkspace ? '/#workflows' : '#workflows'}>Workflows</a>
          <a href={onWorkspace ? '/#trust' : '#trust'}>Trust</a>
          <a href={onWorkspace ? '/#footer' : '#footer'}>Docs</a>
        </nav>

        <div className="nav-actions">
          <div className="search-pill">
            <Search size={16} />
            <span>Search risk flows...</span>
            <span>Ctrl K</span>
          </div>

          {!onWorkspace && (
            <Link className="button button-secondary" to="/workspace">
              Sign in
            </Link>
          )}
          <Link className="button button-primary" to="/workspace">
            {onWorkspace ? 'Workspace' : 'Open workspace'}
          </Link>
        </div>
      </div>
    </header>
  );
}
