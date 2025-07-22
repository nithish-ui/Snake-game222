export class MovingObstacle {
  constructor(startX, startY, endX, endY, speed = 0.02) {
    this.startX = startX
    this.startY = startY
    this.endX = endX
    this.endY = endY
    this.speed = speed
    this.progress = 0
    this.direction = 1
    this.x = startX
    this.y = startY
  }

  update() {
    this.progress += this.speed * this.direction
    
    if (this.progress >= 1) {
      this.progress = 1
      this.direction = -1
    } else if (this.progress <= 0) {
      this.progress = 0
      this.direction = 1
    }
    
    // Smooth interpolation
    const t = this.easeInOutSine(this.progress)
    this.x = Math.floor(this.startX + (this.endX - this.startX) * t)
    this.y = Math.floor(this.startY + (this.endY - this.startY) * t)
  }

  easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2
  }

  getPosition() {
    return { x: this.x, y: this.y }
  }

  draw(ctx, tileSize) {
    const x = this.x * tileSize
    const y = this.y * tileSize
    
    // Moving obstacle with animated appearance
    const gradient = ctx.createRadialGradient(
      x + tileSize / 2, y + tileSize / 2, 0,
      x + tileSize / 2, y + tileSize / 2, tileSize / 2
    )
    gradient.addColorStop(0, '#888888')
    gradient.addColorStop(0.7, '#555555')
    gradient.addColorStop(1, '#333333')
    
    ctx.fillStyle = gradient
    ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2)
    
    // Movement indicator
    ctx.strokeStyle = '#aaaaaa'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2)
    
    // Direction arrow
    ctx.fillStyle = '#ffffff'
    const centerX = x + tileSize / 2
    const centerY = y + tileSize / 2
    const arrowSize = 4
    
    if (this.direction === 1) {
      // Moving towards end
      const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX)
      const arrowX = centerX + Math.cos(angle) * arrowSize
      const arrowY = centerY + Math.sin(angle) * arrowSize
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(arrowX, arrowY)
      ctx.lineTo(arrowX - Math.cos(angle - Math.PI/6) * arrowSize/2, arrowY - Math.sin(angle - Math.PI/6) * arrowSize/2)
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(arrowX - Math.cos(angle + Math.PI/6) * arrowSize/2, arrowY - Math.sin(angle + Math.PI/6) * arrowSize/2)
      ctx.stroke()
    }
  }
}