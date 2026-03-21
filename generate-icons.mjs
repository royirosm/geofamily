// generate-icons.mjs
// Run once from the project root to create the two required PWA icon PNGs:
//   public/icons/icon-192.png
//   public/icons/icon-512.png
//
// Usage:
//   node generate-icons.mjs
//
// Requires: npm install -D canvas   (only needed for this one-time script)
// After running, you can uninstall canvas if you prefer: npm uninstall canvas

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

function generateIcon(size) {
  const canvas  = createCanvas(size, size)
  const ctx     = canvas.getContext('2d')
  const cx      = size / 2

  // Background — blue gradient feel, solid for maskable compatibility
  ctx.fillStyle = '#3b82f6'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // Inner circle (lighter blue)
  ctx.fillStyle = '#2563eb'
  ctx.beginPath()
  ctx.arc(cx, cx, size * 0.38, 0, Math.PI * 2)
  ctx.fill()

  // Globe emoji — scale font to icon size
  ctx.font      = `${Math.floor(size * 0.5)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🌍', cx, cx + size * 0.02)

  return canvas.toBuffer('image/png')
}

mkdirSync('public/icons', { recursive: true })

writeFileSync('public/icons/icon-192.png', generateIcon(192))
console.log('✅  public/icons/icon-192.png')

writeFileSync('public/icons/icon-512.png', generateIcon(512))
console.log('✅  public/icons/icon-512.png')

console.log('\nDone! You can now uninstall canvas: npm uninstall canvas')
