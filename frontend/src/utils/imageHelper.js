export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === '') {
    return "https://via.placeholder.com/300x200?text=No+Image";
  }
  
  const baseUrl = "http://localhost:5000";
  
  // If already a full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If starts with /uploads/, add base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Just filename, add /uploads/ path
  return `${baseUrl}/uploads/${imagePath}`;
};