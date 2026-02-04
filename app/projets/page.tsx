'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ProjetsPage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si on est en haut de la page, toujours afficher le header
      if (currentScrollY === 0) {
        setIsHeaderVisible(true);
      } 
      // Sinon, détecter la direction du scroll
      else if (currentScrollY > lastScrollY) {
        // Scroll vers le bas - cacher le header immédiatement
        setIsHeaderVisible(false);
      }
      // Ne pas réafficher lors du scroll vers le haut, seulement en haut de page
      
      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 bg-transparent transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8">
          <div className="flex items-center justify-end">
            <div className="hidden md:flex items-center gap-6 text-white">
              <Link href="/" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Accueil</Link>
              <Link href="/#projects" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Nos Projets</Link>
              <Link href="/#about" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Le Studio</Link>
              <Link href="/#process" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Process</Link>
              <Link href="/#gallery" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Galerie</Link>
              <Link href="/#contact" className="ml-8 px-6 py-2.5 bg-black rounded-full text-white text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 uppercase">
                NOUS CONTACTER
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white relative z-50 flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {/* Text */}
              <div className="relative h-5 overflow-hidden">
                <span className={`block text-sm font-medium transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
                  Menu
                </span>
                <span className={`block text-sm font-medium transition-all duration-300 absolute top-0 left-0 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                  Close
                </span>
              </div>
              
              {/* Icon */}
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span className={`absolute w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45' : 'rotate-0'}`}></span>
                <span className={`absolute w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'rotate-90'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Background Layers */}
        <div className="absolute inset-0 bg-black"></div>
        <div className={`absolute inset-0 bg-black transition-transform duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`} style={{ transitionDelay: '50ms' }}></div>
        
        {/* Menu Panel */}
        <aside 
          className={`absolute top-0 right-0 h-full w-full bg-black transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ transitionDelay: '100ms' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col justify-center px-8 py-24">
            <ul className="space-y-6">
              {[
                { label: 'ACCUEIL', href: '/' },
                { label: 'NOS PROJETS', href: '/#projects' },
                { label: 'LE STUDIO', href: '/#about' },
                { label: 'PROCESS', href: '/#process' },
                { label: 'GALERIE', href: '/#gallery' },
              ].map((item, index) => (
                <li 
                  key={item.href}
                  className={`transform transition-all duration-500 ${
                    isMobileMenuOpen 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <Link 
                    href={item.href}
                    className="text-white text-3xl font-medium block hover:opacity-80 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className={`mt-12 transform transition-all duration-500 ${
              isMobileMenuOpen 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}>
              <Link 
                href="/#contact"
                className="inline-block px-8 py-4 bg-white text-black rounded-full text-base font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                NOUS CONTACTER
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Maison moderne avec verdure"
            fill
            priority
            className="object-cover"
            quality={90}
            unoptimized
          />
          {/* Overlay pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Titre centré */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight uppercase text-center whitespace-nowrap">
            Découvrez nos projets
          </h1>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 bg-white min-h-screen">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Projects Gallery */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des projets...</p>
            </div>
          ) : projets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun projet disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 xl:gap-16">
              {projets.map((projet: any, index: number) => {
                const imageUrl = projet.image || projet.images?.[0] || '/images/villar1archi.png';
                const title = projet.title || 'Projet';
                const slug = projet.slug || `projet-${index}`;
                
                // Pas de disposition asymétrique, juste alignement normal
                let marginClass = '';
                
                return (
                  <Link
                    key={projet.id || `projet-${index}`}
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
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              2026 - Thibaut Cheringou Architecture
            </p>
            <Link 
              href="/#contact"
              className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium tracking-wide text-sm uppercase"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
