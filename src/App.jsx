import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import DemoToolbar from './components/common/DemoToolbar';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import RoleSelection from './components/onboarding/RoleSelection';
import RoleRegistration from './components/onboarding/RoleRegistration';
import PatientLayout from './components/patient/PatientLayout';
import FamilyLayout from './components/family/FamilyLayout';
import CaregiverLayout from './components/caregiver/CaregiverLayout';
import GameResult from './components/games/GameResult';

// Game Components
import MemoryTwin from './components/games/MemoryTwin';
import MemoryBasket from './components/games/MemoryBasket';
import FamilyMemory from './components/games/FamilyMemory';
import PictureMemory from './components/games/PictureMemory';
import PatternMemory from './components/games/PatternMemory';
import DailyRoutine from './components/games/DailyRoutine';
import OddOneOut from './components/games/OddOneOut';

import { ALL_GAMES, getRecommendedGames } from './utils/adaptiveEngine';

function MainApp() {
  const {
    isOnboarded,
    setIsOnboarded,
    userRole,
    setUserRole,
    viewMode,
    activeTab,
    setActiveTab,
    activeGame,
    setActiveGame,
    gameResult,
    setGameResult,
    recordGameCompletion,
    patientData,
    setPatientData,
    gameSessionCycle
  } = useApp();

  // Onboarding Step State (0: Choose Role "Who are you?", 1: Role-specific Registration)
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(userRole || 'patient');

  // Always reset to Step 0 ("Who are you?") whenever onboarding state is reset
  useEffect(() => {
    if (!isOnboarded) {
      setOnboardingStep(0);
    }
  }, [isOnboarded]);

  // Daily Exercise Playlist State (for running 3 games back-to-back)
  const [exercisePlaylist, setExercisePlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  // Handlers for starting games
  const handleStartTodayExercise = () => {
    const recommended = getRecommendedGames(
      gameSessionCycle,
      patientData.family || [],
      patientData.cognitiveStats?.history || []
    );
    // Shuffle the top 3 personalized recommendations so repeated clicks pick different AI games
    const shuffled = [...recommended].sort(() => 0.5 - Math.random());
    
    // Launch 3 games (as originally requested) for the daily brain exercise
    setExercisePlaylist(shuffled.slice(0, 3));
    setPlaylistIndex(0);
    setActiveGame(shuffled[0]);
    setGameResult(null);
  };

  const handleOpenSingleGame = (game) => {
    setExercisePlaylist([game]);
    setPlaylistIndex(0);
    setActiveGame(game);
    setGameResult(null);
  };

  const handleGameComplete = (resultData) => {
    const enrichedStats = recordGameCompletion(resultData);
    setGameResult({ ...resultData, ...enrichedStats });
  };

  const handleNextGameInSet = () => {
    if (playlistIndex < exercisePlaylist.length - 1) {
      const nextIdx = playlistIndex + 1;
      setPlaylistIndex(nextIdx);
      setActiveGame(exercisePlaylist[nextIdx]);
      setGameResult(null);
    } else {
      // Completed all
      handleExitGame();
    }
  };

  const handleExitGame = () => {
    setActiveGame(null);
    setGameResult(null);
    setExercisePlaylist([]);
    setPlaylistIndex(0);
  };

  // Reshuffle counter to trigger fresh generation and remount components
  const [reshuffleKey, setReshuffleKey] = useState(0);

  const handleReshufflePlayAgain = (gameId) => {
    setReshuffleKey(k => k + 1);
    // Generate new cards/questions immediately
    const game = ALL_GAMES.find(g => g.id === gameId);
    if (game) {
      handleOpenSingleGame(game);
    }
  };

  // Render current active game component
  const renderGameComponent = () => {
    if (gameResult) {
      const hasNext = playlistIndex < exercisePlaylist.length - 1;
      return (
        <GameResult
          gameName={gameResult.gameName || activeGame.name}
          accuracy={gameResult.accuracy}
          timeTaken={gameResult.timeTaken}
          difficulty={gameResult.difficulty}
          levelNotice={gameResult.levelNotice}
          changeDirection={gameResult.changeDirection}
          onReshufflePlayAgain={handleReshufflePlayAgain}
          onPlayAgain={() => {
            setGameResult(null);
          }}
          onNextGame={hasNext ? handleNextGameInSet : null}
          onStartNewAIRecommendedGame={!hasNext ? handleStartTodayExercise : null}
          onReturnHome={handleExitGame}
          onExploreGames={() => {
            handleExitGame();
            setTimeout(() => setActiveTab('games'), 50);
          }}
        />
      );
    }

    if (!activeGame) return null;

    const gameKey = `${activeGame.id}-${reshuffleKey}`;
    const initialLevel = patientData.cognitiveStats?.gameLevels?.[activeGame.id] || patientData.cognitiveStats?.currentLevel || 1;

    switch (activeGame.id) {
      case 'memory-twin':
        return <MemoryTwin key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      case 'memory-basket':
        return <MemoryBasket key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      case 'family-memory':
        return <FamilyMemory key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      case 'picture-memory':
        return <PictureMemory key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      case 'pattern-memory':
        return <PatternMemory key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      case 'daily-routine':
        return <DailyRoutine key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      case 'odd-one-out':
        return <OddOneOut key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
      default:
        return <MemoryTwin key={gameKey} reshuffleKey={reshuffleKey} initialLevel={initialLevel} onComplete={handleGameComplete} onExit={handleExitGame} />;
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#E2E8F0] flex flex-col items-center justify-start antialiased text-[#172B4D]">
      {/* SIH Presentation Demo Toolbar */}
      <DemoToolbar />

      {/* Main Viewport Container */}
      <div className={`w-full transition-all duration-300 flex-1 flex justify-center items-start ${
        viewMode === 'mobile-frame' ? 'py-4 sm:py-8 px-2 sm:px-4' : 'p-0'
      }`}>
        <div className={`w-full bg-white shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col ${
          viewMode === 'mobile-frame'
            ? 'max-w-[430px] min-h-[820px] max-h-[920px] h-[90vh] rounded-[44px] border-[10px] border-[#0F172A] ring-1 ring-slate-900/10'
            : 'max-w-6xl min-h-screen rounded-none'
        }`}>
          {/* Mobile Speaker & Camera Notch (when in mobile frame) */}
          {viewMode === 'mobile-frame' && (
            <div className="w-full h-5 bg-[#0F172A] flex items-center justify-center -mt-0.5 z-40">
              <div className="w-20 h-3.5 bg-black rounded-full flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-900" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>
            </div>
          )}

          {/* Screen Routing */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!isOnboarded ? (
              // Onboarding flow: Step 0 is "Who are you?", Step 1 is Role Registration
              onboardingStep === 0 ? (
                <RoleSelection
                  onSelectRole={(role) => {
                    setSelectedRole(role);
                    setUserRole(role);
                    setOnboardingStep(1);
                  }}
                />
              ) : (
                <RoleRegistration
                  role={selectedRole}
                  onBack={() => setOnboardingStep(0)}
                  onComplete={() => setIsOnboarded(true)}
                />
              )
            ) : activeGame ? (
              // Active Game or Game Result
              renderGameComponent()
            ) : userRole === 'patient' ? (
              // Patient Interface
              <PatientLayout
                onStartExercise={handleStartTodayExercise}
                onOpenGame={handleOpenSingleGame}
              />
            ) : userRole === 'family' ? (
              // Family Member Interface
              <FamilyLayout />
            ) : (
              // Caregiver Interface
              <CaregiverLayout />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
