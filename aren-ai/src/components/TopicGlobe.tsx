import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface TopicNode {
    id: string;
    name: string;
    parentId: string | null;
    level: number;
    score: number;
}

interface TopicGlobeProps {
    topics: TopicNode[];
    onTopicClick: (topic: TopicNode) => void;
}

// Convert spherical coordinates to Cartesian
const sphericalToCartesian = (lat: number, lon: number, radius: number): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
};

// Get color based on score
const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
};

// Unit names map for clean display
const UNIT_NAMES: { [key: string]: string } = {
    'u1': 'Números',
    'u2': 'Fracciones',
    'u3': 'Decimales',
    'u4': 'Porcentajes',
    'u5': 'Álgebra',
    'u6': 'Geometría',
    'u7': 'Medición',
    'u8': 'Problemas',
};

// Single topic node on the globe
const TopicPoint: React.FC<{
    topic: TopicNode;
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ topic, position, onClick, isSelected, onSelect }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Size based on level - ALL BIGGER
    const size = topic.level === 0 ? 0.30 : topic.level === 1 ? 0.15 : 0.08;

    const handleClick = (e: any) => {
        e.stopPropagation();
        onSelect();
        onClick();
    };

    return (
        <group position={position}>
            {/* The colored sphere node - PROMINENT */}
            <mesh ref={meshRef} onClick={handleClick}>
                <sphereGeometry args={[size, 20, 20]} />
                <meshStandardMaterial
                    color={getScoreColor(topic.score)}
                    emissive={getScoreColor(topic.score)}
                    emissiveIntensity={isSelected ? 1.0 : 0.6}
                    metalness={0.2}
                    roughness={0.3}
                />
            </mesh>

            {/* ONLY Units (level 0) get permanent labels - SMALL but legible */}
            {topic.level === 0 && (
                <Html
                    distanceFactor={25}
                    style={{ pointerEvents: 'none' }}
                    position={[0, -(size + 0.08), 0]}
                    center
                >
                    <div style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '2.5px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        borderBottom: `1px solid ${getScoreColor(topic.score)}`,
                    }}>
                        {UNIT_NAMES[topic.id] || topic.name}
                    </div>
                </Html>
            )}
        </group>
    );
};

// The rotating globe
const GlobeCore: React.FC<{
    topics: TopicNode[];
    onTopicClick: (topic: TopicNode) => void;
    autoRotate: boolean;
}> = ({ topics, onTopicClick, autoRotate }) => {
    const globeRef = useRef<THREE.Group>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Calculate positions - SCATTERED randomly across globe
    const topicPositions = useMemo(() => {
        const positions: Map<string, [number, number, number]> = new Map();
        const radius = 2.2;

        // Seeded random for consistent positions
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        // Scatter ALL topics across the globe
        topics.forEach((topic, i) => {
            const seed = i * 137.5 + topic.id.charCodeAt(0);

            // Random latitude and longitude
            const lat = (seededRandom(seed) - 0.5) * 140; // -70 to 70
            const lon = (seededRandom(seed + 1) - 0.5) * 360; // -180 to 180

            // Radius varies by level
            const r = topic.level === 0 ? radius : topic.level === 1 ? radius * 0.95 : radius * 0.88;

            positions.set(topic.id, sphericalToCartesian(lat, lon, r));
        });

        return positions;
    }, [topics]);

    // Auto-rotate
    useFrame((state, delta) => {
        if (globeRef.current && autoRotate) {
            globeRef.current.rotation.y += delta * 0.08;
        }
    });

    return (
        <group ref={globeRef}>
            {/* Globe outer wireframe */}
            <Sphere args={[2.0, 48, 48]}>
                <meshBasicMaterial
                    color="#3b82f6"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Sphere>

            {/* Inner core glow */}
            <Sphere args={[1.9, 32, 32]}>
                <meshBasicMaterial
                    color="#1e1b4b"
                    transparent
                    opacity={0.7}
                />
            </Sphere>

            {/* Topic points */}
            {topics.map(topic => {
                const pos = topicPositions.get(topic.id);
                if (!pos) return null;
                return (
                    <TopicPoint
                        key={topic.id}
                        topic={topic}
                        position={pos}
                        onClick={() => onTopicClick(topic)}
                        isSelected={selectedId === topic.id}
                        onSelect={() => setSelectedId(selectedId === topic.id ? null : topic.id)}
                    />
                );
            })}

            {/* Connection lines - ALL parent-child relationships */}
            {topics.filter(t => t.parentId).map(topic => {
                const childPos = topicPositions.get(topic.id);
                const parentPos = topicPositions.get(topic.parentId!);
                if (!childPos || !parentPos) return null;

                // Different colors based on level
                const lineColor = topic.level === 1 ? '#6366f1' : '#a855f7';
                const lineOpacity = topic.level === 1 ? 0.5 : 0.3;

                return (
                    <Line
                        key={`line-${topic.id}`}
                        points={[parentPos, childPos]}
                        color="#ffffff"
                        lineWidth={0.8}
                        transparent
                        opacity={0.25}
                    />
                );
            })}
        </group>
    );
};

// Main component
const TopicGlobe: React.FC<TopicGlobeProps> = ({ topics, onTopicClick }) => {
    const [autoRotate, setAutoRotate] = useState(true);

    return (
        <div className="topic-globe-container">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 55 }}
                style={{
                    background: 'linear-gradient(180deg, #0c0a1d 0%, #1e1b4b 50%, #0f172a 100%)',
                    borderRadius: '16px',
                }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.2} />
                <pointLight position={[-10, -10, -10]} intensity={0.4} color="#818cf8" />
                <pointLight position={[0, 10, 0]} intensity={0.3} color="#22d3ee" />

                <GlobeCore
                    topics={topics}
                    onTopicClick={onTopicClick}
                    autoRotate={autoRotate}
                />

                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={4}
                    maxDistance={10}
                    onStart={() => setAutoRotate(false)}
                />
            </Canvas>

            {/* Controls */}
            <div className="globe-controls">
                <button
                    className={`globe-control-btn ${autoRotate ? 'active' : ''}`}
                    onClick={() => setAutoRotate(!autoRotate)}
                >
                    {autoRotate ? '⏸️ Pausar' : '▶️ Rotar'}
                </button>
            </div>

            {/* Legend */}
            <div className="globe-legend">
                <div className="globe-legend-title">Rendimiento</div>
                <div className="globe-legend-item">
                    <span className="globe-legend-dot" style={{ background: '#22c55e' }}></span>
                    <span>Excelente ≥80%</span>
                </div>
                <div className="globe-legend-item">
                    <span className="globe-legend-dot" style={{ background: '#eab308' }}></span>
                    <span>Regular 60-79%</span>
                </div>
                <div className="globe-legend-item">
                    <span className="globe-legend-dot" style={{ background: '#ef4444' }}></span>
                    <span>Bajo &lt;60%</span>
                </div>
            </div>

            {/* Instructions */}
            <div className="globe-instructions">
               
            </div>
        </div>
    );
};

export default TopicGlobe;
