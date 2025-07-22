export class ObstacleManager {
  constructor(tileSize, tilesX, tilesY) {
    this.tileSize = tileSize
    this.tilesX = tilesX
    this.tilesY = tilesY
    this.obstacles = []
  }

  generateObstacles(count) {
    this.obstacles = []
    const centerX = Math.floor(this.tilesX / 2)
    const centerY = Math.floor(this.tilesY / 2)
    
    for (let i = 0; i < count; i++) {
      let x, y
      let attempts = 0
      
      do {
        x = Math.floor(Math.random() * this.tilesX)
        y = Math.floor(Math.random() * this.tilesY)
        attempts++
      } while (
        attempts < 100 && (
          // Don't place near center (snake starting area)
          (Math.abs(x - centerX) < 3 && Math.abs(y - centerY) < 3) ||
          // Don't place on existing obstacles
          this.hasObstacle(x, y)
        )
      )
      
      if (attempts < 100) {
        this.obstacles.push({ x, y })
      }
    }
  }

  hasObstacle(x, y) {
    return this.obstacles.some(obstacle => obstacle.x === x && obstacle.y === y)
  }

  draw(ctx) {
    this.obstacles.forEach(obstacle => {
      const x = obstacle.x * this.tileSize
      const y = obstacle.y * this.tileSize
      
      // Draw obstacle with metallic appearance
      const gradient = ctx.createRadialGradient(
        x + this.tileSize / 2, y + this.tileSize / 2, 0,
        x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 2
      )
      gradient.addColorStop(0, '#666666')
      gradient.addColorStop(0.7, '#444444')
      gradient.addColorStop(1, '#222222')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4)
      
      // Add border
      ctx.strokeStyle = '#888888'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4)
      
      // Add highlight
      ctx.fillStyle = '#aaaaaa'
      ctx.fillRect(x + 4, y + 4, this.tileSize - 12, 2)
      ctx.fillRect(x + 4, y + 4, 2, this.tileSize - 12)
    })
  }

  clear() {
    this.obstacles = []
  }
}