export class ParticleSystem {
  constructor() {
    this.particles = []
  }

  createFoodEffect(x, y) {
    // Create multiple particles for food consumption
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: 0.02,
        size: Math.random() * 4 + 2,
        color: `hsl(${120 + Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`,
        type: 'food'
      })
    }
  }

  createExplosion(x, y, color = '#ff4444') {
    // Create explosion effect for game over
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = Math.random() * 6 + 2
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.015,
        size: Math.random() * 6 + 3,
        color: color,
        type: 'explosion'
      })
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Apply gravity for food particles
      if (particle.type === 'food') {
        particle.vy += 0.2
      }
      
      // Apply friction
      particle.vx *= 0.98
      particle.vy *= 0.98
      
      // Update life
      particle.life -= particle.decay
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  draw(ctx) {
    ctx.save()
    
    this.particles.forEach(particle => {
      ctx.globalAlpha = particle.life
      
      if (particle.type === 'food') {
        // Glowing food particles
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.fillStyle = particle.color
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2)
        ctx.fill()
        
        // Inner glow
        ctx.shadowBlur = 0
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.life * 0.3, 0, Math.PI * 2)
        ctx.fill()
        
      } else if (particle.type === 'explosion') {
        // Explosion particles
        ctx.fillStyle = particle.color
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        )
      }
    })
    
    ctx.restore()
  }

  clear() {
    this.particles = []
  }
}