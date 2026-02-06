'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/admin');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide">
              Dashboard Admin
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-300 break-all sm:break-normal">
                <span className="hidden sm:inline">Connecté en tant que: </span>
                <span className="sm:hidden">Connecté: </span>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-xs sm:text-sm uppercase tracking-wide w-full sm:w-auto"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 sm:py-8 md:py-12">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Welcome Section */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Bienvenue dans le Dashboard
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Gérez votre site d'architecture depuis cette interface.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Projects Card */}
            <div className="bg-gray-50 p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Projets</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Gérez vos projets architecturaux
              </p>
              <Link
                href="/admin/dashboard/projets"
                className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm uppercase tracking-wide"
              >
                Gérer les projets
              </Link>
            </div>

            {/* Contact Card */}
            <div className="bg-gray-50 p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Demandes de Contact</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Consultez les demandes de contact reçues
              </p>
              <Link
                href="/admin/dashboard/contact"
                className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm uppercase tracking-wide"
              >
                Voir les demandes
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
