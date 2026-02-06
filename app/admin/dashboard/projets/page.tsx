'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import AddProjectModal from '@/components/AddProjectModal';

export default function AdminProjets() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projets, setProjets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [loadingProjets, setLoadingProjets] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        loadProjets();
      } else {
        router.push('/admin');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadProjets = async () => {
    try {
      const projetsRef = collection(db, 'projets');
      let snapshot;
      
      try {
        // Filtrer uniquement les projets publiés et trier par date
        const q = query(
          projetsRef, 
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (orderByError: any) {
        // Si orderBy échoue, récupérer seulement les projets publiés sans tri
        console.log('orderBy non disponible, récupération sans tri:', orderByError.message);
        const q = query(projetsRef, where('published', '==', true));
        snapshot = await getDocs(q);
      }
      
      const projetsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || null
        };
      });
      
      // Trier manuellement par date si orderBy n'a pas fonctionné
      projetsData.sort((a: any, b: any) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Projets publiés chargés:', projetsData);
      setProjets(projetsData);
      setLoadingProjets(false);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setProjets([]);
      setLoadingProjets(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteDoc(doc(db, 'projets', id));
        loadProjets();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du projet');
      }
    }
  };

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
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide">
              Gestion des Projets
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
              Liste des projets
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Gérez vos projets architecturaux depuis cette interface.
            </p>
            
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                <p>État: {loadingProjets ? 'Chargement...' : `Chargé - ${projets.length} projet(s) trouvé(s)`}</p>
              </div>
            )}

            {/* Projects List */}
            {loadingProjets ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des projets...</p>
              </div>
            ) : projets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Aucun projet pour le moment.</p>
                <p className="text-gray-500 text-sm mb-4">Ajoutez votre premier projet en cliquant sur le bouton ci-dessous.</p>
                <p className="text-gray-400 text-xs">Vérifiez que les règles Firestore permettent la lecture des projets.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projets.map((projet) => (
                  <div key={projet.id} className="bg-white border border-gray-200 overflow-hidden">
                    {/* Image principale */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-200">
                      {projet.image ? (
                        <Image
                          src={projet.image}
                          alt={projet.title || 'Projet'}
                          fill
                          className="object-cover"
                          quality={90}
                          unoptimized={projet.image.startsWith('http')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-sm">Aucune image</span>
                        </div>
                      )}
                    </div>
                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{projet.title || 'Sans titre'}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{projet.description || 'Aucune description'}</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {projet.slug && (
                          <Link
                            href={`/projets/${projet.slug}`}
                            target="_blank"
                            className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors text-xs sm:text-sm uppercase text-center"
                          >
                            Voir
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setEditingProject(projet);
                            setIsModalOpen(true);
                          }}
                          className="px-3 sm:px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm uppercase"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(projet.id)}
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

            {/* Add Project Button */}
            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wide text-sm sm:text-base"
              >
                + Ajouter un projet
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={() => {
          loadProjets();
          setEditingProject(null);
        }}
        editingProject={editingProject}
      />
    </div>
  );
}
