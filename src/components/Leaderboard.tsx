import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Keyboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LeaderboardEntry {
  username: string;
  level: number;
  words_typed: number;
}

export function Leaderboard() {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch leaderboard data directly from the view
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_view')
        .select('username, level, words_typed')
        .order('level', { ascending: false })
        .order('words_typed', { ascending: false })
        .limit(100);

      if (leaderboardError) {
        throw leaderboardError;
      }

      // Filter out any null entries and sort the data
      const validEntries = (leaderboardData || [])
        .filter((entry): entry is LeaderboardEntry => 
          entry.username != null && 
          entry.level != null && 
          entry.words_typed != null
        )
        .sort((a, b) => {
          // Sort by level first, then by words typed
          if (b.level !== a.level) {
            return b.level - a.level;
          }
          return b.words_typed - a.words_typed;
        });

      setLeaders(validEntries);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(t('leaderboard.errors.load'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {t('leaderboard.tryAgain')}
        </button>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.leaderboard')}</h2>
          <p className="text-gray-600 mb-6">{t('leaderboard.noPlayers')}</p>
          <Link
            to="/play"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Keyboard className="w-5 h-5 mr-2" />
            {t('leaderboard.startTyping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-8">
          <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">{t('leaderboard.title')}</h2>
        </div>

        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center p-4 rounded-lg ${
                index < 3 ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-12 text-center">
                {index < 3 ? (
                  <Medal className={`w-6 h-6 mx-auto ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    'text-amber-700'
                  }`} />
                ) : (
                  <span className="text-gray-500 font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 ml-4">
                <h3 className="font-semibold text-gray-900">{leader.username}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('common.level')} {leader.level}</p>
                <p className="text-xs text-gray-500">{leader.words_typed} {t('game.stats.words').toLowerCase()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}