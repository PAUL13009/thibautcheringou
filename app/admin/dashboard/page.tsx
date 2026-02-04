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
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
              Dashboard Admin
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                Connecté en tant que: {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bienvenue dans le Dashboard
            </h2>
            <p className="text-gray-600 text-lg">
              Gérez votre site d'architecture depuis cette interface.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Projects Card */}
            <div className="bg-gray-50 p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Projets</h3>
              <p className="text-gray-600 mb-4">
                Gérez vos projets architecturaux
              </p>
              <Link
                href="/admin/dashboard/projets"
                className="inline-block px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
              >
                Gérer les projets
              </Link>
            </div>

            {/* Gallery Card */}
            <div className="bg-gray-50 p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Galerie</h3>
              <p className="text-gray-600 mb-4">
                Gérez les images de la galerie
              </p>
              <Link
                href="/admin/dashboard/galerie"
                className="inline-block px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
              >
                Gérer la galerie
              </Link>
            </div>

            {/* Settings Card */}
            <div className="bg-gray-50 p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paramètres</h3>
              <p className="text-gray-600 mb-4">
                Configurez les paramètres du site
              </p>
              <Link
                href="/admin/dashboard/parametres"
                className="inline-block px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
              >
                Paramètres
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
