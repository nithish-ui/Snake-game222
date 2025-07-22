export class DangerZone {
  constructor(x, y, duration = 300) {
    this.x = x
    this.y = y
    this.duration = duration
    this.timeLeft = duration
    this.warningTime = 60 // Frames to show warning before activation
    this.active = false
    this.animationTime = 0
  }

  update() {
    this.animationTime += 0.2
    this.timeLeft--
    
    if (this.timeLeft <= 0) {
      return false // Remove this danger zone
    }
    
    // Activate after warning period
    if (this.timeLeft <= this.duration - this.warningTime) {
      this.active = true
    }
    
    return true
  }

  isActive() {
    return this.active
  }

  isWarning() {
    return !this.active && this.timeLeft <= this.warningTime
  }

  draw(ctx, tileSize) {
    const x = this.x * tileSize
    const y = this.y * tileSize
    const centerX = x + tileSize / 2
    const centerY = y + tileSize / 2
    
    if (this.isWarning()) {
      // Warning state - pulsing yellow
      const alpha = 0.3 + Math.sin(this.animationTime * 8) * 0.3
      ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4)
      
      // Warning border
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4)
      
    } else if (this.active) {
      // Active danger zone - red with electricity effect
      ctx.shadowColor = '#ff0000'
      ctx.shadowBlur = 20
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, tileSize / 2
      )
      gradient.addColorStop(0, '#ff4444')
      gradient.addColorStop(0.7, '#ff0000')
      gradient.addColorStop(1, '#aa0000')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2)
      
      // Electric effect
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      
      for (let i = 0; i < 3; i++) {
        const angle = this.animationTime * 4 + i * (Math.PI * 2 / 3)
        const startX = centerX + Math.cos(angle) * (tileSize / 4)
        const startY = centerY + Math.sin(angle) * (tileSize / 4)
        const endX = centerX + Math.cos(angle + Math.PI) * (tileSize / 4)
        const endY = centerY + Math.sin(angle + Math.PI) * (tileSize / 4)
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    }
  }
}