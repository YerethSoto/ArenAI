import React, { useState } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonRange,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    IonCol,
    useIonToast,
    IonCheckbox
} from '@ionic/react';
import {
    schoolOutline,
    personOutline,
    documentTextOutline,
    clipboardOutline,
    addCircleOutline,
    createOutline,
    chevronDownOutline,
    chevronUpOutline,
    bookOutline
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './CreateTask.css';

// Mock Topics Data (Matching Main_Prof structure but simplified keys if possible, or using the same keys)
const TOPICS_BY_SUBJECT: { [key: string]: string[] } = {
    'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry', 'Probability', 'LinearEq', 'Functions'],
    'Science': ['Biology', 'Chemistry', 'Physics', 'EarthSci', 'Astronomy', 'EnvSci'],
    'History': ['History', 'Geography', 'Civics', 'Economics', 'Culture', 'Govt'], // 'Social Studies' mapped to History for now or keep separate
    'Literature': ['Vocab', 'Grammar', 'Reading', 'Writing', 'Speaking', 'Listening'], // Spanish/Lit mapping
    'Computer Science': ['Algorithms', 'DataStructures', 'WebDev', 'Databases', 'AI', 'Networking'],
    'Art': ['Painting', 'Sculpture', 'ArtHistory', 'ColorTheory', 'DigitalArt']
};

