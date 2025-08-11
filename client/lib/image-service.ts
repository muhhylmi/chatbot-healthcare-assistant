// Health-related image mapping for different search terms
const healthImages: { [key: string]: { url: string; alt: string; caption: string } } = {
  'headache relief': {
    url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center',
    alt: 'Person holding head showing headache relief techniques',
    caption: 'Apply gentle pressure and rest in a quiet, dark room'
  },
  'fever management': {
    url: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop&crop=center',
    alt: 'Thermometer showing temperature measurement',
    caption: 'Monitor your temperature regularly'
  },
  'exercise healthy': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    alt: 'People exercising in a park',
    caption: 'Find activities you enjoy for consistent exercise'
  },
  'healthy diet': {
    url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&crop=center',
    alt: 'Colorful healthy foods including fruits and vegetables',
    caption: 'Eat a variety of colorful fruits and vegetables daily'
  },
  'sleep health': {
    url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop&crop=center',
    alt: 'Peaceful bedroom setup for good sleep',
    caption: 'Create a comfortable sleep environment'
  },
  'stress management': {
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center',
    alt: 'Person meditating peacefully',
    caption: 'Practice mindfulness and relaxation techniques'
  },
  'hydration water': {
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop&crop=center',
    alt: 'Clear glass of water being poured',
    caption: 'Drink water regularly throughout the day'
  },
  'yoga meditation': {
    url: 'https://images.unsplash.com/photo-1506629905607-c34b1a19a3e8?w=400&h=300&fit=crop&crop=center',
    alt: 'Person doing yoga in peaceful setting',
    caption: 'Practice yoga for flexibility and mental peace'
  },
  'vitamins nutrition': {
    url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&crop=center',
    alt: 'Various healthy foods rich in vitamins',
    caption: 'Get nutrients from whole foods when possible'
  },
  'heart health': {
    url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
    alt: 'Heart-healthy lifestyle activities',
    caption: 'Take care of your heart with healthy habits'
  },
  'healthcare consultation': {
    url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center',
    alt: 'Healthcare professional consultation',
    caption: 'Always consult healthcare professionals for medical advice'
  },
  'mental health': {
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center',
    alt: 'Peaceful mental health support',
    caption: 'Take care of your mental wellbeing'
  },
  'first aid': {
    url: 'https://images.unsplash.com/photo-1584467735871-8a74e013f312?w=400&h=300&fit=crop&crop=center',
    alt: 'First aid medical supplies',
    caption: 'Know basic first aid techniques'
  }
};

export function findHealthImage(searchTerm: string): { url: string; alt: string; caption: string } | null {
  if (!searchTerm) return null;

  const term = searchTerm.toLowerCase();
  
  // Direct match
  if (healthImages[term]) {
    return healthImages[term];
  }

  // Fuzzy matching
  for (const [key, image] of Object.entries(healthImages)) {
    if (term.includes(key) || key.includes(term)) {
      return image;
    }
  }

  // Keyword-based matching
  const keywords = term.split(' ');
  for (const [key, image] of Object.entries(healthImages)) {
    const keyWords = key.split(' ');
    if (keywords.some(keyword => keyWords.some(keyWord => keyWord.includes(keyword)))) {
      return image;
    }
  }

  // Default health image
  return healthImages['healthcare consultation'];
}
