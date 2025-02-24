import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
      <img
        src={session.user.image || '/default-avatar.png'}
        alt={session.user.name || 'User Avatar'}
        width={100}
        height={100}
      />
    </div>
  );
}
