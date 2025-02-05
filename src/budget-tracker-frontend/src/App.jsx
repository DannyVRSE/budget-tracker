import React from 'react';
import { AuthProvider } from './hooks/AuthContext';
import Home from './pages/Home';

const App = () => {

  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  )

}
export default App;