const CreateTask: React.FC = () => {
    const { t } = useTranslation();
    const [recipientType, setRecipientType] = useState<'class' | 'student'>('class');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [taskType, setTaskType] = useState<'quiz' | 'requirement'>('quiz');
    const [present] = useIonToast();

    // Quiz State
    const [subject, setSubject] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]); // Changed from single topic string
    const [isTopicsExpanded, setIsTopicsExpanded] = useState(false); // For accordion
    const [questionCount, setQuestionCount] = useState(5);
    const [customPrompt, setCustomPrompt] = useState('');

    // Requirement State
    const [note, setNote] = useState('');

    // Mock Data
    const classes = [
        { id: '1', name: 'Mathematics 101' },
        { id: '2', name: 'History of Art' },
        { id: '3', name: 'Computer Science A' }
    ];

    const students = [
        { id: '1', name: 'Alice Johnson' },
        { id: '2', name: 'Bob Smith' },
        { id: '3', name: 'Charlie Brown' },
        { id: '4', name: 'Diana Prince' }
    ];

    const subjects = Object.keys(TOPICS_BY_SUBJECT);

    const handleCreateTask = () => {
        // Validation
        if (selectedRecipients.length === 0) {
            present({
                message: t('professor.createTask.alerts.selectRecipient'),
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        if (taskType === 'quiz' && (!subject || selectedTopics.length === 0)) {
            present({
                message: t('professor.createTask.alerts.fillSubjectTopic'), // Key might need update or text will just say "Topic"
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        if (taskType === 'requirement' && !note) {
            present({
                message: t('professor.createTask.alerts.addNote'),
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        // Success
        console.log('Creating Task:', {
            recipientType,
            selectedRecipients,
            taskType,
            quizData: taskType === 'quiz' ? { subject, selectedTopics, questionCount, customPrompt } : null,
            requirementData: taskType === 'requirement' ? { note } : null
        });

        present({
            message: t('professor.createTask.alerts.success'),
            duration: 2000,
            color: 'success'
        });
    };

    const toggleTopic = (topicKey: string) => {
        setSelectedTopics(prev => {
            if (prev.includes(topicKey)) {
                return prev.filter(t => t !== topicKey);
            } else {
                return [...prev, topicKey];
            }
        });
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/page/professor" />
                    </IonButtons>
                    <IonTitle>{t('professor.createTask.title')}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="create-task-content">
                <div className="create-task-container">

                    {/* Recipient Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <IonIcon icon={schoolOutline} /> {t('professor.createTask.assignTo')}
                        </h2>

                        <div className="recipient-toggle">
                            <IonSegment value={recipientType} onIonChange={e => setRecipientType(e.detail.value as any)}>
                                <IonSegmentButton value="class">
                                    <IonLabel>{t('professor.createTask.classes')}</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton value="student">
                                    <IonLabel>{t('professor.createTask.students')}</IonLabel>
                                </IonSegmentButton>
                            </IonSegment>
                        </div>

                        <IonItem className="custom-select-item" lines="none">
                            <IonLabel position="stacked">
                                {recipientType === 'class' ? t('professor.createTask.selectClasses') : t('professor.createTask.selectStudents')}
                            </IonLabel>
                            <IonSelect
                                multiple={true}
                                value={selectedRecipients}
                                onIonChange={e => setSelectedRecipients(e.detail.value)}
                                placeholder={recipientType === 'class' ? t('professor.createTask.chooseClasses') : t('professor.createTask.chooseStudents')}
                            >
                                {recipientType === 'class'
                                    ? classes.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)
                                    : students.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)
                                }
                            </IonSelect>
                        </IonItem>

                        <div className="selected-chips">
                            {selectedRecipients.map(id => {
                                const item = recipientType === 'class'
                                    ? classes.find(c => c.id === id)
                                    : students.find(s => s.id === id);
                                return item ? <IonChip key={id}>{item.name}</IonChip> : null;
                            })}
                        </div>
                    </section>

                    {/* Task Type Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <IonIcon icon={createOutline} /> {t('professor.createTask.taskType')}
                        </h2>

                        <div className="task-type-cards">
                            <div
                                className={`type-card ${taskType === 'quiz' ? 'selected' : ''}`}
                                onClick={() => setTaskType('quiz')}
                            >
                                <div className="card-icon"><IonIcon icon={clipboardOutline} /></div>
                                <h3>{t('professor.createTask.quiz')}</h3>
                                <p>{t('professor.createTask.quizDesc')}</p>
                            </div>

                            <div
                                className={`type-card ${taskType === 'requirement' ? 'selected' : ''}`}
                                onClick={() => setTaskType('requirement')}
                            >
                                <div className="card-icon"><IonIcon icon={documentTextOutline} /></div>
                                <h3>{t('professor.createTask.requirement')}</h3>
                                <p>{t('professor.createTask.requirementDesc')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Dynamic Form Section */}
                    <section className="form-section input-area">
                        {taskType === 'quiz' ? (
                            <div className="quiz-form fade-in">
                                <h3 className="subsection-title">{t('professor.createTask.quizDetails')}</h3>

                                <IonGrid className="no-padding-start">
                                    <IonRow>
                                        <IonCol size="12">
                                            <IonItem className="custom-input-item" lines="none">
                                                <IonLabel position="stacked">{t('professor.createTask.subject')}</IonLabel>
                                                <IonSelect
                                                    value={subject}
                                                    onIonChange={e => {
                                                        setSubject(e.detail.value);
                                                        setSelectedTopics([]); // Reset topics on subject change
                                                        setIsTopicsExpanded(true); // Auto expand when subject picked
                                                    }}
                                                    placeholder={t('professor.createTask.subject')}
                                                >
                                                    {subjects.map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
                                                </IonSelect>
                                            </IonItem>
                                        </IonCol>

                                        {subject && TOPICS_BY_SUBJECT[subject] && (
                                            <IonCol size="12">
                                                <div className="topics-expandable-container">
                                                    <div
                                                        className="topics-header"
                                                        onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                                                    >
                                                        <div className="topics-label">
                                                            <IonIcon icon={bookOutline} className="topic-icon" />
                                                            <span>{t('professor.createTask.selectTopics')} ({selectedTopics.length})</span>
                                                        </div>
                                                        <IonIcon icon={isTopicsExpanded ? chevronUpOutline : chevronDownOutline} />
                                                    </div>

                                                    {isTopicsExpanded && (
                                                        <div className="topics-list fade-in-fast">
                                                            {TOPICS_BY_SUBJECT[subject].map(topicKey => (
                                                                <div
                                                                    key={topicKey}
                                                                    className={`topic-checkbox-item ${selectedTopics.includes(topicKey) ? 'selected' : ''}`}
                                                                    onClick={() => toggleTopic(topicKey)}
                                                                >
                                                                    <div className={`checkbox-circle ${selectedTopics.includes(topicKey) ? 'checked' : ''}`}>
                                                                        {selectedTopics.includes(topicKey) && <div className="inner-dot"></div>}
                                                                    </div>
                                                                    <span className="topic-name">
                                                                        {t(`professor.dashboard.topics.${topicKey}`, topicKey)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </IonCol>
                                        )}
                                    </IonRow>
                                </IonGrid>

                                <div className="range-container">
                                    <IonLabel>{t('professor.createTask.questionCount')}: {questionCount}</IonLabel>
                                    <IonRange
                                        min={1}
                                        max={20}
                                        pin={true}
                                        value={questionCount}
                                        onIonChange={e => setQuestionCount(e.detail.value as number)}
                                        color="secondary"
                                    >
                                        <IonLabel slot="start">1</IonLabel>
                                        <IonLabel slot="end">20</IonLabel>
                                    </IonRange>
                                </div>

                                <IonItem className="custom-input-item" lines="none">
                                    <IonLabel position="stacked">{t('professor.createTask.customPrompt')}</IonLabel>
                                    <IonTextarea
                                        rows={3}
                                        value={customPrompt}
                                        onIonChange={e => setCustomPrompt(e.detail.value!)}
                                        placeholder={t('professor.createTask.customPromptPlaceholder')}
                                    />
                                </IonItem>
                            </div>
                        ) : (
                            <div className="requirement-form fade-in">
                                <h3 className="subsection-title">{t('professor.createTask.requirementDetails')}</h3>
                                <IonItem className="custom-input-item" lines="none">
                                    <IonLabel position="stacked">{t('professor.createTask.description')}</IonLabel>
                                    <IonTextarea
                                        rows={6}
                                        value={note}
                                        onIonChange={e => setNote(e.detail.value!)}
                                        placeholder={t('professor.createTask.descriptionPlaceholder')}
                                    />
                                </IonItem>
                            </div>
                        )}
                    </section>

                    <div className="action-button-container">
                        <IonButton
                            expand="block"
                            className="create-button"
                            onClick={handleCreateTask}
                        >
                            <IonIcon slot="start" icon={addCircleOutline} />
                            {t('professor.createTask.createBtn')}
                        </IonButton>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default CreateTask;
