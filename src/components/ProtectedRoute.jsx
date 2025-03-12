import { Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CircularProgress } from '@mui/material'

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (token) {
            setIsAuthenticated(true)
        } else {
            setIsAuthenticated(false)
        }

        setLoading(false) // Mark loading as complete
    }, [])

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </div>
        )
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
