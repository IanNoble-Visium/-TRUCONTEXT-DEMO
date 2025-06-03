#!/usr/bin/env python3
"""
PNG to SVG Converter for TruContext Demo Icons

This script converts PNG icons to SVG format for better scalability and animation.
It uses multiple methods to ensure the best possible conversion quality.

Requirements:
    pip install Pillow cairosvg potrace-python opencv-python

Usage:
    python convert_png_to_svg.py [input_dir] [output_dir]
    
Example:
    python convert_png_to_svg.py public/icons public/icons-svg
"""

import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageOps
import base64
import io

def create_svg_from_png_embed(png_path, svg_path, optimize=True):
    """
    Create SVG by embedding PNG as base64 data URI.
    This preserves the original image quality but doesn't create true vectors.
    """
    try:
        # Open and optimize the PNG
        with Image.open(png_path) as img:
            # Convert to RGBA if not already
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Optimize size if requested
            if optimize:
                # Remove unnecessary transparency
                img = ImageOps.expand(img, border=0)
                # Resize if too large (optional)
                if img.width > 512 or img.height > 512:
                    img.thumbnail((512, 512), Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG', optimize=True)
            img_data = base64.b64encode(buffer.getvalue()).decode()
            
            # Create SVG wrapper
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{img.width}" 
     height="{img.height}" 
     viewBox="0 0 {img.width} {img.height}">
  <image x="0" y="0" 
         width="{img.width}" 
         height="{img.height}" 
         xlink:href="data:image/png;base64,{img_data}"/>
</svg>'''
            
            # Write SVG file
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            
            return True
            
    except Exception as e:
        print(f"Error embedding PNG {png_path}: {e}")
        return False

def create_svg_with_potrace(png_path, svg_path):
    """
    Convert PNG to true vector SVG using potrace.
    Requires potrace to be installed on the system.
    """
    try:
        # First convert PNG to PBM (bitmap) format that potrace can read
        temp_pbm = str(svg_path).replace('.svg', '.pbm')
        
        # Open image and convert to 1-bit black and white
        with Image.open(png_path) as img:
            # Convert to grayscale first
            img = img.convert('L')
            # Convert to 1-bit black and white
            img = img.convert('1')
            # Save as PBM
            img.save(temp_pbm)
        
        # Use potrace to convert PBM to SVG
        result = subprocess.run([
            'potrace', temp_pbm, '-s', '-o', str(svg_path)
        ], capture_output=True, text=True)
        
        # Clean up temporary file
        if os.path.exists(temp_pbm):
            os.remove(temp_pbm)
        
        if result.returncode == 0:
            return True
        else:
            print(f"Potrace error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error with potrace conversion {png_path}: {e}")
        return False

def has_potrace():
    """Check if potrace is available on the system."""
    try:
        subprocess.run(['potrace', '--version'], 
                      capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def convert_icons(input_dir, output_dir, use_potrace=False):
    """
    Convert all PNG files in input_dir to SVG files in output_dir.
    
    Args:
        input_dir: Directory containing PNG files
        output_dir: Directory to save SVG files
        use_potrace: Whether to use potrace for true vector conversion
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Get all PNG files
    png_files = list(input_path.glob('*.png'))
    
    if not png_files:
        print(f"No PNG files found in {input_dir}")
        return
    
    print(f"Found {len(png_files)} PNG files to convert")
    print(f"Output directory: {output_dir}")
    print(f"Conversion method: {'Potrace (vector)' if use_potrace else 'Embedded PNG'}")
    print("-" * 50)
    
    converted = 0
    failed = 0
    
    for png_file in png_files:
        svg_file = output_path / (png_file.stem + '.svg')
        print(f"Converting {png_file.name} -> {svg_file.name}")
        
        success = False
        if use_potrace:
            success = create_svg_with_potrace(png_file, svg_file)
            if not success:
                print(f"  Potrace failed, falling back to embedded method...")
                success = create_svg_from_png_embed(png_file, svg_file)
        else:
            success = create_svg_from_png_embed(png_file, svg_file)
        
        if success:
            converted += 1
            print(f"  ✓ Success")
        else:
            failed += 1
            print(f"  ✗ Failed")
    
    print("-" * 50)
    print(f"Conversion complete: {converted} successful, {failed} failed")
    
    # Generate usage examples
    if converted > 0:
        print("\nGenerated SVG files can be used in React like this:")
        print("```jsx")
        print("import { ReactComponent as ServerIcon } from './icons-svg/server.svg'")
        print("// or")
        print('<img src="/icons-svg/server.svg" alt="Server" width="24" height="24" />')
        print("```")

def main():
    """Main function to handle command line arguments and run conversion."""
    # Default directories
    default_input = "public/icons"
    default_output = "public/icons-svg"
    
    # Parse command line arguments
    if len(sys.argv) >= 2:
        input_dir = sys.argv[1]
    else:
        input_dir = default_input
    
    if len(sys.argv) >= 3:
        output_dir = sys.argv[2]
    else:
        output_dir = default_output
    
    # Check if input directory exists
    if not os.path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist")
        print(f"Usage: python {sys.argv[0]} [input_dir] [output_dir]")
        return 1
    
    # Check for potrace availability
    use_potrace = has_potrace()
    if use_potrace:
        print("✓ Potrace found - will use vector conversion")
    else:
        print("⚠ Potrace not found - will use PNG embedding method")
        print("  To install potrace:")
        print("  - Ubuntu/Debian: sudo apt-get install potrace")
        print("  - macOS: brew install potrace")
        print("  - Windows: Download from http://potrace.sourceforge.net/")
    
    print()
    
    # Run conversion
    convert_icons(input_dir, output_dir, use_potrace)
    return 0

if __name__ == "__main__":
    sys.exit(main()) 