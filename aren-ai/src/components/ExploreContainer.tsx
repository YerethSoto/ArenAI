import './ExploreContainer.css';

interface ContainerProps {
  name: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div id="container">
      {/* Here we are going to add components to the main page
      Add validations based on the name prop if needed*/}
    </div>
  );
};

export default ExploreContainer;
