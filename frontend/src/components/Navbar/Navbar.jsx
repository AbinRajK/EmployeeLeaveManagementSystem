import useAuth from "../../hooks/useAuth";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>ELMS</h2>
      </div>
      <div className="navbar-right">
        <span className="user-name">{user?.name}</span>
        <span className="user-role">({user?.role})</span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;