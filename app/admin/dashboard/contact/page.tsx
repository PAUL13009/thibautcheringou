'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminContact() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);

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

  useEffect(() => {
    if (user) {
      loadDemandes();
    }
  }, [user]);

  const loadDemandes = async () => {
    try {
      const demandesRef = collection(db, 'contact');
      const q = query(demandesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const demandesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDemandes(demandesData);
      setLoadingDemandes(false);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setLoadingDemandes(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de contact ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'contact', id));
      loadDemandes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la demande');
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide">
              Demandes de Contact
            </h1>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-xs sm:text-sm uppercase tracking-wide text-center sm:text-left w-full sm:w-auto"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 sm:py-8 md:py-12">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="bg-gray-50 p-4 sm:p-6 md:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Liste des demandes de contact
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Gérez les demandes de contact reçues depuis le formulaire du site.
            </p>

            {/* Demandes List */}
            {loadingDemandes ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des demandes...</p>
              </div>
            ) : demandes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Aucune demande de contact pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {demandes.map((demande) => (
                  <div key={demande.id} className="bg-white border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
                              {demande.nom || 'Sans nom'}
                            </h3>
                            <p className="text-gray-600 mb-1 text-sm sm:text-base break-all">
                              <strong>Email:</strong> {demande.email || 'Non renseigné'}
                            </p>
                            {demande.telephone && (
                              <p className="text-gray-600 mb-1 text-sm sm:text-base">
                                <strong>Téléphone:</strong> {demande.telephone}
                              </p>
                            )}
                            {demande.createdAt && (
                              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                                Reçu le: {demande.createdAt.toDate ? demande.createdAt.toDate().toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                        {demande.message && (
                          <div className="mt-4">
                            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base break-words">
                              {demande.message}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <a
                          href={`mailto:${demande.email}?subject=Re: Demande de contact`}
                          className="px-3 sm:px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm uppercase text-center"
                        >
                          Répondre
                        </a>
                        <button
                          onClick={() => handleDelete(demande.id)}
                          className="px-3 sm:px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors text-xs sm:text-sm uppercase"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
