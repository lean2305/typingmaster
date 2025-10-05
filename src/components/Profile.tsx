import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Trophy, Award, History, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  username: string;
  show_on_leaderboard: boolean;
}

interface UserStats {
  level: number;
  exp: number;
  words_typed: number;
  wpm: number;
  accuracy: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

interface TypingSession {
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
}

export function Profile() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history' | 'settings'>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentSessions, setRecentSessions] = useState<TypingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Settings state
  const [newUsername, setNewUsername] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      // If no stats exist, create initial stats
      if (!statsData) {
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user?.id,
            level: 1,
            exp: 0,
            words_typed: 0,
            time_spent: 0,
            wpm: 0,
            accuracy: 100
          })
          .select()
          .single();

        if (createError) throw createError;
        setStats(newStats);
      } else {
        setStats(statsData);
      }

      // Fetch user achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          unlocked_at,
          achievements (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('unlocked_at', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Set state
      setProfile(profileData || { username: '', show_on_leaderboard: true });
      setNewUsername(profileData?.username || '');
      setShowLeaderboard(profileData?.show_on_leaderboard ?? true);
      
      // Format achievements
      const formattedAchievements = achievementsData?.map(a => ({
        id: a.achievements.id,
        name: a.achievements.name,
        description: a.achievements.description,
        icon: a.achievements.icon,
        unlocked_at: a.unlocked_at
      })) || [];
      setAchievements(formattedAchievements);

      // Generate some sample typing sessions (in a real app, this would come from a sessions table)
      const sampleSessions = generateSampleSessions(statsData || null);
      setRecentSessions(sampleSessions);

    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleSessions = (stats: UserStats | null): TypingSession[] => {
    if (!stats) return [];
    
    const sessions: TypingSession[] = [];
    const baseWpm = stats.wpm || 40;
    const baseAccuracy = stats.accuracy || 95;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      sessions.push({
        date: date.toLocaleDateString(),
        wpm: Math.round(baseWpm + (Math.random() * 10 - 5)),
        accuracy: Math.round(baseAccuracy + (Math.random() * 4 - 2)),
        duration: Math.round(5 + Math.random() * 10)
      });
    }
    
    return sessions;
  };

  const saveUsername = async () => {
    if (!user || !newUsername.trim()) return;
    
    try {
      setSavingUsername(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername.trim() })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
    } catch (err) {
      console.error('Error updating username:', err);
      setError('Failed to update username. Please try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  const toggleLeaderboard = async () => {
    if (!user) return;
    
    try {
      const newValue = !showLeaderboard;
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ show_on_leaderboard: newValue })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setShowLeaderboard(newValue);
      setProfile(prev => prev ? { ...prev, show_on_leaderboard: newValue } : null);
    } catch (err) {
      console.error('Error updating leaderboard visibility:', err);
      setError('Failed to update leaderboard settings. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setDeleting(true);
      setError('');
      
      // Delete user data from tables (RLS policies will ensure we can only delete our own data)
      const { error: deleteAchievementsError } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteAchievementsError) throw deleteAchievementsError;
      
      const { error: deleteStatsError } = await supabase
        .from('user_stats')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteStatsError) throw deleteStatsError;
      
      const { error: deleteProfileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteProfileError) throw deleteProfileError;
      
      // Delete the user's auth account (this will only work for the current user)
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      
      if (deleteUserError) {
        // If admin deletion fails, try client-side deletion
        const { error: clientDeleteError } = await supabase.auth.deleteUser();
        if (clientDeleteError) throw clientDeleteError;
      }
      
      // Sign out after successful deletion
      await signOut();
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and view your progress</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'achievements'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'history'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'settings'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Level</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.level || 1}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Words Typed</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.words_typed || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Average WPM</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.wpm || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Accuracy</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.accuracy || 0}%</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Progress</h3>
              <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ((stats?.exp || 0) / ((stats?.level || 1) * 100)) * 100)}%`
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>{stats?.exp || 0} XP</span>
                <span>{((stats?.level || 1) * 100)} XP needed for next level</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <Award className="w-8 h-8 text-indigo-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-50 p-6 rounded-lg"
                >
                  <div className="flex items-center mb-4">
                    <Award className="w-8 h-8 text-indigo-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-500">
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSessions.map((session, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.wpm}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.accuracy}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.duration} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Account Settings</h2>
                  <Settings className="w-6 h-6" />
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={saveUsername}
                          disabled={savingUsername || newUsername === profile?.username}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-300"
                        >
                          {savingUsername ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy & Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Show my profile on leaderboards</p>
                        <p className="text-sm text-gray-500">Allow other users to see your typing stats</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer"
                           onClick={toggleLeaderboard}>
                        <div className={`absolute inset-0 ${showLeaderboard ? 'bg-indigo-600' : 'bg-gray-300'} rounded-full transition-colors`}>
                          <div className={`absolute left-0 w-6 h-6 transform bg-white rounded-full shadow transition-transform ${showLeaderboard ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Danger Zone</h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start">
                      <Shield className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Delete Account</p>
                        <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all associated data</p>
                        {deleteConfirm ? (
                          <div className="space-y-2">
                            <p className="text-sm text-red-600">Are you sure? This action cannot be undone.</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                              >
                                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Delete Account
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}