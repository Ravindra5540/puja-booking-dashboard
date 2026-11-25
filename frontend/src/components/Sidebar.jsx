import brandMark from '../assets/brand-mark.svg';

const navigation = [
  { label: 'Overview', icon: '◫', current: true, href: '#dashboard' },
  { label: 'Bookings', icon: '▤', current: false, href: '#bookings' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#dashboard" aria-label="Aaradhya Setu dashboard">
        <span className="brand-mark"><img src={brandMark} alt="" /></span>
        <span className="brand-copy">
          <strong>Aaradhya Setu</strong>
          <small>PUJA SERVICES</small>
        </span>
      </a>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <a
            key={item.label}
            className={`nav-link${item.current ? ' is-current' : ''}`}
            href={item.href}
            aria-current={item.current ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="avatar">AS</span>
        <span><strong>Admin account</strong><small>Workspace owner</small></span>
        <span className="footer-dots" aria-hidden="true">···</span>
      </div>
    </aside>
  );
}
