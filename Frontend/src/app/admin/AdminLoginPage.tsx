import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import { useDocumentHead } from '../../lib/useDocumentHead';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLoginPage() {
  useDocumentHead({
    title: 'Admin Login | Throttle LK',
    robots: 'noindex, nofollow',
  });

  const { token, setToken } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/admin/products" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        message?: string | string[];
      };
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
        throw new Error(msg || 'Login failed');
      }
      if (!data.access_token) {
        throw new Error('Invalid response from server');
      }
      setToken(data.access_token);
      toast.success('Signed in');
      navigate('/admin/products', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#F0EDE8] px-4"
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'auto' }}
    >
      <Card className="w-full max-w-md border-[#C0392B]/30 bg-[#141414] text-[#F0EDE8]">
        <CardHeader>
          <CardTitle
            className="text-3xl tracking-wider text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Throttle LK Admin
          </CardTitle>
          <CardDescription className="text-[#F0EDE8]/70">
            Sign in with the username and password configured on your API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user">Username</Label>
              <Input
                id="admin-user"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pass">Password</Label>
              <Input
                id="admin-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8]"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-[#F0EDE8]/60">
              <Link to="/" className="underline hover:text-[#C0392B]">
                Back to store
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
