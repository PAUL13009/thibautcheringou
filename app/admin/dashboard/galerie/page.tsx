'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function AdminGalerie() {
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
              Gestion de la Galerie
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Images de la galerie
            </h2>
            <p className="text-gray-600 mb-6">
              Gérez les images affichées dans la section galerie du site.
            </p>
            
            {/* Upload Section */}
            <div className="mb-8 p-6 bg-white border border-gray-200 border-dashed">
              <h3 className="font-bold text-gray-900 mb-4">Ajouter une image</h3>
              <input
                type="file"
                accept="image/*"
                className="mb-4"
              />
              <button className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wide">
                Uploader
              </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Placeholder pour les images */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-gray-200 aspect-square relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400">Image {i}</span>
                  </div>
                  <button className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
