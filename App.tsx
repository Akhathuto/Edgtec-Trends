import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
// FIX: Corrected import path.
import AppLayout from './components/AppLayout';
import Spinner from './components/Spinner';

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