import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useTranslation } from "react-i18next";
import "./Chatbot.css";

const EMBEDDED_CHAT_URL =
  "https://genai-app-arenai-math-001-1-1763449207844-271931294892.us-central1.run.app/?key=8qes8frsvq5ojr8a&__theme=light";

const Chat: React.FC = () => {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonHeader className="app-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{t('chat.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="chat-embed-content">
        <div className="chat-iframe-wrapper">
          <iframe
            src={EMBEDDED_CHAT_URL}
            title="ArenAI Chatbot"
            loading="lazy"
            allow="camera; microphone; fullscreen; clipboard-write"
            allowFullScreen
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Chat;
