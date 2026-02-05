import {Compiler} from "./components/Compiler.js"
import { Editor } from "./components/Editor.js";
import {
	BrowserRouter,
	Routes,
	Route,
} from 'react-router-dom';

const App = () =>{
  return(
    <div className="App">

<BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Compiler/>}/>
        <Route exact path="/editor" element={<Editor/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;