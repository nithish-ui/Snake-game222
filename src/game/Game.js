import { Snake } from './Snake.js'
import { Food } from './Food.js'
import { ParticleSystem } from './ParticleSystem.js'
import { GameState } from './GameState.js'
import { ObstacleManager } from './ObstacleManager.js'

export class Game {
  constructor(canvas, gameMode = 'classic', settings = {}, soundManager = null) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.gameMode = gameMode
    this.settings = settings
    this.soundManager = soundManager
    
    // Set board size based on settings
    this.setBoardSize()
    
    this.tilesX = this.boardWidth / this.tileSize
    this.tilesY = this.boardHeight / this.tileSize
    
    this.gameState = new GameState()
    this.snake = new Snake(5, 5, this.tileSize)
    this.food = new Food(this.tileSize, this.tilesX, this.tilesY)
    this.particleSystem = new ParticleSystem()
    this.obstacleManager = new ObstacleManager(this.tileSize, this.tilesX, this.tilesY)
    
    this.gameLoop = null
    this.lastTime = 0
    this.setGameSpeed()
    
    // Game mode specific properties
    this.timeLimit = gameMode === 'timed' ? 60 : null
    this.timeRemaining = this.timeLimit
    this.gameStartTime = null
    this.streak = 0
    this.foodEaten = 0
    
