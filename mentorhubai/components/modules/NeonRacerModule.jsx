import React, { useState, useEffect, useCallback, useRef } from 'react';

const LANE_POSITIONS = [30, 50, 70]; // Percentages
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 60;
const ENEMY_SIZE = 60;
const INITIAL_SPEED = 4.5;
const SPEED_INCREMENT = 0.001;
const SPAWN_RATE = 0.025;

export default function RacingGame() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerLane, setPlayerLane] = useState(1);
  const [enemies, setEnemies] = useState([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [roadOffset, setRoadOffset] = useState(0);
  const [particles, setParticles] = useState([]);
  const [boostActive, setBoostActive] = useState(false);
  const [boostCharges, setBoostCharges] = useState(3);
  const [lives, setLives] = useState(10);
  const [invulnerable, setInvulnerable] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const gameLoopRef = useRef(null);
  const keysPressed = useRef({});

  // Move player left/right
  const moveLeft = useCallback(() => {
    if (gameState === 'playing' && playerLane > 0) {
      setPlayerLane(prev => prev - 1);
    }
  }, [gameState, playerLane]);

  const moveRight = useCallback(() => {
    if (gameState === 'playing' && playerLane < 2) {
      setPlayerLane(prev => prev + 1);
    }
  }, [gameState, playerLane]);

  // Activate boost
  const activateBoost = useCallback(() => {
    if (gameState === 'playing' && boostCharges > 0 && !boostActive) {
      setBoostActive(true);
      setBoostCharges(prev => prev - 1);
      
      // Boost lasts 2 seconds
      setTimeout(() => {
        setBoostActive(false);
      }, 2000);
    }
  }, [gameState, boostCharges, boostActive]);

  // Shoot bullet
  const shoot = useCallback(() => {
    if (gameState === 'playing') {
      const playerX = (LANE_POSITIONS[playerLane] / 100) * GAME_WIDTH;
      setBullets(prev => [...prev, {
        id: Date.now(),
        x: playerX,
        y: (68 / 100) * GAME_HEIGHT,
        lane: playerLane
      }]);
    }
  }, [gameState, playerLane]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      
      if (gameState === 'playing') {
        if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')) {
          moveLeft();
        }
        if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')) {
          moveRight();
        }
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          activateBoost();
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          shoot();
        }
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, moveLeft, moveRight, activateBoost, shoot]);

  // Touch/Swipe controls
  const touchStartX = useRef(0);
  
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 30) { // Minimum swipe distance
      if (diff > 0) {
        moveLeft();
      } else {
        moveRight();
      }
    }
  };

  // Direct lane tap control
  const handleLaneTap = (e) => {
    if (gameState !== 'playing') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX || (e.touches && e.touches[0].clientX);
    const relativeX = ((clickX - rect.left) / rect.width) * 100;
    
    // Determine which lane was tapped
    let targetLane;
    if (relativeX < 33) {
      targetLane = 0; // Left lane
    } else if (relativeX < 67) {
      targetLane = 1; // Middle lane
    } else {
      targetLane = 2; // Right lane
    }
    
    setPlayerLane(targetLane);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayerLane(1);
    setEnemies([]);
    setSpeed(INITIAL_SPEED);
    setRoadOffset(0);
    setParticles([]);
    setBoostCharges(3);
    setBoostActive(false);
    setLives(10);
    setInvulnerable(false);
    setBullets([]);
    setEnemyBullets([]);
  };

  const createExplosion = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1
      });
    }
    setParticles(newParticles);
  };

  const checkCollision = useCallback(() => {
    if (boostActive || invulnerable) return false;
    const playerY = 68;
    for (let enemy of enemies) {
      if (enemy.lane === playerLane) {
        const enemyY = (enemy.y / GAME_HEIGHT) * 100;
        if (Math.abs(enemyY - playerY) < 8) {
          return true;
        }
      }
    }
    return false;
  }, [playerLane, enemies, boostActive, invulnerable]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      // Update road animation
      setRoadOffset(prev => (prev + speed * 2) % 100);

      // Update speed
      setSpeed(prev => prev + SPEED_INCREMENT);

      // Update score
      setScore(prev => {
        const newScore = prev + 1;
        // Give extra boost charge every 600 points
        if (newScore % 600 === 0 && newScore > 0) {
          setBoostCharges(prevCharges => Math.min(prevCharges + 1, 5)); // Max 5 charges
        }
        return newScore;
      });

      // Spawn enemies with intelligent system
      if (Math.random() < SPAWN_RATE) {
        // Check which lanes have recent enemies (dangerous zone)
        const dangerZone = 150; // pixels from top
        const occupiedLanes = new Set();
        
        enemies.forEach(enemy => {
          if (enemy.y < dangerZone) {
            occupiedLanes.add(enemy.lane);
          }
        });
        
        // Always keep at least one lane free
        const availableLanes = [0, 1, 2].filter(lane => !occupiedLanes.has(lane));
        
        if (availableLanes.length > 0) {
          // If there are free lanes, randomly pick from them or occupied ones
          // but prioritize keeping diversity
          const allPossibleLanes = availableLanes.length === 3 
            ? [0, 1, 2] // All lanes free, spawn anywhere
            : occupiedLanes.size === 2 
              ? availableLanes // Keep the last lane free
              : [0, 1, 2]; // Some lanes occupied but not critical
          
          const lane = allPossibleLanes[Math.floor(Math.random() * allPossibleLanes.length)];
          
          setEnemies(prev => [...prev, {
            id: Date.now(),
            lane,
            y: -ENEMY_SIZE
          }]);
        }
      }

      // Update enemies
      setEnemies(prev => {
        const updated = prev
          .map(enemy => ({ ...enemy, y: enemy.y + speed }))
          .filter(enemy => enemy.y < GAME_HEIGHT + ENEMY_SIZE);
        return updated;
      });

      // Update bullets
      setBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - 10 }))
        .filter(bullet => bullet.y > -20)
      );

      // Enemy shooting - each enemy has a small chance to shoot each frame
      setEnemies(prevEnemies => {
        prevEnemies.forEach(enemy => {
          if (enemy.y > 0 && Math.random() < 0.006) {
            setEnemyBullets(prev => [...prev, {
              id: Date.now() + Math.random(),
              x: (LANE_POSITIONS[enemy.lane] / 100) * GAME_WIDTH,
              y: enemy.y + ENEMY_SIZE,
              lane: enemy.lane
            }]);
          }
        });
        return prevEnemies;
      });

      // Update enemy bullets - move downward
      setEnemyBullets(prev => prev
        .map(b => ({ ...b, y: b.y + 12 }))
        .filter(b => b.y < GAME_HEIGHT + 20)
      );

      // Check enemy bullet hitting player
      setEnemyBullets(prev => {
        const playerX = (LANE_POSITIONS[playerLane] / 100) * GAME_WIDTH;
        const playerY = (68 / 100) * GAME_HEIGHT;
        return prev.filter(bullet => {
          const hit = bullet.lane === playerLane &&
            Math.abs(bullet.y - playerY) < 30 &&
            !boostActive && !invulnerable;
          if (hit) {
            setLives(prevLives => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
                setScore(prev => { if (prev > highScore) setHighScore(prev); return prev; });
              } else {
                setInvulnerable(true);
                setTimeout(() => setInvulnerable(false), 1500);
              }
              return newLives;
            });
            createExplosion(bullet.x, bullet.y);
          }
          return !hit;
        });
      });

      // Check bullet-enemy collisions
      setBullets(prevBullets => {
        const remainingBullets = [];
        const bulletsToRemove = new Set();
        
        prevBullets.forEach(bullet => {
          let hit = false;
          setEnemies(prevEnemies => {
            return prevEnemies.filter(enemy => {
              const bulletLane = bullet.lane;
              const enemyLane = enemy.lane;
              const bulletY = bullet.y;
              const enemyY = enemy.y;
              
              if (bulletLane === enemyLane && Math.abs(bulletY - enemyY) < 50) {
                hit = true;
                // Add score for killing enemy
                setScore(prev => prev + 100);
                return false; // Remove enemy
              }
              return true;
            });
          });
          
          if (!hit) {
            remainingBullets.push(bullet);
          }
        });
        
        return remainingBullets;
      });

      // Update particles
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.02
        }))
        .filter(p => p.life > 0)
      );

      // Check collision
      if (checkCollision()) {
        const playerX = (LANE_POSITIONS[playerLane] / 100) * GAME_WIDTH;
        const playerY = (68 / 100) * GAME_HEIGHT;
        createExplosion(playerX, playerY);
        
        // Lose a life
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            // Game over
            setGameState('gameOver');
            if (score > highScore) {
              setHighScore(score);
            }
          } else {
            // Still have lives, become invulnerable temporarily
            setInvulnerable(true);
            setTimeout(() => {
              setInvulnerable(false);
            }, 1500); // 1.5 seconds of invulnerability
          }
          return newLives;
        });
      }
    }, 16); // ~60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, speed, checkCollision, playerLane, score, highScore]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0015 0%, #1a0a2e 50%, #16213e 100%)',
      fontFamily: '"Press Start 2P", monospace',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
      paddingBottom: '100px'
    }}>
      {/* Animated background stars */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent)',
        backgroundSize: '200px 200px',
        opacity: 0.3,
        animation: 'twinkle 3s infinite'
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #00ffff); }
          50% { filter: drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 40px #00ffff); }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .neon-button {
          background: linear-gradient(45deg, #ff00ff, #00ffff);
          border: none;
          color: white;
          padding: 15px 30px;
          font-family: 'Press Start 2P', monospace;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.5);
          text-transform: uppercase;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .neon-button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.8);
        }

        .neon-button:active {
          transform: scale(0.95);
        }

        .neon-text {
          color: #fff;
          text-shadow: 
            0 0 10px #ff00ff,
            0 0 20px #ff00ff,
            0 0 30px #ff00ff,
            0 0 40px #00ffff,
            0 0 70px #00ffff;
          animation: glow 2s infinite;
        }

        @media (max-width: 500px) {
          .neon-text {
            font-size: 24px !important;
          }
          .neon-button {
            font-size: 10px;
            padding: 12px 24px;
          }
        }
      `}</style>

      {gameState === 'menu' && (
        <div style={{
          textAlign: 'center',
          zIndex: 10,
          animation: 'slideDown 0.5s ease-out'
        }}>
          <h1 className="neon-text" style={{
            fontSize: '36px',
            marginBottom: '20px',
            letterSpacing: '3px'
          }}>
            NEON RACER
          </h1>
          <p style={{
            color: '#00ffff',
            fontSize: '12px',
            marginBottom: '30px',
            textShadow: '0 0 10px #00ffff',
            lineHeight: '1.6'
          }}>
            PC: Use ← → ou A D<br/>
            BOOST: Espaço ou botão ⚡<br/>
            Celular: Toque na faixa desejada<br/>
            ou use os botões
          </p>
          {highScore > 0 && (
            <p style={{
              color: '#ffff00',
              fontSize: '14px',
              marginBottom: '20px',
              textShadow: '0 0 10px #ffff00'
            }}>
              HIGH SCORE: {highScore}
            </p>
          )}
          <button className="neon-button" onClick={startGame}>
            INICIAR
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div style={{
          textAlign: 'center',
          zIndex: 10,
          animation: 'pulse 0.5s ease-out'
        }}>
          <h1 className="neon-text" style={{
            fontSize: '32px',
            marginBottom: '20px',
            color: '#ff0000'
          }}>
            GAME OVER!
          </h1>
          <p style={{
            color: '#ffff00',
            fontSize: '18px',
            marginBottom: '10px',
            textShadow: '0 0 10px #ffff00'
          }}>
            SCORE: {score}
          </p>
          {score === highScore && score > 0 && (
            <p style={{
              color: '#00ff00',
              fontSize: '12px',
              marginBottom: '20px',
              textShadow: '0 0 10px #00ff00'
            }}>
              ★ NOVO RECORDE! ★
            </p>
          )}
          <button className="neon-button" onClick={startGame}>
            JOGAR NOVAMENTE
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: `${GAME_WIDTH}px`,
          height: '100%',
          maxHeight: `${GAME_HEIGHT}px`,
          minHeight: '400px',
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0520 100%)',
          overflow: 'hidden',
          border: '4px solid',
          borderImage: 'linear-gradient(45deg, #ff00ff, #00ffff) 1',
          boxShadow: '0 0 40px rgba(255, 0, 255, 0.5), 0 0 80px rgba(0, 255, 255, 0.3)',
          borderRadius: '10px',
          cursor: 'pointer',
          flex: 1
        }}
        onClick={handleLaneTap}
        >
          {/* Score display */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: '#00ffff',
            fontSize: '16px',
            zIndex: 10,
            textShadow: '0 0 10px #00ffff',
            fontFamily: '"Press Start 2P", monospace',
            pointerEvents: 'none'
          }}>
            {score}
          </div>

          {/* Lives display */}
          <div style={{
            position: 'absolute',
            top: '50px',
            left: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            maxWidth: '100px',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{
                width: '15px',
                height: '15px',
                background: i < lives 
                  ? 'linear-gradient(135deg, #ff00ff, #ff0080)' 
                  : 'rgba(255, 255, 255, 0.2)',
                border: '2px solid ' + (i < lives ? '#ff00ff' : '#666'),
                borderRadius: '3px',
                boxShadow: i < lives ? '0 0 8px #ff00ff' : 'none',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>

          {/* Boost charges display */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '5px',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: i < boostCharges 
                  ? 'linear-gradient(135deg, #ffff00, #ffaa00)' 
                  : 'rgba(255, 255, 255, 0.2)',
                border: '2px solid ' + (i < boostCharges ? '#ffff00' : '#666'),
                boxShadow: i < boostCharges ? '0 0 10px #ffff00' : 'none',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>

          {/* Boost active indicator */}
          {boostActive && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#ffff00',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 0 20px #ffff00, 0 0 40px #ffff00',
              animation: 'pulse 0.5s infinite',
              zIndex: 5,
              pointerEvents: 'none'
            }}>
              BOOST!
            </div>
          )}

          {/* Road lanes */}
          {[0, 1, 2].map(lane => (
            <div key={lane} style={{
              position: 'absolute',
              left: `${LANE_POSITIONS[lane]}%`,
              top: 0,
              width: '2px',
              height: '100%',
              background: 'repeating-linear-gradient(to bottom, #00ffff 0px, #00ffff 40px, transparent 40px, transparent 80px)',
              transform: `translateY(${roadOffset}%)`,
              opacity: 0.3
            }} />
          ))}

          {/* Player car */}
          <div style={{
            position: 'absolute',
            left: `${LANE_POSITIONS[playerLane]}%`,
            top: '68%',
            transform: 'translate(-50%, -50%)',
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            transition: 'left 0.15s ease-out',
            filter: boostActive ? 'drop-shadow(0 0 30px #ffff00) drop-shadow(0 0 50px #ffaa00)' : 'none',
            opacity: invulnerable ? 0.5 : 1,
            animation: invulnerable ? 'blink 0.2s infinite' : 'none',
            zIndex: 5
          }}>
            {/* Boost aura effect */}
            {boostActive && (
              <div style={{
                position: 'absolute',
                inset: '-20px',
                background: 'radial-gradient(circle, rgba(255, 255, 0, 0.4), transparent)',
                borderRadius: '50%',
                animation: 'pulse 0.3s infinite'
              }} />
            )}
            
            <div style={{
              width: '100%',
              height: '100%',
              background: boostActive 
                ? 'linear-gradient(180deg, #ffff00 0%, #ffaa00 100%)'
                : 'linear-gradient(180deg, #ff00ff 0%, #ff0080 100%)',
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              boxShadow: boostActive
                ? '0 0 30px #ffff00, inset 0 0 15px rgba(255, 255, 255, 0.5)'
                : '0 0 20px #ff00ff, inset 0 0 10px rgba(255, 255, 255, 0.3)',
              border: '2px solid #fff',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
              transition: 'all 0.3s'
            }}>
              {/* Car details */}
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30%',
                height: '30%',
                background: boostActive ? '#fff' : '#00ffff',
                borderRadius: '50%',
                boxShadow: boostActive ? '0 0 20px #fff' : '0 0 10px #00ffff',
                transition: 'all 0.3s'
              }} />
            </div>
          </div>

          {/* Enemy cars */}
          {enemies.map(enemy => (
            <div key={enemy.id} style={{
              position: 'absolute',
              left: `${LANE_POSITIONS[enemy.lane]}%`,
              top: enemy.y,
              transform: 'translate(-50%, 0)',
              width: ENEMY_SIZE,
              height: ENEMY_SIZE
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, #00ff00 0%, #00cc00 100%)',
                clipPath: 'polygon(50% 100%, 100% 0%, 0% 0%)',
                boxShadow: '0 0 20px #00ff00, inset 0 0 10px rgba(255, 255, 255, 0.3)',
                border: '2px solid #fff',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))'
              }}>
                {/* Enemy car details */}
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '30%',
                  height: '30%',
                  background: '#ffff00',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #ffff00'
                }} />
              </div>
            </div>
          ))}

          {/* Player Bullets */}
          {bullets.map(bullet => (
            <div key={bullet.id} style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: '6px',
              height: '20px',
              background: 'linear-gradient(180deg, #ffff00, #ff00ff)',
              borderRadius: '3px',
              boxShadow: '0 0 10px #ffff00',
              transform: 'translateX(-50%)',
              zIndex: 6
            }} />
          ))}

          {/* Enemy Bullets */}
          {enemyBullets.map(bullet => (
            <div key={bullet.id} style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: '6px',
              height: '20px',
              background: 'linear-gradient(180deg, #ff4400, #ff0000)',
              borderRadius: '3px',
              boxShadow: '0 0 10px #ff4400',
              transform: 'translateX(-50%)',
              zIndex: 6
            }} />
          ))}

          {/* Explosion particles */}
          {particles.map(particle => (
            <div key={particle.id} style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: '8px',
              height: '8px',
              background: `rgba(255, ${Math.floor(particle.life * 255)}, 0, ${particle.life})`,
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(255, 100, 0, 0.8)',
              pointerEvents: 'none'
            }} />
          ))}
        </div>
      )}

      {/* CONTROL BUTTONS - ALWAYS VISIBLE FOR TESTING */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 20px',
        zIndex: 10000,
        pointerEvents: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        {/* Left button */}
        <div
          onTouchStart={(e) => { e.preventDefault(); moveLeft(); }}
          onClick={moveLeft}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255, 0, 255, 0.8)',
            border: '2px solid #fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0 0 15px rgba(255, 0, 255, 0.6)'
          }}
        >
          ◄
        </div>

        {/* Shoot button */}
        <div
          onTouchStart={(e) => { e.preventDefault(); shoot(); }}
          onClick={shoot}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            border: '2px solid #fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0 0 15px rgba(255, 0, 0, 0.6)'
          }}
        >
          🔥
        </div>

        {/* Boost button */}
        <div
          onTouchStart={(e) => { e.preventDefault(); activateBoost(); }}
          onClick={activateBoost}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: boostCharges > 0 ? 'rgba(255, 255, 0, 0.8)' : 'rgba(100, 100, 100, 0.6)',
            border: '2px solid #fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#000',
            fontWeight: 'bold',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: boostCharges > 0 ? '0 0 15px rgba(255, 255, 0, 0.6)' : 'none',
            opacity: boostCharges > 0 ? 1 : 0.5
          }}
        >
          ⚡{boostCharges}
        </div>

        {/* Right button */}
        <div
          onTouchStart={(e) => { e.preventDefault(); moveRight(); }}
          onClick={moveRight}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(0, 255, 255, 0.8)',
            border: '2px solid #fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)'
          }}
        >
          ►
        </div>
      </div>
    </div>
  );
}
