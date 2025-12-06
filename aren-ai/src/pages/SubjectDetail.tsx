import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  arrowBack, 
  bookOutline, 
  calculatorOutline, 
  flaskOutline, 
  globeOutline, 
  languageOutline,
  chevronDownOutline,
  chevronForwardOutline,
  bulbOutline,
  documentTextOutline,
  videocamOutline
} from 'ionicons/icons';
import StudentHeader from '../components/StudentHeader';
import './SubjectDetail.css';

const SUBJECT_ICONS: { [key: string]: string } = {
  'Math': calculatorOutline,
  'Science': flaskOutline,
  'SocialStudies': globeOutline,
  'Spanish': languageOutline,
  'History': bookOutline
};

const SubjectDetail: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Generate a translation key for the subject title
  // Assuming subjectId matches the keys in 'mainStudent.subjects' (e.g., 'Math', 'Science')
  const subjectNameKey = `mainStudent.subjects.${subjectId}`;
  const subjectName = t(subjectNameKey, subjectId); // Fallback to ID if not found
  const subjectIcon = SUBJECT_ICONS[subjectId] || bookOutline;

  // Mock data for topics - in a real app this would come from an API/JSON
  // We will use translation keys for this data
  const topicsToken = `subjectDetail.topics.${subjectId}`;
  const topics = t(topicsToken, { returnObjects: true });
  
  // Ensure topics is an array before mapping
  const topicsList = Array.isArray(topics) ? topics : [];

  const toggleTopic = (topicId: string) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
    }
  };

  return (
    <IonPage>
      <StudentHeader 
        pageTitle={subjectName} 
        showNotch={false} 
        backButton={true}
        onBack={() => history.push('/page/student')}
      />
      <IonContent fullscreen className="subject-detail-content">
        <div className="sd-container">
          {/* Header Card */}
          <div className="sd-header-card" style={{ 
            background: `var(--theme-${subjectId.toLowerCase()}-gradient, linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%))` 
          }}>
            <div className="sd-header-icon">
              <IonIcon icon={subjectIcon} />
            </div>
            <div className="sd-header-text">
              <h1>{subjectName}</h1>
              <p>{t('subjectDetail.companionSubtitle', 'Class Companion')}</p>
            </div>
          </div>

          {/* Topics List */}
          <div className="sd-topics-list">
            <h3>{t('subjectDetail.topicsTitle', 'Quick Reference Guide')}</h3>
            
            {topicsList.length > 0 ? (
              topicsList.map((topic: any, index: number) => (
                <div key={index} className={`sd-topic-card ${expandedTopic === `topic-${index}` ? 'expanded' : ''}`}>
                  <div 
                    className="sd-topic-header" 
                    onClick={() => toggleTopic(`topic-${index}`)}
                  >
                    <div className="sd-topic-title">
                      <span className="sd-topic-number">{index + 1}</span>
                      {topic.title}
                    </div>
                    <IonIcon 
                      icon={expandedTopic === `topic-${index}` ? chevronDownOutline : chevronForwardOutline} 
                      className="sd-expand-icon"
                    />
                  </div>

                  {expandedTopic === `topic-${index}` && (
                    <div className="sd-topic-content">
                      <div className="sd-section">
                        <h4><IonIcon icon={bulbOutline} /> {t('subjectDetail.keyConcepts', 'Key Concepts')}</h4>
                        <ul>
                          {topic.concepts && topic.concepts.map((concept: string, i: number) => (
                            <li key={i}>{concept}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="sd-section">
                        <h4><IonIcon icon={documentTextOutline} /> {t('subjectDetail.formulas', 'Formulas & Notes')}</h4>
                        <div className="sd-formulas-box">
                          {topic.formulas && topic.formulas.map((formula: string, i: number) => (
                            <div key={i} className="sd-formula-item">{formula}</div>
                          ))}
                        </div>
                      </div>

                      <div className="sd-actions">
                        <button className="sd-action-btn secondary">
                          <IonIcon icon={videocamOutline} /> {t('subjectDetail.findVideo', 'Find Video')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
                <div className="sd-empty-state">
                    <p>{t('subjectDetail.noData', 'Select a topic to see details.')}</p>
                </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SubjectDetail;
