'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProjectsList from '@/components/ProjectsList';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Composant pour le formulaire de contact
function ContactForm() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!nom.trim() || !email.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'contact'), {
        nom: nom.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: new Date(),
        lu: false
      });

      setSuccess(true);
      setNom('');
      setEmail('');
      setMessage('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du formulaire:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success && (
        <div className="p-4 bg-green-500 text-white text-sm">
          Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500 text-white text-sm">
          {error}
        </div>
      )}
      
      {/* Name Field */}
      <div>
        <input
          type="text"
          placeholder="Nom*"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="w-full bg-transparent border-0 border-b border-gray-400 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors pb-3 text-base md:text-lg"
        />
      </div>

      {/* Email Field */}
      <div>
        <input
          type="email"
          placeholder="Email*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border-0 border-b border-gray-400 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors pb-3 text-base md:text-lg"
        />
      </div>

      {/* Message Field */}
      <div>
        <textarea
          placeholder="Message (Parlez-nous de votre projet)"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full bg-transparent border-0 border-b border-gray-400 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors pb-3 resize-none text-base md:text-lg"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 text-white text-base md:text-lg hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        <span>→</span>
        <span>{submitting ? 'ENVOI EN COURS...' : 'NOUS CONTACTER'}</span>
      </button>
    </form>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <a href="#projects" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Nos Projets</a>
              <a href="#about" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Le Studio</a>
              <a href="#process" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Process</a>
              <a href="#gallery" className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide uppercase">Galerie</a>
              <button className="ml-8 px-6 py-2.5 bg-black rounded-full text-white text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 uppercase">
                NOUS CONTACTER
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
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
                { label: 'NOS PROJETS', href: '#projects' },
                { label: 'LE STUDIO', href: '#about' },
                { label: 'PROCESS', href: '#process' },
                { label: 'GALERIE', href: '#gallery' },
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
                  {item.href.startsWith('/') ? (
                    <Link 
                      href={item.href}
                      className="text-white text-3xl font-medium block hover:opacity-80 transition-opacity"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a 
                      href={item.href}
                      className="text-white text-3xl font-medium block hover:opacity-80 transition-opacity"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            
            <div className={`mt-12 transform transition-all duration-500 ${
              isMobileMenuOpen 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}>
              <a 
                href="#contact"
                className="inline-block px-8 py-4 bg-white text-black rounded-full text-base font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                NOUS CONTACTER
              </a>
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
        
        {/* Thibaut Cheringou - Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl uppercase text-white font-light tracking-wider mb-4 text-center">
            AGENCE D&apos;ARCHITECTURE
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light text-white tracking-tight uppercase text-center">
            Thibaut Cheringou
          </h1>
        </div>
        
        {/* Description Text - Bottom Left */}
        <div className="absolute bottom-20 md:bottom-24 left-0 right-0 lg:left-12 lg:right-auto xl:left-16 z-10 w-full lg:w-auto max-w-[90%] lg:max-w-lg mx-auto lg:mx-0 px-4 lg:px-0">
          <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed font-light uppercase text-center lg:text-left">
            Architecte DPLG depuis 2002, je conçois des espaces inspirés par votre vision, alliant design réfléchi, collaboration et créativité pour façonner des lieux de vie et des espaces qui s&apos;adaptent à votre quotidien
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-white min-h-screen">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Top Section - Info */}
          <div className="pb-6 md:pb-8 mb-24 md:mb-32 lg:mb-40">
            {/* NOS PROJETS with Button */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-gray-900 tracking-tight leading-none">
                NOS PROJETS<sup className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal ml-1 md:ml-2 align-super" id="projects-count">(0)</sup>
              </h2>
              <Link 
                href="/projets"
                className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium tracking-wide inline-flex items-center gap-2 text-sm md:text-base"
              >
                Voir tous nos projets
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Projects Gallery */}
          <div className="relative">
            <ProjectsList />
          </div>
        </div>
      </section>

      {/* Notre Vision Section - Part 1: About Us Style */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Title */}
          <div className="mb-12">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight">
              NOTRE VISION
            </h2>
          </div>

          {/* Large Image */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] relative overflow-hidden bg-gray-200 mb-8">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Architecture moderne"
              fill
              className="object-cover grayscale"
              quality={90}
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Notre Vision Section - Part 2: Two Column Layout */}
      <section className="pt-8 pb-24 bg-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column */}
            <div className="lg:col-span-4">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                <span className="block">NOTRE ÉQUIPE,</span>
                <span className="block">NOTRE HISTOIRE</span>
              </h3>
              <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                Nous visons à rassembler des esprits divers, transformant les idées en expériences qui comptent.
              </p>

              {/* Profile */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  <Image
                    src="/images/thibautcheringou.jpeg"
                    alt="Thibaut Cheringou"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                    quality={90}
                  />
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-xl md:text-2xl">Thibaut Cheringou</div>
                  <div className="text-gray-600 text-base md:text-lg">Architecte et Directeur de l&apos;agence</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8">
              <p className="text-gray-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed">
                Nous sommes une équipe de créateurs, de penseurs et de bâtisseurs qui croient en la création d&apos;expériences qui créent de véritables connexions. Notre histoire est construite sur la passion, l&apos;innovation et la volonté de donner vie à des idées significatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Title */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight text-center">
              SERVICES
            </h2>
          </div>

          {/* Services Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Projet Résidentiel */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] md:aspect-[3/2] relative overflow-hidden bg-gray-200 mb-4">
                <Image
                  src="/images/villar1archi2.png"
                  alt="Villa moderne"
                  fill
                  className="object-cover blur-md group-hover:blur-none group-hover:scale-105 transition-all duration-500"
                  quality={90}
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    Projet Résidentiel
                  </h3>
                </div>
              </div>
            </div>

            {/* Projet Tertiaire */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] md:aspect-[3/2] relative overflow-hidden bg-gray-200 mb-4">
                <Image
                  src="/images/sidney.jpg"
                  alt="Bureaux modernes"
                  fill
                  className="object-cover blur-md group-hover:blur-none group-hover:scale-105 transition-all duration-500"
                  quality={90}
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-white uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    Projet Tertiaire
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight">
              PROCESS
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-base md:text-lg mb-16 max-w-2xl">
            Notre approche complète pour livrer des résultats exceptionnels grâce à une méthodologie structurée
          </p>

          {/* Process Steps */}
          <div className="space-y-0">
            {/* Step 1 - Esquisse */}
            <div className="w-full h-24 md:h-28 lg:h-32 flex items-center justify-between px-6 md:px-8 lg:px-12 bg-blue-100">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl">↓</span>
                <span className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Esquisse</span>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">0001</div>
            </div>

            {/* Step 2 - Conception */}
            <div className="w-full h-24 md:h-28 lg:h-32 flex items-center justify-between px-6 md:px-8 lg:px-12 bg-blue-200">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl">↓</span>
                <span className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Conception</span>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">0002</div>
            </div>

            {/* Step 3 - Permis */}
            <div className="w-full h-24 md:h-28 lg:h-32 flex items-center justify-between px-6 md:px-8 lg:px-12 bg-blue-300">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl">↓</span>
                <span className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Permis</span>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">0003</div>
            </div>

            {/* Step 4 - Chantier */}
            <div className="w-full h-24 md:h-28 lg:h-32 flex items-center justify-between px-6 md:px-8 lg:px-12 bg-blue-400">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl">↓</span>
                <span className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Chantier</span>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">0004</div>
            </div>

            {/* Step 5 - Livraison */}
            <div className="w-full h-24 md:h-28 lg:h-32 flex items-center justify-between px-6 md:px-8 lg:px-12 bg-blue-500">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-2xl md:text-3xl">↓</span>
                <span className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Livraison</span>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">0005</div>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie Section */}
      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Title - Top Right */}
          <div className="flex justify-center md:justify-end mb-12">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight">
              GALERIE
            </h2>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Top Row - Two Images Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Top Left Image */}
              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/villar1archi.png"
                  alt="Villa moderne"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>

              {/* Top Right Image */}
              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/villar1archi2.png"
                  alt="Villa moderne avec piscine"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>
            </div>

            {/* Second Row - Two Images Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/ecole.jpg"
                  alt="École"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>

              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/sidney.jpg"
                  alt="Sidney"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>
            </div>

            {/* Third Row - Two Images Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/sideny2.jpg"
                  alt="Sidney 2"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>

              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/travaux .jpg"
                  alt="Travaux"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>
            </div>

            {/* Fourth Row - Two Images Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/lot4villas.png"
                  alt="Lot de 4 Villas"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>

              <div className="aspect-[4/3] md:aspect-[5/4] relative overflow-hidden rounded-none bg-gray-200">
                <Image
                  src="/images/villacassis.webp"
                  alt="Villa Cassis"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>
            </div>

            {/* Fifth Row - Single Image */}
            <div className="w-full aspect-[4/3] md:aspect-[16/6] relative overflow-hidden rounded-none bg-gray-200">
              <Image
                src="/images/villa.jpg"
                alt="Villa moderne"
                fill
                className="object-cover"
                quality={90}
              />
            </div>

            {/* Bottom Row - Single Wide Image */}
            <div className="w-full aspect-[16/6] md:aspect-[16/5] relative overflow-hidden rounded-none bg-gray-200">
              <Image
                src="/images/planpropre.png"
                alt="Plan architectural"
                fill
                className="object-cover"
                quality={90}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-black">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column */}
            <div>
              {/* Title */}
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
                NOUS CONTACTER
              </h2>

              {/* Description */}
              <p className="text-gray-400 text-base md:text-lg mb-12 leading-relaxed">
                Discutons de votre projet et découvrons comment nous pouvons transformer vos idées en réalité architecturale qui correspond à votre vision.
              </p>

              {/* Contact Information */}
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
                {/* Phone */}
                <a href="tel:0662740373" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400 text-base md:text-lg">06 62 74 03 73</span>
                </a>

                {/* Email */}
                <a href="mailto:cheringou.archi@free.fr?subject=Demande de contact" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-base md:text-lg">cheringou.archi@free.fr</span>
                </a>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center mb-4">
              2026 - ARCHSTUDIO
            </p>
            <div className="text-center">
              <a 
                href="/admin" 
                className="text-gray-500 hover:text-gray-400 text-xs uppercase tracking-wide transition-colors"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
