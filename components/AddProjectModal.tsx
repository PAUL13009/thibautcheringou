'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProject?: any | null;
}

export default function AddProjectModal({ isOpen, onClose, onSuccess, editingProject }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    typeProjet: '',
    surfaceHabitable: '',
    surfaceTerrain: '',
    montantTravaux: '',
    statut: '',
    dateLivraison: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (editingProject && isOpen) {
      // Extraire les valeurs depuis les détails si nécessaire
      const details = editingProject.details || [];
      let typeProjet = editingProject.typeProjet || '';
      let surfaceHabitable = editingProject.surfaceHabitable || '';
      let surfaceTerrain = editingProject.surfaceTerrain || '';
      let montantTravaux = editingProject.montantTravaux || '';
      let statut = editingProject.statut || '';
      let dateLivraison = editingProject.dateLivraison || '';

      // Fonction helper pour retirer m² d'une valeur
      const removeM2 = (value: string) => {
        if (!value) return value;
        return value.replace(/\s*m²/g, '').replace(/\s*m2/gi, '').trim();
      };

      // Si les valeurs ne sont pas dans les champs directs, les extraire des détails
      if (!typeProjet && details.length > 0) {
        const typeMatch = details.find((d: string) => d.includes('Type de projet'));
        if (typeMatch) typeProjet = typeMatch.split(':')[1]?.trim() || '';
      }
      if (!surfaceHabitable && details.length > 0) {
        const match = details.find((d: string) => d.includes('Surface habitable'));
        if (match) {
          surfaceHabitable = match.split(':')[1]?.trim() || '';
          surfaceHabitable = removeM2(surfaceHabitable);
        }
      } else if (surfaceHabitable) {
        surfaceHabitable = removeM2(surfaceHabitable);
      }
      if (!surfaceTerrain && details.length > 0) {
        const match = details.find((d: string) => d.includes('Surface du terrain'));
        if (match) {
          surfaceTerrain = match.split(':')[1]?.trim() || '';
          surfaceTerrain = removeM2(surfaceTerrain);
        }
      } else if (surfaceTerrain) {
        surfaceTerrain = removeM2(surfaceTerrain);
      }
      if (!montantTravaux && details.length > 0) {
        const match = details.find((d: string) => d.includes('Montant des travaux'));
        if (match) montantTravaux = match.split(':')[1]?.trim() || '';
      }
      if (!statut && details.length > 0) {
        const match = details.find((d: string) => d.includes('Statut'));
        if (match) statut = match.split(':')[1]?.trim() || '';
      }
      if (!dateLivraison && details.length > 0) {
        const match = details.find((d: string) => d.includes('Date de livraison'));
        if (match) dateLivraison = match.split(':')[1]?.trim() || '';
      }

      setFormData({
        title: editingProject.title || '',
        description: editingProject.description || '',
        slug: editingProject.slug || '',
        typeProjet,
        surfaceHabitable,
        surfaceTerrain,
        montantTravaux,
        statut,
        dateLivraison,
      });
      setExistingImages(editingProject.images || []);
    } else if (!editingProject && isOpen) {
      // Réinitialiser le formulaire si on n'est pas en mode édition
      setFormData({
        title: '',
        description: '',
        slug: '',
        typeProjet: '',
        surfaceHabitable: '',
        surfaceTerrain: '',
        montantTravaux: '',
        statut: '',
        dateLivraison: '',
      });
      setExistingImages([]);
      setImages([]);
    }
  }, [editingProject, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Générer automatiquement le slug à partir du titre (seulement en mode création)
    if (name === 'title' && !editingProject) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const imageRef = ref(storage, `projets/${formData.slug}/${image.name}-${Date.now()}-${index}`);
      await uploadBytes(imageRef, image);
      return await getDownloadURL(imageRef);
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      // Upload des nouvelles images seulement
      const newImageUrls = await uploadImages();
      
      // Combiner les nouvelles images avec les existantes
      const allImageUrls = editingProject 
        ? [...existingImages.filter(img => img), ...newImageUrls]
        : newImageUrls;

      // Vérifier qu'il y a au moins une image
      if (allImageUrls.length === 0 && !editingProject) {
        setError('Veuillez ajouter au moins une image.');
        setUploading(false);
        return;
      }

      // Fonction helper pour ajouter m² si ce n'est pas déjà présent
      const addM2 = (value: string) => {
        if (!value) return value;
        const cleaned = value.trim();
        // Vérifier si m² ou m2 est déjà présent
        if (cleaned.includes('m²') || cleaned.includes('m2') || cleaned.toLowerCase().includes('m²')) {
          return cleaned;
        }
        return `${cleaned} m²`;
      };

      // Préparer les détails structurés
      const detailsArray = [];
      if (formData.typeProjet) detailsArray.push(`Type de projet : ${formData.typeProjet}`);
      if (formData.surfaceHabitable) {
        const surfaceHabitableWithM2 = addM2(formData.surfaceHabitable);
        detailsArray.push(`Surface habitable : ${surfaceHabitableWithM2}`);
      }
      if (formData.surfaceTerrain) {
        const surfaceTerrainWithM2 = addM2(formData.surfaceTerrain);
        detailsArray.push(`Surface du terrain : ${surfaceTerrainWithM2}`);
      }
      if (formData.montantTravaux) detailsArray.push(`Montant des travaux : ${formData.montantTravaux}`);
      if (formData.statut) detailsArray.push(`Statut : ${formData.statut}`);
      if (formData.statut === 'Terminé' && formData.dateLivraison) {
        detailsArray.push(`Date de livraison : ${formData.dateLivraison}`);
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        details: detailsArray,
        slug: formData.slug,
        typeProjet: formData.typeProjet,
        surfaceHabitable: formData.surfaceHabitable,
        surfaceTerrain: formData.surfaceTerrain,
        montantTravaux: formData.montantTravaux,
        statut: formData.statut,
        dateLivraison: formData.statut === 'Terminé' ? formData.dateLivraison : null,
        image: allImageUrls[0] || existingImages[0] || '', // Première image comme image principale
        images: allImageUrls.length > 0 ? allImageUrls : existingImages,
        published: true
      };

      if (editingProject) {
        // Mode édition : mettre à jour le projet existant
        await updateDoc(doc(db, 'projets', editingProject.id), projectData);
      } else {
        // Mode création : créer un nouveau projet
        await addDoc(collection(db, 'projets'), {
          ...projectData,
          createdAt: new Date(),
        });
      }

      // Afficher le message de succès
      setSuccess(true);
      setUploading(false);
      
      // Réinitialiser le formulaire seulement si on n'est pas en mode édition
      if (!editingProject) {
        setFormData({
          title: '',
          description: '',
          slug: '',
          typeProjet: '',
          surfaceHabitable: '',
          surfaceTerrain: '',
          montantTravaux: '',
          statut: '',
          dateLivraison: '',
        });
        setImages([]);
        setExistingImages([]);
      }
      
      // Rafraîchir la liste des projets
      onSuccess();
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du projet:', err);
      setError(editingProject 
        ? 'Erreur lors de la modification du projet. Veuillez réessayer.'
        : 'Erreur lors de l\'ajout du projet. Veuillez réessayer.');
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProject ? 'Modifier le projet' : 'Ajouter un projet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

              {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  {editingProject ? 'Projet modifié avec succès !' : 'Projet publié avec succès !'}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Titre du projet *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black"
                placeholder="Ex: Villa Moderne"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                disabled={!!editingProject}
                className={`w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black ${editingProject ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ex: villa-moderne"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editingProject 
                  ? 'Le slug ne peut pas être modifié pour préserver les URLs existantes.'
                  : 'Généré automatiquement à partir du titre. Format: lettres minuscules et tirets.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black"
                placeholder="Description du projet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Type de projet *
              </label>
              <select
                name="typeProjet"
                value={formData.typeProjet}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black"
              >
                <option value="">Sélectionner un type</option>
                <option value="Villa">Villa</option>
                <option value="Appartement">Appartement</option>
                <option value="Bureau">Bureau</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Surface habitable (m²) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="surfaceHabitable"
                    value={formData.surfaceHabitable}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 px-4 py-2 pr-10 text-black focus:outline-none focus:border-black"
                    placeholder="Ex: 180"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                    m²
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Surface du terrain (m²) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="surfaceTerrain"
                    value={formData.surfaceTerrain}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-gray-300 px-4 py-2 pr-10 text-black focus:outline-none focus:border-black"
                    placeholder="Ex: 800"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                    m²
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Montant des travaux *
              </label>
              <input
                type="text"
                name="montantTravaux"
                value={formData.montantTravaux}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black"
                placeholder="Ex: 250 000 €"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Statut du projet *
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black"
              >
                <option value="">Sélectionner un statut</option>
                <option value="Terminé">Terminé</option>
                <option value="En cours de livraison">En cours de livraison</option>
              </select>
            </div>

            {formData.statut === 'Terminé' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date de livraison *
                </label>
                <input
                  type="date"
                  name="dateLivraison"
                  value={formData.dateLivraison}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Images {!editingProject && '*'}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full bg-white border border-gray-300 px-4 py-2 text-black focus:outline-none focus:border-black file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
              />
              
              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Images actuelles :</p>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Image existante ${index + 1}`}
                          className="w-full h-32 object-cover border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExistingImages(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Nouvelles images :</p>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {editingProject 
                  ? 'Ajoutez de nouvelles images ou supprimez les existantes. La première image sera utilisée comme image principale.'
                  : 'La première image sera utilisée comme image principale.'}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading 
                  ? (editingProject ? 'Modification...' : 'Publication...') 
                  : (editingProject ? 'Modifier le projet' : 'Publier le projet')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors uppercase tracking-wide"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
