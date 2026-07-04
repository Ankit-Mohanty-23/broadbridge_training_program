import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

// Decode the username out of the JWT stored in localStorage (no library needed).
function getUsernameFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '?';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || '?';
  } catch {
    return '?';
  }
}

// Which "panel" is shown inside the dropdown
const PANEL = { MENU: 'menu', CHANGE_PW: 'change_pw', CHANGE_UN: 'change_un' };

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(PANEL.MENU);
  const [username, setUsername] = useState(getUsernameFromToken);

  // change-password state
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // change-username state
  const [newUn, setNewUn] = useState('');
  const [unPw, setUnPw] = useState('');

  const [msg, setMsg] = useState({ text: '', error: false });
  const [busy, setBusy] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setPanel(PANEL.MENU);
    clearForm();
  }

  function clearForm() {
    setCurPw(''); setNewPw(''); setConfirmPw('');
    setNewUn(''); setUnPw('');
    setMsg({ text: '', error: false });
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setMsg({ text: 'New passwords do not match.', error: true });
      return;
    }
    setBusy(true);
    setMsg({ text: '', error: false });
    try {
      await client.post('/change-password', { currentPassword: curPw, newPassword: newPw });
      setMsg({ text: 'Password updated successfully.', error: false });
      clearForm();
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Something went wrong.', error: true });
    } finally {
      setBusy(false);
    }
  }

  async function handleChangeUsername(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: '', error: false });
    try {
      const { data } = await client.post('/change-username', {
        newUsername: newUn,
        currentPassword: unPw,
      });
      // Server issues a new token with the updated username
      localStorage.setItem('token', data.token);
      setUsername(newUn);
      setMsg({ text: `Username changed to "${newUn}".`, error: false });
      clearForm();
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Something went wrong.', error: true });
    } finally {
      setBusy(false);
    }
  }

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="profile-menu-wrap" ref={menuRef}>
      {/* Avatar button */}
      <button
        id="profile-avatar-btn"
        className="profile-avatar"
        onClick={() => { setOpen((o) => !o); setPanel(PANEL.MENU); clearForm(); }}
        title={username}
        aria-label="Profile menu"
      >
        {initials}
      </button>

      {open && (
        <div className="profile-dropdown" role="dialog" aria-label="Profile options">

          {/* ─── Main menu ─── */}
          {panel === PANEL.MENU && (
            <>
              <div className="profile-dropdown-header">
                <span className="profile-dropdown-name">{username}</span>
                <span className="profile-dropdown-label">Logged in</span>
              </div>
              <hr className="profile-divider" />
              <button
                id="profile-btn-change-un"
                className="profile-item"
                onClick={() => { setPanel(PANEL.CHANGE_UN); setMsg({ text: '', error: false }); }}
              >
                <span className="profile-item-icon">✎</span> Change Username
              </button>
              <button
                id="profile-btn-change-pw"
                className="profile-item"
                onClick={() => { setPanel(PANEL.CHANGE_PW); setMsg({ text: '', error: false }); }}
              >
                <span className="profile-item-icon">🔒</span> Change Password
              </button>
              <hr className="profile-divider" />
              <button id="profile-btn-logout" className="profile-item danger-item" onClick={handleLogout}>
                <span className="profile-item-icon">⏻</span> Logout
              </button>
            </>
          )}

          {/* ─── Change password panel ─── */}
          {panel === PANEL.CHANGE_PW && (
            <>
              <div className="profile-dropdown-header">
                <button className="profile-back-btn" onClick={() => { setPanel(PANEL.MENU); clearForm(); }}>← Back</button>
                <span className="profile-dropdown-label">Change Password</span>
              </div>
              <hr className="profile-divider" />
              {msg.text && <div className={msg.error ? 'profile-msg error' : 'profile-msg success'}>{msg.text}</div>}
              <form onSubmit={handleChangePassword} className="profile-form">
                <input
                  type="password"
                  placeholder="Current password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  required
                  id="profile-cur-pw"
                />
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  id="profile-new-pw"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  id="profile-confirm-pw"
                />
                <button type="submit" disabled={busy} id="profile-save-pw-btn">
                  {busy ? 'Saving…' : 'Save Password'}
                </button>
              </form>
            </>
          )}

          {/* ─── Change username panel ─── */}
          {panel === PANEL.CHANGE_UN && (
            <>
              <div className="profile-dropdown-header">
                <button className="profile-back-btn" onClick={() => { setPanel(PANEL.MENU); clearForm(); }}>← Back</button>
                <span className="profile-dropdown-label">Change Username</span>
              </div>
              <hr className="profile-divider" />
              {msg.text && <div className={msg.error ? 'profile-msg error' : 'profile-msg success'}>{msg.text}</div>}
              <form onSubmit={handleChangeUsername} className="profile-form">
                <input
                  type="text"
                  placeholder="New username"
                  value={newUn}
                  onChange={(e) => setNewUn(e.target.value)}
                  required
                  id="profile-new-un"
                />
                <input
                  type="password"
                  placeholder="Confirm with your password"
                  value={unPw}
                  onChange={(e) => setUnPw(e.target.value)}
                  required
                  id="profile-un-pw"
                />
                <button type="submit" disabled={busy} id="profile-save-un-btn">
                  {busy ? 'Saving…' : 'Save Username'}
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </div>
  );
}
