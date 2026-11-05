import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'


function AppLayout() {
    const { pathname } = useLocation()

    const hideFooter =
        pathname == '/login' ||
        pathname == '/signup' ||
        pathname.startsWith('/dashboard')

    return (
        <>
            <Navbar />

            <Outlet />

            {!hideFooter && <Footer />}


        </>
    )
}

export default AppLayout