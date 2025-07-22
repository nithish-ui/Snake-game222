import { Snake } from './Snake.js'

export class AISnake extends Snake {
  constructor(startX, startY, tileSize) {
    super(startX, startY, tileSize, true)
    this.target = null
    this.pathfindingCooldown = 0
    this.aggressiveness = 0.7 // How often it tries to block player
    this.lastPlayerPosition = null
    this.predictedPlayerPath = []
  }

  update(food, playerSnake, obstacles = []) {
    this.pathfindingCooldown--
    
    // Learn from player behavior
    this.analyzePlayerBehavior(playerSnake)
    
    // Decide strategy
    const strategy = this.chooseStrategy(food, playerSnake)
    
    // Execute strategy
    this.executeStrategy(strategy, food, playerSnake, obstacles)
  }

  analyzePlayerBehavior(playerSnake) {
    const playerHead = playerSnake.getHead()
    
    if (this.lastPlayerPosition) {
      const playerDirection = {
        x: playerHead.x - this.lastPlayerPosition.x,
        y: playerHead.y - this.lastPlayerPosition.y
      }
      
      // Predict where player might go
      this.predictedPlayerPath = [
        { x: playerHead.x + playerDirection.x, y: playerHead.y + playerDirection.y },
        { x: playerHead.x + playerDirection.x * 2, y: playerHead.y + playerDirection.y * 2 }
      ]
    }
    
    this.lastPlayerPosition = { ...playerHead }
  }

  chooseStrategy(food, playerSnake) {
    const myHead = this.getHead()
    const playerHead = playerSnake.getHead()
    
    const distanceToFood = Math.abs(myHead.x - food.x) + Math.abs(myHead.y - food.y)
    const playerDistanceToFood = Math.abs(playerHead.x - food.x) + Math.abs(playerHead.y - food.y)
    
    // If player is closer to food and we're aggressive, try to block
    if (playerDistanceToFood < distanceToFood && Math.random() < this.aggressiveness) {
      return 'block'
    }
    
    // If we're much closer, go for food
    if (distanceToFood < playerDistanceToFood - 2) {
      return 'collect'
    }
    
    // Default: try to get food but avoid player
    return 'cautious'
  }

  executeStrategy(strategy, food, playerSnake, obstacles) {
    let targetPosition
    
    switch (strategy) {
      case 'block':
        // Try to get between player and food
        targetPosition = this.calculateBlockingPosition(food, playerSnake)
        break
      case 'collect':
        // Go directly for food
        targetPosition = { x: food.x, y: food.y }
        break
      case 'cautious':
        // Go for food but avoid player
        targetPosition = this.calculateCautiousPath(food, playerSnake)
        break
    }
    
    if (targetPosition) {
      this.moveTowards(targetPosition, obstacles, playerSnake)
    }
  }

  calculateBlockingPosition(food, playerSnake) {
    const playerHead = playerSnake.getHead()
    
    // Calculate midpoint between player and food
    return {
      x: Math.floor((playerHead.x + food.x) / 2),
      y: Math.floor((playerHead.y + food.y) / 2)
    }
  }

  calculateCautiousPath(food, playerSnake) {
    const playerHead = playerSnake.getHead()
    const myHead = this.getHead()
    
    // If too close to player, move away first
    const distanceToPlayer = Math.abs(myHead.x - playerHead.x) + Math.abs(myHead.y - playerHead.y)
    
    if (distanceToPlayer < 3) {
      // Move away from player
      return {
        x: myHead.x + (myHead.x > playerHead.x ? 1 : -1),
        y: myHead.y + (myHead.y > playerHead.y ? 1 : -1)
      }
    }
    
    return { x: food.x, y: food.y }
  }

  moveTowards(target, obstacles, playerSnake) {
    const head = this.getHead()
    const dx = target.x - head.x
    const dy = target.y - head.y
    
    // Simple pathfinding with obstacle avoidance
    let bestDirection = { x: 0, y: 0 }
    let bestScore = -Infinity
    
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }   // right
    ]
    
    directions.forEach(dir => {
      const newPos = { x: head.x + dir.x, y: head.y + dir.y }
      
      // Check if move is valid
      if (this.isValidMove(newPos, obstacles, playerSnake)) {
        // Score based on distance to target
        const score = -(Math.abs(newPos.x - target.x) + Math.abs(newPos.y - target.y))
        
        if (score > bestScore) {
          bestScore = score
          bestDirection = dir
        }
      }
    })
    
    if (bestDirection.x !== 0 || bestDirection.y !== 0) {
      this.setDirection(bestDirection.x, bestDirection.y)
    }
  }

  isValidMove(pos, obstacles, playerSnake) {
    // Check bounds
    if (pos.x < 0 || pos.x >= 30 || pos.y < 0 || pos.y >= 30) {
      return false
    }
    
    // Check self collision
    if (this.occupiesPosition(pos.x, pos.y)) {
      return false
    }
    
    // Check obstacles
    if (obstacles.some(obs => obs.x === pos.x && obs.y === pos.y)) {
      return false
    }
    
    // Check player snake collision
    if (playerSnake.occupiesPosition(pos.x, pos.y)) {
      return false
    }
    
    return true
  }

  draw(ctx) {
    // Draw AI snake with different visual style
    this.body.forEach((segment, index) => {
      const x = segment.x * this.tileSize
      const y = segment.y * this.tileSize
      
      if (index === 0) {
        this.drawAIHead(ctx, x, y)
      } else {
        this.drawAIBodySegment(ctx, x, y, index)
      }
    })
  }

  drawAIHead(ctx, x, y) {
    // AI head with red coloring
    ctx.shadowColor = '#ff4444'
    ctx.shadowBlur = 15
    
    const gradient = ctx.createRadialGradient(
      x + this.tileSize / 2, y + this.tileSize / 2, 0,
      x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 2
    )
    gradient.addColorStop(0, '#ff6666')
    gradient.addColorStop(1, '#cc4444')
    
    ctx.fillStyle = gradient
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4)
    
    // AI head border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4)
    
    // AI eyes (always looking menacing)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    const eyeSize = 3
    const eyeOffset = 6
    
    ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize)
    ctx.fillRect(x + this.tileSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize)
  }

  drawAIBodySegment(ctx, x, y, index) {
    ctx.shadowColor = '#aa4444'
    ctx.shadowBlur = 8
    
    const intensity = Math.max(0.3, 1 - (index * 0.1))
    const gradient = ctx.createRadialGradient(
      x + this.tileSize / 2, y + this.tileSize / 2, 0,
      x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 2
    )
    gradient.addColorStop(0, `rgba(255, 102, 102, ${intensity})`)
    gradient.addColorStop(1, `rgba(170, 68, 68, ${intensity * 0.7})`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6)
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.5})`
    ctx.lineWidth = 1
    ctx.strokeRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6)
    
    ctx.shadowBlur = 0
  }
}