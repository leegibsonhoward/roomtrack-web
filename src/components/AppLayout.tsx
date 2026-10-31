import { Link, Outlet } from "react-router";

function AppLayout() {
  return (
    <>
      <header className="app-header">
        <Link to="/dashboard" className="app-logo">
          RoomTrack
        </Link>

        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/me">My Account</Link>
        </nav>
      </header>

      <Outlet />
    </>
  );
}

export default AppLayout;