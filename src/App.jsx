import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Example from "./Example";
import ExampleModal from "./ExampleModal";
import AttractivePinturaEditor from "./NewExample";

import "./App.css";

function App() {
  const handleImageProcess = (result) => {
    console.log('Image processed:', result);
    // Handle the processed image result here
  };

  return (
    <Router>
      <div className="App">
        <h1>Pintura Image Editor</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Example</Link>
            </li>
            <li>
              <Link to="/modal">Modal</Link>
            </li>
            <li>
              <Link to="/new">New Attractive Editor</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/modal">
            <ExampleModal />
          </Route>
          <Route path="/new">
            <div style={{ padding: '20px' }}>
              <h2>Attractive Pintura Editor</h2>
              <AttractivePinturaEditor
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                onProcess={handleImageProcess}
              />
            </div>
          </Route>
          <Route path="/">
            <Example />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;