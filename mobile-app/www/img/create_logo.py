from PIL import Image, ImageDraw
import os

# Create a new white canvas
width, height = 200, 200
img = Image.new('RGBA', (width, height), color=(255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Draw a blue square (box/product)
box_margin = 40
box_color = (41, 128, 185)  # Blue
draw.rectangle(
    [(box_margin, box_margin), (width - box_margin, height - box_margin)],
    fill=box_color
)

# Draw barcode-like lines
barcode_y_start = 70
barcode_height = 60
barcode_widths = [3, 1, 4, 2, 3, 2, 1, 5, 2, 3, 1]
barcode_color = (255, 255, 255)  # White
barcode_x = 55

for width_factor in barcode_widths:
    bar_width = width_factor * 2
    draw.rectangle(
        [(barcode_x, barcode_y_start), (barcode_x + bar_width, barcode_y_start + barcode_height)],
        fill=barcode_color
    )
    barcode_x += bar_width + 4

# Add a small circular badge for a modern look
badge_x, badge_y = 150, 50
badge_radius = 20
badge_color = (231, 76, 60)  # Red
draw.ellipse(
    [(badge_x - badge_radius, badge_y - badge_radius), (badge_x + badge_radius, badge_y + badge_radius)],
    fill=badge_color
)

# Save the image
img.save('logo.png')
print('Logo created successfully!') 