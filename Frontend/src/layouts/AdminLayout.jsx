
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import './AdminLayout.css'

const adminLinks = [
    { label: 'Overview', path: '/dashboard', short: 'OV', end: true },
    { label: 'Users', path: '/dashboard/users', short: 'US' },
    { label: 'Make Admin', path: '/dashboard/make-admin', short: 'MA' },
    { label: 'Images', path: '/dashboard/images', short: 'IM' },
    { label: 'Participants', path: '/dashboard/participants', short: 'PA' },
    { label: 'Leaderboard', path: '/dashboard/leaderboard', short: 'LB' },
    { label: 'Events', path: '/dashboard/events', short: 'EV' },
    { label: 'Event Orders', path: '/dashboard/eventOrder', short: 'EO' },
    { label: 'Pricing', path: '/dashboard/pricingSet', short: 'PR' },
    { label: 'Performers', path: '/dashboard/performers', short: 'PE' },
    { label: 'Feedback', path: '/dashboard/feedback', short: 'FE' },
    { label: 'Announcements', path: '/dashboard/announcement', short: 'AN' },
    { label: 'Stalls', path: '/dashboard/stalls', short: 'ST' },
    { label: 'Stall Orders', path: '/dashboard/stallsOrder', short: 'SO' },
]

function AdminLayout() {
    const location = useLocation()

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('eventra-admin-theme')
        return savedTheme === 'dark' ? 'dark' : 'light'
    })

    useEffect(() => {
        localStorage.setItem('eventra-admin-theme', theme)
    }, [theme])

    const currentPage = adminLinks.find((item) =>
        item.end
            ? location.pathname === item.path
            : location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`)
    )

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === 'light' ? 'dark' : 'light'
        )
    }

    return (
        <div className="admin-shell" data-theme={theme}>
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-mark">E</div>
                    <div>
                        <h2>EVENTRA</h2>
                        <span>ADMIN CONSOLE</span>
                    </div>
                </div>

                <div className="admin-nav-heading">WORKSPACE</div>

                <nav className="admin-navigation">
                    {adminLinks.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="admin-nav-icon">
                                {item.short}
                            </span>
                            <span>{item.label}</span>
                            {item.end && (
                                <span className="admin-nav-indicator" />
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-sidebar-footer-mark">E</div>
                    <div>
                        <p>Eventra Management</p>
                        <span>Administration</span>
                    </div>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-breadcrumb">
                        <span>Workspace</span>
                        <span className="admin-breadcrumb-divider">/</span>
                        <strong>{currentPage?.label || 'Management'}</strong>
                    </div>

                    <div className="admin-topbar-actions">
                        <span className="admin-mode-label">
                            {theme === 'light' ? 'Light mode' : 'Dark mode'}
                        </span>

                        <button
                            type="button"
                            className="admin-theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            <span className="admin-theme-icon">
                                {theme === 'light' ? '☾' : '☀'}
                            </span>
                            <span className="admin-theme-toggle-track">
                                <span className="admin-theme-toggle-thumb" />
                            </span>
                        </button>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
