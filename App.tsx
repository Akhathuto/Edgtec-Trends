

import React from 'react';
import { useAuth } from './contexts/AuthContext.tsx';
import Login from './components/Login.tsx';
// FIX: Corrected import path.
import AppLayout from './components/AppLayout.tsx';
import Spinner from './components/Spinner.tsx';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return user ? <AppLayout /> : <Login />;
};

export default App;