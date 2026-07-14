export function AdminSidebar() {
  const links = [
    { href: '/dashboard/admin#overview', label: 'Overview' },
    { href: '/dashboard/admin#settings', label: 'Admin Settings' },
    { href: '/dashboard/admin#users', label: 'Manage Users' },
    { href: '/dashboard/admin#products', label: 'Manage Products' },
    { href: '/dashboard/admin#orders', label: 'Manage Orders' },
  ];

  return (
    <nav className="space-y-2">
      {links.map((l) => (
        <a key={l.href} href={l.href} className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          {l.label}
        </a>
      ))}
    </nav>
  );
}
