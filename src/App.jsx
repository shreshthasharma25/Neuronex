import React, { useState, useEffect } from 'react';

import { AppProvider, useApp } from './context/AppContext';

import { supabase } from './services/supabaseClient';
import AuthScreen from './auth/AuthScreen';

import DemoToolbar from './components/common/DemoToolbar';
import LogoutButton from './components/common/LogoutButton';

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

import { getRecommendedGames } from './utils/adaptiveEngine';


function MainApp() {

  // =========================================================
  // SUPABASE AUTHENTICATION
  // =========================================================

  // undefined = still checking
  // null = not logged in
  // object = logged in

  const [session, setSession] = useState(undefined);

  useEffect(() => {

    // Get existing Supabase session
    async function loadSession() {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
    }

    loadSession();

    // Listen for login/logout/session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup listener
    return () => {
      subscription.unsubscribe();
    };

  }, []);


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setSession(null);
  };


  // =========================================================
  // EXISTING NEURONEX APP CONTEXT
  // =========================================================

  const {
    isOnboarded,
    setIsOnboarded,
    userRole,
    setUserRole,
    viewMode,
    activeGame,
    setActiveGame,
    gameResult,
    setGameResult,
    recordGameCompletion,
    patientData,
    gameSessionCycle
  } = useApp();


  // =========================================================
  // ONBOARDING STATE
  // =========================================================

  // 0 = Role Selection
  // 1 = Role Registration

  const [onboardingStep, setOnboardingStep] = useState(0);

  const [selectedRole, setSelectedRole] = useState(
    userRole || 'patient'
  );


  // Reset onboarding to role selection
  // whenever onboarding is reset

  useEffect(() => {

    if (!isOnboarded) {
      setOnboardingStep(0);
    }

  }, [isOnboarded]);


  // =========================================================
  // GAME PLAYLIST STATE
  // =========================================================

  const [exercisePlaylist, setExercisePlaylist] = useState([]);

  const [playlistIndex, setPlaylistIndex] = useState(0);


  // =========================================================
  // START TODAY'S EXERCISE
  // =========================================================

  const handleStartTodayExercise = () => {

    const recommended = getRecommendedGames(
      gameSessionCycle ||
        patientData.brainExercise.dayCycle ||
        1,

      patientData.family || [],

      patientData.cognitiveStats?.history || []
    );

    setExercisePlaylist(recommended);

    setPlaylistIndex(0);

    setActiveGame(recommended[0]);

    setGameResult(null);
  };


  // =========================================================
  // OPEN A SINGLE GAME
  // =========================================================

  const handleOpenSingleGame = (game) => {

    setExercisePlaylist([game]);

    setPlaylistIndex(0);

    setActiveGame(game);

    setGameResult(null);
  };


  // =========================================================
  // GAME COMPLETION
  // =========================================================

  const handleGameComplete = (resultData) => {

    recordGameCompletion(resultData);

    setGameResult(resultData);
  };


  // =========================================================
  // NEXT GAME
  // =========================================================

  const handleNextGameInSet = () => {

    if (
      playlistIndex <
      exercisePlaylist.length - 1
    ) {

      const nextIdx = playlistIndex + 1;

      setPlaylistIndex(nextIdx);

      setActiveGame(
        exercisePlaylist[nextIdx]
      );

      setGameResult(null);

    } else {

      // Completed all games

      setActiveGame(null);

      setGameResult(null);
    }
  };


  // =========================================================
  // EXIT GAME
  // =========================================================

  const handleExitGame = () => {

    setActiveGame(null);

    setGameResult(null);
  };


  // =========================================================
  // RESHUFFLE
  // =========================================================

  const [reshuffleKey, setReshuffleKey] =
    useState(0);


  const handleReshufflePlayAgain = () => {

    setReshuffleKey(
      (key) => key + 1
    );

    setGameResult(null);
  };


  // =========================================================
  // RENDER ACTIVE GAME
  // =========================================================

  const renderGameComponent = () => {

    // -------------------------------------------------------
    // GAME RESULT
    // -------------------------------------------------------

    if (gameResult) {

      const hasNext =
        playlistIndex <
        exercisePlaylist.length - 1;

      return (
        <GameResult
          gameName={gameResult.gameName}
          accuracy={gameResult.accuracy}
          timeTaken={gameResult.timeTaken}
          difficulty={gameResult.difficulty}

          onReshufflePlayAgain={
            handleReshufflePlayAgain
          }

          onPlayAgain={() => {
            setGameResult(null);
          }}

          onNextGame={
            hasNext
              ? handleNextGameInSet
              : null
          }

          onReturnHome={
            handleExitGame
          }
        />
      );
    }


    // -------------------------------------------------------
    // NO ACTIVE GAME
    // -------------------------------------------------------

    if (!activeGame) {
      return null;
    }


    // -------------------------------------------------------
    // GAME KEY
    // -------------------------------------------------------

    const gameKey =
      `${activeGame.id}-${reshuffleKey}`;


    // -------------------------------------------------------
    // GAME SELECTION
    // -------------------------------------------------------

    switch (activeGame.id) {

      case 'memory-twin':

        return (
          <MemoryTwin
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      case 'memory-basket':

        return (
          <MemoryBasket
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      case 'family-memory':

        return (
          <FamilyMemory
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      case 'picture-memory':

        return (
          <PictureMemory
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      case 'pattern-memory':

        return (
          <PatternMemory
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      case 'daily-routine':

        return (
          <DailyRoutine
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      case 'odd-one-out':

        return (
          <OddOneOut
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );


      // -----------------------------------------------------
      // DEFAULT GAME
      // -----------------------------------------------------

      default:

        return (
          <MemoryTwin
            key={gameKey}
            reshuffleKey={reshuffleKey}
            onComplete={handleGameComplete}
            onExit={handleExitGame}
          />
        );
    }
  };


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="
      min-h-screen
      w-full
      overflow-x-hidden
      bg-[#E2E8F0]
      flex
      flex-col
      items-center
      justify-start
      antialiased
      text-[#172B4D]
    ">

      {/* =====================================================
          DEMO TOOLBAR
      ===================================================== */}

      <DemoToolbar />

      {/* LOGOUT BUTTON */}
      {session && <LogoutButton />}


      {/* =====================================================
          MAIN VIEWPORT
      ===================================================== */}

      <div
        className={`
          w-full
          transition-all
          duration-300
          flex-1
          flex
          justify-center
          items-start

          ${
            viewMode === 'mobile-frame'
              ? 'py-4 sm:py-8 px-2 sm:px-4'
              : 'p-0'
          }
        `}
      >

        <div
          className={`
            w-full
            bg-white
            shadow-2xl
            transition-all
            duration-300
            relative
            overflow-hidden
            flex
            flex-col

            ${
              viewMode === 'mobile-frame'
                ? `
                  max-w-[430px]
                  min-h-[820px]
                  max-h-[920px]
                  h-[90vh]
                  rounded-[44px]
                  border-[10px]
                  border-[#0F172A]
                  ring-1
                  ring-slate-900/10
                `
                : `
                  max-w-6xl
                  min-h-screen
                  rounded-none
                `
            }
          `}
        >


          {/* =================================================
              MOBILE NOTCH
          ================================================= */}

          {viewMode === 'mobile-frame' && (

            <div
              className="
                w-full
                h-5
                bg-[#0F172A]
                flex
                items-center
                justify-center
                -mt-0.5
                z-40
              "
            >

              <div
                className="
                  w-20
                  h-3.5
                  bg-black
                  rounded-full
                  flex
                  items-center
                  justify-center
                  gap-1.5
                "
              >

                <div
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-slate-900
                  "
                />

                <div
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-slate-800
                  "
                />

              </div>

            </div>
          )}


          {/* =================================================
              SCREEN ROUTING
          ================================================= */}

          <div
            className="
              flex-1
              overflow-hidden
              flex
              flex-col
            "
          >


            {/* =================================================
                1. CHECKING AUTHENTICATION
            ================================================= */}

            {session === undefined ? (

              <div
                className="
                  min-h-screen
                  flex
                  items-center
                  justify-center
                "
              >

                <p className="text-gray-500">
                  Loading Neuronex...
                </p>

              </div>

            ) : !session ? (


              /* =================================================
                 2. NOT LOGGED IN
              ================================================= */

              <AuthScreen />


            ) : !isOnboarded ? (


              /* =================================================
                 3. LOGGED IN BUT NOT ONBOARDED
              ================================================= */

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

                  onBack={() => {

                    setOnboardingStep(0);
                  }}

                  onComplete={() => {

                    setIsOnboarded(true);
                  }}
                />

              )


            ) : activeGame ? (


              /* =================================================
                 4. ACTIVE GAME
              ================================================= */

              renderGameComponent()


            ) : userRole === 'patient' ? (


              /* =================================================
                 5. PATIENT
              ================================================= */

              <PatientLayout
                onStartExercise={
                  handleStartTodayExercise
                }

                onOpenGame={
                  handleOpenSingleGame
                }
              />


            ) : userRole === 'family' ? (


              /* =================================================
                 6. FAMILY
              ================================================= */

              <FamilyLayout />


            ) : (


              /* =================================================
                 7. CAREGIVER
              ================================================= */

              <CaregiverLayout />

            )}

          </div>

        </div>

      </div>

    </div>
  );
}


// =============================================================
// APP ROOT
// =============================================================

export default function App() {

  return (

    <AppProvider>

      <MainApp />

    </AppProvider>
  );
}