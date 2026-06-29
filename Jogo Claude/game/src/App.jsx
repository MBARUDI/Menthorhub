import React, { useState, useEffect, useCallback, useRef } from 'react';

const LANE_POSITIONS = [20, 50, 80]; // Em porcentagem, espalhados na tela
const ENEMY_SIZE = 60;
const PLAYER_SIZE = 60;
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

  // Janela responsiva
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const GAME_WIDTH = dimensions.width;
  const GAME_HEIGHT = dimensions.height;
  const PLAYER_Y = GAME_HEIGHT * 0.75; // O jogador fica 75% abaixo na tela

  // Movimento
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

  // Boost
  const activateBoost = useCallback(() => {
    if (gameState === 'playing' && boostCharges > 0 && !boostActive) {
      setBoostActive(true);
      setBoostCharges(prev => prev - 1);
      setTimeout(() => setBoostActive(false), 2000);
    }
  }, [gameState, boostCharges, boostActive]);

  // Atirar
  const shoot = useCallback(() => {
    if (gameState === 'playing') {
      setBullets(prev => [...prev, {
        id: Date.now(),
        lane: playerLane,
        y: PLAYER_Y
      }]);
    }
  }, [gameState, playerLane, PLAYER_Y]);

  // Controles teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      if (gameState === 'playing') {
        if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')) moveLeft();
        if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')) moveRight();
        if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); activateBoost(); }
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); shoot(); }
      }
    };
    const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, moveLeft, moveRight, activateBoost, shoot]);

  // Controles touch
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 30) {
      if (diff > 0) moveLeft();
      else moveRight();
    }
  };

  const handleLaneTap = (e) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX || (e.touches && e.touches[0].clientX);
    const relativeX = ((clickX - rect.left) / rect.width) * 100;
    if (relativeX < 33) setPlayerLane(0);
    else if (relativeX < 67) setPlayerLane(1);
    else setPlayerLane(2);
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
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1,
        color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const checkCollision = useCallback(() => {
    if (boostActive || invulnerable) return false;
    for (let enemy of enemies) {
      if (enemy.lane === playerLane) {
        if (Math.abs(enemy.y - PLAYER_Y) < (PLAYER_SIZE + ENEMY_SIZE) * 0.4) {
          return true;
        }
      }
    }
    return false;
  }, [playerLane, enemies, boostActive, invulnerable, PLAYER_Y]);

  // Loop do Jogo
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setRoadOffset(prev => (prev + speed * 2) % 100);
      setSpeed(prev => prev + SPEED_INCREMENT);
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore % 600 === 0 && newScore > 0) {
          setBoostCharges(prevCharges => Math.min(prevCharges + 1, 5));
        }
        return newScore;
      });

      // Spawn Inimigos
      if (Math.random() < SPAWN_RATE) {
        const dangerZone = GAME_HEIGHT * 0.3; 
        const occupiedLanes = new Set();
        enemies.forEach(enemy => { if (enemy.y < dangerZone) occupiedLanes.add(enemy.lane); });
        
        const availableLanes = [0, 1, 2].filter(lane => !occupiedLanes.has(lane));
        if (availableLanes.length > 0) {
          const allPossibleLanes = availableLanes.length === 3 ? [0, 1, 2] : (occupiedLanes.size === 2 ? availableLanes : [0, 1, 2]);
          const lane = allPossibleLanes[Math.floor(Math.random() * allPossibleLanes.length)];
          setEnemies(prev => [...prev, { id: Date.now(), lane, y: -ENEMY_SIZE }]);
        }
      }

      setEnemies(prev => prev.map(enemy => ({ ...enemy, y: enemy.y + speed })).filter(enemy => enemy.y < GAME_HEIGHT + ENEMY_SIZE));
      setBullets(prev => prev.map(b => ({ ...b, y: b.y - 15 })).filter(b => b.y > -20));

      // Tiro dos Inimigos
      setEnemies(prevEnemies => {
        prevEnemies.forEach(enemy => {
          // Aumentado a chance de tiro para ficar mais dinâmico
          if (enemy.y > 0 && enemy.y < GAME_HEIGHT * 0.6 && Math.random() < 0.006) {
            setEnemyBullets(prev => [...prev, { id: Date.now() + Math.random(), lane: enemy.lane, y: enemy.y + ENEMY_SIZE }]);
          }
        });
        return prevEnemies;
      });

      // Movimento do tiro inimigo
      setEnemyBullets(prev => prev.map(b => ({ ...b, y: b.y + 10 })).filter(b => b.y < GAME_HEIGHT + 20));

      // Colisão do tiro inimigo com jogador
      setEnemyBullets(prev => {
        return prev.filter(bullet => {
          const hit = bullet.lane === playerLane && Math.abs(bullet.y - PLAYER_Y) < PLAYER_SIZE/2 && !boostActive && !invulnerable;
          if (hit) {
            setLives(prevLives => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
                setScore(s => { if (s > highScore) setHighScore(s); return s; });
              } else {
                setInvulnerable(true);
                setTimeout(() => setInvulnerable(false), 1500);
              }
              return newLives;
            });
            const pX = (LANE_POSITIONS[playerLane] / 100) * GAME_WIDTH;
            createExplosion(pX, PLAYER_Y);
          }
          return !hit;
        });
      });

      // Colisão do tiro do jogador com o inimigo
      setBullets(prevBullets => {
        const remainingBullets = [];
        prevBullets.forEach(bullet => {
          let hit = false;
          setEnemies(prevEnemies => prevEnemies.filter(enemy => {
            if (bullet.lane === enemy.lane && Math.abs(bullet.y - enemy.y) < ENEMY_SIZE/2) {
              hit = true;
              setScore(s => s + 100);
              const eX = (LANE_POSITIONS[enemy.lane] / 100) * GAME_WIDTH;
              createExplosion(eX, enemy.y);
              return false;
            }
            return true;
          }));
          if (!hit) remainingBullets.push(bullet);
        });
        return remainingBullets;
      });

      // Partículas de Explosão
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.03 })).filter(p => p.life > 0));

      // Colisão entre carros
      if (checkCollision()) {
        const pX = (LANE_POSITIONS[playerLane] / 100) * GAME_WIDTH;
        createExplosion(pX, PLAYER_Y);
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
            setScore(s => { if (s > highScore) setHighScore(s); return s; });
          } else {
            setInvulnerable(true);
            setTimeout(() => setInvulnerable(false), 1500);
          }
          return newLives;
        });
      }
    }, 16);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, speed, checkCollision, playerLane, score, highScore, GAME_WIDTH, GAME_HEIGHT, PLAYER_Y]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0015 0%, #1a0a2e 50%, #16213e 100%)',
      fontFamily: '"Press Start 2P", monospace',
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent)',
        backgroundSize: '200px 200px', opacity: 0.3, animation: 'twinkle 3s infinite'
      }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #0a0015; }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.5; } }
        @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #00ffff); } 50% { filter: drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 40px #00ffff); } }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .neon-button { background: linear-gradient(45deg, #ff00ff, #00ffff); border: none; color: white; padding: 15px 30px; font-family: 'Press Start 2P', monospace; font-size: 14px; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.5); text-transform: uppercase; user-select: none; }
        .neon-button:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.8); }
        .neon-button:active { transform: scale(0.95); }
        .neon-text { color: #fff; text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #00ffff, 0 0 70px #00ffff; animation: glow 2s infinite; }
        .neon-car { filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #ff00ff); }
        .neon-enemy { filter: drop-shadow(0 0 10px #00ff00) drop-shadow(0 0 20px #00ff00); }
        @media (max-width: 500px) { .neon-text { font-size: 24px !important; } .neon-button { font-size: 10px; padding: 12px 24px; } }
      `}</style>

      {gameState === 'menu' && (
        <div style={{ textAlign: 'center', zIndex: 10, animation: 'slideDown 0.5s ease-out' }}>
          <h1 className="neon-text" style={{ fontSize: '36px', marginBottom: '20px', letterSpacing: '3px' }}>NEON RACER</h1>
          <p style={{ color: '#00ffff', fontSize: '12px', marginBottom: '30px', textShadow: '0 0 10px #00ffff', lineHeight: '1.6' }}>
            PC: Use ← → ou A D<br/>BOOST: Espaço<br/>ATIRAR: S<br/>Celular: Toque na faixa desejada
          </p>
          {highScore > 0 && <p style={{ color: '#ffff00', fontSize: '14px', marginBottom: '20px', textShadow: '0 0 10px #ffff00' }}>HIGH SCORE: {highScore}</p>}
          <button className="neon-button" onClick={startGame}>INICIAR</button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div style={{ textAlign: 'center', zIndex: 10, animation: 'pulse 0.5s ease-out' }}>
          <h1 className="neon-text" style={{ fontSize: '32px', marginBottom: '20px', color: '#ff0000' }}>GAME OVER!</h1>
          <p style={{ color: '#ffff00', fontSize: '18px', marginBottom: '10px', textShadow: '0 0 10px #ffff00' }}>SCORE: {score}</p>
          {score === highScore && score > 0 && <p style={{ color: '#00ff00', fontSize: '12px', marginBottom: '20px', textShadow: '0 0 10px #00ff00' }}>★ NOVO RECORDE! ★</p>}
          <button className="neon-button" onClick={startGame}>JOGAR NOVAMENTE</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          background: 'linear-gradient(180deg, rgba(26,10,46,0.8) 0%, rgba(15,5,32,0.8) 100%)',
          overflow: 'hidden', cursor: 'pointer'
        }} onClick={handleLaneTap} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          
          <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#00ffff', fontSize: '16px', zIndex: 10, textShadow: '0 0 10px #00ffff' }}>{score}</div>

          <div style={{ position: 'absolute', top: '50px', left: '20px', display: 'flex', flexWrap: 'wrap', gap: '5px', maxWidth: '100px', zIndex: 10 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{
                width: '15px', height: '15px',
                background: i < lives ? 'linear-gradient(135deg, #ff00ff, #ff0080)' : 'rgba(255, 255, 255, 0.2)',
                border: '2px solid ' + (i < lives ? '#ff00ff' : '#666'), borderRadius: '3px',
                boxShadow: i < lives ? '0 0 8px #ff00ff' : 'none', transition: 'all 0.3s'
              }} />
            ))}
          </div>

          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '5px', zIndex: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: i < boostCharges ? 'linear-gradient(135deg, #ffff00, #ffaa00)' : 'rgba(255, 255, 255, 0.2)',
                border: '2px solid ' + (i < boostCharges ? '#ffff00' : '#666'),
                boxShadow: i < boostCharges ? '0 0 10px #ffff00' : 'none', transition: 'all 0.3s'
              }} />
            ))}
          </div>

          {boostActive && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ffff00', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 20px #ffff00, 0 0 40px #ffff00', animation: 'pulse 0.5s infinite', zIndex: 5, pointerEvents: 'none' }}>BOOST!</div>
          )}

          {/* Faixas da pista */}
          {[0, 1, 2].map(lane => (
            <div key={lane} style={{
              position: 'absolute', left: `${LANE_POSITIONS[lane]}%`, top: 0, width: '4px', height: '100%',
              background: 'repeating-linear-gradient(to bottom, #00ffff 0px, #00ffff 40px, transparent 40px, transparent 80px)',
              transform: `translateY(${roadOffset}%) translateX(-50%)`, opacity: 0.3, zIndex: 1
            }} />
          ))}

          {/* Carro do Jogador */}
          <div style={{
            position: 'absolute', left: `${LANE_POSITIONS[playerLane]}%`, top: `${PLAYER_Y}px`,
            transform: 'translate(-50%, -50%)', width: PLAYER_SIZE, height: PLAYER_SIZE * 1.5,
            transition: 'left 0.15s ease-out', zIndex: 5,
            opacity: invulnerable ? 0.5 : 1, animation: invulnerable ? 'blink 0.2s infinite' : 'none'
          }}>
            <svg viewBox="0 0 100 150" width="100%" height="100%" className={boostActive ? "" : "neon-car"}>
              {boostActive && <circle cx="50" cy="75" r="70" fill="url(#boostGrad)" opacity="0.5" animation="pulse 0.3s infinite" />}
              <defs>
                <radialGradient id="boostGrad"><stop offset="0%" stopColor="#ffff00" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={boostActive ? "#ffff00" : "#ff00ff"}/><stop offset="100%" stopColor={boostActive ? "#ffaa00" : "#990099"}/></linearGradient>
              </defs>
              <path d="M20,130 L20,50 L40,20 L60,20 L80,50 L80,130 L60,140 L40,140 Z" fill="url(#carBody)" stroke="#fff" strokeWidth="3" />
              <path d="M30,60 L70,60 L60,35 L40,35 Z" fill="#00ffff" opacity="0.8" />
              <rect x="35" y="110" width="30" height="20" fill="#00ffff" opacity="0.6" />
              <path d="M15,100 L20,100 L20,120 L15,120 Z" fill="#fff" />
              <path d="M80,100 L85,100 L85,120 L80,120 Z" fill="#fff" />
              {boostActive && <polygon points="30,140 70,140 50,160" fill="#ffff00" />}
            </svg>
          </div>

          {/* Carros Inimigos */}
          {enemies.map(enemy => (
            <div key={enemy.id} style={{
              position: 'absolute', left: `${LANE_POSITIONS[enemy.lane]}%`, top: enemy.y,
              transform: 'translate(-50%, -50%)', width: ENEMY_SIZE, height: ENEMY_SIZE * 1.5, zIndex: 4
            }}>
              <svg viewBox="0 0 100 150" width="100%" height="100%" className="neon-enemy" style={{transform: 'rotate(180deg)'}}>
                <defs>
                  <linearGradient id="enemyBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00ff00"/><stop offset="100%" stopColor="#008800"/></linearGradient>
                </defs>
                <path d="M20,130 L20,50 L40,20 L60,20 L80,50 L80,130 L60,140 L40,140 Z" fill="url(#enemyBody)" stroke="#fff" strokeWidth="3" />
                <path d="M30,60 L70,60 L60,35 L40,35 Z" fill="#ff0000" opacity="0.8" />
                <rect x="35" y="110" width="30" height="20" fill="#ff0000" opacity="0.6" />
              </svg>
            </div>
          ))}

          {/* Tiros do Jogador */}
          {bullets.map(bullet => (
            <div key={bullet.id} style={{
              position: 'absolute', left: `${LANE_POSITIONS[bullet.lane]}%`, top: bullet.y,
              width: '6px', height: '25px', background: '#ffff00', borderRadius: '3px',
              boxShadow: '0 0 15px #ffff00, 0 0 30px #ff00ff', transform: 'translateX(-50%)', zIndex: 6
            }} />
          ))}

          {/* Tiros Inimigos */}
          {enemyBullets.map(bullet => (
            <div key={bullet.id} style={{
              position: 'absolute', left: `${LANE_POSITIONS[bullet.lane]}%`, top: bullet.y,
              width: '8px', height: '25px', background: '#ff0000', borderRadius: '4px',
              boxShadow: '0 0 15px #ff0000, 0 0 30px #ffaa00', transform: 'translateX(-50%)', zIndex: 6
            }} />
          ))}

          {/* Partículas */}
          {particles.map(particle => (
            <div key={particle.id} style={{
              position: 'absolute', left: particle.x, top: particle.y,
              width: '6px', height: '6px', background: particle.color, borderRadius: '50%',
              boxShadow: `0 0 10px ${particle.color}`, opacity: particle.life, zIndex: 7
            }} />
          ))}

          {/* Controles de Tela (Mobile) */}
          <div style={{
            position: 'absolute', bottom: '30px', left: '0', width: '100%', 
            display: 'flex', justifyContent: 'space-between', padding: '0 20px', 
            boxSizing: 'border-box', zIndex: 20, pointerEvents: 'none'
          }}>
            {/* Esquerda: Setas */}
            <div style={{ display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
              <button onClick={(e) => { e.stopPropagation(); moveLeft(); }} style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 255, 255, 0.1)',
                border: '2px solid #00ffff', color: '#00ffff', fontSize: '24px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}>←</button>
              <button onClick={(e) => { e.stopPropagation(); moveRight(); }} style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 255, 255, 0.1)',
                border: '2px solid #00ffff', color: '#00ffff', fontSize: '24px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}>→</button>
            </div>
            {/* Direita: Ações */}
            <div style={{ display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
              <button onClick={(e) => { e.stopPropagation(); shoot(); }} style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 0, 255, 0.1)',
                border: '2px solid #ff00ff', color: '#ff00ff', fontSize: '24px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                boxShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
              }}>🔫</button>
              <button onClick={(e) => { e.stopPropagation(); activateBoost(); }} style={{
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 0, 0.1)',
                border: '2px solid #ffff00', color: '#ffff00', fontSize: '24px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
              }}>⚡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
