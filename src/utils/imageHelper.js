// Fonction pour construire l'URL complète des images
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }
  
  console.log('🔍 imageHelper - imagePath reçu:', imagePath);
  
  // Si l'image est déjà en base64
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // ✅ Si l'image est sur Cloudinary (production)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ imageHelper - URL Cloudinary:', imagePath);
    return imagePath;
  }
  
  // ✅ Si le chemin commence par /media/ (développement)
  if (imagePath.startsWith('/media/')) {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const fullUrl = `${apiUrl}${imagePath}`;
    console.log('✅ imageHelper - URL locale:', fullUrl);
    return fullUrl;
  }
  
  // Cas par défaut (ne devrait jamais arriver)
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const fullUrl = `${apiUrl}/media/${imagePath}`;
  console.log('⚠️ imageHelper - URL par défaut:', fullUrl);
  return fullUrl;
};