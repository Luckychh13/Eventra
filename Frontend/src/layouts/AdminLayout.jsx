import { NavLink, Outlet } from 'react-router-dom'

const adminLinks = [
    { label: 'Overview', path: '/dashboard', end: true },
    { label: 'Users', path: '/dashboard/users' },
    { label: 'Make Admin', path: '/dashboard/make-admin' },
    { label: 'Images', path: '/dashboard/images' },
    { label: 'Participants', path: '/dashboard/participants' },
    { label: 'Leaderboard', path: '/dashboard/leaderboard' },
    { label: 'Events', path: '/dashboard/events' },
    { label: 'Event Orders', path: '/dashboard/eventOrder' },
    { label: 'Pricing', path: '/dashboard/pricingSet' },
    { label: 'Performers', path: '/dashboard/performers' },
    { label: 'Feedback', path: '/dashboard/feedback' },
    { label: 'Announcements', path: '/dashboard/announcement' },
    { label: 'Stalls', path: '/dashboard/stalls' },
    { label: 'Stall Orders', path: '/dashboard/stallsOrder' },
]

function AdminLayout() {
    return (
        <div className="min-h-screen bg-eventra-black text-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">

                <aside className="w-full shrink-0 rounded-2xl bg-eventra-dark p-4 lg:w-64">
                    <h2 className="mb-5 font-display text-xl font-bold">
                        Admin Panel
                    </h2>

                    <nav className="space-y-1">
                        {adminLinks.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `block rounded-lg px-4 py-3 text-sm transition-colors ${isActive
                                        ? 'bg-eventra-purple text-white'
                                        : 'text-eventra-muted hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 rounded-2xl bg-eventra-dark p-6">
                    <Outlet />
                </main>

            </div>
        </div>
    )
}

export default AdminLayout