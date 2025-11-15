import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import Main_Student from './Main_Student';
import Chatbot from './Chatbot';

const Page: React.FC = () => {
  const location = useLocation();

  return (
    <Switch>
      {/* Redirige a la vista principal si la ruta es exactamente /page/student */}
      <Route exact path="/page/student">
        <Redirect to="/page/student/main" />
      </Route>
      {/* Redirige a la vista principal si la ruta es exactamente /page/professor */}
      <Route exact path="/page/professor">
        <Redirect to="/page/professor/main" />
      </Route>
      {/* Rutas internas */}
      <Route path="/page/student/main" component={Main_Student} />
      <Route path="/page/student/chat" component={Chatbot} />
      <Route path="/page/:name" component={Page} />
    </Switch>
  );
};

export default Page;
