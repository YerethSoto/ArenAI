/**
 * Shared institution configuration.
 * Each entry maps an institution name to its database ID.
 *
 * Currently all institutions map to id: 1 (ULACIT).
 * To add a new institution with a different ID, just add a new entry
 * with the correct id value.
 */

export interface Institution {
  id: number;
  name: string;
}

export const INSTITUTIONS: Institution[] = [
  // Private / University
  { id: 1, name: "ULACIT" },
  { id: 1, name: "Colegio San Paul" },
  { id: 1, name: "Universidad de Costa Rica" },
  { id: 1, name: "Tecnológico de Costa Rica" },
  { id: 1, name: "Universidad Nacional" },
  { id: 1, name: "Universidad Estatal a Distancia" },
  { id: 1, name: "Universidad Latina" },
  { id: 1, name: "Universidad Fidélitas" },
  { id: 1, name: "Universidad Americana" },

  // MEP / Public
  { id: 1, name: "Liceo de Costa Rica" },
  { id: 1, name: "Colegio Superior de Señoritas" },
  { id: 1, name: "Liceo de Heredia" },
  { id: 1, name: "Liceo de San José" },
  { id: 1, name: "Colegio de San Luis Gonzaga" },
  { id: 1, name: "Liceo de Cartago" },
  { id: 1, name: "Colegio de Alajuela" },
  { id: 1, name: "Liceo de Puntarenas" },
  { id: 1, name: "Colegio de Limón" },
  { id: 1, name: "Liceo de Guanacaste" },
  { id: 1, name: "Colegio Técnico Profesional de Purral" },
  { id: 1, name: "Liceo Experimental Bilingüe de Grecia" },
  { id: 1, name: "Colegio Científico de Costa Rica" },
  { id: 1, name: "Liceo Napoleón Quesada Salazar" },
  { id: 1, name: "Colegio de Santa Cruz" },
  { id: 1, name: "Liceo de Aserrí" },
  { id: 1, name: "Colegio de San Ramón" },
  { id: 1, name: "Liceo de San Carlos" },
  { id: 1, name: "Colegio de Pérez Zeledón" },
  { id: 1, name: "Liceo de Turrialba" },
  { id: 1, name: "Colegio Nocturno de San José" },
  { id: 1, name: "Liceo de Osa" },
  { id: 1, name: "Colegio Técnico Profesional de Atenas" },
  { id: 1, name: "Liceo de Sarapiquí" },
  { id: 1, name: "Colegio de Upala" },
  { id: 1, name: "Liceo de Los Santos" },
  { id: 1, name: "Colegio de Tilarán" },
  { id: 1, name: "Liceo de Bagaces" },
  { id: 1, name: "Colegio de Cañas" },
  { id: 1, name: "Liceo de Nicoya" },
  { id: 1, name: "Colegio de La Cruz" },
  { id: 1, name: "Liceo de Hojancha" },
  { id: 1, name: "Colegio de Nandayure" },
  { id: 1, name: "Liceo de Carrillo" },
  { id: 1, name: "Colegio de Santa Bárbara" },
  { id: 1, name: "Liceo de San Pablo" },
  { id: 1, name: "Colegio de Barva" },
  { id: 1, name: "Liceo de Santo Domingo" },
  { id: 1, name: "Colegio de San Rafael" },
  { id: 1, name: "Liceo de Belén" },
  { id: 1, name: "Colegio de Flores" },
  { id: 1, name: "Liceo de San Isidro" },
  { id: 1, name: "Colegio de Curridabat" },
  { id: 1, name: "Liceo de Goicoechea" },
  { id: 1, name: "Colegio de Montes de Oca" },
  { id: 1, name: "Liceo de Tibás" },
  { id: 1, name: "Colegio de Moravia" },
  { id: 1, name: "Liceo de Coronado" },
  { id: 1, name: "Colegio de Acosta" },
  { id: 1, name: "Liceo de Tarrazú" },
  { id: 1, name: "Colegio de Dota" },
  { id: 1, name: "Liceo de León Cortés" },
  { id: 1, name: "Colegio de Desamparados" },
  { id: 1, name: "Liceo de Alajuelita" },
  { id: 1, name: "Colegio de Escazú" },
  { id: 1, name: "Liceo de Santa Ana" },
  { id: 1, name: "Colegio de Mora" },
  { id: 1, name: "Liceo de Puriscal" },
  { id: 1, name: "Colegio de Turrubares" },
];

/**
 * Email-domain → institution name mapping for auto-detection.
 * Used in teacher registration to auto-fill institution from email.
 */
export const DOMAIN_TO_INSTITUTION: Record<string, string> = {
  "mep.go.cr": "Ministerio de Educación Pública (MEP)",
  "stpaul.com": "Colegio San Paul",
  "ulacit.ed.cr": "ULACIT",
  "ucr.ac.cr": "Universidad de Costa Rica",
  "itcr.ac.cr": "Tecnológico de Costa Rica",
  "una.ac.cr": "Universidad Nacional",
  "uned.ac.cr": "Universidad Estatal a Distancia",
  "ulatina.ac.cr": "Universidad Latina",
  "fidelitas.ac.cr": "Universidad Fidélitas",
  "uam.ac.cr": "Universidad Americana",
};

/** Grade options — same as ProfessorMenu */
export const GRADES = ["7", "8", "9", "10", "11", "12"];

/** Section options — same as ProfessorMenu */
export const SECTIONS = ["1", "2", "3", "4"];
