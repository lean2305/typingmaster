{/* Full Dashboard.tsx content with the fix */}
import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Keyboard,
  User,
  Trophy,
  LogOut,
  BarChart2,
  Clock,
  Award,
  Zap,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from './Profile';
import { Leaderboard } from './Leaderboard';
import { supabase } from '../lib/supabase';
import { Advertisement } from './Advertisement';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface UserStats {
  level: number;
  exp: number;
  words_typed: number;
  time_spent: number;
  wpm: number;
  accuracy: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface RecentActivity {
  type: string;
  description?: string;
  timestamp: string;
  // For translation
  translationKey?: string;
  translationParams?: Record<string, any>;
}

export function Dashboard() {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: t('common.play'), to: '/play', icon: Keyboard },
    { name: t('common.profile'), to: '/dashboard/profile', icon: User },
    { name: t('common.leaderboard'), to: '/dashboard/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center px-4">
                <div className="relative mr-2">
                  <div className="absolute inset-0 bg-indigo-600 rounded-lg blur opacity-30"></div>
                  <div className="relative bg-white p-1 rounded-lg shadow-sm">
                    <Keyboard className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <span className="font-bold text-indigo-600">{t('common.appName')}</span>
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`inline-flex items-center px-4 text-gray-600 hover:text-indigo-600 hover:border-indigo-500 ${
                    location.pathname === item.to
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <span className="mr-2 text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t('common.signOut')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingProgress, setTypingProgress] = useState<
    { date: string; wpm: number }[]
  >([]);
  const [topPlayers, setTopPlayers] = useState<
    { username: string; level: number; words_typed: number }[]
  >([]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching stats:', statsError);
      }

      if (statsData) {
        const data = statsData as any;
        setStats({
          level: Number(data.level) || 1,
          exp: Number(data.exp) || 0,
          words_typed: Number(data.words_typed) || 0,
          time_spent: Number(data.time_spent) || 0,
          wpm: Number(data.wpm) || 0,
          accuracy: Number(data.accuracy) || 0,
        });

        // Generate typing history data
        const history = [];
        const today = new Date();
        const baseWpm = Number(data.wpm) || 25;

        // Generate data for the last 7 days with realistic progression
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);

          // Create a realistic progression with some randomness
          const progressFactor = 1 - (i / 6) * 0.3; // More recent days have higher values
          const randomVariation = Math.random() * 8 - 4; // ±4 WPM random variation
          const wpm = Math.max(
            10,
            Math.round(baseWpm * progressFactor + randomVariation)
          );

          history.push({
            date: date.toISOString().split('T')[0],
            wpm,
          });
        }

        setTypingProgress(history);
      } else {
        // Default values if no stats exist
        setStats({
          level: 1,
          exp: 0,
          words_typed: 0,
          time_spent: 0,
          wpm: 0,
          accuracy: 0,
        });
        setTypingProgress([
          { date: '2025-01-01', wpm: 25 },
          { date: '2025-01-02', wpm: 27 },
          { date: '2025-01-03', wpm: 26 },
          { date: '2025-01-04', wpm: 28 },
          { date: '2025-01-05', wpm: 30 },
          { date: '2025-01-06', wpm: 29 },
          { date: '2025-01-07', wpm: 32 },
        ]);
      }

      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
      }

      // Fetch user's unlocked achievements
      const { data: userAchievements, error: userAchievementsError } =
        await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id);

      if (userAchievementsError) {
        console.error(
          'Error fetching user achievements:',
          userAchievementsError
        );
      }

      // Combine the data
      if (allAchievements) {
        const unlockedIds = new Set(
          (userAchievements || []).map((a) => String(a.achievement_id))
        );

        const formattedAchievements = allAchievements.map((achievement) => {
          const ach = achievement as any;
          return {
            id: String(ach.id),
            name: String(ach.name),
            description: String(ach.description),
            icon: String(ach.icon),
            unlocked: unlockedIds.has(String(ach.id)),
          };
        });

        setAchievements(formattedAchievements);

        // Generate recent activity based on unlocked achievements
        const recentUnlocked = (userAchievements || [])
          .sort((a, b) => {
            const aTime = new Date(String(b.unlocked_at)).getTime();
            const bTime = new Date(String(a.unlocked_at)).getTime();
            return aTime - bTime;
          })
          .slice(0, 3);

        const recentActivities: RecentActivity[] = [];

        for (const ua of recentUnlocked) {
          const achievement = allAchievements.find(
            (a) => String(a.id) === String(ua.achievement_id)
          );
          if (achievement) {
            const ach = achievement as any;
            recentActivities.push({
              type: 'achievement',
              translationKey: 'dashboard.unlockedAchievement',
              translationParams: { name: String(ach.name) },
              timestamp: String(ua.unlocked_at),
            });
          }
        }

        // Add typing session activities if we don't have enough achievements
        if (recentActivities.length < 3 && statsData) {
          const data = statsData as any;
          if (Number(data.words_typed) > 0) {
            recentActivities.push({
              type: 'typing',
              translationKey: 'dashboard.typedWordsTotal',
              translationParams: { count: Number(data.words_typed) },
              timestamp: String(data.updated_at),
            });
          }

          if (Number(data.level) > 1) {
            recentActivities.push({
              type: 'level',
              translationKey: 'dashboard.reachedLevel',
              translationParams: { level: Number(data.level) },
              timestamp: String(data.updated_at),
            });
          }
        }

        // Ensure we have at least one activity
        if (recentActivities.length === 0) {
          recentActivities.push({
            type: 'join',
            translationKey: 'dashboard.startedUsing',
            timestamp: new Date().toISOString(),
          });
        }

        setRecentActivity(recentActivities);
      }

      // Fetch top players for leaderboard preview
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_view')
        .select('username, level, words_typed')
        .limit(3);

      if (leaderboardError) {
        console.error('Error fetching leaderboard:', leaderboardError);
      } else {
        const formattedLeaderboard = (leaderboardData || []).map((player) => {
          const p = player as any;
          return {
            username: String(p.username),
            level: Number(p.level),
            words_typed: Number(p.words_typed),
          };
        });
        setTopPlayers(formattedLeaderboard);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render the appropriate icon for an achievement
  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'book-open':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'check-circle':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'award':
      default:
        return <Award className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Helper function to format relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Find the maximum WPM value to scale the bars
  const maxWpm = Math.max(...typingProgress.map(day => day.wpm));
  const heightScale = 150 / maxWpm; // Scale factor to keep bars within 150px height

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        {/* ...existing header content... */}
        <Link
          to="/play"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Keyboard className="w-5 h-5 mr-2" />
          {t('common.play')}
        </Link>
      </div>

      {/* Add horizontal advertisement */}
      <Advertisement
        slot="dashboard-horizontal"
        format="horizontal"
        style={{ display: 'block', textAlign: 'center' }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{t('dashboard.quickStats')}</h2>
            <BarChart2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.levelProgress')}</p>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{stats?.exp || 0} XP</span>
                <span>{(stats?.level || 1) * 100} XP</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.exp || 0) / ((stats?.level || 1) * 100)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.wordsTyped')}</p>
              <p className="text-lg font-semibold text-gray-800">
                {stats?.words_typed || 0}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.wpm')}</p>
                <p className="text-lg font-semibold text-gray-800">
                  {stats?.wpm || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.accuracy')}</p>
                <p className="text-lg font-semibold text-gray-800">
                  {stats?.accuracy || 0}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('dashboard.recentActivity')}
            </h2>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <ul className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <li key={index} className="text-sm text-gray-600">
                  <span className="text-xs text-gray-400 mr-2">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                  {activity.translationKey
                    ? String(t(activity.translationKey, activity.translationParams || {}))
                    : activity.description}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">{t('dashboard.noRecentActivity')}</li>
            )}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">{t('dashboard.timeSpentTyping')}</p>
            <p className="text-lg font-semibold text-gray-800">
              {t('dashboard.minutes', { count: Math.floor((stats?.time_spent || 0) / 60) })}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Achievements
            </h2>
            <Award className="w-5 h-5 text-indigo-500" />
          </div>
          <ul className="space-y-3">
            {achievements.slice(0, 5).map((achievement, index) => (
              <li
                key={index}
                className="flex items-center text-sm text-gray-600"
              >
                <div className="flex-shrink-0 mr-2">
                  {renderAchievementIcon(achievement.icon)}
                </div>
                <div className="flex-1">
                  <span
                    className={
                      achievement.unlocked
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-400'
                    }
                  >
                    {achievement.name}
                  </span>
                  <span className="text-xs block text-gray-500">
                    {achievement.description}
                  </span>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    achievement.unlocked ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                ></div>
              </li>
            ))}
          </ul>
          {achievements.length > 5 && (
            <p className="mt-4 text-sm text-gray-500">
              + {achievements.length - 5} more achievements to unlock
            </p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('dashboard.typingSpeedProgress')}
          </h2>
          <div className="h-48 flex items-end space-x-2">
            {typingProgress.map((day, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div
                  className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors"
                  style={{ height: `${day.wpm * heightScale}px` }}
                ></div>
                <div className="opacity-0 group-hover:opacity-100 absolute bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-16 transition-opacity">
                  {day.date}: {day.wpm} WPM
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {day.date.split('-')[2]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{typingProgress[0]?.date}</span>
            <span>{typingProgress[typingProgress.length - 1]?.date}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('dashboard.topLeaderboard')}
          </h2>
          {topPlayers.length > 0 ? (
            <ul className="space-y-3">
              {topPlayers.map((player, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-5 text-center font-medium text-gray-500">
                      {index + 1}
                    </span>
                    <span className="ml-3 font-medium text-gray-800">
                      {player.username}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-indigo-600">
                      {t('dashboard.level', { level: player.level })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('dashboard.words', { count: player.words_typed })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {t('dashboard.noPlayers')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('dashboard.beFirst')}
              </p>
            </div>
          )}
          <Link
            to="/dashboard/leaderboard"
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 inline-block"
          >
            {t('dashboard.viewFullLeaderboard')}
          </Link>
        </motion.div>
      </div>

      {/* Add vertical advertisement in the sidebar */}
      <div className="hidden lg:block fixed right-4 top-24 w-[300px]">
        <Advertisement
          slot="dashboard-vertical"
          format="vertical"
          style={{ display: 'block', width: '300px', height: '600px' }}
        />
      </div>
    </motion.div>
  );
}