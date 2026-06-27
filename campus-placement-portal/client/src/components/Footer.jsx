export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" />
          Campus Placement
        </div>
        <p className="footer-tagline">
          Connecting students, recruiters, and placement cells — one portal.
        </p>
        <p className="footer-copy">&copy; {year} BroadBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}