    this.setupEventListeners()
    this.loadHighScore()
    this.placeFood()
    this.setupGameMode()
  }

  setBoardSize() {
    const sizes = {
      small: { width: 500, height: 500, tileSize: 25 },
      medium: { width: 600, height: 600, tileSize: 25 },
      large: { width: 750, height: 750, tileSize: 25 }
    }
    
    const size = sizes[this.settings.boardSize] || sizes.medium
    this.canvas.width = size.width
    this.canvas.height = size.height
    this.boardWidth = size.width
    this.boardHeight = size.height
    this.tileSize = size.tileSize
  }

  setGameSpeed() {
    const speeds = {
      easy: 200,
      medium: 150,
      hard: 100,
      insane: 60
    }
    this.baseGameSpeed = speeds[this.settings.difficulty] || speeds.medium
    this.gameSpeed = this.baseGameSpeed
  }

  setupGameMode() {
    if (this.gameMode === 'obstacle') {
      this.obstacleManager.generateObstacles(Math.floor(this.tilesX * this.tilesY * 0.1))
    }
    
    if (this.gameMode === 'timed') {
      document.getElementById('timerStat').style.display = 'block'
      this.updateTimer()
    } else {
      document.getElementById('timerStat').style.display = 'none'
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (this.gameState.isGameOver()) {
        if (e.code === 'Space') {
          this.restart()
        }
        if (e.code === 'Escape') {
          this.returnToMenu()
        }
        return
      }

      if (this.gameState.isPaused()) {
        if (e.code === 'KeyP') {
          this.resume()
        }
        return
      }

      // Use custom controls from settings
      const controls = this.settings.controls || {
        up: 'ArrowUp',
        down: 'ArrowDown', 
        left: 'ArrowLeft',
        right: 'ArrowRight'
      }

      if (e.code === controls.up || e.code === 'KeyW') {
        this.snake.setDirection(0, -1)
      } else if (e.code === controls.down || e.code === 'KeyS') {
        this.snake.setDirection(0, 1)
      } else if (e.code === controls.left || e.code === 'KeyA') {
        this.snake.setDirection(-1, 0)
      } else if (e.code === controls.right || e.code === 'KeyD') {
        this.snake.setDirection(1, 0)
      } else if (e.code === 'KeyP') {
        this.pause()
      } else if (e.code === 'Escape') {
        this.returnToMenu()
      }
    })
  }

  returnToMenu() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
    
    // Save game statistics
    this.saveGameStats()
    
    // Show main menu
    const menuSystem = window.menuSystem || document.menuSystem
    if (menuSystem) {
      menuSystem.showMainMenu()
    }
  }

  saveGameStats() {
    const gameTime = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0
    const stats = {
      score: this.gameState.getScore(),
      streak: this.streak,
      time: gameTime,
      foodEaten: this.foodEaten
    }
    
    // Update global statistics
    const menuSystem = window.menuSystem || document.menuSystem
    if (menuSystem) {
      menuSystem.updateStatistics(stats)
    }
  }

  placeFood() {
    let validPosition = false
    let attempts = 0
    const maxAttempts = 100

    while (!validPosition && attempts < maxAttempts) {
      this.food.randomizePosition()
      validPosition = !this.snake.occupiesPosition(this.food.x, this.food.y) &&
                     !this.obstacleManager.hasObstacle(this.food.x, this.food.y)
      attempts++
    }

    // If we can't find a valid position, the game is essentially won
    if (attempts >= maxAttempts) {
      this.gameWon()
    }
  }

  start() {
    this.gameState.setState('playing')
    this.gameStartTime = Date.now()
    this.hideOverlay()
    this.gameLoop = requestAnimationFrame((time) => this.update(time))
  }

  pause() {
    this.gameState.setState('paused')
    this.showOverlay('PAUSED', 'Press P to resume')
    this.soundManager?.play('pause')
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
  }

  resume() {
    this.gameState.setState('playing')
    this.hideOverlay()
    this.gameLoop = requestAnimationFrame((time) => this.update(time))
  }

  restart() {
    this.snake.reset(5, 5)
    this.gameState.resetScore()
    this.gameState.setState('playing')
    this.timeRemaining = this.timeLimit
    this.gameStartTime = Date.now()
    this.streak = 0
    this.foodEaten = 0
    this.gameSpeed = this.baseGameSpeed
    this.placeFood()
    this.particleSystem.clear()
    this.hideOverlay()
    this.updateUI()
    this.gameLoop = requestAnimationFrame((time) => this.update(time))
  }

  gameOver() {
    this.gameState.setState('gameOver')
    this.saveHighScore()
    this.saveGameStats()
    this.soundManager?.play('gameOver')
    this.showOverlay('GAME OVER', 'Press SPACE to restart or ESC for menu')
    
    // Create explosion effect at snake head
    const head = this.snake.getHead()
    this.particleSystem.createExplosion(
      head.x * this.tileSize + this.tileSize / 2,
      head.y * this.tileSize + this.tileSize / 2,
      '#ff4444'
    )
    
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
  }

  gameWon() {
    this.gameState.setState('gameOver')
    this.saveHighScore()
    this.saveGameStats()
    this.soundManager?.play('levelUp')
    this.showOverlay('YOU WON!', 'Perfect Score! Press SPACE to restart or ESC for menu')
    
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
  }

  update(currentTime) {
    if (currentTime - this.lastTime >= this.gameSpeed) {
      // Handle timed mode
      if (this.gameMode === 'timed' && this.timeRemaining !== null) {
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000)
        this.timeRemaining = Math.max(0, this.timeLimit - elapsed)
        this.updateTimer()
        
        if (this.timeRemaining <= 0) {
          this.gameOver()
          return
        }
      }
      
      this.snake.move()
      
      // Check food collision
      const head = this.snake.getHead()
      if (head.x === this.food.x && head.y === this.food.y) {
        this.snake.grow()
        this.gameState.incrementScore()
        this.foodEaten++
        this.streak++
        this.updateUI()
        
        // Play sound
        this.soundManager?.play('eat')
        
        // Create particle effect
        this.particleSystem.createFoodEffect(
          this.food.x * this.tileSize + this.tileSize / 2,
          this.food.y * this.tileSize + this.tileSize / 2
        )
        
        this.placeFood()
        
        // Increase speed slightly (but not in easy mode)
        if (this.settings.difficulty !== 'easy') {
          this.gameSpeed = Math.max(this.baseGameSpeed * 0.5, this.gameSpeed - 2)
        }
        
        // Level up sound every 5 food items
        if (this.foodEaten % 5 === 0) {
          this.soundManager?.play('levelUp')
        }
      } else {
        this.streak = 0
      }
      
      // Check collisions
      if (this.checkCollisions()) {
        this.gameOver()
        return
      }
      
      this.lastTime = currentTime
    }
    
    this.particleSystem.update()
    this.render()
    
    if (this.gameState.isPlaying()) {
      this.gameLoop = requestAnimationFrame((time) => this.update(time))
    }
  }

  checkCollisions() {
    const head = this.snake.getHead()
    
    // Wall collision - fixed boundary check
    if (head.x < 0 || head.x >= this.tilesX || 
        head.y < 0 || head.y >= this.tilesY) {
      return true
    }
    
    // Obstacle collision (for obstacle mode)
    if (this.gameMode === 'obstacle' && this.obstacleManager.hasObstacle(head.x, head.y)) {
      return true
    }
    
    // Self collision - improved detection
    return this.snake.checkSelfCollision()
  }

  render() {
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, this.boardWidth, this.boardHeight)
    gradient.addColorStop(0, '#0a0a0a')
    gradient.addColorStop(1, '#1a1a1a')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.boardWidth, this.boardHeight)
    
    // Draw subtle grid
    this.drawGrid()
    
    // Draw obstacles (if obstacle mode)
    if (this.gameMode === 'obstacle') {
      this.obstacleManager.draw(this.ctx)
    }
    
    // Draw game objects
    this.food.draw(this.ctx)
    this.snake.draw(this.ctx)
    this.particleSystem.draw(this.ctx)
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    this.ctx.lineWidth = 1
    
    for (let i = 0; i <= this.tilesX; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(i * this.tileSize, 0)
      this.ctx.lineTo(i * this.tileSize, this.boardHeight)
      this.ctx.stroke()
    }
    
    for (let i = 0; i <= this.tilesY; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, i * this.tileSize)
      this.ctx.lineTo(this.boardWidth, i * this.tileSize)
      this.ctx.stroke()
    }
  }

  showOverlay(title, message) {
    const overlay = document.getElementById('gameOverlay')
    const titleEl = document.getElementById('overlayTitle')
    const messageEl = document.getElementById('overlayMessage')
    
    titleEl.textContent = title
    messageEl.textContent = message
    overlay.classList.add('show')
  }

  hideOverlay() {
    const overlay = document.getElementById('gameOverlay')
    overlay.classList.remove('show')
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameState.getScore()
    document.getElementById('highScore').textContent = this.gameState.getHighScore()
  }

  updateTimer() {
    if (this.timeRemaining !== null) {
      document.getElementById('timer').textContent = this.timeRemaining
    }
  }

  loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore')
    if (saved) {
      this.gameState.setHighScore(parseInt(saved))
    }
    this.updateUI()
  }

  saveHighScore() {
    const currentScore = this.gameState.getScore()
    if (currentScore > this.gameState.getHighScore()) {
      this.gameState.setHighScore(currentScore)
      localStorage.setItem('snakeHighScore', currentScore.toString())
      this.updateUI()
    }
  }
}
          this.snake.setDirection(0, -1)
          break
        case 'ArrowDown':
        case 'KeyS':
          this.snake.setDirection(0, 1)
          break
        case 'ArrowLeft':
        case 'KeyA':
          this.snake.setDirection(-1, 0)
          break
        case 'ArrowRight':
        case 'KeyD':
          this.snake.setDirection(1, 0)
          break
        case 'KeyP':
          this.pause()
          break
      }
    })
  }

  placeFood() {
    let validPosition = false
    let attempts = 0
    const maxAttempts = 100

    while (!validPosition && attempts < maxAttempts) {
      this.food.randomizePosition()
      validPosition = !this.snake.occupiesPosition(this.food.x, this.food.y)
      attempts++
    }

    // If we can't find a valid position, the game is essentially won
    if (attempts >= maxAttempts) {
      this.gameWon()
    }
  }

  start() {
    this.gameState.setState('playing')
    this.hideOverlay()
    this.gameLoop = requestAnimationFrame((time) => this.update(time))
  }

  pause() {
    this.gameState.setState('paused')
    this.showOverlay('PAUSED', 'Press P to resume')
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
  }

  resume() {
    this.gameState.setState('playing')
    this.hideOverlay()
    this.gameLoop = requestAnimationFrame((time) => this.update(time))
  }

  restart() {
    this.snake.reset(5, 5)
    this.gameState.resetScore()
    this.gameState.setState('playing')
    this.placeFood()
    this.particleSystem.clear()
    this.hideOverlay()
    this.updateUI()
    this.gameLoop = requestAnimationFrame((time) => this.update(time))
  }

  gameOver() {
    this.gameState.setState('gameOver')
    this.saveHighScore()
    this.showOverlay('GAME OVER', 'Press SPACE to restart')
    
    // Create explosion effect at snake head
    const head = this.snake.getHead()
    this.particleSystem.createExplosion(
      head.x * this.tileSize + this.tileSize / 2,
      head.y * this.tileSize + this.tileSize / 2,
      '#ff4444'
    )
    
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
  }

  gameWon() {
    this.gameState.setState('gameOver')
    this.saveHighScore()
    this.showOverlay('YOU WON!', 'Perfect Score! Press SPACE to restart')
    
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop)
      this.gameLoop = null
    }
  }

  update(currentTime) {
    if (currentTime - this.lastTime >= this.gameSpeed) {
      this.snake.move()
      
      // Check food collision
      const head = this.snake.getHead()
      if (head.x === this.food.x && head.y === this.food.y) {
        this.snake.grow()
        this.gameState.incrementScore()
        this.updateUI()
        
        // Create particle effect
        this.particleSystem.createFoodEffect(
          this.food.x * this.tileSize + this.tileSize / 2,
          this.food.y * this.tileSize + this.tileSize / 2
        )
        
        this.placeFood()
        
        // Increase speed slightly
        this.gameSpeed = Math.max(80, this.gameSpeed - 2)
      }
      
      // Check collisions
      if (this.checkCollisions()) {
        this.gameOver()
        return
      }
      
      this.lastTime = currentTime
    }
    
    this.particleSystem.update()
    this.render()
    
    if (this.gameState.isPlaying()) {
      this.gameLoop = requestAnimationFrame((time) => this.update(time))
    }
  }

  checkCollisions() {
    const head = this.snake.getHead()
    
    // Wall collision - fixed boundary check
    if (head.x < 0 || head.x >= this.tilesX || 
        head.y < 0 || head.y >= this.tilesY) {
      return true
    }
    
    // Self collision - improved detection
    return this.snake.checkSelfCollision()
  }

  render() {
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, this.boardWidth, this.boardHeight)
    gradient.addColorStop(0, '#0a0a0a')
    gradient.addColorStop(1, '#1a1a1a')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.boardWidth, this.boardHeight)
    
    // Draw subtle grid
    this.drawGrid()
    
    // Draw game objects
    this.food.draw(this.ctx)
    this.snake.draw(this.ctx)
    this.particleSystem.draw(this.ctx)
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    this.ctx.lineWidth = 1
    
    for (let i = 0; i <= this.tilesX; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(i * this.tileSize, 0)
      this.ctx.lineTo(i * this.tileSize, this.boardHeight)
      this.ctx.stroke()
    }
    
    for (let i = 0; i <= this.tilesY; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, i * this.tileSize)
      this.ctx.lineTo(this.boardWidth, i * this.tileSize)
      this.ctx.stroke()
    }
  }

  showOverlay(title, message) {
    const overlay = document.getElementById('gameOverlay')
    const titleEl = document.getElementById('overlayTitle')
    const messageEl = document.getElementById('overlayMessage')
    
    titleEl.textContent = title
    messageEl.textContent = message
    overlay.classList.add('show')
  }

  hideOverlay() {
    const overlay = document.getElementById('gameOverlay')
    overlay.classList.remove('show')
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameState.getScore()
    document.getElementById('highScore').textContent = this.gameState.getHighScore()
  }

  loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore')
    if (saved) {
      this.gameState.setHighScore(parseInt(saved))
    }
    this.updateUI()
  }

  saveHighScore() {
    const currentScore = this.gameState.getScore()
    if (currentScore > this.gameState.getHighScore()) {
      this.gameState.setHighScore(currentScore)
      localStorage.setItem('snakeHighScore', currentScore.toString())
      this.updateUI()
    }
  }
}