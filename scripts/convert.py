#!/usr/bin/env python3
"""
PNG to SVG Converter for TruContext Demo Icons

This script converts PNG icons to SVG format by embedding the PNG data directly
into the SVG. All icons are resized to a consistent size (512x512) while
maintaining their aspect ratio and being centered in the canvas.

Requirements:
    pip install Pillow

Usage:
    python convert_png_to_svg.py [input_dir] [output_dir]

Example:
    python convert_png_to_svg.py public/icons public/icons-svg
"""

import os
import sys
import base64
from pathlib import Path
from PIL import Image
from typing import List, Optional
from io import BytesIO

def create_embedded_svg(png_path: Path, svg_path: Path, target_size: int = 512) -> bool:
    """
    Create an SVG that embeds the original PNG, resized to fit within target_size x target_size
    while maintaining aspect ratio and centered in the canvas.
    """
    try:
        # Open and process the image
        with Image.open(png_path) as img:
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Calculate new dimensions maintaining aspect ratio
            width, height = img.size
            scale = min(target_size / width, target_size / height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            
            # Calculate position to center the image
            x = (target_size - new_width) // 2
            y = (target_size - new_height) // 2
            
            # Resize the image
            img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Create a new image with transparent background
            canvas = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
            canvas.paste(img_resized, (x, y), img_resized)
            
            # Convert to base64
            buffered = BytesIO()
            canvas.save(buffered, format="PNG", optimize=True)
            base64_data = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Create SVG with embedded PNG
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{target_size}" height="{target_size}" viewBox="0 0 {target_size} {target_size}" 
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="{target_size}" height="{target_size}" 
         xlink:href="data:image/png;base64,{base64_data}"/>
</svg>'''
        
        # Ensure output directory exists
        svg_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write to file
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
            
        return True
        
    except Exception as e:
        print(f"  ✗ Error converting {png_path}: {e}")
        return False

def convert_icons(input_dir: str, output_dir: str, target_size: int = 512) -> None:
    """
    Convert all PNG files in input_dir to SVG files in output_dir.
    All SVGs will be target_size x target_size with the original images
    centered and scaled to fit while maintaining aspect ratio.
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Find all PNG files
    png_files = list(input_path.glob('*.png'))
    
    if not png_files:
        print(f"No PNG files found in {input_dir}")
        return
    
    print(f"Found {len(png_files)} PNG files to convert")
    print(f"Output directory: {output_dir}")
    print(f"Target size: {target_size}x{target_size}px")
    print("-" * 60)
    
    # Process each file
    success_count = 0
    for png_file in png_files:
        svg_file = output_path / f"{png_file.stem}.svg"
        print(f"Converting {png_file.name} -> {svg_file.name}")
        
        if create_embedded_svg(png_file, svg_file, target_size):
            success_count += 1
            print(f"  ✓ Successfully created {svg_file.name}")
        else:
            print(f"  ✗ Failed to convert {png_file.name}")
    
    print("-" * 60)
    print(f"Conversion complete: {success_count} successful, {len(png_files) - success_count} failed")

def main() -> None:
    """Main function to handle command line arguments and run conversion."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert PNG icons to SVG with embedded PNG data')
    parser.add_argument('input_dir', help='Directory containing PNG files')
    parser.add_argument('output_dir', help='Directory to save SVG files')
    parser.add_argument('--size', type=int, default=512,
                       help='Target size for the SVG (default: 512)')
    
    args = parser.parse_args()
    
    print("🎨 PNG to SVG Converter")
    print("=" * 40)
    print("✓ Embedding original PNG data in SVG")
    print("✓ Standardizing all icons to the same size")
    print("✓ Maintaining aspect ratio and centering images")
    print("✓ Optimized for web display")
    print()
    
    convert_icons(args.input_dir, args.output_dir, args.size)

if __name__ == "__main__":
    main()