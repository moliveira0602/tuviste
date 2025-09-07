import React from "react";
import { getCategoryColor } from "../utils/categories";

export default function CategoryFilter({ categories, selected, onSelect }) {
  // Se não foram passadas categorias, usa a lista vazia
  const categoriesToShow = categories || [{ value: "todas", label: "Todas" }];

  return (
    <div className="flex flex-wrap gap-2">
      {categoriesToShow.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelect(category.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === category.value
              ? "bg-blue-600 text-white shadow-md transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}