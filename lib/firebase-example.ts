// Exemple d'utilisation de Firebase dans votre projet
// 
// Importez les services dont vous avez besoin :
// import { db, storage, auth } from '@/lib/firebase';
//
// Exemples d'utilisation :
//
// 1. Firestore (Base de données)
// import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
//
// // Lire des données
// const projetsRef = collection(db, 'projets');
// const snapshot = await getDocs(projetsRef);
// const projets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//
// // Ajouter des données
// await addDoc(collection(db, 'projets'), {
//   title: 'Nouveau projet',
//   description: 'Description du projet',
//   createdAt: new Date()
// });
//
// 2. Storage (Fichiers)
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
//
// // Uploader un fichier
// const fileRef = ref(storage, 'images/image.jpg');
// await uploadBytes(fileRef, file);
// const url = await getDownloadURL(fileRef);
//
// 3. Authentication
// import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
//
// // Se connecter
// await signInWithEmailAndPassword(auth, email, password);
//
// // Se déconnecter
// await signOut(auth);
