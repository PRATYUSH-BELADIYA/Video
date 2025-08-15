import React, { useState } from 'react'
import axios from 'axios'
import Loader from './Loder' // <-- import your loader

export default function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // loader state

  const handleSubmit = async () => {
    setError('')
    setLoading(true) // show loader
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:2000/api/auth/login', { username, password })
        localStorage.setItem('token', res.data.token)
        onAuth(res.data.token)
      } else {
        await axios.post('http://localhost:2000/api/auth/register', { username, password })
        setIsLogin(true) // switch to login after registration
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong')
    } finally {
      setLoading(false) // hide loader
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1116]">
        <Loader /> 
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0e1116] to-[#0a0c10]">
      <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md shadow-glow">
        <h2 className="text-2xl font-semibold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 px-4 py-3 rounded-lg bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-brand/60"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-brand/60"
        />

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-brand hover:bg-brand/90 px-4 py-3 rounded-lg shadow-glow transition"
        >
          {isLogin ? 'Login' : 'Register'}
        </button>

        <p className="mt-4 text-sm text-white/60 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand hover:underline"
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  )
}
