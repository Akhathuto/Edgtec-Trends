
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import AppLayout from './components/AppLayout';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return user ? <AppLayout /> : <Login />;
};

export default App;
