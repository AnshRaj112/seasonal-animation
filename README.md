# Seasonal Animation

A lightweight, customizable npm package for creating beautiful seasonal animations (snow, rain, and falling leaves) that cover the entire screen. Perfect for adding atmospheric effects to your web applications.

## Features

- ❄️ **Winter Mode**: Animated snowflakes with realistic swaying motion
- 🌧️ **Rainy Mode**: Dynamic rain drops with customizable angles
- 🍂 **Fall Mode**: Beautiful falling leaves with multiple leaf shapes
- 🎨 **Fully Customizable**: Control quantity, angle, speed, size, and colors
- 📱 **Responsive**: Automatically adapts to screen size
- 🚀 **Lightweight**: No external dependencies
- 🎯 **Easy to Use**: Simple API with sensible defaults

## Installation

```bash
npm install seasonal-animation
```

## Quick Start

### Basic Usage

```javascript
import SeasonalAnimation from 'seasonal-animation';

// Create a winter snow effect
const animation = new SeasonalAnimation({
  season: 'winter',
  quantity: 50
});

animation.start();
```

### CommonJS

```javascript
const SeasonalAnimation = require('seasonal-animation');

const animation = new SeasonalAnimation({
  season: 'winter',
  quantity: 50
});

animation.start();
```

### Browser (CDN)

```html
<script src="path/to/seasonal-animation/src/index.js"></script>
<script>
  const animation = new SeasonalAnimation({
    season: 'winter',
    quantity: 50
  });
  animation.start();
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `season` | `string` | `'winter'` | Season type: `'winter'`, `'rainy'`, or `'fall'` |
| `quantity` | `number` | `50` | Number of particles to render |
| `angle` | `number` | `0` | Angle in degrees (0 = straight down, 45 = diagonal) |
| `speed` | `number` | `1` | Speed multiplier (1 = normal, 2 = double speed) |
| `size` | `number` | `10` | Base size of particles (overrides season defaults) |
| `color` | `string` | `null` | Custom color (null = season default) |
| `container` | `Element\|string` | `document.body` | Container element or selector |
| `zIndex` | `number` | `1000` | CSS z-index of the canvas |

## Examples

### Winter Snow

```javascript
const snow = new SeasonalAnimation({
  season: 'winter',
  quantity: 100,
  speed: 1.5,
  angle: 0 // Straight down
});

snow.start();
```

### Rain with Angle

```javascript
const rain = new SeasonalAnimation({
  season: 'rainy',
  quantity: 200,
  angle: 15, // Slight angle
  speed: 2,
  color: '#4A90E2' // Custom blue
});

rain.start();
```

### Fall Leaves

```javascript
const leaves = new SeasonalAnimation({
  season: 'fall',
  quantity: 75,
  angle: 5, // Gentle angle
  speed: 1.2,
  color: '#FF6347' // Tomato red
});

leaves.start();
```

### Custom Container

```javascript
const animation = new SeasonalAnimation({
  season: 'winter',
  container: '#my-container', // CSS selector
  quantity: 50
});

animation.start();
```

### Update Options Dynamically

```javascript
const animation = new SeasonalAnimation({
  season: 'winter',
  quantity: 50
});

animation.start();

// Later, update the animation
animation.updateOptions({
  quantity: 100,
  speed: 2
});
```

## API Methods

### `start()`

Starts the animation.

```javascript
animation.start();
```

### `stop()`

Stops the animation.

```javascript
animation.stop();
```

### `destroy()`

Removes the animation canvas and cleans up resources.

```javascript
animation.destroy();
```

### `updateOptions(newOptions)`

Updates the animation options and restarts with new settings.

```javascript
animation.updateOptions({
  quantity: 100,
  speed: 2,
  angle: 15
});
```

## Season-Specific Features

### Winter (`'winter'`)
- Snowflake shapes with 6 arms
- Natural swaying motion
- Default color: White (#FFFFFF)
- Size range: 2-8px

### Rainy (`'rainy'`)
- Line-based rain drops
- Straight or angled fall
- Default color: Sky Blue (#87CEEB)
- Size range: 1-2px

### Fall (`'fall'`)
- Multiple leaf shapes (maple, oval, simple)
- Rotating and swaying motion
- Default color: Dark Orange (#FF8C00)
- Size range: 8-20px

## Important Notes

- **Full Screen Coverage**: The animation always starts from the top and covers the entire screen/viewport, regardless of the angle setting.
- **Performance**: Adjust the `quantity` based on your needs. Higher quantities (200+) may impact performance on slower devices.
- **Container**: The canvas is positioned as `fixed` and covers the entire viewport by default.
- **Responsive**: The animation automatically resizes when the window is resized.

## Browser Support

Works in all modern browsers that support:
- HTML5 Canvas
- `requestAnimationFrame`
- ES6+ JavaScript

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues, please report them on the [GitHub Issues page](https://github.com/AnshRaj112/seasonal-animation/issues).

