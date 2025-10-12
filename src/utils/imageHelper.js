// Fonction pour construire l'URL complète des images
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }
  
  // URL de l'API backend - IMPORTANT: utiliser la variable d'environnement
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  console.log('🔍 imageHelper - imagePath reçu:', imagePath);
  console.log('🔍 imageHelper - apiUrl:', apiUrl);
  
  // Si l'image est déjà en base64
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // Si l'image est déjà une URL complète
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si le chemin commence par /media/
  if (imagePath.startsWith('/media/')) {
    const fullUrl = `${apiUrl}${imagePath}`;
    console.log('✅ imageHelper - URL construite:', fullUrl);
    return fullUrl;
  }
  
  // Cas par défaut
  const fullUrl = `${apiUrl}/media/${imagePath}`;
  console.log('✅ imageHelper - URL construite (défaut):', fullUrl);
  return fullUrl;
};