import React, { useState, useRef, useEffect } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonButton, IonInput } from '@ionic/react';
import { people, chatbubbles, podium, send, shield, star } from 'ionicons/icons';
import './Clan.css';

// --- MOCK DATA ---
const CLAN_DATA = {
    name: "Los Eruditos",
    level: 5,
    membersCount: 12,
    xp: 2450,
    nextLevelXp: 3000,
    notice: "¡Recuerden completar la misión de matemáticas antes del viernes!"
};

const INITIAL_MESSAGES = [
    { id: 1, sender: "Carlos M.", avatar: "👨‍🎓", text: "¿Alguien sabe la respuesta de la pregunta 5?", isMe: false },
    { id: 2, sender: "Ana S.", avatar: "👩‍🎓", text: "Es la raíz cuadrada de 144, o sea 12.", isMe: false },
    { id: 3, sender: "Carlos M.", avatar: "👨‍🎓", text: "¡Gracias! Me salvaste.", isMe: false },
];

const MEMBERS = [
    { id: 1, name: "Sofia V.", role: "Líder", avatar: "👩‍🏫", online: true, trophies: 1200 },
    { id: 2, name: "Tu (Yo)", role: "Veterano", avatar: "😎", online: true, trophies: 1150 },
    { id: 3, name: "Carlos M.", role: "Miembro", avatar: "👨‍🎓", online: true, trophies: 980 },
    { id: 4, name: "Ana S.", role: "Miembro", avatar: "👩‍🎓", online: false, trophies: 950 },
    { id: 5, name: "Diego L.", role: "Nuevo", avatar: "🤠", online: false, trophies: 400 },
];

const Clan: React.FC = () => {
    const [segment, setSegment] = useState<'hub' | 'chat' | 'members'>('hub');
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const newMsg = {
            id: Date.now(),
            sender: "Tu",
            avatar: "😎",
            text: chatInput,
            isMe: true
        };
        setMessages([...messages, newMsg]);
        setChatInput('');
        // Scroll to bottom simulation
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTo(0, 99999);
        }, 100);
    };

    return (
        <div className="clan-embedded" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* CLAN BANNER HEADER */}
            <div className="clan-header-card" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <IonIcon icon={shield} className="clan-header-bg-icon" />
                <div className="clan-top-row">
                    <div className="clan-emblem">🦉</div>
                    <div className="clan-info-text">
                        <div className="clan-level-badge">Nivel {CLAN_DATA.level}</div>
                        <h1>{CLAN_DATA.name}</h1>
                    </div>
                </div>
                <div className="clan-stats">
                    <span><IonIcon icon={people} /> {CLAN_DATA.membersCount}/20</span>
                    <span><IonIcon icon={star} /> {CLAN_DATA.xp} XP</span>
                </div>
            </div>

            {/* TABS (Sticky below header) */}
            <div className="clan-tabs" style={{ background: 'var(--ion-card-background)', padding: '10px 20px', borderBottom: '1px solid var(--ion-border-color)' }}>
                <IonSegment
                    mode="ios"
                    value={segment}
                    onIonChange={e => setSegment(e.detail.value as any)}
                    className="custom-segment"
                >
                    <IonSegmentButton value="hub">
                        <IonLabel>Base</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="chat">
                        <IonLabel>Chat</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="members">
                        <IonLabel>Miembros</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </div>

            {/* CONTENT AREA (Scrollable) */}
            <div className="clan-content-area" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

                {/* --- TAB CONTENT: HUB --- */}
                {segment === 'hub' && (
                    <div className="hub-content slide-in" style={{ padding: '20px' }}>
                        <div className="clan-notice">
                            <strong>📢 Tablón:</strong> {CLAN_DATA.notice}
                        </div>

                        <h3 className="section-title" style={{ paddingLeft: 0 }}>Misiones de Clan</h3>

                        <div className="quest-card">
                            <div className="quest-header">
                                <div className="quest-title">Sabiduría Colectiva</div>
                                <div className="quest-reward">💰 500 Oro</div>
                            </div>
                            <div className="quest-progress-track">
                                <div className="quest-fill" style={{ width: '75%' }}></div>
                            </div>
                            <div className="quest-numbers">
                                <span>Gana 100 Quizes (Grupo)</span>
                                <span>75/100</span>
                            </div>
                        </div>

                        <div className="quest-card">
                            <div className="quest-header">
                                <div className="quest-title">Guerreros de Arena</div>
                                <div className="quest-reward">💎 50 Gemas</div>
                            </div>
                            <div className="quest-progress-track">
                                <div className="quest-fill" style={{ width: '40%' }}></div>
                            </div>
                            <div className="quest-numbers">
                                <span>Gana 50 Batallas (Grupo)</span>
                                <span>20/50</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: CHAT --- */}
                {segment === 'chat' && (
                    <div className="chat-container slide-in" style={{ height: '100%' }}>
                        <div className="chat-scroll-area" ref={scrollRef} style={{ padding: '20px' }}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`chat-bubble ${msg.isMe ? 'me' : ''}`}>
                                    <div className="chat-avatar">{msg.avatar}</div>
                                    <div className="chat-box">
                                        {!msg.isMe && <div className="chat-sender">{msg.sender}</div>}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chat-input-bar" style={{ padding: '10px 20px', background: 'var(--ion-background-color)', position: 'sticky', bottom: 0, borderTop: '1px solid var(--ion-border-color)' }}>
                            <IonInput
                                className="chat-input"
                                placeholder="Escribe un mensaje..."
                                value={chatInput}
                                onIonInput={e => setChatInput(e.detail.value!)}
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            />
                            <div className="btn-send" onClick={handleSendMessage}>
                                <IonIcon icon={send} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB CONTENT: MEMBERS --- */}
                {segment === 'members' && (
                    <div className="member-list slide-in" style={{ padding: '20px' }}>
                        {MEMBERS.map(member => (
                            <div key={member.id} className="member-item">
                                <div className="member-avatar">
                                    {member.avatar}
                                    <div className={`status-indicator ${member.online ? 'status-online' : 'status-offline'}`}></div>
                                </div>
                                <div className="member-details">
                                    <h3>{member.name}</h3>
                                    <div className={`member-role role-${member.role.toLowerCase()}`}>{member.role}</div>
                                </div>
                                <div className="member-actions">
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ion-color-medium)' }}>
                                        🏆 {member.trophies}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clan;
