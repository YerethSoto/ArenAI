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
  IonLabel
} from '@ionic/react';
import { school, create, chevronDown, close, share, copy, todayOutline } from 'ionicons/icons';
import QRCode from 'qrcode';
import './Class_Creation.css';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Class_Creation: React.FC = () => {
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [sectionNumber, setSectionNumer] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [qrData, setQrData] = useState<{ classCode: string; joinLink: string } | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLIonModalElement | null>(null);

  const gradeLevels = [
    '7','8','9','10','11',
    '12'
  ];

  const sectionNumbers = [
    '1','2','3','4','5','6','7','8','9','10'
  ]

  const generateClassCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const generateJoinLink = (code: string) => `https://arenai.education/join/${code}`;

  const handleCreateClass = async () => {
    try {
      setIsLoading(true);

      if (!gradeLevel) {
        alert('Please select a grade level');
        return;
      }
      if(!sectionNumber){

        alert('Please enter the section number')
      }

      // Simular llamada/processing
      await sleep(800);

      const newClassCode = generateClassCode();
      const newJoinLink = generateJoinLink(newClassCode);

      setClassCode(newClassCode);
      setJoinLink(newJoinLink);
      setQrData({ classCode: newClassCode, joinLink: newJoinLink });

      // Generar imagen QR localmente (data URL)
      try {
        const dataUrl = await QRCode.toDataURL(newJoinLink, { margin: 1, width: 320 });
        setQrImage(dataUrl);
      } catch (qrErr) {
        console.warn('QR generation failed, will fallback to api image', qrErr);
        setQrImage(null);
      }

      // Pequeño delay para asegurar render coherente antes de abrir modal
      await sleep(100);

      setShowQRModal(true);
      console.log('Class created', { newClassCode, newJoinLink });
    } catch (err) {
      console.error('Error creating class:', err);
      alert('An error occurred while creating the class.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setQrImage(null);
    setClassName('');
    setGradeLevel('');
    setClassCode('');
    setJoinLink('');
    setQrData(null);
  };

  const handleShareClass = async () => {
    const data = qrData ?? { classCode, joinLink };
    if (!data.joinLink) {
      alert('No link available to share yet.');
      return;
    }
    const shareData = { title: `Join ${className}`, text: `Join my class "${className}" - code: ${data.classCode}`, url: data.joinLink };
    try {
      if ((navigator as any).share) await (navigator as any).share(shareData);
      else { await navigator.clipboard.writeText(`${data.joinLink}`); alert('Link copied to clipboard'); }
    } catch (e) { console.error(e); alert('Share failed'); }
  };

  const handleCopyCode = async () => {
    const code = qrData?.classCode ?? classCode;
    if (!code) return alert('No code to copy');
    await navigator.clipboard.writeText(code);
    alert('Class code copied to clipboard!');
  };

  const handleCopyLink = async () => {
    const link = qrData?.joinLink ?? joinLink;
    if (!link) return alert('No link to copy');
    await navigator.clipboard.writeText(link);
    alert('Class link copied to clipboard!');
  };

  // DEBUG: ver cambios de estado del modal en consola
  useEffect(() => {
    console.log('showQRModal changed:', showQRModal, 'qrData:', qrData);
  }, [showQRModal, qrData]);

  // forzar present() cuando showQRModal cambia a true
  useEffect(() => {
    if (showQRModal) {
      // small timeout to let state/render settle
      setTimeout(() => {
        try {
          // present() puede no existir dependiendo de la versión, así que comprobamos
          const m = modalRef.current as any;
          if (m?.present) m.present();
        } catch (e) {
          console.debug('modal present() not available', e);
        }
      }, 60);
    }
  }, [showQRModal]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Create a Section</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen class="class-creation-content">
        <div className="class-creation-container">
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" size-md="8" size-lg="6" size-xl="4">
                <div className="header-section">
                  <IonText><h1 className="page-title"><strong>Create New Section</strong></h1></IonText>
                  <IonText><p className="page-subtitle">Create it once, use it for a year</p></IonText>
                </div>

                <IonCard className="creation-card">
                  <IonCardContent>
                    {/* reemplazamos <form> por controles con onClick */}


                    <div className="input-section">
                      <IonText><h3 className="input-label">Grade Level</h3></IonText>
                      <IonItem className="select-item" lines="none">
                         <IonIcon icon={todayOutline} slot="start" className="input-icon" />
                        <IonSelect
                          value={gradeLevel}
                          placeholder="Select grade level"
                          onIonChange={(e) => setGradeLevel(e.detail.value)}
                          interface="action-sheet"
                          className="grade-select"
                        >
                          {gradeLevels.map((grade, i) => <IonSelectOption key={i} value={grade}>{grade}</IonSelectOption>)}
                        </IonSelect>
                        <IonIcon icon={chevronDown} slot="end" className="select-arrow" />
                      </IonItem>
                    </div>





                    <div className="input-section">
                      <IonText><h3 className="input-label">Section Name</h3></IonText>
                      <IonItem className="input-item" lines="none">
                        <IonIcon icon={school} slot="start" className="input-icon" />


                          <IonSelect
                          value={sectionNumber}
                          placeholder="Select section number"
                          onIonChange={(e) => setSectionNumer(e.detail.value)}
                          interface="action-sheet"
                          className="custom-input"
                        >
                          {sectionNumbers.map((grade, i) => <IonSelectOption key={i} value={grade}>{grade}</IonSelectOption>)}
                        </IonSelect>




                   
                      </IonItem>
                    </div>

                    

                    <div className="button-section">
                      <IonButton
                        onClick={handleCreateClass}
                        expand="block"
                        className="create-button"
                        disabled={isLoading}
                      >
                        <IonIcon icon={create} slot="start" />
                        {isLoading ? 'CREATING CLASS...' : 'CREATE CLASS'}
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>

                <div className="info-section">
                  <IonCard className="info-card">
                    <IonCardContent>
                      <IonText>
                        <h3 className="info-title"><strong>About Section Creation</strong></h3>
                        <ul className="info-list">
                          

                          <li>1. Enter the grade and sectino number and automatically create a new section</li>
                          <li>2. Once created you will get a QR Code, let the students scan it to join the section</li>
                          <li>3.  <strong> Done!</strong> now your students will be assigned to this section for the remainder of the year</li>
                    
                        </ul>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        { /* quita IonModal y añade este overlay controlado por showQRModal */ }
        {showQRModal && qrData && (
          <div className="qr-overlay" role="dialog" aria-modal="true">
            <div className="qr-overlay-backdrop" onClick={handleCloseModal} />
            <div className="qr-overlay-card">
              <header className="qr-overlay-header">
                <h3>Class Created</h3>
                <button className="qr-close" onClick={handleCloseModal} aria-label="Close">✕</button>
              </header>

              <div className="qr-overlay-body">
                <div className="success-section">
                  <p className="success-message">Your class <strong>{gradeLevel} - {sectionNumber} </strong> has been created.</p>
                </div>

                <div className="class-details">
                  <div className="detail-item">
                    <h4>Class Code</h4>
                    <p className="class-code">{qrData.classCode}</p>
                    <button className="btn-copy" onClick={handleCopyCode} aria-label="Copy code">Copy</button>
                  </div>
                </div>

                <div className="qr-section">
                  <h4>Scan QR to Join</h4>
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
                    <button className="btn-share" onClick={handleShareClass}>Share</button>
                    <button className="btn-done" onClick={handleCloseModal}>Done</button>
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