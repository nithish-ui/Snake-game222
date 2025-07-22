export class Snake {
  constructor(startX, startY, tileSize) {
    this.tileSize = tileSize
    this.reset(startX, startY)
  }

  reset(startX, startY) {
    this.body = [{ x: startX, y: startY }]
    this.direction = { x: 1, y: 0 }
    this.nextDirection = { x: 1, y: 0 }
    this.growing = false
  }

  setDirection(x, y) {
    // Prevent reversing into itself
    if (this.direction.x === -x && this.direction.y === -y) {
      return
    }
    
    this.nextDirection = { x, y }
  }

  move() {
    // Update direction
    this.direction = { ...this.nextDirection }
    
    // Calculate new head position
    const head = this.getHead()
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    }
    
    // Add new head
    this.body.unshift(newHead)
    
    // Remove tail if not growing
    if (!this.growing) {
      this.body.pop()
    } else {
      this.growing = false
    }
  }

  grow() {
    this.growing = true
  }

  getHead() {
    return this.body[0]
  }

  occupiesPosition(x, y) {
    return this.body.some(segment => segment.x === x && segment.y === y)
  }

  checkSelfCollision() {
    const head = this.getHead()
    // Check if head collides with any body segment (excluding head itself)
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        return true
      }
    }
    return false
  }

  draw(ctx) {
    this.body.forEach((segment, index) => {
      const x = segment.x * this.tileSize
      const y = segment.y * this.tileSize
      
      if (index === 0) {
        // Draw head with special styling
        this.drawHead(ctx, x, y)
      } else {
        // Draw body segment
        this.drawBodySegment(ctx, x, y, index)
      }
    })
  }

  drawHead(ctx, x, y) {
    // Head glow effect
    ctx.shadowColor = '#00ff88'
    ctx.shadowBlur = 15
    
    // Main head
    const gradient = ctx.createRadialGradient(
      x + this.tileSize / 2, y + this.tileSize / 2, 0,
      x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 2
    )
    gradient.addColorStop(0, '#00ff88')
    gradient.addColorStop(1, '#00cc66')
    
    ctx.fillStyle = gradient
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4)
    
    // Head border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4)
    
    // Eyes
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    const eyeSize = 3
    const eyeOffset = 6
    
    if (this.direction.x === 1) { // Moving right
      ctx.fillRect(x + this.tileSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize)
      ctx.fillRect(x + this.tileSize - eyeOffset, y + this.tileSize - eyeOffset - eyeSize, eyeSize, eyeSize)
    } else if (this.direction.x === -1) { // Moving left
      ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize)
      ctx.fillRect(x + eyeOffset - eyeSize, y + this.tileSize - eyeOffset - eyeSize, eyeSize, eyeSize)
    } else if (this.direction.y === -1) { // Moving up
      ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize)
      ctx.fillRect(x + this.tileSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize)
    } else { // Moving down
      ctx.fillRect(x + eyeOffset, y + this.tileSize - eyeOffset, eyeSize, eyeSize)
      ctx.fillRect(x + this.tileSize - eyeOffset - eyeSize, y + this.tileSize - eyeOffset, eyeSize, eyeSize)
    }
  }

  drawBodySegment(ctx, x, y, index) {
    // Body glow effect (dimmer than head)
    ctx.shadowColor = '#00aa66'
    ctx.shadowBlur = 8
    
    // Body gradient
    const intensity = Math.max(0.3, 1 - (index * 0.1))
    const gradient = ctx.createRadialGradient(
      x + this.tileSize / 2, y + this.tileSize / 2, 0,
      x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 2
    )
    gradient.addColorStop(0, `rgba(0, 255, 136, ${intensity})`)
    gradient.addColorStop(1, `rgba(0, 170, 102, ${intensity * 0.7})`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6)
    
    // Body border
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.5})`
    ctx.lineWidth = 1
    ctx.strokeRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6)
    
    ctx.shadowBlur = 0
  }
}