export class GameState {
  constructor() {
    this.state = 'menu' // 'menu', 'playing', 'paused', 'gameOver'
    this.score = 0
    this.highScore = 0
  }

  setState(newState) {
    this.state = newState
  }

  getState() {
    return this.state
  }

  isPlaying() {
    return this.state === 'playing'
  }

  isPaused() {
    return this.state === 'paused'
  }

  isGameOver() {
    return this.state === 'gameOver'
  }

  incrementScore() {
    this.score++
  }

  getScore() {
    return this.score
  }

  resetScore() {
    this.score = 0
  }

  setHighScore(score) {
    this.highScore = score
  }

  getHighScore() {
    return this.highScore
  }
}