import fs from 'fs';

const filePath = 'd:/repositories/ArenAI/aren-ai/src/data/topicsData.ts';
let content = fs.readFileSync(filePath, 'utf8');

const dictionary = {
    "Definición de": "Definition of",
    "Importancia de": "Importance of",
    "Estudios Sociales": "Social Studies",
    "Costa Rica": "Costa Rica",
    "Ubicación": "Location",
    "Geográfica": "Geographical",
    "Concepto de": "Concept of",
    "Relieve": "Relief",
    "Valles": "Valleys",
    "Cordilleras": "Mountain Ranges",
    "Llanuras": "Plains",
    "Ríos y Cuencas": "Rivers and Basins",
    "Región": "Region",
    "Socioeconómicas": "Socio-economic",
    "Clima": "Climate",
    "Tropical": "Tropical",
    "Seco": "Dry",
    "Húmedo": "Humid",
    "Historia Antigua": "Ancient History",
    "Modo de Vida": "Way of Life",
    "Cazadores-Recolectores": "Hunter-Gatherers",
    "Aldeanos": "Villagers",
    "Cacicazgos": "Chiefdoms",
    "Pueblos Originarios": "Original Peoples",
    "Territorios Indígenas": "Indigenous Territories",
    "Momento del Contacto": "Moment of Contact",
    "Impacto": "Impact",
    "Conquista": "Conquest",
    "Sociedad Colonial": "Colonial Society",
    "Organización": "Organization",
    "Independencia": "Independence",
    "Pacto de Concordia": "Pact of Concord",
    "Anexión de": "Annexation of",
    "Campaña Nacional": "National Campaign",
    "Batalla de": "Battle of",
    "Juan Santamaría": "Juan Santamaria",
    "Reformas": "Reforms",
    "Liberales": "Liberal",
    "Sociales": "Social",
    "Caja Costarricense de Seguro Social": "Social Security",
    "Código de Trabajo": "Labor Code",
    "Garantías Sociales": "Social Guarantees",
    "Valor Posicional": "Place Value",
    "Notación": "Notation",
    "Desarrollada": "Expanded",
    "Lectura y Escritura": "Reading and Writing",
    "Redondeo": "Rounding",
    "Fracciones": "Fractions",
    "Propia e Impropia": "Proper and Improper",
    "Operaciones con": "Operations with",
    "Números": "Numbers",
    "Naturales": "Natural",
    "Decimales": "Decimals",
    "Potencias": "Powers",
    "Raíces": "Roots",
    "Teoría de": "Theory of",
    "Múltiplos": "Multiples",
    "Divisores": "Divisors",
    "Divisibilidad": "Divisibility",
    "Primos y Compuestos": "Primes and Composites",
    "Geometría": "Geometry",
    "Cuerpos Sólidos": "Solid Bodies",
    "Prismas": "Prisms",
    "Cilindros": "Cylinders",
    "Esferas y Conos": "Spheres and Cones",
    "Perímetro": "Perimeter",
    "Área": "Area",
    "Polígonos": "Polygons",
    "Circunferencia": "Circumference",
    "Círculo": "Circle",
    "Mínimo": "Minimum",
    "Máximo": "Maximum",
    "Congruencia": "Congruence",
    "Triángulos": "Triangles",
    "Criterios de": "Criteria of",
    "Oraciones": "Sentences",
    "Dubitativas": "Doubtful",
    "Ortografía": "Spelling",
    "Ecuaciones": "Equations",
    "Álgebra": "Algebra",
    "Lectura Comprensiva": "Reading Comprehension",
    "Sistema Solar": "Solar System",
    "Matemáticas": "Mathematics",
    "Básicas": "Basic",
    "Análisis": "Analysis",
    "Definición": "Definition",
    "Características": "Characteristics",
    "Identificación": "Identification",
    "Descripción": "Description",
    "Reconocimiento": "Recognition",
    "Valor": "Value",
    "Uso": "Use",
    "Práctica": "Practice",
    "Sistema": "System",
    "Problemas": "Problems",
    "de": "of",
    "del": "of the",
    "y": "and",
    "con": "with",
    "para": "for",
    "las": "the",
    "los": "the",
    "la": "the",
    "el": "the",
    "en": "in",
    "entre": "between",
};

function translate(text) {
    if (!text) return text;
    let translated = text;
    // Sort keys by length descending to match longest phrases first
    const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    for (const es of sortedKeys) {
        const en = dictionary[es];
        const regex = new RegExp(`\\b${es}\\b`, 'gi');
        translated = translated.replace(regex, en);
    }
    return translated;
}

// 1. Clean up ALL existing nameEn, descriptionEn, commonMistakesEn
content = content.replace(/\n\s*nameEn: "[^"]*",/g, '');
content = content.replace(/\n\s*descriptionEn: "[^"]*",?/g, '');
content = content.replace(/\n\s*commonMistakesEn: \[.*?\],?/g, '');

// Clean up extra commas and potential double commas inside objects
content = content.replace(/,\s*,/g, ',');

// 2. Process ALL_TOPICS
// This time we use a regex that matches the whole object block between { and }
// and captures the id, name, subjectId, and description inside
const topicBlockRegex = /\{[\s\n]*id:\s*(\d+),[\s\n]*name:\s*"([^"]+)",[\s\n]*subjectId:\s*(\d+),[\s\n]*description:\s*"([^"]+)"[\s\n]*,?[\s\n]*\}/g;

content = content.replace(topicBlockRegex, (match, id, name, subjectId, description) => {
    const nameEn = translate(name);
    const descriptionEn = translate(description);

    return `{
        id: ${id},
        name: "${name}",
        nameEn: "${nameEn}",
        subjectId: ${subjectId},
        description: "${description}",
        descriptionEn: "${descriptionEn}"
    }`;
});

fs.writeFileSync(filePath, content);
console.log('Translations applied successfully with super robust regex!');
