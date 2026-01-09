export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://via.placeholder.com/300x200?text=No+Image";
  }
  
  const baseUrl = "http://localhost:5000";
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/uploads/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  return `${baseUrl}/uploads/${imagePath}`;
};

export const getImageFilename = (imagePath) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('/uploads/')) {
    return imagePath.replace('/uploads/', '');
  }
  
  if (imagePath.startsWith('http')) {
    const url = new URL(imagePath);
    return url.pathname.split('/').pop();
  }
  
  return imagePath;
};