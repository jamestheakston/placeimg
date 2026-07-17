# Placeimg

<img src="favicon.svg" alt="Placeimg Logo" width="32" height="32" />

A free placeholder image service for web development and design.

## Features

- Dynamic SVG image generation
- Custom dimensions (1x1 to 4000x4000)
- Custom colors (hex or CSS names)
- Custom text with multiline support
- Transparent backgrounds
- Custom text colors
- Custom fonts
- Retina support (@2x, @3x)
- Multiple format extensions (.png, .jpg, .gif, .webp, .avif)
- CDN caching for fast delivery

## Usage

### Basic

```
https://placeimg.pages.dev/{width}/{height}
```

### With Color

```
https://placeimg.pages.dev/{width}/{height}?color={hex}
```

### With Text

```
https://placeimg.pages.dev/{width}/{height}?text={text}
```

### Color/Text Format

```
https://placeimg.pages.dev/{bgcolor}/{textcolor}
```

### Retina

```
https://placeimg.pages.dev/{width}/{height}@{scale}x
```

### Format Extension

```
https://placeimg.pages.dev/{width}/{height}.{format}
```

## Parameters

- `width`: Image width in pixels (1-4000)
- `height`: Image height in pixels (1-4000)
- `color`: Background color in hex or CSS name (default: cccccc)
- `text`: Custom text to display (default: dimensions)
- `textColor`: Text color in hex or CSS name (default: auto-contrast)
- `font`: Font family (default: Arial)
- `transparent`: Transparent background (default: false)

## Examples

- `https://placeimg.pages.dev/640/480` - 640x480 image
- `https://placeimg.pages.dev/640/480?color=ff5733` - Orange background
- `https://placeimg.pages.dev/640/480?text=Hello` - Custom text
- `https://placeimg.pages.dev/blue/white` - Color/text format
- `https://placeimg.pages.dev/640/480@2x` - Retina 2x
- `https://placeimg.pages.dev/640/480.png` - PNG format

## License

MIT License - Free to use for any purpose.
