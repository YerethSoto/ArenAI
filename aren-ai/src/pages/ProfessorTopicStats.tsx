import React, { useState, useMemo } from 'react';
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
} from '@ionic/react';
import {
    menu,
    statsChartOutline,
    linkOutline,
    chevronDownOutline,
    chevronUpOutline,
    trophyOutline,
    flameOutline,
    alertCircleOutline,
    starOutline,
    trendingUpOutline,
    trendingDownOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import ProfessorMenu from '../components/ProfessorMenu';
import { useProfessorFilters } from '../hooks/useProfessorFilters';
import {
    SUBJECTS,
    getTopicsWithStats,
    getTopicRelations,
    TopicWithStats,
    TopicRelation,
} from '../data/topicsData';
import '../components/ProfessorHeader.css';
import './ProfessorTopicStats.css';

// ================================ STUDENT DATA ================================
interface StudentData {
    id: string;
    name: string;
    averageScore: number;
    streak: number;
    level: number;
}

const STUDENTS: StudentData[] = [
    { id: 's1', name: 'Ana García', averageScore: 95, streak: 12, level: 8 },
    { id: 's2', name: 'Carlos Martínez', averageScore: 88, streak: 7, level: 7 },
    { id: 's3', name: 'María Rodríguez', averageScore: 85, streak: 5, level: 6 },
    { id: 's4', name: 'Diego Sánchez', averageScore: 82, streak: 3, level: 5 },
    { id: 's5', name: 'Sofía Torres', averageScore: 78, streak: 2, level: 5 },
    { id: 's6', name: 'Luis Rodríguez', averageScore: 72, streak: 1, level: 4 },
    { id: 's7', name: 'Elena Martínez', averageScore: 68, streak: 0, level: 4 },
    { id: 's8', name: 'Pedro Gómez', averageScore: 55, streak: 0, level: 3 },
];

// ================================ SVG DONUT COMPONENT ================================
const DonutChart: React.FC<{ percent: number; size?: number; stroke?: number; color?: string }> = ({
    percent, size = 42, stroke = 5, color,
}) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const resolvedColor = color || (percent >= 80 ? '#2ecc71' : percent >= 60 ? '#f39c12' : '#e74c3c');

    return (
        <svg width={size} height={size} className="pts-donut">
            <circle cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={resolvedColor} strokeWidth={stroke}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                className="pts-donut-arc" />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
                className="pts-donut-text" fill={resolvedColor}>
                {percent}
            </text>
        </svg>
    );
};

// ================================ TOPIC RELATIONSHIP GRAPH ================================
interface TopicNode {
    topicId: number;
    name: string;
    shortName: string;
    x: number;
    y: number;
}

