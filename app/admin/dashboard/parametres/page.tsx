'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function AdminParametres() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
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
              Paramètres
            </h1>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="bg-gray-50 p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configuration du site
            </h2>
            
            {/* Settings Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nom de l'agence
                </label>
                <input
                  type="text"
                  defaultValue="Thibaut Cheringou Architecture"
                  className="w-full bg-white border border-gray-300 px-4 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  defaultValue="cheringou.archi@free.fr"
                  className="w-full bg-white border border-gray-300 px-4 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  defaultValue="06 62 74 03 73"
                  className="w-full bg-white border border-gray-300 px-4 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  defaultValue="Architecte DPLG depuis 2002, je conçois des espaces inspirés par votre vision, alliant design réfléchi, collaboration et créativité pour façonner des lieux de vie et des espaces qui s'adaptent à votre quotidien"
                  className="w-full bg-white border border-gray-300 px-4 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <button className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wide">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
