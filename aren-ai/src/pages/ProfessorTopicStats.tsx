import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonModal,
} from '@ionic/react';
import {
    menu,
    statsChartOutline,
    gitNetworkOutline,
    peopleOutline,
    alertCircleOutline,
    flameOutline,
    closeOutline,
    schoolOutline,
    gameControllerOutline,
    timeOutline,
    trendingUpOutline,
    trendingDownOutline,
    checkmarkCircleOutline,
    closeCircleOutline,
    listOutline,
    globeOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import ProfessorMenu from '../components/ProfessorMenu';
import TopicGlobe from '../components/TopicGlobe';
import { useProfessorFilters } from '../hooks/useProfessorFilters';
import '../components/ProfessorHeader.css';
import '../components/TopicGlobe.css';
import './ProfessorTopicStats.css';

// ============ MOCK DATA ============

// Hierarchical Topic Structure for Full School Year
interface TopicNode {
    id: string;
    name: string;
    parentId: string | null; // null = root unit
    level: number; // 0 = unit, 1 = topic, 2 = subtopic
    score: number;
    connections: string[]; // prerequisite topics
    // Drill-down data
    studentsCompleted: number;
    totalStudents: number;
    correctAnswers: number;
    incorrectAnswers: number;
    commonMistakes: string[];
    strugglingStudents: { name: string; score: number }[];
    topPerformers: { name: string; score: number }[];
}

// Helper to generate random student performance
const genStudents = (low: number, high: number) => ({
    strugglingStudents: [
        { name: 'Pedro Gómez', score: low },
        { name: 'Elena Martínez', score: low + 8 },
    ],
    topPerformers: [
        { name: 'Ana García', score: high },
        { name: 'Carlos Méndez', score: high - 3 },
    ],
});

// Full Year Math Curriculum - 8 Units with Topics and Subtopics
const TOPIC_NETWORK: TopicNode[] = [
    // ========== UNIT 1: NÚMEROS Y OPERACIONES ==========
    {
        id: 'u1', name: '1. Números y Operaciones', parentId: null, level: 0, score: 76, connections: [],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 850, incorrectAnswers: 250,
        commonMistakes: [], ...genStudents(48, 95)
    },

    {
        id: 'u1t1', name: 'Números Naturales', parentId: 'u1', level: 1, score: 85, connections: [],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 280, incorrectAnswers: 40,
        commonMistakes: ['Valor posicional', 'Comparación de números grandes'], ...genStudents(62, 98)
    },
    {
        id: 'u1t1s1', name: 'Valor posicional', parentId: 'u1t1', level: 2, score: 88, connections: [],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 95, incorrectAnswers: 10,
        commonMistakes: ['Confundir unidades/decenas'], ...genStudents(65, 100)
    },
    {
        id: 'u1t1s2', name: 'Comparación y orden', parentId: 'u1t1', level: 2, score: 82, connections: ['u1t1s1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 88, incorrectAnswers: 18,
        commonMistakes: ['Símbolos < y >'], ...genStudents(58, 96)
    },

    {
        id: 'u1t2', name: 'Operaciones Básicas', parentId: 'u1', level: 1, score: 78, connections: ['u1t1'],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 320, incorrectAnswers: 80,
        commonMistakes: ['Llevar en suma', 'Prestar en resta'], ...genStudents(52, 95)
    },
    {
        id: 'u1t2s1', name: 'Suma y resta', parentId: 'u1t2', level: 2, score: 82, connections: ['u1t1s1'],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 110, incorrectAnswers: 20,
        commonMistakes: ['Acarreos'], ...genStudents(58, 98)
    },
    {
        id: 'u1t2s2', name: 'Multiplicación', parentId: 'u1t2', level: 2, score: 75, connections: ['u1t2s1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 100, incorrectAnswers: 30,
        commonMistakes: ['Tablas del 7, 8, 9'], ...genStudents(48, 94)
    },
    {
        id: 'u1t2s3', name: 'División', parentId: 'u1t2', level: 2, score: 68, connections: ['u1t2s2'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 85, incorrectAnswers: 40,
        commonMistakes: ['División con residuo', 'Verificación'], ...genStudents(42, 92)
    },

    {
        id: 'u1t3', name: 'Propiedades', parentId: 'u1', level: 1, score: 72, connections: ['u1t2'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 180, incorrectAnswers: 70,
        commonMistakes: ['Propiedad distributiva'], ...genStudents(45, 90)
    },
    {
        id: 'u1t3s1', name: 'Conmutativa y asociativa', parentId: 'u1t3', level: 2, score: 78, connections: ['u1t2s1'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 18,
        commonMistakes: ['Aplicar a resta/división'], ...genStudents(52, 94)
    },
    {
        id: 'u1t3s2', name: 'Distributiva', parentId: 'u1t3', level: 2, score: 65, connections: ['u1t3s1', 'u1t2s2'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 55, incorrectAnswers: 30,
        commonMistakes: ['Expandir paréntesis'], ...genStudents(38, 88)
    },

    // ========== UNIT 2: FRACCIONES ==========
    {
        id: 'u2', name: '2. Fracciones', parentId: null, level: 0, score: 71, connections: ['u1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 720, incorrectAnswers: 280,
        commonMistakes: [], ...genStudents(42, 92)
    },

    {
        id: 'u2t1', name: 'Conceptos Básicos', parentId: 'u2', level: 1, score: 79, connections: ['u1t2s3'],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 195, incorrectAnswers: 45,
        commonMistakes: ['Numerador vs denominador'], ...genStudents(55, 95)
    },
    {
        id: 'u2t1s1', name: 'Representación', parentId: 'u2t1', level: 2, score: 82, connections: [],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 70, incorrectAnswers: 12,
        commonMistakes: ['Partes iguales'], ...genStudents(60, 98)
    },
    {
        id: 'u2t1s2', name: 'Fracciones equivalentes', parentId: 'u2t1', level: 2, score: 75, connections: ['u2t1s1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 20,
        commonMistakes: ['Multiplicar ambos términos'], ...genStudents(50, 92)
    },
    {
        id: 'u2t1s3', name: 'Simplificación', parentId: 'u2t1', level: 2, score: 70, connections: ['u2t1s2', 'u1t2s3'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 58, incorrectAnswers: 22,
        commonMistakes: ['Encontrar MCD'], ...genStudents(45, 90)
    },

    {
        id: 'u2t2', name: 'Operaciones con Fracciones', parentId: 'u2', level: 1, score: 65, connections: ['u2t1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 280, incorrectAnswers: 150,
        commonMistakes: ['MCM para sumar'], ...genStudents(38, 88)
    },
    {
        id: 'u2t2s1', name: 'Suma y resta', parentId: 'u2t2', level: 2, score: 62, connections: ['u2t1s3'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 85, incorrectAnswers: 50,
        commonMistakes: ['Denominador común'], ...genStudents(35, 85)
    },
    {
        id: 'u2t2s2', name: 'Multiplicación', parentId: 'u2t2', level: 2, score: 70, connections: ['u2t2s1'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 95, incorrectAnswers: 35,
        commonMistakes: ['Simplificar antes'], ...genStudents(45, 90)
    },
    {
        id: 'u2t2s3', name: 'División', parentId: 'u2t2', level: 2, score: 58, connections: ['u2t2s2'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 70, incorrectAnswers: 50,
        commonMistakes: ['Invertir y multiplicar'], ...genStudents(32, 82)
    },

    {
        id: 'u2t3', name: 'Números Mixtos', parentId: 'u2', level: 1, score: 68, connections: ['u2t2'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 145, incorrectAnswers: 65,
        commonMistakes: ['Conversión'], ...genStudents(42, 88)
    },

    // ========== UNIT 3: DECIMALES ==========
    {
        id: 'u3', name: '3. Decimales', parentId: null, level: 0, score: 74, connections: ['u2'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 580, incorrectAnswers: 180,
        commonMistakes: [], ...genStudents(48, 94)
    },

    {
        id: 'u3t1', name: 'Conceptos Decimales', parentId: 'u3', level: 1, score: 80, connections: ['u2t1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 175, incorrectAnswers: 35,
        commonMistakes: ['Lectura de decimales'], ...genStudents(58, 96)
    },
    {
        id: 'u3t1s1', name: 'Valor posicional decimal', parentId: 'u3t1', level: 2, score: 82, connections: ['u1t1s1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 60, incorrectAnswers: 10,
        commonMistakes: ['Décimas vs centésimas'], ...genStudents(60, 98)
    },
    {
        id: 'u3t1s2', name: 'Conversión fracción-decimal', parentId: 'u3t1', level: 2, score: 75, connections: ['u3t1s1', 'u2t1s3'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 55, incorrectAnswers: 18,
        commonMistakes: ['División para convertir'], ...genStudents(50, 92)
    },

    {
        id: 'u3t2', name: 'Operaciones Decimales', parentId: 'u3', level: 1, score: 72, connections: ['u3t1'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 250, incorrectAnswers: 85,
        commonMistakes: ['Alinear punto decimal'], ...genStudents(48, 90)
    },
    {
        id: 'u3t2s1', name: 'Suma y resta', parentId: 'u3t2', level: 2, score: 78, connections: ['u3t1s1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 85, incorrectAnswers: 20,
        commonMistakes: ['Alineación del punto'], ...genStudents(55, 95)
    },
    {
        id: 'u3t2s2', name: 'Multiplicación', parentId: 'u3t2', level: 2, score: 68, connections: ['u3t2s1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 75, incorrectAnswers: 35,
        commonMistakes: ['Contar decimales'], ...genStudents(42, 88)
    },
    {
        id: 'u3t2s3', name: 'División', parentId: 'u3t2', level: 2, score: 62, connections: ['u3t2s2'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 40,
        commonMistakes: ['Mover punto decimal'], ...genStudents(38, 85)
    },

    // ========== UNIT 4: PORCENTAJES ==========
    {
        id: 'u4', name: '4. Porcentajes', parentId: null, level: 0, score: 69, connections: ['u2', 'u3'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 420, incorrectAnswers: 180,
        commonMistakes: [], ...genStudents(42, 88)
    },

    {
        id: 'u4t1', name: 'Concepto de Porcentaje', parentId: 'u4', level: 1, score: 75, connections: ['u2t1', 'u3t1'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 145, incorrectAnswers: 45,
        commonMistakes: ['% como fracción de 100'], ...genStudents(50, 92)
    },
    {
        id: 'u4t1s1', name: 'Conversiones', parentId: 'u4t1', level: 2, score: 72, connections: ['u3t1s2'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 75, incorrectAnswers: 25,
        commonMistakes: ['%, fracción, decimal'], ...genStudents(48, 90)
    },

    {
        id: 'u4t2', name: 'Cálculos con Porcentajes', parentId: 'u4', level: 1, score: 65, connections: ['u4t1'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 180, incorrectAnswers: 95,
        commonMistakes: ['Calcular % de cantidad'], ...genStudents(38, 85)
    },
    {
        id: 'u4t2s1', name: 'Porcentaje de una cantidad', parentId: 'u4t2', level: 2, score: 68, connections: ['u4t1s1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 28,
        commonMistakes: ['Multiplicar por decimal'], ...genStudents(42, 88)
    },
    {
        id: 'u4t2s2', name: 'Aumentos y descuentos', parentId: 'u4t2', level: 2, score: 62, connections: ['u4t2s1'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 55, incorrectAnswers: 35,
        commonMistakes: ['Sumar/restar al original'], ...genStudents(35, 82)
    },

    // ========== UNIT 5: ÁLGEBRA ==========
    {
        id: 'u5', name: '5. Álgebra', parentId: null, level: 0, score: 66, connections: ['u1'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 520, incorrectAnswers: 280,
        commonMistakes: [], ...genStudents(38, 86)
    },

    {
        id: 'u5t1', name: 'Expresiones Algebraicas', parentId: 'u5', level: 1, score: 70, connections: ['u1t3'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 165, incorrectAnswers: 65,
        commonMistakes: ['Términos semejantes'], ...genStudents(45, 88)
    },
    {
        id: 'u5t1s1', name: 'Variables y constantes', parentId: 'u5t1', level: 2, score: 75, connections: [],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 58, incorrectAnswers: 15,
        commonMistakes: ['Concepto de variable'], ...genStudents(50, 92)
    },
    {
        id: 'u5t1s2', name: 'Evaluación', parentId: 'u5t1', level: 2, score: 72, connections: ['u5t1s1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 55, incorrectAnswers: 20,
        commonMistakes: ['Sustituir valores'], ...genStudents(48, 90)
    },
    {
        id: 'u5t1s3', name: 'Simplificación', parentId: 'u5t1', level: 2, score: 65, connections: ['u5t1s2'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 48, incorrectAnswers: 28,
        commonMistakes: ['Combinar términos'], ...genStudents(40, 85)
    },

    {
        id: 'u5t2', name: 'Ecuaciones Lineales', parentId: 'u5', level: 1, score: 62, connections: ['u5t1'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 195, incorrectAnswers: 125,
        commonMistakes: ['Despejar variable'], ...genStudents(35, 82)
    },
    {
        id: 'u5t2s1', name: 'Ecuaciones de un paso', parentId: 'u5t2', level: 2, score: 70, connections: ['u5t1s3'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 72, incorrectAnswers: 28,
        commonMistakes: ['Operación inversa'], ...genStudents(45, 88)
    },
    {
        id: 'u5t2s2', name: 'Ecuaciones de dos pasos', parentId: 'u5t2', level: 2, score: 62, connections: ['u5t2s1'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 58, incorrectAnswers: 38,
        commonMistakes: ['Orden de operaciones inversas'], ...genStudents(38, 82)
    },
    {
        id: 'u5t2s3', name: 'Ecuaciones con paréntesis', parentId: 'u5t2', level: 2, score: 55, connections: ['u5t2s2', 'u1t3s2'],
        studentsCompleted: 21, totalStudents: 28, correctAnswers: 45, incorrectAnswers: 42,
        commonMistakes: ['Distributiva primero'], ...genStudents(28, 78)
    },

    {
        id: 'u5t3', name: 'Desigualdades', parentId: 'u5', level: 1, score: 58, connections: ['u5t2'],
        studentsCompleted: 22, totalStudents: 28, correctAnswers: 110, incorrectAnswers: 80,
        commonMistakes: ['Invertir signo'], ...genStudents(32, 78)
    },

    // ========== UNIT 6: GEOMETRÍA ==========
    {
        id: 'u6', name: '6. Geometría', parentId: null, level: 0, score: 68, connections: [],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 680, incorrectAnswers: 320,
        commonMistakes: [], ...genStudents(42, 88)
    },

    {
        id: 'u6t1', name: 'Figuras Básicas', parentId: 'u6', level: 1, score: 78, connections: [],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 195, incorrectAnswers: 55,
        commonMistakes: ['Clasificación'], ...genStudents(55, 94)
    },
    {
        id: 'u6t1s1', name: 'Puntos, rectas, planos', parentId: 'u6t1', level: 2, score: 82, connections: [],
        studentsCompleted: 28, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 12,
        commonMistakes: ['Notación'], ...genStudents(60, 96)
    },
    {
        id: 'u6t1s2', name: 'Ángulos', parentId: 'u6t1', level: 2, score: 75, connections: ['u6t1s1'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 68, incorrectAnswers: 22,
        commonMistakes: ['Medir con transportador', 'Tipos de ángulos'], ...genStudents(50, 92)
    },
    {
        id: 'u6t1s3', name: 'Polígonos', parentId: 'u6t1', level: 2, score: 72, connections: ['u6t1s2'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 62, incorrectAnswers: 21,
        commonMistakes: ['Clasificación por lados'], ...genStudents(48, 90)
    },

    {
        id: 'u6t2', name: 'Triángulos', parentId: 'u6', level: 1, score: 70, connections: ['u6t1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 175, incorrectAnswers: 75,
        commonMistakes: ['Suma de ángulos = 180°'], ...genStudents(45, 88)
    },
    {
        id: 'u6t2s1', name: 'Clasificación', parentId: 'u6t2', level: 2, score: 75, connections: ['u6t1s3'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 62, incorrectAnswers: 18,
        commonMistakes: ['Por lados vs ángulos'], ...genStudents(50, 92)
    },
    {
        id: 'u6t2s2', name: 'Propiedades', parentId: 'u6t2', level: 2, score: 68, connections: ['u6t2s1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 58, incorrectAnswers: 28,
        commonMistakes: ['Ángulos interiores'], ...genStudents(42, 86)
    },
    {
        id: 'u6t2s3', name: 'Teorema de Pitágoras', parentId: 'u6t2', level: 2, score: 58, connections: ['u6t2s2', 'u5t2'],
        studentsCompleted: 22, totalStudents: 28, correctAnswers: 48, incorrectAnswers: 35,
        commonMistakes: ['Identificar catetos/hipotenusa', 'Aplicar fórmula'], ...genStudents(32, 80)
    },

    {
        id: 'u6t3', name: 'Cuadriláteros', parentId: 'u6', level: 1, score: 65, connections: ['u6t1'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 140, incorrectAnswers: 75,
        commonMistakes: ['Propiedades específicas'], ...genStudents(40, 85)
    },
    {
        id: 'u6t3s1', name: 'Tipos y propiedades', parentId: 'u6t3', level: 2, score: 68, connections: ['u6t1s3'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 72, incorrectAnswers: 32,
        commonMistakes: ['Diferencias entre tipos'], ...genStudents(42, 86)
    },

    {
        id: 'u6t4', name: 'Círculos', parentId: 'u6', level: 1, score: 62, connections: ['u6t1'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 120, incorrectAnswers: 72,
        commonMistakes: ['Radio vs diámetro', 'Fórmulas'], ...genStudents(38, 82)
    },

    // ========== UNIT 7: MEDICIÓN ==========
    {
        id: 'u7', name: '7. Medición', parentId: null, level: 0, score: 70, connections: ['u6', 'u3'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 580, incorrectAnswers: 245,
        commonMistakes: [], ...genStudents(45, 90)
    },

    {
        id: 'u7t1', name: 'Perímetro', parentId: 'u7', level: 1, score: 78, connections: ['u6t1'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 165, incorrectAnswers: 40,
        commonMistakes: ['Sumar todos los lados'], ...genStudents(55, 94)
    },
    {
        id: 'u7t1s1', name: 'Perímetro de polígonos', parentId: 'u7t1', level: 2, score: 80, connections: ['u6t1s3'],
        studentsCompleted: 27, totalStudents: 28, correctAnswers: 85, incorrectAnswers: 18,
        commonMistakes: ['Fórmulas específicas'], ...genStudents(58, 96)
    },
    {
        id: 'u7t1s2', name: 'Circunferencia', parentId: 'u7t1', level: 2, score: 72, connections: ['u6t4', 'u3t2'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 25,
        commonMistakes: ['Uso de π'], ...genStudents(48, 90)
    },

    {
        id: 'u7t2', name: 'Área', parentId: 'u7', level: 1, score: 68, connections: ['u7t1'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 220, incorrectAnswers: 100,
        commonMistakes: ['Confundir con perímetro', 'Unidades cuadradas'], ...genStudents(42, 88)
    },
    {
        id: 'u7t2s1', name: 'Área de rectángulos', parentId: 'u7t2', level: 2, score: 75, connections: ['u6t3s1'],
        studentsCompleted: 26, totalStudents: 28, correctAnswers: 78, incorrectAnswers: 22,
        commonMistakes: ['Base × altura'], ...genStudents(50, 92)
    },
    {
        id: 'u7t2s2', name: 'Área de triángulos', parentId: 'u7t2', level: 2, score: 68, connections: ['u7t2s1', 'u6t2'],
        studentsCompleted: 25, totalStudents: 28, correctAnswers: 65, incorrectAnswers: 30,
        commonMistakes: ['Dividir entre 2', 'Identificar altura'], ...genStudents(42, 86)
    },
    {
        id: 'u7t2s3', name: 'Área de círculos', parentId: 'u7t2', level: 2, score: 60, connections: ['u6t4', 'u7t1s2'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 52, incorrectAnswers: 38,
        commonMistakes: ['π × r²'], ...genStudents(35, 80)
    },

    {
        id: 'u7t3', name: 'Volumen', parentId: 'u7', level: 1, score: 62, connections: ['u7t2'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 145, incorrectAnswers: 85,
        commonMistakes: ['Unidades cúbicas', 'Fórmulas 3D'], ...genStudents(38, 82)
    },
    {
        id: 'u7t3s1', name: 'Prismas y cubos', parentId: 'u7t3', level: 2, score: 65, connections: ['u7t2s1'],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 75, incorrectAnswers: 40,
        commonMistakes: ['Largo × ancho × alto'], ...genStudents(40, 85)
    },
    {
        id: 'u7t3s2', name: 'Cilindros', parentId: 'u7t3', level: 2, score: 55, connections: ['u7t2s3', 'u7t3s1'],
        studentsCompleted: 21, totalStudents: 28, correctAnswers: 48, incorrectAnswers: 42,
        commonMistakes: ['Área base × altura'], ...genStudents(30, 78)
    },

    // ========== UNIT 8: RESOLUCIÓN DE PROBLEMAS ==========
    {
        id: 'u8', name: '8. Resolución de Problemas', parentId: null, level: 0, score: 58, connections: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
        studentsCompleted: 22, totalStudents: 28, correctAnswers: 320, incorrectAnswers: 280,
        commonMistakes: [], ...genStudents(28, 80)
    },

    {
        id: 'u8t1', name: 'Estrategias', parentId: 'u8', level: 1, score: 62, connections: [],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 125, incorrectAnswers: 78,
        commonMistakes: ['Identificar datos', 'Planear solución'], ...genStudents(35, 82)
    },
    {
        id: 'u8t1s1', name: 'Comprensión del problema', parentId: 'u8t1', level: 2, score: 65, connections: [],
        studentsCompleted: 24, totalStudents: 28, correctAnswers: 48, incorrectAnswers: 25,
        commonMistakes: ['Leer completamente'], ...genStudents(40, 85)
    },
    {
        id: 'u8t1s2', name: 'Elegir operación', parentId: 'u8t1', level: 2, score: 58, connections: ['u8t1s1'],
        studentsCompleted: 23, totalStudents: 28, correctAnswers: 42, incorrectAnswers: 32,
        commonMistakes: ['Palabras clave'], ...genStudents(32, 78)
    },

    {
        id: 'u8t2', name: 'Problemas Multi-paso', parentId: 'u8', level: 1, score: 52, connections: ['u8t1', 'u5t2'],
        studentsCompleted: 20, totalStudents: 28, correctAnswers: 115, incorrectAnswers: 125,
        commonMistakes: ['Orden de pasos', 'Verificar respuesta'], ...genStudents(25, 75)
    },
    {
        id: 'u8t2s1', name: 'Problemas de dos pasos', parentId: 'u8t2', level: 2, score: 58, connections: ['u8t1s2'],
        studentsCompleted: 22, totalStudents: 28, correctAnswers: 52, incorrectAnswers: 42,
        commonMistakes: ['Secuencia de operaciones'], ...genStudents(32, 80)
    },
    {
        id: 'u8t2s2', name: 'Problemas complejos', parentId: 'u8t2', level: 2, score: 48, connections: ['u8t2s1'],
        studentsCompleted: 18, totalStudents: 28, correctAnswers: 38, incorrectAnswers: 52,
        commonMistakes: ['Dividir en partes', 'Múltiples operaciones'], ...genStudents(22, 72)
    },

    {
        id: 'u8t3', name: 'Problemas de Aplicación', parentId: 'u8', level: 1, score: 55, connections: ['u8t2'],
        studentsCompleted: 21, totalStudents: 28, correctAnswers: 95, incorrectAnswers: 85,
        commonMistakes: ['Contextualizar', 'Unidades de respuesta'], ...genStudents(28, 78)
    },
];

// Get root units
const UNITS = TOPIC_NETWORK.filter(t => t.level === 0);

// Class overview stats (updated for full curriculum)
interface ClassStats {
    totalStudents: number;
    classAverage: number;
    totalTopics: number;
    completionRate: number;
}

const CLASS_STATS: ClassStats = {
    totalStudents: 28,
    classAverage: 68,
    totalTopics: TOPIC_NETWORK.length,
    completionRate: 78,
};

// Students data with more details
interface StudentSummary {
    id: string;
    name: string;
    averageScore: number;
    streak: number;
    level: number;
    quizzesTaken: number;
    battlesWon: number;
    totalBattles: number;
    studyTime: number; // minutos
    tardies: number;
    topicScores: { topic: string; score: number }[];
    recentActivity: { type: string; description: string; date: string }[];
}

const STUDENTS: StudentSummary[] = [
    {
        id: 's1', name: 'Ana García', averageScore: 95, streak: 12, level: 8, quizzesTaken: 24, battlesWon: 18, totalBattles: 22, studyTime: 120, tardies: 0,
        topicScores: [
            { topic: 'Álgebra Básica', score: 98 }, { topic: 'Geometría', score: 90 }, { topic: 'Fracciones', score: 100 },
            { topic: 'Ecuaciones', score: 92 }, { topic: 'Decimales', score: 100 }, { topic: 'Problemas', score: 88 }
        ],
        recentActivity: [
            { type: 'quiz', description: 'Quiz de Ecuaciones: 92%', date: '2026-01-25' },
            { type: 'battle', description: 'Victoria vs Carlos M.', date: '2026-01-24' },
        ]
    },
    {
        id: 's2', name: 'Carlos Méndez', averageScore: 91, streak: 8, level: 7, quizzesTaken: 20, battlesWon: 15, totalBattles: 20, studyTime: 95, tardies: 1,
        topicScores: [
            { topic: 'Álgebra Básica', score: 95 }, { topic: 'Geometría', score: 85 }, { topic: 'Fracciones', score: 88 },
            { topic: 'Ecuaciones', score: 94 }, { topic: 'Decimales', score: 92 }, { topic: 'Problemas', score: 85 }
        ],
        recentActivity: [
            { type: 'quiz', description: 'Quiz de Decimales: 92%', date: '2026-01-25' },
        ]
    },
    {
        id: 's3', name: 'María López', averageScore: 88, streak: 5, level: 6, quizzesTaken: 18, battlesWon: 12, totalBattles: 18, studyTime: 80, tardies: 0,
        topicScores: [
            { topic: 'Álgebra Básica', score: 85 }, { topic: 'Geometría', score: 92 }, { topic: 'Fracciones', score: 90 },
            { topic: 'Ecuaciones', score: 88 }, { topic: 'Decimales', score: 98 }, { topic: 'Problemas', score: 75 }
        ],
        recentActivity: []
    },
    {
        id: 's4', name: 'Diego Sánchez', averageScore: 82, streak: 3, level: 5, quizzesTaken: 15, battlesWon: 9, totalBattles: 14, studyTime: 65, tardies: 1,
        topicScores: [
            { topic: 'Álgebra Básica', score: 80 }, { topic: 'Geometría', score: 78 }, { topic: 'Fracciones', score: 95 },
            { topic: 'Ecuaciones', score: 82 }, { topic: 'Decimales', score: 85 }, { topic: 'Problemas', score: 68 }
        ],
        recentActivity: []
    },
    {
        id: 's5', name: 'Sofía Torres', averageScore: 78, streak: 2, level: 5, quizzesTaken: 14, battlesWon: 8, totalBattles: 15, studyTime: 55, tardies: 2,
        topicScores: [
            { topic: 'Álgebra Básica', score: 75 }, { topic: 'Geometría', score: 72 }, { topic: 'Fracciones', score: 82 },
            { topic: 'Ecuaciones', score: 78 }, { topic: 'Decimales', score: 88 }, { topic: 'Problemas', score: 52 }
        ],
        recentActivity: []
    },
    {
        id: 's6', name: 'Luis Rodríguez', averageScore: 72, streak: 1, level: 4, quizzesTaken: 12, battlesWon: 6, totalBattles: 14, studyTime: 40, tardies: 4,
        topicScores: [
            { topic: 'Álgebra Básica', score: 70 }, { topic: 'Geometría', score: 48 }, { topic: 'Fracciones', score: 78 },
            { topic: 'Ecuaciones', score: 75 }, { topic: 'Decimales', score: 85 }, { topic: 'Problemas', score: 45 }
        ],
        recentActivity: []
    },
    {
        id: 's7', name: 'Elena Martínez', averageScore: 68, streak: 0, level: 4, quizzesTaken: 10, battlesWon: 4, totalBattles: 12, studyTime: 35, tardies: 2,
        topicScores: [
            { topic: 'Álgebra Básica', score: 52 }, { topic: 'Geometría', score: 55 }, { topic: 'Fracciones', score: 72 },
            { topic: 'Ecuaciones', score: 58 }, { topic: 'Decimales', score: 78 }, { topic: 'Problemas', score: 42 }
        ],
        recentActivity: []
    },
    {
        id: 's8', name: 'Pedro Gómez', averageScore: 55, streak: 0, level: 3, quizzesTaken: 8, battlesWon: 2, totalBattles: 10, studyTime: 20, tardies: 3,
        topicScores: [
            { topic: 'Álgebra Básica', score: 45 }, { topic: 'Geometría', score: 38 }, { topic: 'Fracciones', score: 55 },
            { topic: 'Ecuaciones', score: 42 }, { topic: 'Decimales', score: 62 }, { topic: 'Problemas', score: 28 }
        ],
        recentActivity: [
            { type: 'quiz', description: 'Quiz de Problemas: 28%', date: '2026-01-23' },
        ]
    },
];

// Alerts with drill-down data
interface Alert {
    id: string;
    type: 'low_performance' | 'difficult_topic' | 'tardiness';
    icon: string;
    title: string;
    description: string;
    severity: 'warning' | 'danger';
    relatedStudentId?: string;
    relatedTopicId?: string;
    details: string[];
    recommendations: string[];
}

const ALERTS: Alert[] = [
    {
        id: 'a1', type: 'low_performance', icon: '📉', title: 'Pedro Gómez', description: 'Promedio bajo: 55%', severity: 'danger',
        relatedStudentId: 's8',
        details: [
            'Promedio más bajo de la clase',
            'Solo 8 quizzes completados (menos que el promedio)',
            'Racha de estudio: 0 días',
            'Tema más débil: Problemas (28%)',
        ],
        recommendations: [
            'Asignar tutor de apoyo',
            'Sesión de refuerzo en Geometría y Problemas',
            'Comunicación con padres de familia',
        ]
    },
    {
        id: 'a2', type: 'low_performance', icon: '📉', title: 'Elena Martínez', description: 'Promedio bajo: 68%', severity: 'warning',
        relatedStudentId: 's7',
        details: [
            'Promedio debajo del 70%',
            'Dificultades en Álgebra Básica (52%)',
            'Bajo rendimiento en Problemas (42%)',
        ],
        recommendations: [
            'Ejercicios adicionales de álgebra',
            'Práctica guiada en resolución de problemas',
        ]
    },
    {
        id: 'a3', type: 'difficult_topic', icon: '🎯', title: 'Problemas', description: 'Promedio clase: 58%', severity: 'warning',
        relatedTopicId: 't6',
        details: [
            'Tema con menor rendimiento de la clase',
            '8 estudiantes debajo del 60%',
            '4 estudiantes no han completado el tema',
            'Error común: Interpretación del enunciado',
        ],
        recommendations: [
            'Clase de refuerzo grupal',
            'Ejercicios de comprensión lectora matemática',
            'Problemas paso a paso con explicación',
        ]
    },
    {
        id: 'a4', type: 'tardiness', icon: '⏰', title: 'Luis Rodríguez', description: '4 tardanzas este período', severity: 'warning',
        relatedStudentId: 's6',
        details: [
            'Llegadas tarde: Lun 15, Mié 17, Vie 19, Lun 22',
            'Patrón: Principalmente los lunes',
            'Impacto: Se pierde inicio de clases',
        ],
        recommendations: [
            'Conversar con el estudiante',
            'Notificar a padres de familia',
            'Verificar situación de transporte',
        ]
    },
    {
        id: 'a5', type: 'tardiness', icon: '⏰', title: 'Pedro Gómez', description: '3 tardanzas este período', severity: 'warning',
        relatedStudentId: 's8',
        details: [
            'Llegadas tarde: Mar 16, Jue 18, Mar 23',
            'Combinado con bajo rendimiento académico',
        ],
        recommendations: [
            'Reunión con padres de familia',
            'Plan de mejora integral',
        ]
    },
];

// ============ COMPONENT ============

const ProfessorTopicStats: React.FC = () => {
    const { t } = useTranslation();
    const {
        selectedGrade,
        setSelectedGrade,
        selectedSection,
        setSelectedSection,
        selectedSubject,
        setSelectedSubject,
    } = useProfessorFilters();

    const [activeTab, setActiveTab] = useState<'resumen' | 'red' | 'estudiantes'>('resumen');

    // Drill-down state
    const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
    const [topicsView, setTopicsView] = useState<'list' | 'globe'>('list');

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#2ecc71';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    const handleTopicClick = (topic: TopicNode) => {
        setSelectedTopic(topic);
    };

    const handleStudentClick = (student: StudentSummary) => {
        setSelectedStudent(student);
    };

    const handleAlertClick = (alert: Alert) => {
        setSelectedAlert(alert);
    };

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => {
            const newSet = new Set(prev);
            if (newSet.has(unitId)) {
                newSet.delete(unitId);
            } else {
                newSet.add(unitId);
            }
            return newSet;
        });
    };

    // Get children of a topic
    const getChildren = (parentId: string) => {
        return TOPIC_NETWORK.filter(t => t.parentId === parentId);
    };

    return (
        <IonPage className="pts-page">
            <IonHeader className="professor-header-container">
                <IonToolbar color="primary" className="professor-toolbar">
                    <div className="ph-content">
                        <IonMenuButton className="ph-menu-btn">
                            <IonIcon icon={menu} />
                        </IonMenuButton>
                    </div>
                </IonToolbar>

                <div className="ph-brand-container-absolute">
                    <div className="ph-brand-name">ArenAI</div>
                    <div className="ph-brand-sub">Estadísticas</div>
                </div>

                <div className="ph-notch-container">
                    <div className="ph-notch">
                        <div className="ph-dropdowns-display">
                            <div className="ph-text-oval">
                                <ProfessorMenu
                                    selectedGrade={String(selectedGrade)}
                                    selectedSection={selectedSection}
                                    selectedSubject={t(
                                        'professor.dashboard.subjects.' +
                                        selectedSubject.replace(/\s+/g, ''),
                                    )}
                                    onGradeChange={(grade) => setSelectedGrade(parseInt(grade, 10))}
                                    onSectionChange={setSelectedSection}
                                    onSubjectChange={setSelectedSubject}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent fullscreen className="pts-content">
                <PageTransition variant="fade">
                    {/* Tab Selector */}
                    <div className="pts-tabs-container">
                        <IonSegment
                            value={activeTab}
                            onIonChange={(e) => setActiveTab(e.detail.value as any)}
                            className="pts-segment"
                        >
                            <IonSegmentButton value="resumen">
                                <IonIcon icon={statsChartOutline} />
                                <IonLabel>Resumen</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="red">
                                <IonIcon icon={gitNetworkOutline} />
                                <IonLabel>Temas</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="estudiantes">
                                <IonIcon icon={peopleOutline} />
                                <IonLabel>Estudiantes</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>

                    {/* TAB: Resumen */}
                    {activeTab === 'resumen' && (
                        <div className="pts-tab-content">
                            {/* Stats Row */}
                            <div className="pts-stats-row">
                                <div className="pts-stat-circle" onClick={() => setActiveTab('estudiantes')}>
                                    <span className="pts-stat-value">{CLASS_STATS.totalStudents}</span>
                                    <span className="pts-stat-label">Estudiantes</span>
                                </div>
                                <div className="pts-stat-circle">
                                    <span className="pts-stat-value" style={{ color: getScoreColor(CLASS_STATS.classAverage) }}>
                                        {CLASS_STATS.classAverage}%
                                    </span>
                                    <span className="pts-stat-label">Promedio</span>
                                </div>
                                <div className="pts-stat-circle" onClick={() => setActiveTab('red')}>
                                    <span className="pts-stat-value">{CLASS_STATS.totalTopics}</span>
                                    <span className="pts-stat-label">Temas</span>
                                </div>
                                <div className="pts-stat-circle">
                                    <span className="pts-stat-value" style={{ color: getScoreColor(CLASS_STATS.completionRate) }}>
                                        {CLASS_STATS.completionRate}%
                                    </span>
                                    <span className="pts-stat-label">Completado</span>
                                </div>
                            </div>

                            {/* Alerts */}
                            <div className="pts-card">
                                <div className="pts-card-title">
                                    <IonIcon icon={alertCircleOutline} />
                                    Alertas de Atención
                                </div>
                                <div className="pts-alerts-list">
                                    {ALERTS.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`pts-alert-item ${alert.severity} clickable`}
                                            onClick={() => handleAlertClick(alert)}
                                        >
                                            <span className="pts-alert-icon">{alert.icon}</span>
                                            <div className="pts-alert-info">
                                                <span className="pts-alert-title">{alert.title}</span>
                                                <span className="pts-alert-desc">{alert.description}</span>
                                            </div>
                                            <IonIcon icon={trendingDownOutline} className="pts-alert-arrow" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Temas (Tree View + Globe) */}
                    {activeTab === 'red' && (
                        <div className="pts-tab-content">
                            {/* View Toggle */}
                            <div className="pts-view-toggle">
                                <button
                                    className={`pts-view-btn ${topicsView === 'list' ? 'active' : ''}`}
                                    onClick={() => setTopicsView('list')}
                                >
                                    <IonIcon icon={listOutline} />
                                    Lista
                                </button>
                                <button
                                    className={`pts-view-btn ${topicsView === 'globe' ? 'active' : ''}`}
                                    onClick={() => setTopicsView('globe')}
                                >
                                    <IonIcon icon={globeOutline} />
                                    Globo 3D
                                </button>
                            </div>

                            {/* Globe View */}
                            {topicsView === 'globe' && (
                                <>
                                    <TopicGlobe
                                        topics={TOPIC_NETWORK}
                                        onTopicClick={handleTopicClick}
                                    />
                                    <p className="pts-hint">Arrastra para rotar • Toca un tema para ver detalles</p>
                                </>
                            )}

                            {/* List View */}
                            {topicsView === 'list' && (
                                <>
                                    {/* Legend */}
                                    <div className="pts-legend">
                                        <div className="pts-legend-item">
                                            <span className="pts-legend-dot" style={{ background: '#2ecc71' }}></span>
                                            <span>≥80%</span>
                                        </div>
                                        <div className="pts-legend-item">
                                            <span className="pts-legend-dot" style={{ background: '#f39c12' }}></span>
                                            <span>60-79%</span>
                                        </div>
                                        <div className="pts-legend-item">
                                            <span className="pts-legend-dot" style={{ background: '#e74c3c' }}></span>
                                            <span>&lt;60%</span>
                                        </div>
                                    </div>

                                    {/* Tree View */}
                                    <div className="pts-tree">
                                        {UNITS.map(unit => {
                                            const isExpanded = expandedUnits.has(unit.id);
                                            const topics = getChildren(unit.id);

                                            return (
                                                <div key={unit.id} className="pts-tree-unit">
                                                    {/* Unit Header */}
                                                    <div
                                                        className="pts-tree-unit-header clickable"
                                                        onClick={() => toggleUnit(unit.id)}
                                                    >
                                                        <div className="pts-tree-expand-icon">
                                                            {isExpanded ? '▼' : '►'}
                                                        </div>
                                                        <div className="pts-tree-unit-info">
                                                            <span className="pts-tree-unit-name">{unit.name}</span>
                                                            <span className="pts-tree-unit-count">
                                                                {topics.length} temas
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="pts-tree-score"
                                                            style={{ background: getScoreColor(unit.score) }}
                                                        >
                                                            {unit.score}%
                                                        </div>
                                                    </div>

                                                    {/* Topics (Level 1) */}
                                                    {isExpanded && (
                                                        <div className="pts-tree-topics">
                                                            {topics.map(topic => {
                                                                const subtopics = getChildren(topic.id);
                                                                const isTopicExpanded = expandedUnits.has(topic.id);

                                                                return (
                                                                    <div key={topic.id} className="pts-tree-topic">
                                                                        <div className="pts-tree-topic-row">
                                                                            {subtopics.length > 0 ? (
                                                                                <div
                                                                                    className="pts-tree-topic-expand"
                                                                                    onClick={() => toggleUnit(topic.id)}
                                                                                >
                                                                                    {isTopicExpanded ? '▼' : '►'}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="pts-tree-topic-expand">○</div>
                                                                            )}
                                                                            <div
                                                                                className="pts-tree-topic-info clickable"
                                                                                onClick={() => handleTopicClick(topic)}
                                                                            >
                                                                                <span className="pts-tree-topic-name">{topic.name}</span>
                                                                                <div className="pts-tree-bar-container">
                                                                                    <div
                                                                                        className="pts-tree-bar"
                                                                                        style={{
                                                                                            width: `${topic.score}%`,
                                                                                            background: getScoreColor(topic.score)
                                                                                        }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                className="pts-tree-topic-score"
                                                                                style={{ color: getScoreColor(topic.score) }}
                                                                            >
                                                                                {topic.score}%
                                                                            </div>
                                                                        </div>

                                                                        {/* Subtopics (Level 2) */}
                                                                        {isTopicExpanded && subtopics.length > 0 && (
                                                                            <div className="pts-tree-subtopics">
                                                                                {subtopics.map(sub => (
                                                                                    <div
                                                                                        key={sub.id}
                                                                                        className="pts-tree-subtopic clickable"
                                                                                        onClick={() => handleTopicClick(sub)}
                                                                                    >
                                                                                        <span className="pts-tree-subtopic-name">{sub.name}</span>
                                                                                        <span
                                                                                            className="pts-tree-subtopic-score"
                                                                                            style={{ color: getScoreColor(sub.score) }}
                                                                                        >
                                                                                            {sub.score}%
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <p className="pts-hint">Toca una unidad para expandir • Toca un tema para ver detalles</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB: Estudiantes */}
                    {activeTab === 'estudiantes' && (
                        <div className="pts-tab-content">
                            <div className="pts-top-students">
                                {STUDENTS.slice(0, 3).map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className={`pts-top-card rank-${idx + 1}`}
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        <div className="pts-top-rank">{idx + 1}</div>
                                        <div className="pts-top-avatar">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="pts-top-name">{student.name}</div>
                                        <div className="pts-top-score" style={{ color: getScoreColor(student.averageScore) }}>
                                            {student.averageScore}%
                                        </div>
                                        <div className="pts-top-streak">
                                            <IonIcon icon={flameOutline} />
                                            {student.streak}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pts-students-list">
                                {STUDENTS.slice(3).map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className="pts-student-row clickable"
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        <div className="pts-student-rank">{idx + 4}</div>
                                        <div className="pts-student-avatar">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="pts-student-info">
                                            <span className="pts-student-name">{student.name}</span>
                                            <span className="pts-student-stats">
                                                Lvl {student.level} • {student.quizzesTaken} quizzes
                                            </span>
                                        </div>
                                        <div className="pts-student-score" style={{ color: getScoreColor(student.averageScore) }}>
                                            {student.averageScore}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pts-footer-spacer"></div>
                </PageTransition>
            </IonContent>

            {/* ============ DRILL-DOWN MODALS ============ */}

            {/* Topic Detail Modal */}
            <IonModal isOpen={!!selectedTopic} onDidDismiss={() => setSelectedTopic(null)}>
                <div className="pts-modal">
                    <div className="pts-modal-header">
                        <h2>{selectedTopic?.name}</h2>
                        <button className="pts-modal-close" onClick={() => setSelectedTopic(null)}>
                            <IonIcon icon={closeOutline} />
                        </button>
                    </div>
                    {selectedTopic && (
                        <div className="pts-modal-content">
                            {/* Score Overview */}
                            <div className="pts-modal-score-row">
                                <div className="pts-modal-big-score" style={{ color: getScoreColor(selectedTopic.score) }}>
                                    {selectedTopic.score}%
                                </div>
                                <div className="pts-modal-score-label">Promedio de la clase</div>
                            </div>

                            {/* Stats Grid */}
                            <div className="pts-modal-stats">
                                <div className="pts-modal-stat">
                                    <IonIcon icon={checkmarkCircleOutline} style={{ color: '#2ecc71' }} />
                                    <span className="pts-modal-stat-value">{selectedTopic.correctAnswers}</span>
                                    <span className="pts-modal-stat-label">Correctas</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={closeCircleOutline} style={{ color: '#e74c3c' }} />
                                    <span className="pts-modal-stat-value">{selectedTopic.incorrectAnswers}</span>
                                    <span className="pts-modal-stat-label">Incorrectas</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={peopleOutline} />
                                    <span className="pts-modal-stat-value">{selectedTopic.studentsCompleted}/{selectedTopic.totalStudents}</span>
                                    <span className="pts-modal-stat-label">Completaron</span>
                                </div>
                            </div>

                            {/* Common Mistakes */}
                            <div className="pts-modal-section">
                                <h3>❌ Errores Comunes</h3>
                                <ul>
                                    {selectedTopic.commonMistakes.map((mistake, idx) => (
                                        <li key={idx}>{mistake}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Struggling Students */}
                            <div className="pts-modal-section">
                                <h3>⚠️ Estudiantes con Dificultades</h3>
                                <div className="pts-modal-student-list">
                                    {selectedTopic.strugglingStudents.map((s, idx) => (
                                        <div key={idx} className="pts-modal-student-item">
                                            <span>{s.name}</span>
                                            <span style={{ color: getScoreColor(s.score) }}>{s.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Performers */}
                            <div className="pts-modal-section">
                                <h3>⭐ Mejores del Tema</h3>
                                <div className="pts-modal-student-list">
                                    {selectedTopic.topPerformers.map((s, idx) => (
                                        <div key={idx} className="pts-modal-student-item">
                                            <span>{s.name}</span>
                                            <span style={{ color: getScoreColor(s.score) }}>{s.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </IonModal>

            {/* Student Detail Modal */}
            <IonModal isOpen={!!selectedStudent} onDidDismiss={() => setSelectedStudent(null)}>
                <div className="pts-modal">
                    <div className="pts-modal-header">
                        <h2>{selectedStudent?.name}</h2>
                        <button className="pts-modal-close" onClick={() => setSelectedStudent(null)}>
                            <IonIcon icon={closeOutline} />
                        </button>
                    </div>
                    {selectedStudent && (
                        <div className="pts-modal-content">
                            {/* Score + Stats */}
                            <div className="pts-modal-score-row">
                                <div className="pts-modal-big-score" style={{ color: getScoreColor(selectedStudent.averageScore) }}>
                                    {selectedStudent.averageScore}%
                                </div>
                                <div className="pts-modal-score-label">Promedio General</div>
                            </div>

                            <div className="pts-modal-stats">
                                <div className="pts-modal-stat">
                                    <IonIcon icon={flameOutline} style={{ color: '#e74c3c' }} />
                                    <span className="pts-modal-stat-value">{selectedStudent.streak}</span>
                                    <span className="pts-modal-stat-label">Racha</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={schoolOutline} />
                                    <span className="pts-modal-stat-value">{selectedStudent.quizzesTaken}</span>
                                    <span className="pts-modal-stat-label">Quizzes</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={gameControllerOutline} />
                                    <span className="pts-modal-stat-value">{selectedStudent.battlesWon}/{selectedStudent.totalBattles}</span>
                                    <span className="pts-modal-stat-label">Batallas</span>
                                </div>
                                <div className="pts-modal-stat">
                                    <IonIcon icon={timeOutline} />
                                    <span className="pts-modal-stat-value">{selectedStudent.studyTime}m</span>
                                    <span className="pts-modal-stat-label">Estudio</span>
                                </div>
                            </div>

                            {/* Tardies Warning */}
                            {selectedStudent.tardies >= 3 && (
                                <div className="pts-modal-warning">
                                    ⚠️ {selectedStudent.tardies} tardanzas este período
                                </div>
                            )}

                            {/* Topic Breakdown */}
                            <div className="pts-modal-section">
                                <h3>📊 Rendimiento por Tema</h3>
                                <div className="pts-modal-topic-bars">
                                    {selectedStudent.topicScores.map((ts, idx) => (
                                        <div key={idx} className="pts-modal-topic-bar">
                                            <div className="pts-modal-topic-name">{ts.topic}</div>
                                            <div className="pts-modal-bar-track">
                                                <div
                                                    className="pts-modal-bar-fill"
                                                    style={{ width: `${ts.score}%`, background: getScoreColor(ts.score) }}
                                                ></div>
                                            </div>
                                            <div className="pts-modal-topic-score" style={{ color: getScoreColor(ts.score) }}>
                                                {ts.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            {selectedStudent.recentActivity.length > 0 && (
                                <div className="pts-modal-section">
                                    <h3>📅 Actividad Reciente</h3>
                                    <ul>
                                        {selectedStudent.recentActivity.map((act, idx) => (
                                            <li key={idx}>{act.date}: {act.description}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </IonModal>

            {/* Alert Detail Modal */}
            <IonModal isOpen={!!selectedAlert} onDidDismiss={() => setSelectedAlert(null)}>
                <div className="pts-modal">
                    <div className="pts-modal-header">
                        <h2>{selectedAlert?.icon} {selectedAlert?.title}</h2>
                        <button className="pts-modal-close" onClick={() => setSelectedAlert(null)}>
                            <IonIcon icon={closeOutline} />
                        </button>
                    </div>
                    {selectedAlert && (
                        <div className="pts-modal-content">
                            <div className={`pts-modal-alert-badge ${selectedAlert.severity}`}>
                                {selectedAlert.description}
                            </div>

                            {/* Details */}
                            <div className="pts-modal-section">
                                <h3>📋 Detalles</h3>
                                <ul>
                                    {selectedAlert.details.map((d, idx) => (
                                        <li key={idx}>{d}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations */}
                            <div className="pts-modal-section">
                                <h3>💡 Recomendaciones</h3>
                                <ul>
                                    {selectedAlert.recommendations.map((r, idx) => (
                                        <li key={idx}>{r}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Quick Action */}
                            {selectedAlert.relatedStudentId && (
                                <button
                                    className="pts-modal-action-btn"
                                    onClick={() => {
                                        const student = STUDENTS.find(s => s.id === selectedAlert.relatedStudentId);
                                        if (student) {
                                            setSelectedAlert(null);
                                            setTimeout(() => setSelectedStudent(student), 300);
                                        }
                                    }}
                                >
                                    Ver Perfil del Estudiante
                                </button>
                            )}
                            {selectedAlert.relatedTopicId && (
                                <button
                                    className="pts-modal-action-btn"
                                    onClick={() => {
                                        const topic = TOPIC_NETWORK.find(t => t.id === selectedAlert.relatedTopicId);
                                        if (topic) {
                                            setSelectedAlert(null);
                                            setTimeout(() => setSelectedTopic(topic), 300);
                                        }
                                    }}
                                >
                                    Ver Detalles del Tema
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </IonModal>
        </IonPage>
    );
};

export default ProfessorTopicStats;