const TopicRelGraph: React.FC<{
    relations: TopicRelation[];
    subjectColor: string;
    selectedRelationId: string | null;
    onSelectRelation: (id: string | null) => void;
}> = ({ relations, subjectColor, selectedRelationId, onSelectRelation }) => {
    const W = 360;
    const H = 340;
    const R = 26; // node radius

    // Collect unique topic IDs that appear in relations
    const topicNodes = useMemo(() => {
        const topicMap = new Map<number, string>();
        relations.forEach(r => {
            topicMap.set(r.sourceTopicId, r.sourceName);
            topicMap.set(r.targetTopicId, r.targetName);
        });
        const topics = Array.from(topicMap.entries());
        const count = topics.length;
        if (count === 0) return [];

        // Arrange in a circle layout
        const centerX = W / 2;
        const centerY = H / 2;
        const radiusLayout = Math.min(W, H) / 2 - R - 20;

        return topics.map(([id, name], idx): TopicNode => {
            const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
            return {
                topicId: id,
                name: name,
                shortName: name.length > 14 ? name.substring(0, 12) + '…' : name,
                x: centerX + radiusLayout * Math.cos(angle),
                y: centerY + radiusLayout * Math.sin(angle),
            };
        });
    }, [relations]);

    const nodeMap = useMemo(() => {
        const m = new Map<number, TopicNode>();
        topicNodes.forEach(n => m.set(n.topicId, n));
        return m;
    }, [topicNodes]);

    if (topicNodes.length === 0) {
        return (
            <div className="pts-rel-empty">
                <span>🔗</span>
                <p>No hay relaciones para esta materia</p>
            </div>
        );
    }

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="pts-rel-svg" preserveAspectRatio="xMidYMid meet">
            {/* Connection lines */}
            {relations.map(rel => {
                const from = nodeMap.get(rel.sourceTopicId);
                const to = nodeMap.get(rel.targetTopicId);
                if (!from || !to) return null;

                const isSelected = selectedRelationId === rel.id;
                const thickness = Math.max(1.5, (rel.impactPercent / 100) * 8);

                // Curved path
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const nx = -dy * 0.12;
                const ny = dx * 0.12;
                const ctrlX = midX + nx;
                const ctrlY = midY + ny;

                const lineColor = rel.type === 'prerequisito' ? '#e74c3c'
                    : rel.type === 'complementario' ? '#3498db' : '#9b59b6';

                return (
                    <g key={rel.id}
                        onClick={() => onSelectRelation(isSelected ? null : rel.id)}
                        style={{ cursor: 'pointer' }}>
                        {/* Glow on selected */}
                        {isSelected && (
                            <path
                                d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                                fill="none" stroke={lineColor} strokeWidth={thickness + 5}
                                opacity={0.15} strokeLinecap="round"
                            />
                        )}
                        <path
                            d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                            fill="none" stroke={lineColor}
                            strokeWidth={thickness}
                            strokeLinecap="round"
                            opacity={isSelected ? 0.9 : 0.45}
                            className="pts-rel-line"
                        />
                        {/* Impact label */}
                        <rect x={ctrlX - 12} y={ctrlY - 7}
                            width={24} height={14} rx={7}
                            fill={isSelected ? lineColor : 'rgba(0,0,0,0.45)'}
                            opacity={0.9} />
                        <text x={ctrlX} y={ctrlY + 1}
                            textAnchor="middle" dominantBaseline="central"
                            className="pts-rel-line-label">
                            {rel.impactPercent}%
                        </text>
                    </g>
                );
            })}

            {/* Topic nodes */}
            {topicNodes.map(node => {
                // Is this node involved in the selected relation?
                const selectedRel = relations.find(r => r.id === selectedRelationId);
                const isHighlighted = selectedRel
                    ? (selectedRel.sourceTopicId === node.topicId || selectedRel.targetTopicId === node.topicId)
                    : false;

                return (
                    <g key={node.topicId} className={`pts-rel-node ${isHighlighted ? 'active' : ''}`}>
                        {isHighlighted && (
                            <circle cx={node.x} cy={node.y} r={R + 4}
                                fill="none" stroke={subjectColor} strokeWidth={2}
                                opacity={0.4} className="pts-rel-node-glow" />
                        )}
                        <circle cx={node.x} cy={node.y} r={R}
                            fill={isHighlighted ? subjectColor : 'rgba(255,255,255,0.92)'}
                            stroke={subjectColor} strokeWidth={isHighlighted ? 2.5 : 1.5}
                            className="pts-rel-node-circle" />
                        <text x={node.x} y={node.y}
                            textAnchor="middle" dominantBaseline="central"
                            className={`pts-rel-node-label ${isHighlighted ? 'active' : ''}`}
                            fontSize={6.5}>
                            {node.shortName}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ================================ MAIN COMPONENT ================================
const ProfessorTopicStats: React.FC = () => {
    const { t, i18n } = useTranslation();
    const {
        selectedGrade, setSelectedGrade,
        selectedSection, setSelectedSection,
        selectedSubject: profSubject,
        setSelectedSubject: setProfSubject,
    } = useProfessorFilters();

    // Tab
    const [activeTab, setActiveTab] = useState<'temas' | 'relaciones'>('temas');
    const [displayCount, setDisplayCount] = useState(8);
    const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);
    const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);

    // Map subject name → ID
    const SUBJECT_NAME_TO_ID: Record<string, number> = {
        'Math': 1, 'Matemáticas': 1,
        'Science': 2, 'Ciencias': 2,
        'Spanish': 3, 'Español': 3,
        'Social Studies': 4, 'Estudios Sociales': 4,
    };
    const currentSubjectId = SUBJECT_NAME_TO_ID[profSubject] || 1;
    const currentSubject = SUBJECTS[currentSubjectId];

    // Data
    const allTopics = useMemo(() => getTopicsWithStats(28), []);
    const allRelations = useMemo(() => getTopicRelations(), []);

    // Topics filtered by subject and sorted by score
    const weeklyTopics = useMemo(() => {
        return allTopics
            .filter(t => t.subjectId === currentSubjectId)
            .sort((a, b) => b.score - a.score);
    }, [allTopics, currentSubjectId]);

    const displayedTopics = weeklyTopics.slice(0, displayCount);
    const hasMore = displayCount < weeklyTopics.length;

    // Subject average
    const subjectAverage = useMemo(() => {
        const subjectTopics = allTopics.filter(t => t.subjectId === currentSubjectId);
        if (subjectTopics.length === 0) return 0;
        return Math.round(subjectTopics.reduce((s, t) => s + t.score, 0) / subjectTopics.length);
    }, [allTopics, currentSubjectId]);

    // INTRA-SUBJECT relations only (same subject source and target)
    const intraSubjectRelations = useMemo(() =>
        allRelations.filter(r =>
            r.sourceSubjectId === currentSubjectId && r.targetSubjectId === currentSubjectId
        ).sort((a, b) => b.impactPercent - a.impactPercent)
        , [allRelations, currentSubjectId]);

    // Worst-impacting topic within the subject (most connections/highest aggregate impact)
    const worstImpactTopic = useMemo(() => {
        if (intraSubjectRelations.length === 0) return null;
        const impacts: Record<number, { name: string; total: number; count: number; targets: string[] }> = {};
        intraSubjectRelations.forEach(r => {
            if (!impacts[r.sourceTopicId]) {
                impacts[r.sourceTopicId] = { name: r.sourceName, total: 0, count: 0, targets: [] };
            }
            impacts[r.sourceTopicId].total += r.impactPercent;
            impacts[r.sourceTopicId].count++;
            impacts[r.sourceTopicId].targets.push(r.targetName);
        });
        const sorted = Object.values(impacts).sort((a, b) => b.total - a.total);
        return sorted[0] || null;
    }, [intraSubjectRelations]);

    // Students sorted
    const sortedStudents = useMemo(() =>
        [...STUDENTS].sort((a, b) => b.averageScore - a.averageScore)
        , []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#2ecc71';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    const getTrend = (score: number) => {
        if (score >= 80) return { icon: trendingUpOutline, label: '↑ Subiendo', color: '#2ecc71' };
        if (score >= 60) return { icon: trendingUpOutline, label: '→ Estable', color: '#f39c12' };
        return { icon: trendingDownOutline, label: '↓ Bajando', color: '#e74c3c' };
    };

    // Reset display count and selection when subject changes
    const handleTabChange = (tab: 'temas' | 'relaciones') => {
        setActiveTab(tab);
        setSelectedRelationId(null);
    };

    return (
        <IonPage className="pts-page">
            <IonHeader className="professor-header-container">
                <IonToolbar className="professor-toolbar">
                    <div className="ph-content">
                        <div className="ph-menu-btn-container">
                            <IonMenuButton className="ph-menu-btn">
                                <IonIcon icon={menu} />
                            </IonMenuButton>
                        </div>
                    </div>
                </IonToolbar>
                <div className="ph-brand-container-absolute">
                    <div className="ph-brand-name">ArenAI</div>
                    <div className="ph-brand-sub">Temas Clase</div>
                </div>
                <div className="ph-notch-container">
                    <div className="ph-notch">
                        <div className="ph-dropdowns-display">
                            <div className="ph-text-oval">
                                <ProfessorMenu
                                    selectedGrade={String(selectedGrade)}
                                    selectedSection={selectedSection}
                                    selectedSubject={t(currentSubject?.nameKey || 'professor.topicStats.subjects.math')}
                                    onGradeChange={(grade) => setSelectedGrade(parseInt(grade, 10))}
                                    onSectionChange={setSelectedSection}
                                    onSubjectChange={setProfSubject}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent fullscreen className="pts-content">
                <PageTransition variant="fade">
                    {/* Segment Tabs */}
                    <div className="pts-tabs-container">
                        <IonSegment
                            value={activeTab}
                            onIonChange={(e) => handleTabChange(e.detail.value as any)}
                            className="pts-segment"
                        >
                            <IonSegmentButton value="temas">
                                <IonIcon icon={statsChartOutline} />
                                <IonLabel>Temas</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="relaciones">
                                <IonIcon icon={linkOutline} />
                                <IonLabel>Relaciones</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>

                    {/* ============================================ */}
                    {/* TAB: TEMAS                                  */}
                    {/* ============================================ */}
                    {activeTab === 'temas' && (
                        <div className="pts-tab-content">
                            {/* Subject Hero */}
                            <div className="pts-subject-hero">
                                <div className="pts-subject-hero-icon" style={{ background: currentSubject?.color }}>
                                    <span>{currentSubject?.icon}</span>
                                </div>
                                <div className="pts-subject-hero-info">
                                    <h2>{currentSubject?.name}</h2>
                                    <div className="pts-subject-hero-stats">
                                        <span>{weeklyTopics.length} temas</span>
                                        <span className="pts-hero-divider">•</span>
                                        <span style={{ color: getScoreColor(subjectAverage) }}>
                                            {subjectAverage}% promedio
                                        </span>
                                    </div>
                                </div>
                                <DonutChart percent={subjectAverage} size={54} stroke={6} color={currentSubject?.color} />
                            </div>

                            {/* Section Title */}
                            <div className="pts-section-header">
                                <IonIcon icon={starOutline} className="pts-section-icon" />
                                <h3>Temas de la Semana</h3>
                                <span className="pts-section-count">{weeklyTopics.length}</span>
                            </div>

                            {/* Topic List with Donuts */}
                            <div className="pts-topic-list">
                                {displayedTopics.map((topic, idx) => {
                                    const isExpanded = expandedTopicId === topic.id;
                                    const trend = getTrend(topic.score);
                                    return (
                                        <div key={topic.id} className={`pts-topic-row ${isExpanded ? 'expanded' : ''}`}>
                                            <div
                                                className="pts-topic-summary"
                                                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                                            >
                                                <span className="pts-topic-rank">{idx + 1}</span>
                                                <div className="pts-topic-text">
                                                    <span className="pts-topic-name">{topic.name}</span>
                                                    <span className="pts-topic-meta">
                                                        {topic.studentsCompleted}/{topic.totalStudents} completaron
                                                    </span>
                                                </div>
                                                <DonutChart percent={topic.score} size={42} stroke={5} />
                                                <IonIcon icon={isExpanded ? chevronUpOutline : chevronDownOutline} className="pts-topic-chevron" />
                                            </div>

                                            {isExpanded && (
                                                <div className="pts-topic-expanded">
                                                    <p className="pts-topic-desc">{topic.description}</p>
                                                    <div className="pts-topic-detail-grid">
                                                        <div className="pts-topic-detail-stat">
                                                            <span className="pts-detail-value" style={{ color: '#2ecc71' }}>{topic.correctAnswers}</span>
                                                            <span className="pts-detail-label">Correctas</span>
                                                        </div>
                                                        <div className="pts-topic-detail-stat">
                                                            <span className="pts-detail-value" style={{ color: '#e74c3c' }}>{topic.incorrectAnswers}</span>
                                                            <span className="pts-detail-label">Incorrectas</span>
                                                        </div>
                                                        <div className="pts-topic-detail-stat">
                                                            <IonIcon icon={trend.icon} style={{ color: trend.color, fontSize: 18 }} />
                                                            <span className="pts-detail-label" style={{ color: trend.color }}>{trend.label}</span>
                                                        </div>
                                                    </div>

                                                    {topic.commonMistakes.length > 0 && (
                                                        <div className="pts-topic-mistakes">
                                                            <strong>Errores comunes:</strong>
                                                            <ul>
                                                                {topic.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {topic.strugglingStudents.length > 0 && (
                                                        <div className="pts-topic-struggling">
                                                            <strong>⚠️ Estudiantes con dificultad:</strong>
                                                            <div className="pts-struggling-chips">
                                                                {topic.strugglingStudents.map((s, i) => (
                                                                    <span key={i} className="pts-struggling-chip">
                                                                        {s.name} <b style={{ color: getScoreColor(s.score) }}>{s.score}%</b>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {topic.topPerformers.length > 0 && (
                                                        <div className="pts-topic-top">
                                                            <strong>⭐ Mejores:</strong>
                                                            <div className="pts-struggling-chips">
                                                                {topic.topPerformers.map((s, i) => (
                                                                    <span key={i} className="pts-top-chip">
                                                                        {s.name} <b style={{ color: '#2ecc71' }}>{s.score}%</b>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <button className="pts-load-more"
                                    onClick={() => setDisplayCount(prev => prev + 10)}>
                                    Cargar más temas ({weeklyTopics.length - displayCount} restantes)
                                </button>
                            )}

                            {/* Divider + Student Ranking */}
                            <div className="pts-divider" />

                            <div className="pts-section-header">
                                <IonIcon icon={trophyOutline} className="pts-section-icon pts-icon-gold" />
                                <h3>General Estudiantes</h3>
                            </div>

                            <div className="pts-students-ranking">
                                {sortedStudents.map((student, idx) => (
                                    <div key={student.id} className={`pts-student-rank-row ${idx < 3 ? `top-${idx + 1}` : ''}`}>
                                        <span className="pts-rank-pos">
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                        </span>
                                        <div className="pts-rank-avatar" style={{ borderColor: getScoreColor(student.averageScore) }}>
                                            {getInitials(student.name)}
                                        </div>
                                        <div className="pts-rank-info">
                                            <span className="pts-rank-name">{student.name}</span>
                                            <span className="pts-rank-meta">
                                                Lvl {student.level}
                                                {student.streak > 0 && <> • <IonIcon icon={flameOutline} style={{ color: '#e74c3c' }} /> {student.streak}</>}
                                            </span>
                                        </div>
                                        <DonutChart percent={student.averageScore} size={38} stroke={4} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ============================================ */}
                    {/* TAB: RELACIONES (INTRA-SUBJECT)             */}
                    {/* ============================================ */}
                    {activeTab === 'relaciones' && (
                        <div className="pts-tab-content">
                            {/* Header */}
                            <div className="pts-rel-graph-card">
                                <h3 className="pts-rel-graph-title">
                                    {currentSubject?.icon} Relaciones — {currentSubject?.name}
                                </h3>
                                <p className="pts-rel-graph-subtitle">
                                    Conexiones entre temas de la misma materia. Líneas más gruesas = mayor influencia.
                                    Toca una línea para ver el detalle.
                                </p>
                                <div className="pts-rel-graph-container">
                                    <TopicRelGraph
                                        relations={intraSubjectRelations}
                                        subjectColor={currentSubject?.color || '#3498db'}
                                        selectedRelationId={selectedRelationId}
                                        onSelectRelation={setSelectedRelationId}
                                    />
                                </div>

                                {/* Selected relation detail popover */}
                                {selectedRelationId && (() => {
                                    const rel = intraSubjectRelations.find(r => r.id === selectedRelationId);
                                    if (!rel) return null;
                                    return (
                                        <div className="pts-rel-selected-detail">
                                            <div className="pts-rel-selected-header">
                                                <span className={`pts-rel-type-badge ${rel.type}`}>
                                                    {rel.type === 'prerequisito' ? '→' : rel.type === 'complementario' ? '↔' : '~'}
                                                </span>
                                                <div className="pts-rel-selected-names">
                                                    <span className="pts-rel-selected-source">{rel.sourceName}</span>
                                                    <span className="pts-rel-selected-arrow">→</span>
                                                    <span className="pts-rel-selected-target">{rel.targetName}</span>
                                                </div>
                                                <span className="pts-rel-selected-impact" style={{
                                                    color: rel.impactPercent >= 50 ? '#e74c3c' : rel.impactPercent >= 30 ? '#f39c12' : '#3498db'
                                                }}>
                                                    {rel.impactPercent}%
                                                </span>
                                            </div>
                                            <p className="pts-rel-selected-desc">{rel.description}</p>
                                            <span className={`pts-rel-selected-type-label ${rel.type}`}>
                                                {rel.type === 'prerequisito' ? '📋 Prerrequisito' :
                                                    rel.type === 'complementario' ? '🤝 Complementario' : '🔄 Correlacionado'}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Warning */}
                            {worstImpactTopic && (
                                <div className="pts-rel-warning">
                                    <div className="pts-rel-warning-icon">
                                        <IonIcon icon={alertCircleOutline} />
                                    </div>
                                    <div className="pts-rel-warning-content">
                                        <strong>⚠️ Tema con mayor influencia interna</strong>
                                        <p>
                                            <b>{worstImpactTopic.name}</b> afecta a <b>{worstImpactTopic.count}</b> tema{worstImpactTopic.count > 1 ? 's' : ''} dentro
                                            de {currentSubject?.icon} {currentSubject?.name} con un impacto total de <b>{worstImpactTopic.total}%</b>.
                                        </p>
                                        <div className="pts-rel-warning-targets">
                                            {worstImpactTopic.targets.map((name, i) => (
                                                <span key={i} className="pts-rel-warning-chip">
                                                    📌 {name}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="pts-rel-warning-advice">
                                            Si este tema no se domina, los temas dependientes se verán directamente afectados.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Dictionary */}
                            <div className="pts-rel-dictionary">
                                <h3 className="pts-rel-dict-title">📖 Diccionario de Relaciones</h3>
                                <p className="pts-rel-dict-subtitle">
                                    Todas las conexiones entre temas de {currentSubject?.icon} {currentSubject?.name}
                                </p>

                                {/* Legend */}
                                <div className="pts-rel-legend">
                                    <div className="pts-rel-legend-item">
                                        <span className="pts-rel-legend-line prereq" />
                                        <span>Prerrequisito</span>
                                    </div>
                                    <div className="pts-rel-legend-item">
                                        <span className="pts-rel-legend-line complement" />
                                        <span>Complementario</span>
                                    </div>
                                    <div className="pts-rel-legend-item">
                                        <span className="pts-rel-legend-line correlated" />
                                        <span>Correlacionado</span>
                                    </div>
                                </div>

                                <div className="pts-rel-dict-list">
                                    {intraSubjectRelations.map(rel => (
                                        <div key={rel.id}
                                            className={`pts-rel-dict-card ${selectedRelationId === rel.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedRelationId(selectedRelationId === rel.id ? null : rel.id)}>
                                            <div className="pts-rel-dict-header">
                                                <span className={`pts-rel-type-badge ${rel.type}`}>
                                                    {rel.type === 'prerequisito' ? '→' : rel.type === 'complementario' ? '↔' : '~'}
                                                </span>
                                                <div className="pts-rel-dict-pair">
                                                    <span className="pts-rel-dict-source">{rel.sourceName}</span>
                                                    <span className="pts-rel-dict-arrow">→</span>
                                                    <span className="pts-rel-dict-target">{rel.targetName}</span>
                                                </div>
                                                <div className="pts-rel-dict-impact">
                                                    <div className="pts-rel-dict-impact-bar"
                                                        style={{
                                                            width: `${rel.impactPercent}%`,
                                                            background: rel.impactPercent >= 50 ? '#e74c3c' : rel.impactPercent >= 30 ? '#f39c12' : '#3498db',
                                                        }} />
                                                    <span>{rel.impactPercent}%</span>
                                                </div>
                                            </div>
                                            <p className="pts-rel-dict-desc">{rel.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pts-footer-spacer" />
                </PageTransition>
            </IonContent>
        </IonPage>
    );
};

export default ProfessorTopicStats;
