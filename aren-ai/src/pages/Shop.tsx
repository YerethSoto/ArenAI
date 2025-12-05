import React, { useState } from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonIcon, IonModal, IonButton, useIonAlert } from '@ionic/react';
import { cart, diamond, cash, arrowBack, checkmarkCircle, close } from 'ionicons/icons';
import './Shop.css';

// --- MOCK DATA ---
const SHOP_ITEMS = [
    { id: 1, name: "El Guerrero", type: "avatar", price: 500, currency: "gold", icon: "🦁", desc: "Desbloquea al poderoso Guerrero para tus batallas." },
    { id: 2, name: "Maestro Zen", type: "avatar", price: 800, currency: "gold", icon: "🐼", desc: "La paz interior te guiará a la victoria." },
    { id: 3, name: "Cyber Frame", type: "frame", price: 200, currency: "gems", icon: "🖼️", desc: "Un marco futurista para tu perfil." },
    { id: 4, name: "Doble XP (1h)", type: "booster", price: 100, currency: "gems", icon: "⚡", desc: "Gana el doble de experiencia durante una hora." },
    { id: 5, name: "Racha Freeze", type: "booster", price: 300, currency: "gold", icon: "❄️", desc: "Protege tu racha de estudio por un día." },
    { id: 6, name: "Neon Vibe", type: "frame", price: 150, currency: "gems", icon: "✨", desc: "Brilla con este marco de neón." },
];

const Shop: React.FC = () => {
    // Mock User State
    const [userBalance, setUserBalance] = useState({ gold: 1250, gems: 350 });
    const [ownedItems, setOwnedItems] = useState([1]); // User starts with item ID 1 (example)
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [presentAlert] = useIonAlert();

    const filteredItems = selectedCategory === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => item.type === selectedCategory);

    const handlePurchase = () => {
        if (!selectedItem) return;

        const cost = selectedItem.price;
        const currencyKey = selectedItem.currency as 'gold' | 'gems';

        if (userBalance[currencyKey] >= cost) {
            // Success
            setUserBalance(prev => ({ ...prev, [currencyKey]: prev[currencyKey] - cost }));
            setOwnedItems(prev => [...prev, selectedItem.id]);
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setSelectedItem(null);
            }, 2000);
        } else {
            // Fail
            presentAlert({
                header: 'Fondos Insuficientes',
                message: `No tienes suficientes ${currencyKey === 'gold' ? 'Monedas' : 'Gemas'} para comprar esto.`,
                buttons: ['OK']
            });
        }
    };

    return (
        <div className="shop-embedded" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* SHOP HEADER (Simplified for embedded view) */}
            <div className="shop-header-embedded" style={{
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(var(--ion-card-background-rgb), 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--ion-border-color)'
            }}>
                <div style={{ fontWeight: '900', fontSize: '20px', color: 'var(--ion-color-primary)' }}>TIENDA</div>

                <div className="shop-balance-container">
                    <div className="shop-currency-badge curr-gold">
                        <IonIcon icon={cash} className="currency-icon" />
                        <span>{userBalance.gold}</span>
                    </div>
                    <div className="shop-currency-badge curr-gems">
                        <IonIcon icon={diamond} className="currency-icon" />
                        <span>{userBalance.gems}</span>
                    </div>
                </div>
            </div>

            <div className="shop-scroll-area" style={{ flex: 1, overflowY: 'auto' }}>

                {/* CATEGORIES */}
                <div className="shop-categories" style={{ paddingTop: '20px' }}>
                    {['all', 'avatar', 'frame', 'booster'].map(cat => (
                        <button
                            key={cat}
                            className={`shop-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat === 'all' ? 'Todo' : cat.charAt(0).toUpperCase() + cat.slice(1) + 's'}
                        </button>
                    ))}
                </div>

                <div className="shop-content-container">
                    {/* FEATURED CAROUSEL (Only on All) */}
                    {selectedCategory === 'all' && (
                        <>
                            <div className="section-heading">
                                <IonIcon icon={diamond} /> Destacado
                            </div>
                            <div className="featured-carousel">
                                <div className="featured-card">
                                    <IonIcon icon={cash} className="feat-bg-icon" />
                                    <div className="feat-content">
                                        <div className="feat-tag">OFERTA</div>
                                        <div className="feat-title">Pack de Inicio</div>
                                        <div className="feat-desc">Empieza con ventaja en la arena.</div>
                                        <div className="feat-price">
                                            <span style={{ color: '#f1c40f' }}>●</span> 200 Gems
                                        </div>
                                    </div>
                                </div>
                                <div className="featured-card" style={{ background: 'linear-gradient(135deg, #8e44ad, #3498db)' }}>
                                    <div className="feat-content">
                                        <div className="feat-tag" style={{ background: '#2ecc71' }}>NUEVO</div>
                                        <div className="feat-title">Cyber Frame</div>
                                        <div className="feat-desc">Estilo futurista para tu perfil.</div>
                                        <div className="feat-price">
                                            <span style={{ color: '#2ecc71' }}>💎</span> 200
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ITEMS GRID */}
                    <div className="section-heading">
                        <IonIcon icon={cart} /> Catálogo
                    </div>

                    <div className="shop-grid">
                        {filteredItems.map(item => {
                            const isOwned = ownedItems.includes(item.id);
                            return (
                                <div key={item.id} className="item-card" onClick={() => !isOwned && setSelectedItem(item)}>
                                    <div className="item-visual">{item.icon}</div>
                                    <div className="item-info">
                                        <div className="item-name">{item.name}</div>
                                        <div className="item-type">{item.type}</div>
                                    </div>

                                    {isOwned ? (
                                        <button className="btn-buy owned" disabled>
                                            <IonIcon icon={checkmarkCircle} /> Comprado
                                        </button>
                                    ) : (
                                        <button className="btn-buy can-afford">
                                            {item.currency === 'gold' ? <IonIcon icon={cash} /> : <IonIcon icon={diamond} />}
                                            {item.price}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* PURCHASE MODAL */}
            <IonModal isOpen={!!selectedItem} onDidDismiss={() => setSelectedItem(null)}>
                {selectedItem && (
                    <div className="purchase-modal-content">
                        {showSuccess ? (
                            <div className="success-overlay">
                                <IonIcon icon={checkmarkCircle} className="success-checkmark" />
                                <h2 style={{ color: 'var(--ion-text-color)' }}>¡Compra Exitosa!</h2>
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                    <IonIcon icon={close} size="large" onClick={() => setSelectedItem(null)} />
                                </div>

                                <div className="purchase-icon-large">{selectedItem.icon}</div>
                                <div className="purchase-title">{selectedItem.name}</div>
                                <p className="purchase-desc">{selectedItem.desc}</p>

                                <div className="purchase-price-tag" style={{ color: selectedItem.currency === 'gold' ? '#f1c40f' : '#2ecc71' }}>
                                    <IonIcon icon={selectedItem.currency === 'gold' ? cash : diamond} />
                                    {selectedItem.price}
                                </div>

                                <IonButton
                                    className="btn-confirm-purchase"
                                    color={selectedItem.currency === 'gold' ? 'warning' : 'success'}
                                    onClick={handlePurchase}
                                >
                                    CONFIRMAR COMPRA
                                </IonButton>
                            </>
                        )}
                    </div>
                )}
            </IonModal>
        </div>
    );
};

export default Shop;
