'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ProjectsList() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjets = async () => {
      try {
        const projetsRef = collection(db, 'projets');
        const q = query(projetsRef, where('published', '==', true));
        const snapshot = await getDocs(q);
        const projetsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Trier par date de création (plus récent en premier)
        projetsData.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setProjets(projetsData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        setLoading(false);
      }
    };

    loadProjets();
  }, []);

  // Mettre à jour le compteur chaque fois que les projets changent
  useEffect(() => {
    const updateProjectsCount = () => {
      // Limiter à 4 projets maximum pour l'affichage
      const displayedCount = Math.min(projets.length, 4);
      const countElement = document.getElementById('projects-count');
      if (countElement) {
        countElement.textContent = `(${displayedCount})`;
      }
    };

    // Mettre à jour immédiatement
    updateProjectsCount();

    // Mettre à jour après un court délai pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(updateProjectsCount, 100);
    
    return () => clearTimeout(timeoutId);
  }, [projets]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des projets...</p>
      </div>
    );
  }

  if (projets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Aucun projet disponible pour le moment.</p>
      </div>
    );
  }

  // Utiliser uniquement les projets depuis Firestore
  const displayedProjets = projets.slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 xl:gap-16">
      {displayedProjets.map((projet: any, index: number) => {
        const imageUrl = projet.image || projet.images?.[0] || '/images/villar1archi.png';
        const title = projet.title || 'Projet';
        const slug = projet.slug || `projet-${index}`;
        
        // Disposition asymétrique exacte comme avant
        let marginClass = '';
        if (index === 1) {
          marginClass = 'md:mt-12 lg:mt-20 xl:mt-24';
        } else if (index === 2) {
          marginClass = 'md:-mt-6 lg:-mt-10 xl:-mt-12';
        } else if (index === 3) {
          marginClass = 'md:mt-6 lg:mt-10 xl:mt-12';
        }
        
        return (
          <Link
            key={projet.id || `default-${index}`}
            href={`/projets/${slug}`}
            className={`group cursor-pointer block ${marginClass}`}
          >
            <div className="aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] mb-3 overflow-hidden relative bg-gray-200">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                quality={90}
                unoptimized={imageUrl.startsWith('http')}
              />
            </div>
            <h3 className="text-gray-900 text-base md:text-lg lg:text-xl font-medium tracking-[0.05em] uppercase">
              {title.toUpperCase()}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}
