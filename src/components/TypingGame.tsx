import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Keyboard, User, Trophy, LogOut, Award, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

// Word list for the basic mode (can be overridden by translations)
const defaultWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
];

// Default sentences (fallbacks if translations are missing)
const defaultSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Two wrongs don't make a right.",
  "Practice makes perfect."
];

// Default paragraphs (fallbacks)
const defaultParagraphs = [
  "The sun was setting behind the mountains, casting long shadows across the valley. A gentle breeze rustled the leaves of the trees, creating a soothing melody.",
  "The old bookstore on the corner was a treasure trove of forgotten stories. Dusty shelves lined the walls, filled with volumes of all sizes and colors."
];

// Game mode types
type GameMode = 'words' | 'sentences' | 'paragraphs';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export function TypingGame() {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const [gameMode, setGameMode] = useState<GameMode>('words');
  const [currentText, setCurrentText] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showAchievement, setShowAchievement] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [errors, setErrors] = useState(0);
  // error state kept if needed; otherwise unused so remove to satisfy linter
  
  // Use refs to avoid unnecessary re-renders
  const totalAttemptsRef = useRef(0);
  const correctAttemptsRef = useRef(0);
  const timeSpentRef = useRef(0);
  const statsRef = useRef<{
    level: number;
    exp: number;
    words_typed: number;
    time_spent: number;
    wpm: number;
    accuracy: number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const expRef = useRef(0);
  const wpmRef = useRef(0);
  const accuracyRef = useRef(100);
  const previousAchievementsRef = useRef<Set<string>>(new Set());
  const startTimeRef = useRef<number | null>(null);
  const errorsRef = useRef(0);

  // Function to get new text based on game mode
  const getNewText = useCallback(() => {
    // Pull lists from translations if available; otherwise use defaults
    const wordsList = (t('game.wordsList', { returnObjects: true }) as string[]) || defaultWords;
    const sentencesList = (t('game.sentences', { returnObjects: true }) as string[]) || defaultSentences;
    const paragraphsList = (t('game.paragraphs', { returnObjects: true }) as string[]) || defaultParagraphs;

    let text = '';
    switch (gameMode) {
      case 'words': {
        const randomIndex = Math.floor(Math.random() * wordsList.length);
        text = wordsList[randomIndex];
        break;
      }
      case 'sentences': {
        const sentenceIndex = Math.floor(Math.random() * sentencesList.length);
        text = sentencesList[sentenceIndex];
        break;
      }
      case 'paragraphs': {
        const paragraphIndex = Math.floor(Math.random() * paragraphsList.length);
        text = paragraphsList[paragraphIndex];
        break;
      }
    }
    setCurrentText(text);
    setCurrentPosition(0);
    setInput('');
    setGameCompleted(false);
  }, [gameMode]);

  // Start a new game
  const startGame = useCallback(() => {
    getNewText();
    setGameStarted(true);
    setGameCompleted(false);
    startTimeRef.current = Date.now();
    errorsRef.current = 0;
    setErrors(0);
  }, [getNewText]);

  // Calculate and update WPM
  const updateWPM = useCallback(() => {
    if (scoreRef.current > 0) {
      const minutes = timeSpentRef.current / 60;
      const newWpm = Math.round(scoreRef.current / minutes);
      wpmRef.current = newWpm;
      setWpm(newWpm);
    }
  }, []);

  // Calculate and update accuracy
  const updateAccuracy = useCallback(() => {
    if (totalAttemptsRef.current > 0) {
      const newAccuracy = Math.round((correctAttemptsRef.current / totalAttemptsRef.current) * 100);
      accuracyRef.current = newAccuracy;
      setAccuracy(newAccuracy);
    }
  }, []);

  // Check for newly unlocked achievements
  const checkNewAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Get all user's achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (userAchievementsError) {
        console.error("Error fetching user achievements:", userAchievementsError);
        return;
      }

      // Get the set of current achievement IDs
  const currentAchievementIds = new Set<string>((userAchievements as any[] | undefined)?.map(a => String(a.achievement_id)) || []);
      
      // Find new achievements (not in previous set)
      const newAchievementIds = Array.from(currentAchievementIds).filter(
        id => !previousAchievementsRef.current.has(id)
      );

      // If there are new achievements, fetch their details and show notification
      if (newAchievementIds.length > 0) {
        const { data: achievementDetails, error: detailsError } = await supabase
          .from('achievements')
          .select('*')
          .in('id', newAchievementIds as string[]);

        if (detailsError) {
          console.error("Error fetching achievement details:", detailsError);
          return;
        }

        if (achievementDetails && achievementDetails.length > 0) {
          // Show the most recent achievement (cast fields safely)
          const first = achievementDetails[0] as any;
          setUnlockedAchievement({
            id: String(first.id),
            name: String(first.name ?? ''),
            description: String(first.description ?? ''),
            icon: String(first.icon ?? '')
          });
          setShowAchievement(true);
          
          // Hide after 5 seconds
          setTimeout(() => {
            setShowAchievement(false);
          }, 5000);
        }
      }

      // Update the previous achievements ref
      previousAchievementsRef.current = currentAchievementIds;
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  }, [user]);

  // Update user stats in Supabase - debounced to avoid too many requests
  const updateUserStatsDebounced = useCallback(async () => {
    if (!user) return;

    try {
      const updateData = {
        level: levelRef.current,
        exp: expRef.current,
        words_typed: scoreRef.current,
        time_spent: timeSpentRef.current,
        wpm: wpmRef.current,
        accuracy: accuracyRef.current,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('user_stats')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Error updating statistics:", updateError);
      } else {
        // Check for new achievements after updating stats
        await checkNewAchievements();
      }
    } catch (error) {
      console.error("Error updating Supabase:", error);
    }
  }, [user, checkNewAchievements]);

  // Debounce function to limit Supabase updates
  const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedUpdate = useCallback(() => {
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current);
    }
    
    debouncedUpdateRef.current = setTimeout(() => {
      updateUserStatsDebounced();
    }, 2000); // Update database every 2 seconds at most
  }, [updateUserStatsDebounced]);

  // Fetch user stats when the page loads
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error getting user:", authError);
        setIsLoading(false);
        return;
      }

      try {
        const { data: existingStats, error: fetchError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user_stats:', fetchError);
          setIsLoading(false);
          return;
        }

  if (!existingStats) {
          // Create initial stats
          const { data: newStats, error: insertError } = await supabase
            .from('user_stats')
            .insert({
              user_id: user.id,
              level: 1,
              exp: 0,
              words_typed: 0,
              time_spent: 0,
              wpm: 0,
              accuracy: 100
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating initial stats:', insertError);
            throw insertError;
          }

          const ns: any = newStats;
          statsRef.current = {
            level: ns.level || 1,
            exp: ns.exp || 0,
            words_typed: ns.words_typed || 0,
            time_spent: ns.time_spent || 0,
            wpm: ns.wpm || 0,
            accuracy: ns.accuracy || 100
          };
          setLevel(1);
          setExp(0);
          setScore(0);
          setTimeSpent(0);
          setWpm(0);
          setAccuracy(100);
          
          // Set ref values
          levelRef.current = 1;
          expRef.current = 0;
          scoreRef.current = 0;
          timeSpentRef.current = 0;
          wpmRef.current = 0;
          accuracyRef.current = 100;
        } else {
          const es: any = existingStats;
          statsRef.current = {
            level: es.level || 1,
            exp: es.exp || 0,
            words_typed: es.words_typed || 0,
            time_spent: es.time_spent || 0,
            wpm: es.wpm || 0,
            accuracy: es.accuracy || 100
          };

          // Set state values
          setLevel(es.level || 1);
          setExp(es.exp || 0);
          setScore(es.words_typed || 0);
          setTimeSpent(es.time_spent || 0);
          setWpm(es.wpm || 0);
          setAccuracy(es.accuracy || 100);

          // Set ref values
          levelRef.current = es.level || 1;
          expRef.current = es.exp || 0;
          scoreRef.current = es.words_typed || 0;
          timeSpentRef.current = es.time_spent || 0;
          wpmRef.current = es.wpm || 0;
          accuracyRef.current = es.accuracy || 100;
        }

        // Fetch user's current achievements
        const { data: userAchievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);

        if (achievementsError) {
          console.error('Error fetching user achievements:', achievementsError);
        } else {
          // Store current achievements to compare later (ensure strings)
          previousAchievementsRef.current = new Set<string>((userAchievements as any[] | undefined)?.map(a => String(a.achievement_id)) || []);
        }
      } catch (error: any) {
        console.error("Error fetching data from Supabase:", error);
        // keep console error; do not set local UI error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
    getNewText();

    return () => {
      // Clean up timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (debouncedUpdateRef.current) clearTimeout(debouncedUpdateRef.current);
    };
  }, [getNewText]);

  // Start timer after loading data
  useEffect(() => {
    if (!isLoading && !timerRef.current) {
      timerRef.current = setInterval(() => {
        if (gameStarted && !gameCompleted) {
          timeSpentRef.current += 1;
          setTimeSpent(timeSpentRef.current);
          updateWPM();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading, updateWPM, gameStarted, gameCompleted]);

  // Process user input for words mode
  const handleWordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Track total attempts for accuracy calculation
    if (value.length > input.length) {
      totalAttemptsRef.current += 1;
    }

    if (value === currentText) {
      // Correct word typed
      correctAttemptsRef.current += 1;
      updateAccuracy();
      
      // Update score
      scoreRef.current += 1;
      setScore(scoreRef.current);
      
      // Update experience and level
      const expGained = 10;
      expRef.current += expGained;
      
      if (expRef.current >= levelRef.current * 100) {
        levelRef.current += 1;
        expRef.current -= (levelRef.current - 1) * 100;
      }
      
      setLevel(levelRef.current);
      setExp(expRef.current);
      
      // Update stats in database (debounced)
      debouncedUpdate();
      
      // Reset input and get new word
      setInput('');
      getNewText();
    }
  };

  // Process user input for sentences and paragraphs mode
  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted) {
      startGame();
      return;
    }

    const value = e.target.value;
    setInput(value);

    // Check if the current input matches the expected text so far
    const expectedText = currentText.substring(0, value.length);
    
    if (value === expectedText) {
      // Correct typing so far
      setCurrentPosition(value.length);
      
      // Check if completed the entire text
      if (value.length === currentText.length) {
        // Calculate words typed (approximate by counting spaces + 1)
        const wordsInText = currentText.split(' ').length;
        
        // Update score
        scoreRef.current += wordsInText;
        setScore(scoreRef.current);
        
        // Calculate time taken in minutes
        const endTime = Date.now();
        const timeElapsed = (endTime - (startTimeRef.current || endTime)) / 1000 / 60;
        
        // Calculate WPM for this session
        const sessionWpm = Math.round(wordsInText / timeElapsed);
        
        // Calculate accuracy for this session
        const totalChars = currentText.length;
        const accuracyPercentage = Math.round(((totalChars - errorsRef.current) / totalChars) * 100);
        
        // Update overall WPM and accuracy (weighted average)
        const oldWpm = wpmRef.current;
        wpmRef.current = Math.round((oldWpm + sessionWpm) / 2);
        setWpm(wpmRef.current);
        
        const oldAccuracy = accuracyRef.current;
        accuracyRef.current = Math.round((oldAccuracy + accuracyPercentage) / 2);
        setAccuracy(accuracyRef.current);
        
        // Update experience and level
        const expGained = Math.round(wordsInText * 5 * (accuracyPercentage / 100));
        expRef.current += expGained;
        
        if (expRef.current >= levelRef.current * 100) {
          levelRef.current += 1;
          expRef.current -= (levelRef.current - 1) * 100;
        }
        
        setLevel(levelRef.current);
        setExp(expRef.current);
        
        // Update stats in database
        debouncedUpdate();
        
        // Mark game as completed
        setGameCompleted(true);
      }
    } else {
      // Error in typing
      errorsRef.current += 1;
      setErrors(errorsRef.current);
    }
  };

  // Handle input based on game mode
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameMode === 'words') {
      handleWordInput(e);
    } else {
      handleTextInput(e);
    }
  };

  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    setGameStarted(false);
    setGameCompleted(false);
    setInput('');
    getNewText();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header/Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center px-4">
                <Keyboard className="w-6 h-6 text-indigo-600 mr-2" />
                <span className="font-bold text-indigo-600">{t('common.appName')}</span>
              </Link>
              <Link
                to="/play"
                className="inline-flex items-center px-4 text-indigo-600 border-b-2 border-indigo-500"
              >
                <Keyboard className="w-5 h-5 mr-2" />
                {t('common.play')}
              </Link>
              <Link
                to="/dashboard/profile"
                className="inline-flex items-center px-4 text-gray-600 hover:text-indigo-600 hover:border-indigo-500"
              >
                <User className="w-5 h-5 mr-2" />
                {t('common.profile')}
              </Link>
              <Link
                to="/dashboard/leaderboard"
                className="inline-flex items-center px-4 text-gray-600 hover:text-indigo-600 hover:border-indigo-500"
              >
                <Trophy className="w-5 h-5 mr-2" />
                {t('common.leaderboard')}
              </Link>
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

      <div className="max-w-4xl mx-auto p-8">
        {/* Game mode selector */}
        <div className="mb-8 bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Layers className="w-5 h-5 text-indigo-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">{t('game.modes.title')}</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => changeGameMode('words')}
              className={`px-4 py-2 rounded-lg ${
                gameMode === 'words' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('game.modes.words')}
            </button>
            <button
              onClick={() => changeGameMode('sentences')}
              className={`px-4 py-2 rounded-lg ${
                gameMode === 'sentences' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('game.modes.sentences')}
            </button>
            <button
              onClick={() => changeGameMode('paragraphs')}
              className={`px-4 py-2 rounded-lg ${
                gameMode === 'paragraphs' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('game.modes.paragraphs')}
            </button>
          </div>
        </div>

        {/* Game stats dashboard */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-gray-500">{t('game.stats.level')}</h3>
            <p className="text-2xl font-bold text-indigo-600">{level}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-gray-500">{t('game.stats.words')}</h3>
            <p className="text-2xl font-bold text-indigo-600">{score}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-gray-500">{t('game.stats.wpm')}</h3>
            <p className="text-2xl font-bold text-indigo-600">{wpm}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-gray-500">{t('game.stats.accuracy')}</h3>
            <p className="text-2xl font-bold text-indigo-600">{accuracy}%</p>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{t('game.stats.level')} {level}</span>
            <span className="text-sm text-gray-600">{exp} / {level * 100} XP</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${(exp / (level * 100)) * 100}%` }}
            />
          </div>
        </div>

        {/* Current text display */}
        <div className="text-2xl font-medium text-center mb-8 p-8 bg-white rounded-xl shadow-md">
          {gameMode === 'words' ? (
            <div>{currentText}</div>
          ) : (
            <div className="text-left whitespace-pre-wrap">
              {currentText.split('').map((char, index) => (
                <span 
                  key={index} 
                  className={`${
                    index < currentPosition 
                      ? 'text-green-600' 
                      : index === currentPosition 
                        ? 'bg-indigo-200' 
                        : 'text-gray-800'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Input field */}
        {gameCompleted ? (
          <div className="text-center">
            <p className="text-xl text-green-600 mb-4">{t('game.actions.greatJob')}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t('game.actions.startNew')}
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={input}
              onChange={handleInput}
              className="w-full text-xl p-6 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-colors"
              placeholder={gameStarted ? t('game.actions.typeHere') : t('game.actions.startTyping')}
              autoFocus
            />
            {gameMode !== 'words' && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('game.stats.progress')}: {Math.round((currentPosition / currentText.length) * 100)}%
                </span>
                <span className="text-gray-600">
                  {t('game.stats.errors')}: {errors}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timer */}
        <div className="mt-6 text-center text-gray-600">
          {t('game.stats.time')}: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Achievement notification */}
      {showAchievement && unlockedAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg border-l-4 border-indigo-500 flex items-center max-w-md"
        >
          <Award className="w-10 h-10 text-indigo-500 mr-4" />
          <div>
            <h3 className="font-bold text-gray-900">{t('game.achievement.unlocked')}</h3>
            <p className="text-indigo-600 font-medium">{unlockedAchievement.name}</p>
            <p className="text-sm text-gray-600">{unlockedAchievement.description}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}