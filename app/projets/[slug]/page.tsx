import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Fonction pour récupérer un projet depuis Firestore
async function getProjet(slug: string) {
  try {
    const projetsRef = collection(db, 'projets');
    const q = query(projetsRef, where('slug', '==', slug), where('published', '==', true));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return null;
  }
}

// Données des projets par défaut (fallback)
const projetsDefault = {
  'villa-nans-les-pins': {
    title: 'Villa Nans-les-Pins',
    image: '/images/villar1archi.png',
    description: 'Villa moderne avec vue panoramique, alliant design contemporain et intégration paysagère.',
    details: [
      'Surface habitable : 180 m²',
      'Terrain : 800 m²',
      'Architecture moderne',
      'Piscine et terrasse',
      'Vue panoramique'
    ],
    images: [
      '/images/villar1archi.png',
      '/images/villar1archi2.png'
    ]
  },
  'villa-r1-marseille': {
    title: 'Villa R+1 Marseille',
    image: '/images/villar1archi2.png',
    description: 'Résidence contemporaine sur deux niveaux, optimisant l\'espace et la lumière naturelle.',
    details: [
      'Surface habitable : 220 m²',
      'Terrain : 600 m²',
      'Architecture R+1',
      'Jardin paysager',
      'Garage intégré'
    ],
    images: [
      '/images/villar1archi2.png',
      '/images/villar1archi.png'
    ]
  },
  'villa-cassis': {
    title: 'Villa Cassis',
    image: '/images/villacassis.webp',
    description: 'Villa d\'exception sur les hauteurs de Cassis, avec vue imprenable sur la Méditerranée.',
    details: [
      'Surface habitable : 250 m²',
      'Terrain : 1200 m²',
      'Architecture contemporaine',
      'Piscine à débordement',
      'Vue mer panoramique'
    ],
    images: [
      '/images/villacassis.webp',
      '/images/villa.jpg'
    ]
  },
  'lot-de-4-villas': {
    title: 'Lot de 4 Villas',
    image: '/images/lot4villas.png',
    description: 'Programme résidentiel de 4 villas modernes, harmonieusement intégrées dans un environnement paysager.',
    details: [
      '4 villas individuelles',
      'Surface moyenne : 200 m²',
      'Architecture contemporaine',
      'Espaces verts communs',
      'Parking et carports'
    ],
    images: [
      '/images/lot4villas.png',
      '/images/villa.jpg'
    ]
  }
} as any;

export default async function ProjetPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Essayer de récupérer depuis Firestore, sinon utiliser les données par défaut
  let projet = await getProjet(slug);
  
  if (!projet) {
    // Fallback vers les données par défaut
    projet = projetsDefault[slug as keyof typeof projetsDefault] as any;
  }

  if (!projet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Projet non trouvé</h1>
          <Link href="/" className="text-gray-600 hover:text-gray-900 underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Image */}
      <section className="pt-12 md:pt-16 lg:pt-20">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Back Button */}
          <Link 
            href="/#projects"
            className="inline-flex items-center gap-2 mb-4 bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm uppercase tracking-wide text-white">Retour</span>
          </Link>
          <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden bg-gray-200">
            <Image
              src={projet.image || projet.images?.[0] || '/images/villar1archi.png'}
              alt={projet.title}
              fill
              className="object-cover"
              priority
              quality={90}
              unoptimized={(projet.image || projet.images?.[0] || '').startsWith('http')}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Title */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-4">
              {projet.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
              {projet.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {(projet.details || []).map((detail: string, index: number) => {
              // Fonction pour formater les surfaces avec m² si nécessaire
              const formatDetail = (text: string) => {
                // Si c'est une surface habitable ou surface du terrain sans m², l'ajouter
                if (text.includes('Surface habitable :') || text.includes('Surface du terrain :')) {
                  const parts = text.split(':');
                  if (parts.length === 2) {
                    const value = parts[1].trim();
                    // Vérifier si m² est déjà présent
                    if (!value.includes('m²') && !value.includes('m2')) {
                      return `${parts[0]}: ${value} m²`;
                    }
                  }
                }
                return text;
              };
              
              return (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <p className="text-gray-900 font-medium">{formatDetail(detail)}</p>
                </div>
              );
            })}
          </div>

          {/* Gallery */}
          {projet.images && projet.images.length > 1 && (
            <div className="mt-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                Galerie
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {projet.images.map((image: string, index: number) => (
                  <div key={index} className="aspect-[4/3] relative overflow-hidden bg-gray-200">
                    <Image
                      src={image}
                      alt={`${projet.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={90}
                      unoptimized={image.startsWith('http')}
                    />
                  </div>
                ))}
              </div>
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
