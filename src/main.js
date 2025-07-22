import './style.css'
import { Game } from './game/Game.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="game-container">
    <div class="game-header">
      <h1 class="game-title">SNAKE</h1>
      <div class="game-stats">
        <div class="stat">
          <span class="stat-label">Score</span>
          <span class="stat-value" id="score">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">High Score</span>
          <span class="stat-value" id="highScore">0</span>
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
          </div>
        </div>
      </div>
    </div>
  </div>
`

const canvas = document.getElementById('gameCanvas')
const game = new Game(canvas)

// Start the game
game.start()