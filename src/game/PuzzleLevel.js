export class PuzzleLevel {
  constructor(levelNumber) {
    this.levelNumber = levelNumber
    this.generateLevel()
  }

  generateLevel() {
    const levels = [
      // Level 1: Simple L-shape
      {
        snakeStart: { x: 1, y: 1 },
        snakeLength: 3,
        food: [{ x: 5, y: 1 }, { x: 1, y: 5 }],
        moves: 8,
        obstacles: []
      },
      // Level 2: Navigate around obstacle
      {
        snakeStart: { x: 2, y: 2 },
        snakeLength: 3,
        food: [{ x: 8, y: 2 }, { x: 8, y: 8 }, { x: 2, y: 8 }],
        moves: 20,
        obstacles: [
          { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }
        ]
      },
      // Level 3: Spiral pattern
      {
        snakeStart: { x: 5, y: 5 },
        snakeLength: 4,
        food: [{ x: 1, y: 1 }, { x: 9, y: 1 }, { x: 9, y: 9 }, { x: 1, y: 9 }],
        moves: 32,
        obstacles: [
          { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
          { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
          { x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 },
          { x: 3, y: 6 }, { x: 3, y: 5 }, { x: 3, y: 4 }
        ]
      },
      // Level 4: Cross pattern
      {
        snakeStart: { x: 5, y: 1 },
        snakeLength: 3,
        food: [{ x: 1, y: 5 }, { x: 9, y: 5 }, { x: 5, y: 9 }],
        moves: 24,
        obstacles: [
          { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
          { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }
        ]
      },
      // Level 5: Maze-like
      {
        snakeStart: { x: 1, y: 1 },
        snakeLength: 4,
        food: [{ x: 9, y: 9 }, { x: 1, y: 9 }, { x: 9, y: 1 }],
        moves: 40,
        obstacles: [
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
          { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
          { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
          { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 }
        ]
      }
    ]

    if (this.levelNumber <= levels.length) {
      const level = levels[this.levelNumber - 1]
      this.snakeStart = level.snakeStart
      this.snakeLength = level.snakeLength
      this.food = [...level.food]
      this.totalFood = level.food.length
      this.moves = level.moves
      this.obstacles = [...level.obstacles]
    } else {
      // Generate random level for higher numbers
      this.generateRandomLevel()
    }
  }

  generateRandomLevel() {
    this.snakeStart = { x: 2, y: 2 }
    this.snakeLength = 3 + Math.floor(this.levelNumber / 3)
    this.moves = 15 + this.levelNumber * 5
    
    // Generate random food positions
    this.food = []
    this.totalFood = 3 + Math.floor(this.levelNumber / 2)
    
    for (let i = 0; i < this.totalFood; i++) {
      let pos
      do {
        pos = {
          x: Math.floor(Math.random() * 8) + 1,
          y: Math.floor(Math.random() * 8) + 1
        }
      } while (this.food.some(f => f.x === pos.x && f.y === pos.y))
      
      this.food.push(pos)
    }
    
    // Generate random obstacles
    this.obstacles = []
    const obstacleCount = Math.min(15, this.levelNumber * 2)
    
    for (let i = 0; i < obstacleCount; i++) {
      let pos
      do {
        pos = {
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10)
        }
      } while (
        this.obstacles.some(o => o.x === pos.x && o.y === pos.y) ||
        this.food.some(f => f.x === pos.x && f.y === pos.y) ||
        (pos.x === this.snakeStart.x && pos.y === this.snakeStart.y)
      )
      
      this.obstacles.push(pos)
    }
  }

  isComplete(foodCollected) {
    return foodCollected >= this.totalFood
  }

  getNextFoodPosition() {
    return this.food.length > 0 ? this.food[0] : null
  }

  removeFood(x, y) {
    this.food = this.food.filter(f => !(f.x === x && f.y === y))
  }
}