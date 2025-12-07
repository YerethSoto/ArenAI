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
    useIonToast
} from '@ionic/react';
import {
    schoolOutline,
    personOutline,
    documentTextOutline,
    clipboardOutline,
    addCircleOutline,
    createOutline
} from 'ionicons/icons';
import './CreateTask.css';

const CreateTask: React.FC = () => {
    const [recipientType, setRecipientType] = useState<'class' | 'student'>('class');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [taskType, setTaskType] = useState<'quiz' | 'requirement'>('quiz');
    const [present] = useIonToast();

    // Quiz State
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
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

    const subjects = [
        'Mathematics', 'History', 'Science', 'Literature', 'Computer Science', 'Art'
    ];

    const handleCreateTask = () => {
        // Validation
        if (selectedRecipients.length === 0) {
            present({
                message: 'Please select at least one recipient.',
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        if (taskType === 'quiz' && (!subject || !topic)) {
            present({
                message: 'Please fill in Subject and Topic for the quiz.',
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        if (taskType === 'requirement' && !note) {
            present({
                message: 'Please add a note for the requirement.',
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
            quizData: taskType === 'quiz' ? { subject, topic, questionCount, customPrompt } : null,
            requirementData: taskType === 'requirement' ? { note } : null
        });

        present({
            message: 'Task created successfully!',
            duration: 2000,
            color: 'success'
        });
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/page/professor" />
                    </IonButtons>
                    <IonTitle>Create New Task</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="create-task-content">
                <div className="create-task-container">

                    {/* Recipient Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <IonIcon icon={schoolOutline} /> Assign To
                        </h2>

                        <div className="recipient-toggle">
                            <IonSegment value={recipientType} onIonChange={e => setRecipientType(e.detail.value as any)}>
                                <IonSegmentButton value="class">
                                    <IonLabel>Classes</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton value="student">
                                    <IonLabel>Students</IonLabel>
                                </IonSegmentButton>
                            </IonSegment>
                        </div>

                        <IonItem className="custom-select-item" lines="none">
                            <IonLabel position="stacked">Select {recipientType === 'class' ? 'Classes' : 'Students'}</IonLabel>
                            <IonSelect
                                multiple={true}
                                value={selectedRecipients}
                                onIonChange={e => setSelectedRecipients(e.detail.value)}
                                placeholder={`Choose ${recipientType === 'class' ? 'Classes' : 'Students'}...`}
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
                            <IonIcon icon={createOutline} /> Task Type
                        </h2>

                        <div className="task-type-cards">
                            <div
                                className={`type-card ${taskType === 'quiz' ? 'selected' : ''}`}
                                onClick={() => setTaskType('quiz')}
                            >
                                <div className="card-icon"><IonIcon icon={clipboardOutline} /></div>
                                <h3>Quiz</h3>
                                <p>Generate a quiz with AI</p>
                            </div>

                            <div
                                className={`type-card ${taskType === 'requirement' ? 'selected' : ''}`}
                                onClick={() => setTaskType('requirement')}
                            >
                                <div className="card-icon"><IonIcon icon={documentTextOutline} /></div>
                                <h3>Requirement</h3>
                                <p>Manual task or note</p>
                            </div>
                        </div>
                    </section>

                    {/* Dynamic Form Section */}
                    <section className="form-section input-area">
                        {taskType === 'quiz' ? (
                            <div className="quiz-form fade-in">
                                <h3 className="subsection-title">Quiz Details</h3>

                                <IonGrid>
                                    <IonRow>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem className="custom-input-item" lines="none">
                                                <IonLabel position="stacked">Subject</IonLabel>
                                                <IonSelect
                                                    value={subject}
                                                    onIonChange={e => setSubject(e.detail.value)}
                                                    placeholder="Select Subject"
                                                >
                                                    {subjects.map(s => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
                                                </IonSelect>
                                            </IonItem>
                                        </IonCol>
                                        <IonCol size="12" sizeMd="6">
                                            <IonItem className="custom-input-item" lines="none">
                                                <IonLabel position="stacked">Topic</IonLabel>
                                                <IonInput
                                                    value={topic}
                                                    onIonChange={e => setTopic(e.detail.value!)}
                                                    placeholder="E.g., Algebra, Renaissance Art"
                                                />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>

                                <div className="range-container">
                                    <IonLabel>Number of Questions: {questionCount}</IonLabel>
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
                                    <IonLabel position="stacked">Custom Prompt Instructions (Optional)</IonLabel>
                                    <IonTextarea
                                        rows={3}
                                        value={customPrompt}
                                        onIonChange={e => setCustomPrompt(e.detail.value!)}
                                        placeholder="Add specific instructions for the AI generation..."
                                    />
                                </IonItem>
                            </div>
                        ) : (
                            <div className="requirement-form fade-in">
                                <h3 className="subsection-title">Requirement Details</h3>
                                <IonItem className="custom-input-item" lines="none">
                                    <IonLabel position="stacked">Task Description / Note</IonLabel>
                                    <IonTextarea
                                        rows={6}
                                        value={note}
                                        onIonChange={e => setNote(e.detail.value!)}
                                        placeholder="Describe the task requirements..."
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
                            Create Task
                        </IonButton>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default CreateTask;
