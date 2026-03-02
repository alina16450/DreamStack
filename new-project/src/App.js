import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Service/Home';
import Add from './Service/Add';
import Edit from './Service/Edit';
import Account from './Service/Account.js';
import NoPage from './Service/NoPage';
import { BucketProvider } from './Repository/BucketContext';


//initializes a BucketProvider item from BucketContext, and passes our Routes as children. Our routes initialize our different pages, and their names.
function App() {
  return (
    <BucketProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/account' element={<Account />} />
          <Route path='/add' element={<Add />} />
          <Route path='/edit' element={<Edit />} />
          <Route path='*' element={<NoPage />} />
        </Routes>
      </Router>
    </BucketProvider>
  );
}

export default App;
