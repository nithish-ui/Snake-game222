export class Food {
  constructor(tileSize, tilesX, tilesY) {
    this.tileSize = tileSize
    this.tilesX = tilesX
    this.tilesY = tilesY
    this.animationTime = 0
    this.randomizePosition()
  }

  randomizePosition() {
    this.x = Math.floor(Math.random() * this.tilesX)
    this.y = Math.floor(Math.random() * this.tilesY)
  }

  draw(ctx) {
    this.animationTime += 0.1
    
    const x = this.x * this.tileSize
    const y = this.y * this.tileSize
    const centerX = x + this.tileSize / 2
    const centerY = y + this.tileSize / 2
    
    // Pulsing glow effect
    const glowIntensity = 0.5 + Math.sin(this.animationTime * 3) * 0.3
    ctx.shadowColor = '#ff4444'
    ctx.shadowBlur = 20 * glowIntensity
    
    // Main food body
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, this.tileSize / 2
    )
    gradient.addColorStop(0, '#ff6666')
    gradient.addColorStop(0.7, '#ff4444')
    gradient.addColorStop(1, '#cc2222')
    
    ctx.fillStyle = gradient
    
    // Draw as circle instead of square
    ctx.beginPath()
    const radius = (this.tileSize / 2 - 2) * (0.9 + Math.sin(this.animationTime * 2) * 0.1)
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Highlight
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffaaaa'
    ctx.beginPath()
    ctx.arc(centerX - 3, centerY - 3, radius * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Sparkle effect
    const sparkles = 3
    for (let i = 0; i < sparkles; i++) {
      const angle = (this.animationTime * 2 + i * (Math.PI * 2 / sparkles)) % (Math.PI * 2)
      const sparkleX = centerX + Math.cos(angle) * (radius + 5)
      const sparkleY = centerY + Math.sin(angle) * (radius + 5)
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(this.animationTime * 4 + i) * 0.5})`
      ctx.beginPath()
      ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}