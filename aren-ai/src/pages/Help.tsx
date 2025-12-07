import React, { useState } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonIcon,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonToast
} from '@ionic/react';
import { helpCircle, mail, chevronDown, search, book, checkmarkCircle, send } from 'ionicons/icons';
import './Help.css';

const Help: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [contactForm, setContactForm] = useState({ subject: '', message: '' });

    const faqs = [
        {
            question: "¿Cómo gano más oro y gemas?",
            answer: "Puedes ganar oro completando lecciones, quizzes diarios y misiones de clan. Las gemas se obtienen al subir de nivel, mantener rachas de estudio o en cofres especiales."
        },
        {
            question: "¿Cómo funcionan las Batallas?",
            answer: "En el Lobby de Batalla, elige un modo (Standard, Blitz o Lógica). Te enfrentarás a otro estudiante en tiempo real respondiendo preguntas. ¡El que responda más rápido y correctamente gana!"
        },
        {
            question: "¿Puedo cambiar mi Avatar?",
            answer: "¡Sí! Ve a la Tienda o a tu Perfil. Puedes desbloquear nuevos avatares con oro o gemas y seleccionarlos como tu personaje activo."
        },
        {
            question: "¿Qué pasa si pierdo mi racha?",
            answer: "Si olvidas estudiar un día, tu racha se reiniciará a cero. Puedes usar un 'Racha Freeze' comprado en la tienda para proteger tu racha por un día."
        },
        {
            question: "¿Cómo me uno a un Clan?",
            answer: "Ve a la sección 'Clan' en el menú o el lobby. Puedes buscar un clan por nombre o unirte al clan de tu clase si tu profesor lo ha habilitado."
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleContactSubmit = () => {
        // Mock submission
        console.log("Contact form submitted:", contactForm);
        setContactForm({ subject: '', message: '' });
        setShowToast(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Ayuda y Soporte</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="help-page-content">
                <div className="help-hero">
                    <IonIcon icon={helpCircle} className="help-hero-icon" />
                    <h1>¿En qué podemos ayudarte?</h1>
                    <div className="search-bar-container">
                        <IonIcon icon={search} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar preguntas..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="help-section">
                    <div className="section-header">
                        <IonIcon icon={book} />
                        <h2>Preguntas Frecuentes</h2>
                    </div>

                    <IonAccordionGroup className="faq-accordion">
                        {filteredFaqs.map((faq, index) => (
                            <IonAccordion value={index.toString()} key={index}>
                                <IonItem slot="header" color="light">
                                    <IonLabel className="faq-question">{faq.question}</IonLabel>
                                </IonItem>
                                <div className="ion-padding" slot="content">
                                    <p className="faq-answer">{faq.answer}</p>
                                </div>
                            </IonAccordion>
                        ))}
                        {filteredFaqs.length === 0 && (
                            <div className="no-results">
                                No encontramos respuestas para "{searchText}".
                            </div>
                        )}
                    </IonAccordionGroup>
                </div>

                <div className="help-section contact-section">
                    <div className="section-header">
                        <IonIcon icon={mail} />
                        <h2>Contáctanos</h2>
                    </div>
                    <p className="contact-desc">¿No encuentras lo que buscas? Envíanos un mensaje.</p>

                    <div className="contact-form">
                        <IonItem className="input-item">
                            <IonLabel position="stacked">Asunto</IonLabel>
                            <IonInput
                                value={contactForm.subject}
                                placeholder="Ej. Problema con mi cuenta"
                                onIonChange={e => setContactForm({ ...contactForm, subject: e.detail.value! })}
                            />
                        </IonItem>
                        <IonItem className="input-item">
                            <IonLabel position="stacked">Mensaje</IonLabel>
                            <IonTextarea
                                rows={4}
                                value={contactForm.message}
                                placeholder="Describe tu problema en detalle..."
                                onIonChange={e => setContactForm({ ...contactForm, message: e.detail.value! })}
                            />
                        </IonItem>

                        <IonButton expand="block" className="btn-send-help" onClick={handleContactSubmit}>
                            Enviar Mensaje <IonIcon slot="end" icon={send} />
                        </IonButton>
                    </div>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="¡Mensaje enviado! Te responderemos pronto."
                    duration={3000}
                    position="bottom"
                    color="success"
                    icon={checkmarkCircle}
                />

            </IonContent>
        </IonPage>
    );
};

export default Help;
