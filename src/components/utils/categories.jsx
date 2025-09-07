
export const availableCategories = [
  { value: 'todas', label: 'Todas', label_en: 'All' },
  { value: 'politica', label: 'Política', label_en: 'Politics' },
  { value: 'economia', label: 'Economia', label_en: 'Economy' },
  { value: 'desporto', label: 'Desporto', label_en: 'Sports' },
  { value: 'tecnologia', label: 'Tecnologia', label_en: 'Technology' },
  { value: 'cultura', label: 'Cultura', label_en: 'Culture' },
  { value: 'ambiente', label: 'Ambiente', label_en: 'Environment' },
  { value: 'saude', label: 'Saúde', label_en: 'Health' },
  { value: 'mundo', label: 'Mundo', label_en: 'World' },
  { value: 'sociedade', label: 'Sociedade', label_en: 'Society' },
  { value: 'opiniao', label: 'Opinião', label_en: 'Opinion' },
];

export const COUNTRIES = [
    { value: 'todos', label: 'Todos', label_en: 'All' },
    { value: 'pt', label: 'Portugal', label_en: 'Portugal' },
    { value: 'br', label: 'Brasil', label_en: 'Brazil' },
    { value: 'us', label: 'EUA', label_en: 'USA' },
    { value: 'gb', label: 'Reino Unido', label_en: 'UK' },
    { value: 'es', label: 'Espanha', label_en: 'Spain' },
    { value: 'fr', label: 'França', label_en: 'France' },
    { value: 'de', label: 'Alemanha', label_en: 'Germany' },
    { value: 'it', label: 'Itália', label_en: 'Italy' },
    { value: 'jp', label: 'Japão', label_en: 'Japan' },
    { value: 'cn', label: 'China', label_en: 'China' },
    { value: 'ru', label: 'Rússia', label_en: 'Russia' },
    { value: 'ua', label: 'Ucrânia', label_en: 'Ukraine' },
    { value: 'global', label: 'Global', label_en: 'Global' },
];

export const getCategoryLabel = (value, lang = 'pt-PT') => {
  const category = availableCategories.find(c => c.value === value);
  if (!category) return value;
  return lang === 'en-US' ? (category.label_en || category.label) : category.label;
};

export const getCountryLabel = (value, lang = 'pt-PT') => {
  const country = COUNTRIES.find(c => c.value === value);
  if (!country) return value;
  return lang === 'en-US' ? (country.label_en || country.label) : country.label;
};

export const getCategoryColor = (value) => {
  const colors = {
    politica: 'bg-red-100 text-red-800',
    economia: 'bg-yellow-100 text-yellow-800',
    desporto: 'bg-green-100 text-green-800',
    tecnologia: 'bg-blue-100 text-blue-800',
    cultura: 'bg-purple-100 text-purple-800',
    ambiente: 'bg-teal-100 text-teal-800',
    saude: 'bg-pink-100 text-pink-800',
    mundo: 'bg-indigo-100 text-indigo-800',
    sociedade: 'bg-orange-100 text-orange-800',
    opiniao: 'bg-gray-100 text-gray-800',
  };
  return colors[value] || 'bg-gray-200 text-gray-900';
};
