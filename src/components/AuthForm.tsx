import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function AuthForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // After successful signup, redirect to profile setup
        navigate('/setup');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-600 rounded-full blur opacity-30"></div>
          <div className="relative bg-white p-3 rounded-full shadow-lg">
            <Keyboard className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
      </h2>
      <p className="text-center text-gray-500 mb-8">
        {isSignUp
          ? t('auth.joinTyping')
          : t('auth.signInContinue')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder={t('auth.enterEmail')}
            required
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder={t('auth.enterPassword')}
            required
            minLength={6}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span>{t('auth.processing')}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span>{isSignUp ? t('auth.createAccount') : t('common.signIn')}</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </div>
          )}
        </button>
        
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full"></div>
          <div className="bg-white px-3 text-sm text-gray-500 absolute">{t('common.and').toLowerCase()}</div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full py-3 px-4 bg-white border border-gray-300 text-indigo-600 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
        >
          <User className="mr-2 w-5 h-5" />
          {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
        </button>
      </form>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>{t('auth.termsAgree')}</p>
        <p className="mt-1">
          <a href="#" className="text-indigo-600 hover:underline">{t('auth.termsOfService')}</a>
          {' ' + t('common.and') + ' '}
          <a href="#" className="text-indigo-600 hover:underline">{t('auth.privacyPolicy')}</a>
        </p>
      </div>
    </motion.div>
  );
}