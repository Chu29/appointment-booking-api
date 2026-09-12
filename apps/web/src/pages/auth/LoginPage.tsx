import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Calendar, AlertCircle } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (from !== '/') {
        navigate(from, { replace: true })
      } else {
        navigate(
          user.role === 'provider' ? '/provider/dashboard' : '/discover',
          { replace: true },
        )
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Invalid email or password. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
          <Calendar className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to manage your appointments and schedule
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-xl shadow-gray-200/50">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-50 py-4 bg-gray-50/50 rounded-b-xl">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
