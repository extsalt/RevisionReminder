import React from 'react';
import { signInWithGoogle } from '../services/firebase';
import { IS_CONFIGURED } from '../constants';
import { Button } from './Button';
import { CheckSquare } from 'lucide-react';

export const Login: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
    }
  };

  if (!IS_CONFIGURED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-red-100">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-600 flex items-center justify-center bg-red-100 rounded-full">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Configuration Missing</h2>
            <p className="mt-2 text-sm text-slate-600">
              Please open <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600">constants.ts</code> and add your Firebase configuration keys to run the app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-indigo-600 flex items-center justify-center bg-indigo-50 rounded-full">
            <CheckSquare size={24} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Welcome to QuickList</h2>
          <p className="mt-2 text-sm text-slate-600">
            Convert your thoughts into actionable checklists in seconds.
          </p>
        </div>
        <div className="mt-8">
           {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          <Button 
            onClick={handleLogin} 
            className="w-full flex justify-center py-3"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};