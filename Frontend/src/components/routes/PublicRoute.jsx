import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

const PublicRoute = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return <h1>Loading...</h1>
    }
    if (user?.emailVerified) return <Navigate to='/' replace />

    return <Outlet />
}

export default PublicRoute