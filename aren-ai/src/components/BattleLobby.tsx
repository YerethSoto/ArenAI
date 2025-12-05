import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  useIonRouter,
  IonModal,
} from '@ionic/react';
import {
  trophy,
  people,
  cart,
  person,
  shield,
  calendar,
  skull,
  arrowBack,
  close,
  flash,
  star,
  ribbon,
  image,
  planet,
  flask
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './BattleLobby.css';

// Imports for embedded components
import Shop from '../pages/Shop';
import Clan from '../pages/Clan';

const BattleLobby: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();

  // UI State
  const [selectedMode, setSelectedMode] = useState<'standard' | 'blitz' | 'trick'>('standard');
  const [activeTab, setActiveTab] = useState<'shop' | 'avatar' | 'battle' | 'clan' | 'events'>('battle');
  const [showFriends, setShowFriends] = useState(false);
  const [showTrophyRoad, setShowTrophyRoad] = useState(false);

  // Avatar Selection State
  const [selectedAvatarHero, setSelectedAvatarHero] = useState('scholar');

  // Mock Data
  const user = { name: "Estudiante", level: 5, gold: 1450, gems: 120, trophies: 1200 };
  const onlineFriends = [
    { id: 1, name: "Ana P.", status: "online", avatar: "👩‍🎓" },
    { id: 2, name: "Carlos M.", status: "online", avatar: "👨‍🏫" },
    { id: 3, name: "Sofia L.", status: "inBattle", avatar: "👩‍🔬" },
  ];

  // Avatar Config
  const avatars = [
    { id: 'scholar', name: 'El Erudito', icon: '❄️', role: 'Estratega' },
    { id: 'warrior', name: 'Guerrero', icon: '🔥', role: 'Daño' },
    { id: 'zen', name: 'Maestro Zen', icon: '🍃', role: 'Soporte' },
    { id: 'dreamer', name: 'Soñadora', icon: '⚡', role: 'Control' },
  ];

  const currentAvatar = avatars.find(a => a.id === selectedAvatarHero);

  // Arena Mock Data with PREMISES for Image Generation
  const arenas = [
    {
      id: 4,
      name: "Observatorio Estelar",
      trophies: 1200,
      img: "/assets/battle_sprite_back_capybara.png",
      premise: "Concept: A high-tech glass observatory floating in a nebula. Deep purple and blue colors, holograms of constellations, futuristic telescopes.",
      icon: planet
    },
    {
      id: 3,
      name: "Jardín Botánico",
      trophies: 800,
      img: "/assets/battle_sprite_back_capybara.png",
      premise: "Concept: A lush, overgrown greenhouse with bioluminescent plants. Giant vines wrapping around ancient stone structures. Mystic green atmosphere.",
      icon: image
    },
    {
      id: 2,
      name: "Laboratorio Quántico",
      trophies: 400,
      img: "/assets/battle_sprite_back_capybara.png",
      premise: "Concept: A sterile white laboratory with floating geometric shapes and laser grids. Blue neon lights and white surfaces.",
      icon: flask
    },
    {
      id: 1,
      name: "Biblioteca Aeterna",
      trophies: 0,
      img: "/assets/battle_sprite_back_capybara.png",
      premise: "Concept: An endless library with spiral staircases reaching into clouds. Flying books and golden dust particles.",
      icon: ribbon
    }
  ];

  const currentArena = arenas.find(a => a.trophies <= user.trophies && a.trophies >= 0) || arenas[3];

  const handleBattleStart = () => {
    router.push('/battleminigame');
  };

  // --- TAB RENDERING LOGIC ---
  // --- EVENTS LOGIC ---
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const EVENTS = [
    { id: 1, title: 'Torneo Blitz', sub: 'Termina en 2d 14h', desc: '¡Batallas rápidas de 60 segundos! Gana doble oro en cada victoria.', icon: flash, color: 'var(--ion-color-primary)', reward: '2x Gold' },
    { id: 2, title: 'Reto Lógico', sub: 'Recompensas Dobles', desc: 'Demuestra tu inteligencia en el modo Lógica. Preguntas nivel avanzado.', icon: star, color: 'var(--ion-color-secondary)', reward: 'Cofre Raro' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'shop':
        return (
          <div className="view-container slide-in" style={{ padding: 0, height: '100%' }}>
            <Shop />
          </div>
        );
      case 'avatar':
        return (
          <div className="view-container slide-in">
            <div className="section-title">Elige tu Luchador</div>

            <div className="avatar-selector-container">
              <div className="hero-preview">
                <div className="hero-model">{currentAvatar?.icon}</div>
              </div>

              <div className="hero-stats">
                <div className="hero-name">{currentAvatar?.name}</div>
                <div className="hero-role">{currentAvatar?.role}</div>
              </div>

              <button className="btn-select-hero">
                Seleccionar {currentAvatar?.name}
              </button>

              <div className="section-title" style={{ fontSize: '14px', marginTop: '20px' }}>Colección</div>
              <div className="avatars-grid">
                {avatars.map(av => (
                  <div
                    key={av.id}
                    className={`avatar-card ${selectedAvatarHero === av.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatarHero(av.id)}
                  >
                    <div className="avatar-icon">{av.icon}</div>
                    <div className="avatar-label">{av.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'clan':
        return (
          <div className="view-container slide-in" style={{ padding: 0, height: '100%' }}>
            <Clan />
          </div>
        );
      case 'events':
        return (
          <div className="view-container slide-in">
            <div className="section-title">Eventos de Temporada</div>

            {EVENTS.map(ev => (
              <div key={ev.id} className="event-banner" style={{ background: ev.color }} onClick={() => setSelectedEvent(ev)}>
                <div className="event-title">{ev.title}</div>
                <div className="event-sub">{ev.sub}</div>
                <IonIcon icon={ev.icon} size="large" style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.3, fontSize: '100px' }} />
              </div>
            ))}
          </div>
        );
      case 'battle':
      default:
        return (
          <div className="view-container view-battle slide-in">

            {/* FRIENDS POPOVER AND BACKDROP */}
            {showFriends && (
              <>
                <div className="friends-backdrop" onClick={() => setShowFriends(false)}></div>
                <div className="friends-popover">
                  <div className="friends-header">
                    <span>Amigos ({onlineFriends.filter(f => f.status === 'online').length})</span>
                    <IonIcon icon={close} className="close-friends-btn" onClick={() => setShowFriends(false)} />
                  </div>
                  <div className="friends-list">
                    {onlineFriends.map(friend => (
                      <div key={friend.id} className="friend-row">
                        <div className="f-avatar">{friend.avatar}</div>
                        <div className="f-info">
                          <div className="f-name">{friend.name}</div>
                          <div className={`f-status ${friend.status}`}>{friend.status}</div>
                        </div>
                        <button className="btn-vs-mini" disabled={friend.status !== 'online'}>VS</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ARENA VISUAL */}
            <div className="lobby-arena-header">
              <div className="arena-visual" onClick={() => setShowTrophyRoad(true)}>
                <div className="arena-tap-hint">Ver Camino de Trofeos</div>
                <img src={currentArena.img} alt="Arena" className="arena-current-img" />
              </div>
              <div className="arena-info">
                <h2 className="arena-name">{currentArena.name}</h2>
                <p className="arena-desc">Arena {currentArena.id}</p>
              </div>

              {/* BATTLE CONTROLS */}
              <div className="lobby-battle-section">
                <div className="mode-selector">
                  <button
                    className={`mode-btn ${selectedMode === 'standard' ? 'active' : ''}`}
                    onClick={() => setSelectedMode('standard')}
                  >Standard</button>
                  <button
                    className={`mode-btn ${selectedMode === 'blitz' ? 'active' : ''}`}
                    onClick={() => setSelectedMode('blitz')}
                  >Blitz</button>
                  <button
                    className={`mode-btn ${selectedMode === 'trick' ? 'active' : ''}`}
                    onClick={() => setSelectedMode('trick')}
                  >Lógica</button>
                </div>

                <button className="btn-battle-gold" onClick={handleBattleStart}>
                  <span>BATALLA</span>
                  <span className="sub-text">{selectedMode}</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <IonPage className="battle-lobby-page">

      {/* TOP BAR */}
      <div className="lobby-top-bar">
        <div className="lobby-left-group">
          {/* EXIT BUTTON */}
          <div className="btn-friends-toggle" style={{ background: 'var(--ion-color-medium)', marginRight: '8px' }} onClick={() => router.push('/page/student')}>
            <IonIcon icon={arrowBack} />
          </div>
          {/* FRIENDS BUTTON */}
          <div className="btn-friends-toggle" onClick={() => setShowFriends(!showFriends)}>
            <IonIcon icon={people} />
            <div className="friend-count-badge">2</div>
          </div>
        </div>

        <div className="lobby-user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="lobby-level-badge">{user.level}</div>
            <span className="user-name-display">{user.name}</span>
          </div>
        </div>

        <div className="lobby-resources">
          <div className="res-item"><span className="res-gold">🪙</span> {user.gold}</div>
          <div className="res-item"><span className="res-gems">💎</span> {user.gems}</div>
        </div>
      </div>

      <IonContent fullscreen>
        <div className="lobby-content">
          {renderContent()}

          {/* EPIC TROPHY ROAD OVERLAY: PREMISE CARDS ONLY */}
          {showTrophyRoad && (
            <div className="trophy-road-overlay">
              <div className="road-header">
                <IonButton fill="clear" color="medium" onClick={() => setShowTrophyRoad(false)}>
                  <IonIcon slot="start" icon={arrowBack} />
                  Volver
                </IonButton>
                <div style={{ fontWeight: '800', fontSize: '18px' }}>CAMINO DE TROFEOS</div>
              </div>
              <div className="road-content">
                {/* Road line background */}
                <div className="road-path-line"></div>

                {arenas.map(arena => (
                  <div key={arena.id} className={`road-arena-node ${arena.id === currentArena.id ? 'current' : ''}`}>
                    <div className="arena-concept-card">
                      <div className="concept-header">
                        <IonIcon icon={arena.icon} className="concept-icon" />
                      </div>
                      <div className="concept-body">
                        <div className="node-trophies"><IonIcon icon={trophy} /> {arena.trophies}+</div>
                        <div className="node-title">{arena.name}</div>
                        <p className="node-premise">
                          <strong>[Image Placeholder]</strong><br />
                          {arena.premise}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENT MODAL */}
          <IonModal isOpen={!!selectedEvent} onDidDismiss={() => setSelectedEvent(null)} initialBreakpoint={0.6} breakpoints={[0, 0.6]}>
            <div className="event-modal-content" style={{ padding: '30px', textAlign: 'center' }}>
              {selectedEvent && (
                <>
                  <div style={{
                    width: '80px', height: '80px',
                    background: selectedEvent.color,
                    borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }}>
                    <IonIcon icon={selectedEvent.icon} style={{ fontSize: '40px', color: 'white' }} />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 10px' }}>{selectedEvent.title}</h2>
                  <div style={{ color: 'var(--ion-color-medium)', marginBottom: '20px', fontWeight: 'bold' }}>{selectedEvent.sub}</div>

                  <p style={{ lineHeight: '1.6', fontSize: '16px', marginBottom: '30px' }}>
                    {selectedEvent.desc}
                  </p>

                  <div className="reward-box" style={{
                    background: 'var(--ion-item-background)',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    border: '1px dashed var(--ion-color-medium)'
                  }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ion-color-medium)', fontWeight: 'bold' }}>Recompensa Principal</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ion-color-primary)' }}>{selectedEvent.reward}</div>
                  </div>

                  <IonButton expand="block" color="dark" onClick={() => setSelectedEvent(null)}>Entendido</IonButton>
                </>
              )}
            </div>
          </IonModal>

        </div>
      </IonContent>

      {/* FOOTER NAV (Fixed) */}
      <div className="lobby-footer">
        <div
          className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          <IonIcon icon={cart} />
          <span>{t('battleLobby.tabs.shop', 'Tienda')}</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'avatar' ? 'active' : ''}`}
          onClick={() => setActiveTab('avatar')}
        >
          <IonIcon icon={person} />
          <span>{t('battleLobby.tabs.deck', 'Avatar')}</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'battle' ? 'active' : ''}`}
          onClick={() => setActiveTab('battle')}
        >
          <IonIcon icon={skull} style={{ fontSize: '32px' }} />
        </div>
        <div
          className={`nav-item ${activeTab === 'clan' ? 'active' : ''}`}
          onClick={() => setActiveTab('clan')}
        >
          <IonIcon icon={shield} />
          <span>{t('battleLobby.tabs.clan', 'Clan')}</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <IonIcon icon={calendar} />
          <span>{t('battleLobby.tabs.events', 'Eventos')}</span>
        </div>
      </div>

    </IonPage>
  );
};

export default BattleLobby;