import './style.css'
import { Game } from './game/Game.js'
import { MenuSystem } from './game/MenuSystem.js'
import { SoundManager } from './game/SoundManager.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="game-container">
    <div class="main-menu" id="mainMenu">
      <div class="menu-content">
        <h1 class="game-title">Serpentine</h1>
        <p class="game-subtitle">A Modern Classic</p>
        <div class="menu-buttons">
          <button class="menu-btn" id="playBtn">Play</button>
          <button class="menu-btn" id="settingsBtn">Settings</button>
          <button class="menu-btn" id="statsBtn">Statistics</button>
        </div>
      </div>
    </div>
    
    <div class="mode-selection-menu hidden" id="modeSelectionMenu">
      <div class="menu-content">
        <h2>Choose Game Mode</h2>
        <div class="mode-grid">
          <div class="mode-card" id="classicMode">
            <div class="mode-icon">🐍</div>
            <h3>Classic</h3>
            <p>Traditional Snake gameplay. Eat food, grow longer, avoid walls and yourself.</p>
          </div>
          <div class="mode-card" id="timedMode">
            <div class="mode-icon">⏱️</div>
            <h3>Timed Challenge</h3>
            <p>Race against time! Score as much as possible in 60 seconds.</p>
          </div>
          <div class="mode-card" id="obstacleMode">
            <div class="mode-icon">🧱</div>
            <h3>Obstacle Course</h3>
            <p>Navigate around obstacles while growing your snake. Extra challenge!</p>
          </div>
        </div>
        <button class="menu-btn secondary" id="backToMainFromModes">Back</button>
      </div>
    </div>
    
    <div class="settings-menu hidden" id="settingsMenu">
      <div class="menu-content">
        <h2>Settings</h2>
        <div class="setting-group">
          <label>Difficulty:</label>
          <select id="difficultySelect">
            <option value="easy">Easy</option>
            <option value="medium" selected>Medium</option>
            <option value="hard">Hard</option>
            <option value="insane">Insane</option>
          </select>
        </div>
        <div class="setting-group">
          <label>Board Size:</label>
          <select id="boardSizeSelect">
            <option value="small">Small (20x20)</option>
            <option value="medium" selected>Medium (24x24)</option>
            <option value="large">Large (30x30)</option>
          </select>
        </div>
        <div class="setting-group">
          <label>Theme:</label>
          <select id="themeSelect">
            <option value="neon" selected>Neon</option>
            <option value="retro">Retro</option>
            <option value="nature">Nature</option>
            <option value="space">Space</option>
          </select>
        </div>
        <div class="setting-group">
          <label>Sound:</label>
          <input type="checkbox" id="soundToggle" checked>
        </div>
        <div class="setting-group">
          <label>Wall Behavior:</label>
          <select id="wallBehaviorSelect">
            <option value="solid">Solid Walls (Modern)</option>
            <option value="wrap">Wrap Around (Classic)</option>
          </select>
        </div>
        <div class="controls-config">
          <h3>Controls</h3>
          <div class="control-mapping">
            <span>Up: <kbd id="upKey">ArrowUp</kbd></span>
            <span>Down: <kbd id="downKey">ArrowDown</kbd></span>
            <span>Left: <kbd id="leftKey">ArrowLeft</kbd></span>
            <span>Right: <kbd id="rightKey">ArrowRight</kbd></span>
          </div>
        </div>
        <button class="menu-btn" id="backToMenu">Back to Menu</button>
      </div>
    </div>
    
    <div class="stats-menu hidden" id="statsMenu">
      <div class="menu-content">
        <h2>Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number" id="totalGames">0</span>
            <span class="stat-label">Games Played</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="totalScore">0</span>
            <span class="stat-label">Total Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="avgScore">0</span>
            <span class="stat-label">Average Score</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="bestStreak">0</span>
            <span class="stat-label">Best Streak</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="totalTime">0m</span>
            <span class="stat-label">Time Played</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="foodEaten">0</span>
            <span class="stat-label">Food Eaten</span>
          </div>
        </div>
        <button class="menu-btn" id="resetStats">Reset Statistics</button>
        <button class="menu-btn" id="backToMenuFromStats">Back to Menu</button>
      </div>
    </div>
    
    <div class="game-header">
      <h1 class="game-title-small">Serpentine</h1>
      <div class="game-stats">
        <div class="stat">
          <span class="stat-label">Score</span>
          <span class="stat-value" id="score">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">High Score</span>
          <span class="stat-value" id="highScore">0</span>
        </div>
        <div class="stat" id="timerStat" style="display: none;">
          <span class="stat-label">Time</span>
          <span class="stat-value" id="timer">60</span>
        </div>
      </div>
    </div>
    
    <div class="game-area">
      <canvas id="gameCanvas" width="600" height="600"></canvas>
      <div class="game-overlay" id="gameOverlay">
        <div class="overlay-content">
          <h2 id="overlayTitle">GAME OVER</h2>
          <p id="overlayMessage">Press SPACE to restart</p>
          <div class="controls-hint">
            <p>Use ARROW KEYS or WASD to move</p>
            <p>Press P to pause</p>
            <p>Press ESC to return to menu</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`

// Initialize systems
const soundManager = new SoundManager()
const menuSystem = new MenuSystem()
let game = null

// Initialize menu system
menuSystem.init((gameMode, settings) => {
  const canvas = document.getElementById('gameCanvas')
  game = new Game(canvas, gameMode, settings, soundManager)
  game.start()
})