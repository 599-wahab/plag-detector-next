// lib/withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function withAuth(Component, requiredRole) {
  return function AuthenticatedPage(props) {
    const router = useRouter();

    useEffect(() => {
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      if (!userId || !role) {
        router.push('/login');
        return;
      }
      if (requiredRole && role !== requiredRole) {
        router.push(`/dashboard/${role}`); // redirect to their correct dashboard
      }
    }, []);

    return <Component {...props} />;
  };
}
