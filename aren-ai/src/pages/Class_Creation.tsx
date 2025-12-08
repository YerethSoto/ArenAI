import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonMenuButton,
  IonButtons,
  IonLabel,
  IonBackButton
} from '@ionic/react';
import { school, create, chevronDown, close, share, copy, todayOutline } from 'ionicons/icons';
import * as QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';
import './Class_Creation.css';
import { getApiUrl } from '../config/api';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Class_Creation: React.FC = () => {
  const { t } = useTranslation();
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [sectionNumber, setSectionNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [qrData, setQrData] = useState<{ classCode: string; joinLink: string } | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modalRef = useRef<HTMLIonModalElement | null>(null);

  const gradeLevels = [
    '7', '8', '9', '10', '11', '12'
  ];

  const sectionNumbers = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
  ]

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    // Validate inputs
    if (!gradeLevel) {
      setErrorMsg(t('professor.classCreation.alerts.selectGrade'));
      setIsLoading(false);
      return;
    }
    if (!sectionNumber) {
      setErrorMsg(t('professor.classCreation.alerts.selectSection'));
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrorMsg(t('professor.classCreation.alerts.loginRequired'));
        setIsLoading(false);
        return;
      }

      const resp = await fetch(getApiUrl('/api/sections'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          section_number: sectionNumber,
          grade: gradeLevel
        }),
      });

      if (!resp.ok) {
        // Handle different error cases
        if (resp.status === 409) {
          setErrorMsg(t('professor.classCreation.alerts.exists'));
          setIsLoading(false);
          return;
        }

        const errBody = await resp.json().catch(() => null);
        setErrorMsg(errBody?.message || t('professor.classCreation.alerts.failed'));
        setIsLoading(false);
        return;
      }

      const data = await resp.json();

      // Extract section data from response
      const newClassCode = data.id_section?.toString() || '';
      const newJoinLink = `${window.location.origin}/join/${newClassCode}`;

      setClassCode(newClassCode);
      setJoinLink(newJoinLink);
      setQrData({ classCode: newClassCode, joinLink: newJoinLink });

      // Generate QR code
      try {
        const dataUrl = await QRCode.toDataURL(newJoinLink, { margin: 1, width: 320 });
        setQrImage(dataUrl);
      } catch (qrErr) {
        console.warn('QR generation failed, will fallback to api image', qrErr);
        setQrImage(null);
      }

      await sleep(100);
      setShowQRModal(true);

    } catch (error) {
      console.error('Create class error', error);
      setErrorMsg(t('professor.classCreation.alerts.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setQrImage(null);
    setClassName('');
    setGradeLevel('');
    setSectionNumber('');
    setClassCode('');
    setJoinLink('');
    setQrData(null);
  };

  const handleShareClass = async () => {
    const data = qrData ?? { classCode, joinLink };
    if (!data.joinLink) {
      alert(t('professor.classCreation.alerts.noLink'));
      return;
    }
    const shareData = {
      title: `Join Grade ${gradeLevel} - Section ${sectionNumber}`,
      text: `Join my class - Grade ${gradeLevel}, Section ${sectionNumber} - code: ${data.classCode}`,
      url: data.joinLink
    };
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(shareData);
      } else {
        await navigator.clipboard.writeText(`${data.joinLink}`);
        alert(t('professor.classCreation.alerts.linkCopied'));
      }
    } catch (e) {
      console.error(e);
      alert(t('professor.classCreation.alerts.shareFailed'));
    }
  };

  const handleCopyCode = async () => {
    const code = qrData?.classCode ?? classCode;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    alert(t('professor.classCreation.alerts.codeCopied'));
  };

  const handleCopyLink = async () => {
    const link = qrData?.joinLink ?? joinLink;
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert(t('professor.classCreation.alerts.linkCopied'));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/page/professor" />
          </IonButtons>
          <IonTitle>{t('professor.classCreation.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="class-creation-content">
        <div className="class-creation-container">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" size-md="8" size-lg="6" size-xl="5">
                <div className="header-section">
                  <h1 className="page-title">{t('professor.classCreation.pageTitle')}</h1>
                  <p className="page-subtitle">{t('professor.classCreation.pageSubtitle')}</p>
                </div>

                <IonCard className="creation-card">
                  <IonCardContent>
                    <form onSubmit={handleCreateClass}>
                      {/* Error Message */}
                      {errorMsg && (
                        <div className="error-message">
                          {errorMsg}
                        </div>
                      )}

                      {/* Grade Level Section */}
                      <div className="input-section">
                        <h3 className="input-label">{t('professor.classCreation.gradeLevel')}</h3>
                        <IonItem className="select-item" lines="none">
                          <IonIcon icon={todayOutline} slot="start" className="input-icon" />
                          <IonSelect
                            value={gradeLevel}
                            placeholder={t('professor.classCreation.selectGrade')}
                            onIonChange={(e) => setGradeLevel(e.detail.value)}
                            interface="action-sheet"
                            className="grade-select"
                            required
                          >
                            {gradeLevels.map((grade, i) => (
                              <IonSelectOption key={i} value={grade}>{grade}</IonSelectOption>
                            ))}
                          </IonSelect>
                          <IonIcon icon={chevronDown} slot="end" className="select-arrow" />
                        </IonItem>
                      </div>

                      {/* Section Number Section */}
                      <div className="input-section">
                        <h3 className="input-label">{t('professor.classCreation.sectionNumber')}</h3>
                        <IonItem className="select-item" lines="none">
                          <IonIcon icon={school} slot="start" className="input-icon" />
                          <IonSelect
                            value={sectionNumber}
                            placeholder={t('professor.classCreation.selectSection')}
                            onIonChange={(e) => setSectionNumber(e.detail.value)}
                            interface="action-sheet"
                            className="custom-input"
                            required
                          >
                            {sectionNumbers.map((section, i) => (
                              <IonSelectOption key={i} value={section}>{section}</IonSelectOption>
                            ))}
                          </IonSelect>
                          <IonIcon icon={chevronDown} slot="end" className="select-arrow" />
                        </IonItem>
                      </div>

                      {/* Create Button */}
                      <div className="button-section">
                        <IonButton
                          type="submit"
                          expand="block"
                          className="create-button"
                          disabled={isLoading}
                        >
                          <IonIcon icon={create} slot="start" />
                          {isLoading ? t('professor.classCreation.creatingBtn') : t('professor.classCreation.createBtn')}
                        </IonButton>
                      </div>
                    </form>
                  </IonCardContent>
                </IonCard>

                {/* Info Section */}
                <div className="info-section">
                  <IonCard className="info-card">
                    <IonCardContent>
                      <IonText>
                        <h3 className="info-title"><strong>{t('professor.classCreation.aboutTitle')}</strong></h3>
                        <ul className="info-list">
                          <li>{t('professor.classCreation.aboutList.step1')}</li>
                          <li>{t('professor.classCreation.aboutList.step2')}</li>
                          <li><strong>{t('professor.classCreation.aboutList.step3')}</strong></li>
                        </ul>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* QR Modal Overlay */}
        {showQRModal && qrData && (
          <div className="qr-overlay" role="dialog" aria-modal="true">
            <div className="qr-overlay-backdrop" onClick={handleCloseModal} />
            <div className="qr-overlay-card">
              <header className="qr-overlay-header">
                <h3>{t('professor.classCreation.modal.title')}</h3>
                <button className="qr-close" onClick={handleCloseModal} aria-label="Close">✕</button>
              </header>

              <div className="qr-overlay-body">
                <div className="success-section">
                  <p className="success-message">
                    {t('professor.classCreation.modal.successMsg', { grade: gradeLevel, section: sectionNumber })}
                  </p>
                </div>

                <div className="class-details">
                  <div className="detail-item">
                    <h4>{t('professor.classCreation.modal.classCode')}</h4>
                    <p className="class-code">{qrData.classCode}</p>
                    <button className="btn-copy" onClick={handleCopyCode} aria-label="Copy code">{t('professor.classCreation.modal.copy')}</button>
                  </div>
                </div>

                <div className="qr-section">
                  <h4>{t('professor.classCreation.modal.scanQr')}</h4>
                  <div className="qr-code-wrapper">
                    {qrImage ? (
                      <img src={qrImage} alt="Class QR Code" width={320} height={320} />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData.joinLink)}`}
                        alt="Class QR Code (fallback)"
                        width={320}
                        height={320}
                      />
                    )}
                  </div>
                  <p className="qr-link">{qrData.joinLink}</p>
                  <div className="qr-actions">
                    <button className="btn-share" onClick={handleShareClass}>{t('professor.classCreation.modal.share')}</button>
                    <button className="btn-copy-link" onClick={handleCopyLink}>{t('professor.classCreation.modal.copyLink')}</button>
                    <button className="btn-done" onClick={handleCloseModal}>{t('professor.classCreation.modal.done')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Class_Creation;