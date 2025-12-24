/**
 * Seasonal Animation Library
 * Creates animated seasonal effects: snow, rain, and falling leaves
 */

class SeasonalAnimation {
  constructor(options = {}) {
    // Handle color explicitly - allow null, undefined, or a valid color string
    const color = (options.color !== undefined && options.color !== null && options.color !== '') 
      ? options.color 
      : null;
    
    this.options = {
      season: options.season || 'winter', // 'winter', 'rainy', 'fall'
      quantity: options.quantity || 50,
      angle: options.angle || 0, // degrees
      speed: options.speed || 1,
      size: options.size || 10,
      color: color, // null = default colors per season, otherwise use provided color
      container: options.container || document.body,
      zIndex: options.zIndex || 1000
    };

    this.particles = [];
    this.animationId = null;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.frameCount = 0;

    // Season-specific defaults
    this.seasonDefaults = {
      winter: {
        color: '#FFFFFF',
        shape: 'circle',
        minSize: 2,
        maxSize: 8,
        minSpeed: 0.5,
        maxSpeed: 2,
        sway: true
      },
      rainy: {
        color: '#87CEEB',
        shape: 'line',
        minSize: 1,
        maxSize: 2,
        minSpeed: 3,
        maxSpeed: 8,
        sway: false
      },
      fall: {
        color: '#FF8C00',
        shape: 'leaf',
        minSize: 8,
        maxSize: 20,
        minSpeed: 1,
        maxSpeed: 3,
        sway: true
      }
    };

    this.init();
  }

  init() {
    // Create container
    this.container = typeof this.options.container === 'string' 
      ? document.querySelector(this.options.container)
      : this.options.container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = this.options.zIndex;
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    
    // Ensure canvas has dimensions
    this.resize();
    
    // Recreate particles after resize to ensure proper dimensions
    this.createParticles();
    
    // Handle window resize
    const resizeHandler = () => {
      this.resize();
      this.createParticles();
    };
    window.addEventListener('resize', resizeHandler);
    this.resizeHandler = resizeHandler;
  }

  resize() {
    const width = window.innerWidth || this.container.clientWidth || 800;
    const height = window.innerHeight || this.container.clientHeight || 600;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  createParticles() {
    this.particles = [];
    const defaults = this.seasonDefaults[this.options.season];
    if (!defaults) {
      console.error(`Invalid season: ${this.options.season}. Using 'winter' as default.`);
      this.options.season = 'winter';
      return this.createParticles();
    }
    
    const angleRad = (this.options.angle * Math.PI) / 180;
    const width = this.canvas.width || window.innerWidth || 800;
    const height = this.canvas.height || window.innerHeight || 600;

    for (let i = 0; i < this.options.quantity; i++) {
      const particle = {
        x: Math.random() * width,
        y: -Math.random() * height, // Start from top
        size: defaults.minSize + Math.random() * (defaults.maxSize - defaults.minSize),
        speed: (defaults.minSpeed + Math.random() * (defaults.maxSpeed - defaults.minSpeed)) * this.options.speed,
        angle: angleRad,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        swayAmount: defaults.sway ? (Math.random() * 2 + 1) : 0,
        swaySpeed: defaults.sway ? (Math.random() * 0.02 + 0.01) : 0,
        swayOffset: Math.random() * Math.PI * 2,
        color: (this.options.color !== null && this.options.color !== undefined) ? this.options.color : defaults.color,
        shape: defaults.shape
      };

      // For leaves, add some variation
      if (this.options.season === 'fall') {
        particle.leafType = Math.floor(Math.random() * 3); // Different leaf shapes
      }

      this.particles.push(particle);
    }
  }

  drawParticle(particle) {
    if (!this.ctx || !particle) return;
    
    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);
    this.ctx.fillStyle = particle.color;
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineCap = 'round';

    if (particle.shape === 'circle') {
      // Snowflake
      this.ctx.beginPath();
      this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add snowflake arms
      this.ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -particle.size);
        this.ctx.stroke();
        this.ctx.rotate(Math.PI / 3);
      }
    } else if (particle.shape === 'line') {
      // Rain drop
      this.ctx.lineWidth = Math.max(1, particle.size / 2);
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(
        Math.sin(particle.angle) * particle.size * 5,
        Math.cos(particle.angle) * particle.size * 5
      );
      this.ctx.stroke();
    } else if (particle.shape === 'leaf') {
      // Leaf
      this.drawLeaf(particle);
    }

    this.ctx.restore();
  }

  drawLeaf(particle) {
    const size = particle.size;
    this.ctx.beginPath();
    
    // Draw different leaf shapes
    if (particle.leafType === 0) {
      // Maple-like leaf
      this.ctx.moveTo(0, -size);
      this.ctx.quadraticCurveTo(-size * 0.5, -size * 0.3, -size * 0.8, size * 0.2);
      this.ctx.quadraticCurveTo(-size * 0.3, size * 0.5, 0, size);
      this.ctx.quadraticCurveTo(size * 0.3, size * 0.5, size * 0.8, size * 0.2);
      this.ctx.quadraticCurveTo(size * 0.5, -size * 0.3, 0, -size);
    } else if (particle.leafType === 1) {
      // Oval leaf
      this.ctx.ellipse(0, 0, size * 0.6, size, 0, 0, Math.PI * 2);
    } else {
      // Simple leaf
      this.ctx.moveTo(0, -size);
      this.ctx.quadraticCurveTo(-size * 0.4, 0, 0, size);
      this.ctx.quadraticCurveTo(size * 0.4, 0, 0, -size);
    }
    
    this.ctx.fill();
    
    // Add leaf vein
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(0, size);
    this.ctx.stroke();
  }

  updateParticle(particle) {
    const defaults = this.seasonDefaults[this.options.season];
    
    // Calculate movement with angle
    const vx = Math.sin(particle.angle) * particle.speed;
    const vy = Math.cos(particle.angle) * particle.speed;

    // Add sway for snow and leaves
    if (defaults.sway) {
      particle.x += Math.sin(particle.swayOffset + this.frameCount * particle.swaySpeed) * particle.swayAmount;
    }

    particle.x += vx;
    particle.y += vy;
    particle.rotation += particle.rotationSpeed;

    // Reset particle when it goes off screen
    if (particle.y > this.canvas.height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * this.canvas.width;
    }

    // Wrap horizontally for angled particles
    if (particle.x < -particle.size) {
      particle.x = this.canvas.width + particle.size;
    } else if (particle.x > this.canvas.width + particle.size) {
      particle.x = -particle.size;
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });

    this.frameCount++;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.frameCount = 0;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.stop();
    this.createParticles();
    this.start();
  }
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SeasonalAnimation;
}

// Export for browser global (when loaded via script tag)
if (typeof window !== 'undefined') {
  window.SeasonalAnimation = SeasonalAnimation;
}

// Also export for ES6 modules if supported
if (typeof exports !== 'undefined') {
  exports.default = SeasonalAnimation;
  exports.SeasonalAnimation = SeasonalAnimation;
}

