import { Howl } from 'howler'

export class SoundManager {
  constructor() {
    this.enabled = true
    this.sounds = {}
    this.initSounds()
  }

  initSounds() {
    // Create simple audio using Web Audio API since we can't load external files
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Pre-generate sound buffers
    this.generateSounds()
  }

  generateSounds() {
    // Generate eat sound (short beep)
    this.sounds.eat = this.createTone(800, 0.1, 'sine')
    
    // Generate game over sound (descending tone)
    this.sounds.gameOver = this.createDescendingTone(400, 200, 0.5)
    
    // Generate pause sound
    this.sounds.pause = this.createTone(600, 0.2, 'square')
    
    // Generate level up sound
    this.sounds.levelUp = this.createAscendingTone(400, 800, 0.3)
  }

  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    }
  }

  createDescendingTone(startFreq, endFreq, duration) {
    return () => {
      if (!this.enabled) return
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration)
      oscillator.type = 'sawtooth'
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    }
  }

  createAscendingTone(startFreq, endFreq, duration) {
    return () => {
      if (!this.enabled) return
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration)
      oscillator.type = 'triangle'
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    }
  }

  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      try {
        this.sounds[soundName]()
      } catch (error) {
        console.warn('Could not play sound:', error)
      }
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  isEnabled() {
    return this.enabled
  }
}