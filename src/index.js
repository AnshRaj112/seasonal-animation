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
        minSize: 3,
        maxSize: 10,
        minSpeed: 0.3,
        maxSpeed: 1.5,
        sway: true,
        rotationSpeed: 0.01,
        opacity: 0.8
      },
      rainy: {
        color: '#87CEEB',
        shape: 'line',
        minSize: 1.5,
        maxSize: 3,
        minSpeed: 4,
        maxSpeed: 10,
        sway: false,
        rotationSpeed: 0,
        opacity: 0.7
      },
      fall: {
        color: '#FF8C00',
        shape: 'leaf',
        minSize: 10,
        maxSize: 25,
        minSpeed: 0.8,
        maxSpeed: 2.5,
        sway: false,
        rotationSpeed: 0.02,
        opacity: 0.9
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
      const size = defaults.minSize + Math.random() * (defaults.maxSize - defaults.minSize);
      const baseSpeed = (defaults.minSpeed + Math.random() * (defaults.maxSpeed - defaults.minSpeed)) * this.options.speed;
      
      const particle = {
        x: Math.random() * width,
        y: -Math.random() * height, // Start from top
        size: size,
        speed: baseSpeed,
        angle: angleRad,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: defaults.rotationSpeed * (0.5 + Math.random()), // Vary rotation speed
        swayAmount: defaults.sway ? (Math.random() * 1.5 + 0.5) : 0,
        swaySpeed: defaults.sway ? (Math.random() * 0.015 + 0.005) : 0,
        swayOffset: Math.random() * Math.PI * 2,
        color: (this.options.color !== null && this.options.color !== undefined) ? this.options.color : defaults.color,
        shape: defaults.shape,
        opacity: defaults.opacity + (Math.random() - 0.5) * 0.2, // Vary opacity
        // Physics properties
        windX: defaults.sway ? (Math.random() - 0.5) * 0.3 : 0, // Horizontal wind component
        turbulence: defaults.sway ? Math.random() * 0.1 : 0, // Random turbulence
        // For rain: trail effect
        trailLength: this.options.season === 'rainy' ? (size * 15 + Math.random() * 10) : 0,
        // For leaves: simple rotation only
        rotationX: 0,
        rotationXSpeed: 0
      };

      // For leaves, add some variation
      if (this.options.season === 'fall') {
        particle.leafType = Math.floor(Math.random() * 3); // Different leaf shapes
      }
      
      // For snowflakes, add unique pattern properties with much more variation
      if (this.options.season === 'winter') {
        // Different base structures
        particle.snowflakeType = Math.floor(Math.random() * 6); // 6 different base types
        particle.armCount = Math.random() > 0.7 ? 8 : 6; // 30% have 8 arms, 70% have 6
        
        // Branch positions - much more variation
        particle.branch1Pos = 0.2 + Math.random() * 0.3; // Position of first branch (0.2-0.5)
        particle.branch2Pos = 0.5 + Math.random() * 0.3; // Position of second branch (0.5-0.8)
        particle.branch3Pos = Math.random() > 0.6 ? (0.7 + Math.random() * 0.2) : 0; // Third branch for some (0.7-0.9)
        
        // Branch lengths - much more variation
        particle.branch1Length = 0.1 + Math.random() * 0.25; // Length of first branch (0.1-0.35)
        particle.branch2Length = 0.08 + Math.random() * 0.22; // Length of second branch (0.08-0.3)
        particle.branch3Length = particle.branch3Pos > 0 ? (0.06 + Math.random() * 0.1) : 0; // Third branch length
        
        // Branch angles - more dramatic
        particle.branch1Angle = (Math.random() - 0.5) * 1.2; // Angle variation (-0.6 to 0.6 radians)
        particle.branch2Angle = (Math.random() - 0.5) * 1.0;
        particle.branch3Angle = particle.branch3Pos > 0 ? (Math.random() - 0.5) * 0.8 : 0;
        
        // Number of branches per arm
        particle.numBranches1 = Math.floor(Math.random() * 3) + 1; // 1-3 branches at first position
        particle.numBranches2 = Math.floor(Math.random() * 3) + 1; // 1-3 branches at second position
        
        // Center design
        particle.centerType = Math.floor(Math.random() * 4); // 0=none, 1=circle, 2=hexagon, 3=star
        particle.centerSize = 0.08 + Math.random() * 0.15; // Center size (0.08-0.23)
        
        // Arm properties
        particle.armThickness = 0.6 + Math.random() * 0.6; // Arm thickness multiplier (0.6-1.2)
        particle.armStyle = Math.floor(Math.random() * 3); // 0=straight, 1=tapered, 2=curved
        
        // Pattern decorations
        particle.patternType = Math.floor(Math.random() * 5); // 5 different decorative patterns
        particle.hasDots = Math.random() > 0.5; // 50% have dots
        particle.hasSpikes = Math.random() > 0.4; // 60% have spikes
        particle.hasVShapes = Math.random() > 0.5; // 50% have V shapes
        
        // Tip variations
        particle.tipStyle = Math.floor(Math.random() * 4); // Different tip styles
        particle.tipLength = 0.05 + Math.random() * 0.1; // Tip extension length
      }

      this.particles.push(particle);
    }
  }

  drawParticle(particle) {
    if (!this.ctx || !particle) return;
    
    this.ctx.save();
    
    // Apply opacity
    const opacity = Math.max(0.3, Math.min(1, particle.opacity || 1));
    const color = this.hexToRgba(particle.color, opacity);
    
    if (particle.shape === 'circle') {
      // Snowflake - more detailed design with unique patterns
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      this.drawSnowflake(particle, color);
      
    } else if (particle.shape === 'line') {
      // Rain drop - streak with gradient
      this.drawRainDrop(particle, color);
      
    } else if (particle.shape === 'leaf') {
      // Leaf - simple rotation only
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      this.drawLeaf(particle, color);
    }

    this.ctx.restore();
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  drawSnowflake(particle, color) {
    const size = particle.size;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    const baseLineWidth = Math.max(0.6, size / 12) * (particle.armThickness || 1);
    this.ctx.lineWidth = baseLineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    const armCount = particle.armCount || 6;
    const angleStep = (Math.PI * 2) / armCount;
    
    // Draw center based on centerType
    if (particle.centerType === 1) {
      // Circle center
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * (particle.centerSize || 0.15), 0, Math.PI * 2);
      this.ctx.fill();
    } else if (particle.centerType === 2) {
      // Hexagon center
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * size * (particle.centerSize || 0.15);
        const y = Math.sin(angle) * size * (particle.centerSize || 0.15);
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.fill();
    } else if (particle.centerType === 3) {
      // Star center
      this.ctx.beginPath();
      const centerSize = size * (particle.centerSize || 0.15);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const radius = i % 2 === 0 ? centerSize : centerSize * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Draw each arm with unique pattern
    for (let i = 0; i < armCount; i++) {
      this.ctx.save();
      
      // Main arm with different styles
      this.ctx.lineWidth = baseLineWidth;
      this.ctx.beginPath();
      
      if (particle.armStyle === 0) {
        // Straight arm
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -size);
      } else if (particle.armStyle === 1) {
        // Tapered arm (thinner at tip)
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -size * 0.7);
        this.ctx.lineWidth = baseLineWidth * 0.6;
        this.ctx.lineTo(0, -size);
      } else if (particle.armStyle === 2) {
        // Curved arm
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(size * 0.1, -size * 0.5, 0, -size);
      }
      this.ctx.stroke();
      this.ctx.lineWidth = baseLineWidth; // Reset
      
      // First set of branches with variable count
      if (particle.branch1Pos && particle.branch1Length) {
        const branch1Pos = particle.branch1Pos;
        const branch1Length = particle.branch1Length;
        const branch1Angle = particle.branch1Angle || 0;
        const numBranches1 = particle.numBranches1 || 2;
        
        for (let b = 0; b < numBranches1; b++) {
          const angleOffset = branch1Angle + (b - (numBranches1 - 1) / 2) * 0.3;
          const branchX = Math.sin(angleOffset) * size * branch1Length;
          const branchY = Math.cos(angleOffset) * size * branch1Length;
          
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size * branch1Pos);
          this.ctx.lineTo(branchX, -size * branch1Pos - branchY);
          this.ctx.stroke();
          
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size * branch1Pos);
          this.ctx.lineTo(-branchX, -size * branch1Pos - branchY);
          this.ctx.stroke();
        }
      }
      
      // Second set of branches
      if (particle.branch2Pos && particle.branch2Length) {
        const branch2Pos = particle.branch2Pos;
        const branch2Length = particle.branch2Length;
        const branch2Angle = particle.branch2Angle || 0;
        const numBranches2 = particle.numBranches2 || 2;
        
        for (let b = 0; b < numBranches2; b++) {
          const angleOffset = branch2Angle + (b - (numBranches2 - 1) / 2) * 0.25;
          const branchX = Math.sin(angleOffset) * size * branch2Length;
          const branchY = Math.cos(angleOffset) * size * branch2Length;
          
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size * branch2Pos);
          this.ctx.lineTo(branchX, -size * branch2Pos - branchY);
          this.ctx.stroke();
          
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size * branch2Pos);
          this.ctx.lineTo(-branchX, -size * branch2Pos - branchY);
          this.ctx.stroke();
        }
      }
      
      // Third set of branches (if exists)
      if (particle.branch3Pos && particle.branch3Pos > 0 && particle.branch3Length) {
        const branch3Pos = particle.branch3Pos;
        const branch3Length = particle.branch3Length;
        const branch3Angle = particle.branch3Angle || 0;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size * branch3Pos);
        const branch3X = Math.sin(branch3Angle) * size * branch3Length;
        const branch3Y = Math.cos(branch3Angle) * size * branch3Length;
        this.ctx.lineTo(branch3X, -size * branch3Pos - branch3Y);
        this.ctx.moveTo(0, -size * branch3Pos);
        this.ctx.lineTo(-branch3X, -size * branch3Pos - branch3Y);
        this.ctx.stroke();
      }
      
      // Tip style variations
      if (particle.tipStyle === 0) {
        // Simple point
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(0, -size * (1 + particle.tipLength));
        this.ctx.stroke();
      } else if (particle.tipStyle === 1) {
        // Forked tip
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.05, -size * (1 + particle.tipLength));
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(-size * 0.05, -size * (1 + particle.tipLength));
        this.ctx.stroke();
      } else if (particle.tipStyle === 2) {
        // Star tip
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        for (let t = 0; t < 3; t++) {
          const tipAngle = (t * Math.PI * 2) / 3;
          const tipX = Math.sin(tipAngle) * size * particle.tipLength * 0.5;
          const tipY = Math.cos(tipAngle) * size * particle.tipLength;
          if (t === 0) this.ctx.moveTo(0, -size);
          this.ctx.lineTo(tipX, -size - tipY);
          this.ctx.moveTo(0, -size);
        }
        this.ctx.stroke();
      } else if (particle.tipStyle === 3) {
        // Curved tip
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.quadraticCurveTo(size * 0.08, -size * (1 + particle.tipLength * 0.5), 0, -size * (1 + particle.tipLength));
        this.ctx.stroke();
      }
      
      // Decorative patterns
      if (particle.hasDots) {
        this.ctx.fillStyle = color;
        const numDots = Math.floor(Math.random() * 3) + 2; // 2-4 dots
        for (let j = 0; j < numDots; j++) {
          const dotPos = 0.15 + j * (0.7 / numDots);
          this.ctx.beginPath();
          this.ctx.arc(0, -size * dotPos, baseLineWidth * (0.4 + Math.random() * 0.3), 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      
      if (particle.hasSpikes) {
        const numSpikes = Math.floor(Math.random() * 2) + 1; // 1-2 spikes
        for (let j = 0; j < numSpikes; j++) {
          const spikePos = 0.3 + j * 0.35;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size * spikePos);
          this.ctx.lineTo(size * 0.08, -size * spikePos - size * 0.04);
          this.ctx.lineTo(0, -size * spikePos - size * 0.08);
          this.ctx.lineTo(-size * 0.08, -size * spikePos - size * 0.04);
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
      
      if (particle.hasVShapes) {
        const numV = Math.floor(Math.random() * 2) + 1; // 1-2 V shapes
        for (let j = 0; j < numV; j++) {
          const vPos = 0.25 + j * 0.4;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -size * vPos);
          this.ctx.lineTo(size * 0.1, -size * vPos - size * 0.06);
          this.ctx.lineTo(0, -size * vPos - size * 0.12);
          this.ctx.lineTo(-size * 0.1, -size * vPos - size * 0.06);
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }
      
      this.ctx.restore();
      this.ctx.rotate(angleStep);
    }
  }

  drawRainDrop(particle, color) {
    const length = particle.trailLength || particle.size * 12;
    const angle = particle.angle;
    
    // Extract RGB values from rgba color
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    let r, g, b, alpha;
    
    if (rgbaMatch) {
      r = rgbaMatch[1];
      g = rgbaMatch[2];
      b = rgbaMatch[3];
      alpha = parseFloat(rgbaMatch[4] || 1);
    } else {
      // Fallback: try to parse hex
      const hexMatch = particle.color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
      if (hexMatch) {
        r = parseInt(hexMatch[1], 16);
        g = parseInt(hexMatch[2], 16);
        b = parseInt(hexMatch[3], 16);
        alpha = 1;
      } else {
        // Default fallback
        r = 135; g = 206; b = 235; alpha = 1;
      }
    }
    
    // Create gradient for rain streak (fade at top)
    const gradient = this.ctx.createLinearGradient(
      particle.x,
      particle.y,
      particle.x + Math.sin(angle) * length,
      particle.y + Math.cos(angle) * length
    );
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = Math.max(1.5, particle.size * 0.8);
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(particle.x, particle.y);
    this.ctx.lineTo(
      particle.x + Math.sin(angle) * length,
      particle.y + Math.cos(angle) * length
    );
    this.ctx.stroke();
    
    // Add small bright dot at the tip (raindrop)
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    this.ctx.beginPath();
    this.ctx.arc(
      particle.x + Math.sin(angle) * length * 0.1,
      particle.y + Math.cos(angle) * length * 0.1,
      particle.size * 0.3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  drawLeaf(particle, color) {
    const size = particle.size;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = Math.max(1, size / 15);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    
    // Draw different leaf shapes with more detail
    if (particle.leafType === 0) {
      // Maple-like leaf with lobes
      this.ctx.moveTo(0, -size);
      // Left side
      this.ctx.quadraticCurveTo(-size * 0.4, -size * 0.5, -size * 0.7, -size * 0.2);
      this.ctx.quadraticCurveTo(-size * 0.8, size * 0.1, -size * 0.6, size * 0.4);
      this.ctx.quadraticCurveTo(-size * 0.4, size * 0.6, -size * 0.2, size * 0.7);
      this.ctx.quadraticCurveTo(-size * 0.1, size * 0.8, 0, size);
      // Right side
      this.ctx.quadraticCurveTo(size * 0.1, size * 0.8, size * 0.2, size * 0.7);
      this.ctx.quadraticCurveTo(size * 0.4, size * 0.6, size * 0.6, size * 0.4);
      this.ctx.quadraticCurveTo(size * 0.8, size * 0.1, size * 0.7, -size * 0.2);
      this.ctx.quadraticCurveTo(size * 0.4, -size * 0.5, 0, -size);
    } else if (particle.leafType === 1) {
      // Oval/elliptical leaf
      this.ctx.ellipse(0, 0, size * 0.5, size * 0.8, 0, 0, Math.PI * 2);
    } else {
      // Simple teardrop leaf
      this.ctx.moveTo(0, -size);
      this.ctx.quadraticCurveTo(-size * 0.35, -size * 0.1, -size * 0.5, size * 0.3);
      this.ctx.quadraticCurveTo(-size * 0.3, size * 0.6, 0, size);
      this.ctx.quadraticCurveTo(size * 0.3, size * 0.6, size * 0.5, size * 0.3);
      this.ctx.quadraticCurveTo(size * 0.35, -size * 0.1, 0, -size);
    }
    
    this.ctx.fill();
    
    // Add leaf vein (main stem)
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size * 0.9);
    this.ctx.lineTo(0, size * 0.9);
    this.ctx.stroke();
    
    // Add side veins for maple leaf
    if (particle.leafType === 0) {
      this.ctx.beginPath();
      // Left veins
      this.ctx.moveTo(0, -size * 0.3);
      this.ctx.lineTo(-size * 0.3, -size * 0.1);
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(-size * 0.4, size * 0.2);
      this.ctx.moveTo(0, size * 0.3);
      this.ctx.lineTo(-size * 0.3, size * 0.5);
      // Right veins
      this.ctx.moveTo(0, -size * 0.3);
      this.ctx.lineTo(size * 0.3, -size * 0.1);
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(size * 0.4, size * 0.2);
      this.ctx.moveTo(0, size * 0.3);
      this.ctx.lineTo(size * 0.3, size * 0.5);
      this.ctx.stroke();
    }
  }

  updateParticle(particle) {
    const defaults = this.seasonDefaults[this.options.season];
    
    // Calculate base movement with angle
    const vx = Math.sin(particle.angle) * particle.speed;
    const vy = Math.cos(particle.angle) * particle.speed;

    // Season-specific physics
    if (this.options.season === 'winter') {
      // Snowflakes: gentle swaying, slow rotation
      const windEffect = Math.sin(particle.swayOffset + this.frameCount * particle.swaySpeed) * particle.swayAmount;
      particle.x += vx + windEffect + particle.windX;
      particle.y += vy;
      particle.rotation += particle.rotationSpeed;
      // Add slight vertical wobble
      particle.x += Math.sin(this.frameCount * 0.01 + particle.swayOffset) * particle.turbulence;
      
    } else if (this.options.season === 'rainy') {
      // Rain: straight fast fall, no rotation, slight wind angle
      particle.x += vx;
      particle.y += vy;
      // Rain doesn't rotate, but can have slight angle from wind
      // Add slight horizontal drift from wind
      particle.x += particle.windX * 0.5;
      
    } else if (this.options.season === 'fall') {
      // Leaves: simple fall, no physics
      particle.x += vx;
      particle.y += vy;
      particle.rotation += particle.rotationSpeed;
    }

    // Reset particle when it goes off screen
    if (particle.y > this.canvas.height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * this.canvas.width;
      // Reset some properties for variety
      if (this.options.season === 'fall') {
        // Simple reset, no physics properties
      }
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

