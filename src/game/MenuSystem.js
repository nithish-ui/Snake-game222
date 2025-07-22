export class MenuSystem {
  constructor() {
    this.currentSettings = {
      difficulty: 'medium',
      boardSize: 'medium',
      theme: 'neon',
      sound: true,
      controls: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight'
      }
    }
    this.onGameStart = null
    this.loadSettings()
  }

  init(onGameStartCallback) {
    this.onGameStart = onGameStartCallback
    this.setupEventListeners()
    this.updateUI()
    this.showMainMenu()
  }

  setupEventListeners() {
    // Main menu button
    document.getElementById('playBtn').addEventListener('click', () => {
      this.showModeSelection()
    })
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.showSettings()
    })
    
    document.getElementById('statsBtn').addEventListener('click', () => {
      this.showStats()
    })

    // Mode selection buttons
    document.getElementById('classicMode').addEventListener('click', () => {
      this.startGame('classic')
    })
    
    document.getElementById('timedMode').addEventListener('click', () => {
      this.startGame('timed')
    })
    
    document.getElementById('obstacleMode').addEventListener('click', () => {
      this.startGame('obstacle')
    })
    
    document.getElementById('backToMainFromModes').addEventListener('click', () => {
      this.showMainMenu()
    })

    // Settings menu
    document.getElementById('backToMenu').addEventListener('click', () => {
      this.showMainMenu()
    })
    
    document.getElementById('difficultySelect').addEventListener('change', (e) => {
      this.currentSettings.difficulty = e.target.value
      this.saveSettings()
    })
    
    document.getElementById('boardSizeSelect').addEventListener('change', (e) => {
      this.currentSettings.boardSize = e.target.value
      this.saveSettings()
    })
    
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.currentSettings.theme = e.target.value
      this.applyTheme(e.target.value)
      this.saveSettings()
    })
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
      this.currentSettings.sound = e.target.checked
      this.saveSettings()
    })

    // Stats menu
    document.getElementById('backToMenuFromStats').addEventListener('click', () => {
      this.showMainMenu()
    })
    
    document.getElementById('resetStats').addEventListener('click', () => {
      this.resetStatistics()
    })

    // Global escape key
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.showMainMenu()
      }
    })
  }

  startGame(mode) {
    this.hideAllMenus()
    if (this.onGameStart) {
      this.onGameStart(mode, this.currentSettings)
    }
  }

  showMainMenu() {
    this.hideAllMenus()
    document.getElementById('mainMenu').classList.remove('hidden')
  }

  showModeSelection() {
    this.hideAllMenus()
    document.getElementById('modeSelectionMenu').classList.remove('hidden')
  }

  showSettings() {
    this.hideAllMenus()
    document.getElementById('settingsMenu').classList.remove('hidden')
    this.updateSettingsUI()
  }

  showStats() {
    this.hideAllMenus()
    document.getElementById('statsMenu').classList.remove('hidden')
    this.updateStatsUI()
  }

  hideAllMenus() {
    document.getElementById('mainMenu').classList.add('hidden')
    document.getElementById('modeSelectionMenu').classList.add('hidden')
    document.getElementById('settingsMenu').classList.add('hidden')
    document.getElementById('statsMenu').classList.add('hidden')
  }

  updateSettingsUI() {
    document.getElementById('difficultySelect').value = this.currentSettings.difficulty
    document.getElementById('boardSizeSelect').value = this.currentSettings.boardSize
    document.getElementById('themeSelect').value = this.currentSettings.theme
    document.getElementById('soundToggle').checked = this.currentSettings.sound
    
    // Update control display
    document.getElementById('upKey').textContent = this.currentSettings.controls.up
    document.getElementById('downKey').textContent = this.currentSettings.controls.down
    document.getElementById('leftKey').textContent = this.currentSettings.controls.left
    document.getElementById('rightKey').textContent = this.currentSettings.controls.right
  }

  updateStatsUI() {
    const stats = this.getStatistics()
    document.getElementById('totalGames').textContent = stats.totalGames
    document.getElementById('totalScore').textContent = stats.totalScore
    document.getElementById('avgScore').textContent = stats.averageScore.toFixed(1)
    document.getElementById('bestStreak').textContent = stats.bestStreak
    document.getElementById('totalTime').textContent = this.formatTime(stats.totalTime)
    document.getElementById('foodEaten').textContent = stats.foodEaten
  }

  updateUI() {
    this.applyTheme(this.currentSettings.theme)
  }

  applyTheme(theme) {
    const body = document.body
    body.className = body.className.replace(/theme-\w+/g, '')
    if (theme !== 'neon') {
      body.classList.add(`theme-${theme}`)
    }
  }

  saveSettings() {
    localStorage.setItem('snakeSettings', JSON.stringify(this.currentSettings))
  }

  loadSettings() {
    const saved = localStorage.getItem('snakeSettings')
    if (saved) {
      this.currentSettings = { ...this.currentSettings, ...JSON.parse(saved) }
    }
  }

  getStatistics() {
    const saved = localStorage.getItem('snakeStats')
    const defaultStats = {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      bestStreak: 0,
      totalTime: 0,
      foodEaten: 0
    }
    
    if (saved) {
      const stats = JSON.parse(saved)
      stats.averageScore = stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0
      return stats
    }
    
    return defaultStats
  }

  updateStatistics(gameStats) {
    const current = this.getStatistics()
    const updated = {
      totalGames: current.totalGames + 1,
      totalScore: current.totalScore + gameStats.score,
      bestStreak: Math.max(current.bestStreak, gameStats.streak || 0),
      totalTime: current.totalTime + (gameStats.time || 0),
      foodEaten: current.foodEaten + (gameStats.foodEaten || 0)
    }
    updated.averageScore = updated.totalScore / updated.totalGames
    
    localStorage.setItem('snakeStats', JSON.stringify(updated))
  }

  resetStatistics() {
    localStorage.removeItem('snakeStats')
    this.updateStatsUI()
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
}