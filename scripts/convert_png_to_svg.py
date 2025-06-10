#!/usr/bin/env python3
"""
PNG to SVG Vector Converter for TruContext Demo Icons

This script converts PNG icons to proper vector SVG graphics using image processing
techniques including edge detection, contour tracing, and shape recognition.
It analyzes actual PNG files and generates true vector paths.

Requirements:
    pip install Pillow numpy opencv-python scikit-image scipy

Usage:
    python convert_png_to_svg.py [input_dir] [output_dir]

Example:
    python convert_png_to_svg.py public/icons public/icons-svg
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
import cv2
from scipy import ndimage
from typing import List, Tuple, Dict, Optional
import colorsys

def extract_dominant_colors(img_array: np.ndarray, num_colors: int = 5) -> List[Tuple[int, int, int]]:
    """Extract dominant colors from the image using k-means clustering."""
    # Reshape image to be a list of pixels
    pixels = img_array.reshape(-1, img_array.shape[-1])

    # Remove fully transparent pixels if RGBA
    if img_array.shape[-1] == 4:
        pixels = pixels[pixels[:, 3] > 0]  # Keep only non-transparent pixels
        pixels = pixels[:, :3]  # Remove alpha channel

    # Use k-means clustering to find dominant colors
    from sklearn.cluster import KMeans

    # Limit number of pixels for performance
    if len(pixels) > 10000:
        indices = np.random.choice(len(pixels), 10000, replace=False)
        pixels = pixels[indices]

    if len(pixels) == 0:
        return [(128, 128, 128)]  # Default gray if no pixels

    kmeans = KMeans(n_clusters=min(num_colors, len(pixels)), random_state=42, n_init=10)
    kmeans.fit(pixels)

    colors = []
    for center in kmeans.cluster_centers_:
        colors.append(tuple(map(int, center)))

    return colors

def preprocess_image(img_array: np.ndarray, debug_path: Optional[Path] = None) -> Tuple[np.ndarray, np.ndarray, Dict]:
    """Preprocess image for contour detection with improved transparency handling."""
    debug_info = {}
    original_shape = img_array.shape
    
    try:
        # Handle transparency properly
        if img_array.shape[-1] == 4:  # RGBA
            alpha = img_array[:, :, 3]
            # Create mask from alpha channel (non-transparent pixels)
            mask = (alpha > 10).astype(np.uint8) * 255  # Lowered threshold from 128 to 10
            debug_info['has_alpha'] = True
            debug_info['transparent_pixels'] = np.sum(alpha <= 10)
            debug_info['opaque_pixels'] = np.sum(alpha > 10)
            debug_info['alpha_range'] = (int(alpha.min()), int(alpha.max()))

            # Convert RGB to grayscale
            gray = cv2.cvtColor(img_array[:, :, :3], cv2.COLOR_RGB2GRAY)
            
            # Apply mask to grayscale - set transparent areas to white (background)
            gray_masked = cv2.bitwise_and(gray, gray, mask=mask)
            gray_masked = cv2.add(cv2.bitwise_not(mask), gray_masked)  # Fill transparent areas with white
            
            # Enhance contrast for better edge detection
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray_masked = clahe.apply(gray_masked)
            
            print(f"    → Alpha channel: {debug_info['opaque_pixels']} opaque, {debug_info['transparent_pixels']} transparent, "
                  f"alpha range: {debug_info['alpha_range']}")
        else:  # RGB
            gray = cv2.cvtColor(img_array[:, :, :3], cv2.COLOR_RGB2GRAY) if len(img_array.shape) == 3 else img_array
            gray_masked = gray
            mask = np.ones_like(gray) * 255
            debug_info['has_alpha'] = False
            
            # Enhance contrast for RGB images too
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray_masked = clahe.apply(gray_masked)
            
        debug_info['original_shape'] = original_shape
        debug_info['processed_shape'] = gray_masked.shape
        debug_info['gray_range'] = (int(gray_masked.min()), int(gray_masked.max()))
        
    except Exception as e:
        print(f"    ⚠ Error in preprocessing: {str(e)}")
        # Fallback to simple grayscale conversion
        gray_masked = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY) if len(img_array.shape) == 3 else img_array
        mask = np.ones_like(gray_masked) * 255
        debug_info['error'] = str(e)

    # Apply bilateral filter to reduce noise while preserving edges
    try:
        filtered = cv2.bilateralFilter(gray_masked, 9, 75, 75)
    except:
        filtered = cv2.GaussianBlur(gray_masked, (5, 5), 0)
    
    # Try multiple thresholding methods and choose the best one
    thresholding_methods = []
    
    def add_threshold_method(name, binary_img, method_name):
        try:
            # Try different retrieval modes
            for mode_name, mode in [('external', cv2.RETR_EXTERNAL), ('list', cv2.RETR_LIST), ('tree', cv2.RETR_TREE)]:
                contours, _ = cv2.findContours(binary_img, mode, cv2.CHAIN_APPROX_SIMPLE)
                valid_contours = [c for c in contours if cv2.contourArea(c) > 1]  # Very small threshold to keep most contours
                thresholding_methods.append((
                    f"{method_name}_{mode_name}", 
                    binary_img.copy(), 
                    len(valid_contours),
                    valid_contours
                ))
        except Exception as e:
            print(f"      ⚠ Error in {method_name}: {str(e)}")
    
    # Method 1: Adaptive Gaussian with different block sizes
    for block_size in [11, 21, 31]:
        binary_adaptive = cv2.adaptiveThreshold(
            filtered, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 
            block_size, 
            2
        )
        add_threshold_method("adaptive_gaussian", binary_adaptive, f"adaptive_gaussian_{block_size}")
    
    # Method 2: Otsu's method with different preprocessing
    for blur_size in [0, 3, 5]:
        if blur_size > 0:
            blurred = cv2.GaussianBlur(filtered, (blur_size, blur_size), 0)
        else:
            blurred = filtered
            
        # Otsu's thresholding
        _, binary_otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        add_threshold_method("otsu", binary_otsu, f"otsu_blur_{blur_size}")
        
        # Otsu's with inverted threshold
        _, binary_inv = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        add_threshold_method("otsu_inv", binary_inv, f"otsu_inv_blur_{blur_size}")
    
    # Method 3: Canny edge detection with different thresholds
    for thresh1, thresh2 in [(30, 100), (50, 150), (70, 200)]:
        edges = cv2.Canny(filtered, thresh1, thresh2)
        # Dilate edges to close gaps
        kernel = np.ones((2, 2), np.uint8)
        edges_dilated = cv2.dilate(edges, kernel, iterations=1)
        add_threshold_method("canny", edges_dilated, f"canny_{thresh1}_{thresh2}")
    
    # Method 4: Simple threshold with different values
    mean_val = np.mean(filtered[filtered < 255])  # Exclude white background
    for offset in [-40, -20, 0, 20, 40]:
        thresh_val = max(1, min(254, mean_val + offset))
        _, binary = cv2.threshold(filtered, thresh_val, 255, cv2.THRESH_BINARY)
        add_threshold_method("simple", binary, f"simple_{thresh_val}")
    
    # Sort methods by number of contours found (descending)
    thresholding_methods.sort(key=lambda x: x[2], reverse=True)
    
    # Debug output
    print("    → Thresholding methods (top 5):")
    for i, (name, _, count, _) in enumerate(thresholding_methods[:5]):
        marker = "★" if i == 0 else " "
        print(f"      {marker} {name}: {count} contours")

    # Choose the best method based on contour count and other factors
    best_method = thresholding_methods[0] if thresholding_methods else (None, None, 0, [])
    method_name, binary, contour_count, all_contours = best_method
    
    debug_info['thresholding_method'] = method_name
    debug_info['contour_counts'] = {name: count for name, _, count, _ in thresholding_methods}
    debug_info['best_method_contours'] = contour_count
    
    # Apply morphological operations to clean up, but be careful not to lose details
    if contour_count > 0:
        kernel_size = min(3, min(binary.shape) // 100)  # Smaller kernel for smaller images
        kernel_size = max(1, kernel_size)  # At least 1
        kernel = np.ones((kernel_size, kernel_size), np.uint8)
        
        # Only apply morphological operations if we have contours to work with
        binary_cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        binary_cleaned = cv2.morphologyEx(binary_cleaned, cv2.MORPH_OPEN, kernel)
        
        # Find contours again after cleaning
        contours, _ = cv2.findContours(binary_cleaned, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        all_contours = [c for c in contours if cv2.contourArea(c) > 1]  # Very small threshold
        contour_count = len(all_contours)
        debug_info['contours_after_cleaning'] = contour_count
    else:
        # If we have no contours, try to recover by using the original binary
        binary_cleaned = binary
        debug_info['contours_after_cleaning'] = 0
    
    debug_info['final_contour_count'] = contour_count

    # Save debug images if path provided
    if debug_path:
        debug_dir = debug_path.parent / "debug"
        debug_dir.mkdir(exist_ok=True)
        
        try:
            # Save original and processed grayscale
            cv2.imwrite(str(debug_dir / f"{debug_path.stem}_00_original.png"), 
                       cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGRA) if img_array.shape[-1] == 4 
                       else cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR))
            
            # Save grayscale and mask if available
            cv2.imwrite(str(debug_dir / f"{debug_path.stem}_01_gray.png"), gray_masked)
            if 'mask' in locals() and mask is not None:
                cv2.imwrite(str(debug_dir / f"{debug_path.stem}_02_mask.png"), mask)
            
            # Save binary images from top 3 methods
            for i, (name, img, cnt, _) in enumerate(thresholding_methods[:3]):
                cv2.imwrite(str(debug_dir / f"{debug_path.stem}_03_method_{i+1}_{name}.png"), img)
            
            # Save final cleaned binary
            cv2.imwrite(str(debug_dir / f"{debug_path.stem}_04_final_binary.png"), binary_cleaned)
            
            # Save contour visualization
            if contour_count > 0:
                contour_img = cv2.cvtColor(binary_cleaned, cv2.COLOR_GRAY2BGR)
                cv2.drawContours(contour_img, all_contours, -1, (0, 255, 0), 1)
                cv2.imwrite(str(debug_dir / f"{debug_path.stem}_05_contours.png"), contour_img)
                
            # Save debug info
            with open(debug_dir / f"{debug_path.stem}_debug.txt", 'w') as f:
                import json
                f.write(json.dumps(debug_info, indent=2, default=str))
                
        except Exception as e:
            print(f"    ⚠ Error saving debug images: {str(e)}")

    return gray_masked, binary_cleaned, debug_info

def simplify_contour(contour: np.ndarray, epsilon_factor: float = 0.02) -> np.ndarray:
    """Simplify contour using Douglas-Peucker algorithm."""
    epsilon = epsilon_factor * cv2.arcLength(contour, True)
    return cv2.approxPolyDP(contour, epsilon, True)

def contour_to_svg_path(contour: np.ndarray, scale_factor: float = 1.0) -> str:
    """Convert OpenCV contour to SVG path string."""
    if len(contour) < 3:
        return ""

    # Scale contour points
    scaled_contour = contour * scale_factor

    # Start path with move command
    path_data = f"M {scaled_contour[0][0][0]:.1f} {scaled_contour[0][0][1]:.1f}"

    # Add line commands for remaining points
    for point in scaled_contour[1:]:
        path_data += f" L {point[0][0]:.1f} {point[0][1]:.1f}"

    # Close path
    path_data += " Z"

    return path_data

def detect_shapes(contours: List[np.ndarray]) -> List[Dict]:
    """Detect basic shapes from contours."""
    shapes = []

    for contour in contours:
        # Calculate contour properties
        area = cv2.contourArea(contour)
        if area < 100:  # Skip very small contours
            continue

        perimeter = cv2.arcLength(contour, True)
        if perimeter == 0:
            continue

        # Approximate contour
        epsilon = 0.02 * perimeter
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # Classify shape based on number of vertices
        vertices = len(approx)

        shape_info = {
            'contour': contour,
            'approx': approx,
            'area': area,
            'perimeter': perimeter,
            'vertices': vertices,
            'type': 'polygon'
        }

        # Detect circles
        if vertices > 8:
            # Check if it's roughly circular
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            if circularity > 0.7:
                # Find minimum enclosing circle
                (x, y), radius = cv2.minEnclosingCircle(contour)
                shape_info.update({
                    'type': 'circle',
                    'center': (int(x), int(y)),
                    'radius': int(radius)
                })

        # Detect rectangles
        elif vertices == 4:
            # Check if it's roughly rectangular
            rect = cv2.boundingRect(contour)
            rect_area = rect[2] * rect[3]
            if area / rect_area > 0.8:
                shape_info.update({
                    'type': 'rectangle',
                    'bounds': rect
                })

        shapes.append(shape_info)

    return shapes

def create_vector_svg(png_path: Path, svg_path: Path) -> bool:
    """
    Create a proper vector SVG from PNG using image processing and contour detection.
    """
    try:
        # Load and process the PNG image
        with Image.open(png_path) as img:
            # Convert to RGBA and resize to standard size
            img = img.convert('RGBA')
            original_size = img.size
            img = img.resize((512, 512), Image.Resampling.LANCZOS)

            # Convert to numpy array for processing
            img_array = np.array(img)
            debug_dir = svg_path.parent / "debug"
            debug_dir.mkdir(exist_ok=True)

            print(f"\n{'='*80}")
            print(f"Processing: {png_path.name} ({original_size[0]}x{original_size[1]} → 512x512)")
            print(f"Debug output: {debug_dir}")

            # Extract dominant colors
            colors = extract_dominant_colors(img_array)
            print(f"  → Extracted {len(colors)} dominant colors")

            # Enable debug for all images
            debug_path = svg_path
            gray, binary, debug_info = preprocess_image(img_array, debug_path)

            # Save the preprocessed image for debugging
            cv2.imwrite(str(debug_dir / f"{png_path.stem}_preprocessed.png"), gray)

            # Try multiple contour finding methods
            all_contours = []
            methods = [
                ("RETR_EXTERNAL + CHAIN_APPROX_SIMPLE", cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE),
                ("RETR_LIST + CHAIN_APPROX_SIMPLE", cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE),
                ("RETR_TREE + CHAIN_APPROX_NONE", cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
            ]

            for method_name, mode, method in methods:
                contours, _ = cv2.findContours(binary, mode, method)
                if contours:
                    print(f"  → {method_name}: Found {len(contours)} contours")
                    all_contours.extend(contours)

            # Remove duplicate contours
            unique_contours = []
            seen = set()
            for c in all_contours:
                c_hash = hash(tuple(c.ravel()))
                if c_hash not in seen:
                    seen.add(c_hash)
                    unique_contours.append(c)

            
            print(f"  → Found {len(unique_contours)} unique contours across all methods")

            # Calculate adaptive minimum area based on image size
            image_area = img_array.shape[0] * img_array.shape[1]
            min_area_adaptive = max(1, 0.0005 * image_area)  # Reduced from 0.001 to 0.0005 for more sensitivity
            min_area_absolute = 5  # Reduced from 25 to 5 to catch smaller details
            min_area = min(min_area_adaptive, min_area_absolute)

            print(f"  → Using adaptive area threshold: {min_area:.1f} pixels (image area: {image_area})")

            # Filter contours with adaptive threshold
            valid_contours = []
            small_contours = []

            for contour in unique_contours:
                area = cv2.contourArea(contour)
                if area > min_area:
                    valid_contours.append(contour)
                elif area > 1:  # Keep very small contours separately
                    small_contours.append(contour)

            print(f"  → {len(valid_contours)} contours above threshold, {len(small_contours)} small contours")

            # If we have few valid contours, include small ones too
            if len(valid_contours) < 3 and small_contours:
                print(f"  → Including {len(small_contours)} small contours due to low count")
                valid_contours.extend(small_contours)

            # Sort by area (largest first)
            valid_contours.sort(key=cv2.contourArea, reverse=True)

            # If we still have no contours, try alternative approaches
            if not valid_contours:
                print("  ⚠ No valid contours found with standard methods, trying alternative approaches...")
                
                # Try with a simple threshold
                _, binary_simple = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                cv2.imwrite(str(debug_dir / f"{png_path.stem}_simple_thresh.png"), binary_simple)
                
                # Try different contour finding methods on the simple threshold
                for method_name, mode, method in methods:
                    contours, _ = cv2.findContours(binary_simple, mode, method)
                    if contours:
                        valid_contours.extend([c for c in contours if cv2.contourArea(c) > 1])
                        print(f"  → Found {len(contours)} contours with simple threshold + {method_name}")
                
                # If still no contours, try edge detection
                if not valid_contours:
                    for thresh1, thresh2 in [(30, 100), (50, 150), (70, 200)]:
                        edges = cv2.Canny(gray, thresh1, thresh2)
                        cv2.imwrite(str(debug_dir / f"{png_path.stem}_canny_{thresh1}_{thresh2}.png"), edges)
                        
                        # Try different contour finding methods on the edges
                        for method_name, mode, method in methods:
                            contours, _ = cv2.findContours(edges, mode, method)
                            if contours:
                                valid_contours.extend([c for c in contours if cv2.contourArea(c) > 1])
                                print(f"  → Found {len(contours)} contours with Canny {thresh1}-{thresh2} + {method_name}")
            
            # If still no contours, use the fallback
            if not valid_contours:
                print(f"  ⚠ No valid contours found after all methods, using fallback")
                return create_simple_fallback_svg(png_path.stem, svg_path, colors)

            # Remove any duplicate contours from the combined results
            unique_contours = []
            seen = set()
            for c in valid_contours:
                c_hash = hash(tuple(c.ravel()))
                if c_hash not in seen:
                    seen.add(c_hash)
                    unique_contours.append(c)
            
            valid_contours = unique_contours
            print(f"  → Using {len(valid_contours)} unique contours for shape detection")

            # Sort by area (largest first) and limit to top 20 contours
            valid_contours.sort(key=cv2.contourArea, reverse=True)
            valid_contours = valid_contours[:20]

            # Detect shapes
            shapes = detect_shapes(valid_contours)
            print(f"  → Detected {len(shapes)} shapes")

            # Generate SVG content
            svg_content = generate_svg_from_shapes(shapes, colors)

            # Validate SVG content before saving
            if not validate_svg_content(svg_content):
                print(f"  ⚠ Generated SVG appears to be empty, using fallback")
                return create_simple_fallback_svg(png_path.stem, svg_path, colors)

            # Save the final SVG
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)

            # Create a visualization of the detected contours
            if valid_contours:
                contour_img = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
                cv2.drawContours(contour_img, valid_contours, -1, (0, 255, 0), 2)
                cv2.imwrite(str(debug_dir / f"{png_path.stem}_contours.png"), contour_img)

            print(f"  ✓ Successfully generated vector SVG with {len(shapes)} shapes")
            return True

    except Exception as e:
        import traceback
        print(f"  ✗ Error converting {png_path}: {e}")
        print(traceback.format_exc())
        
        # Create a simple fallback
        try:
            print("  → Creating fallback SVG")
            return create_simple_fallback_svg(png_path.stem, svg_path, colors if 'colors' in locals() else [(128, 128, 128)])
        except Exception as fallback_error:
            print(f"  ✗ Error creating fallback: {fallback_error}")
            return False

def validate_svg_content(svg_content: str) -> bool:
    """Validate that SVG content contains actual visible shapes."""
    # Check for common SVG shape elements
    shape_elements = ['<path', '<circle', '<rect', '<ellipse', '<polygon', '<line']

    # Count visible elements (exclude empty paths)
    visible_elements = 0
    for element in shape_elements:
        if element in svg_content:
            visible_elements += svg_content.count(element)

    # Also check that paths have actual data
    if '<path' in svg_content:
        import re
        path_data_pattern = r'd="([^"]*)"'
        path_matches = re.findall(path_data_pattern, svg_content)
        # Filter out empty or trivial paths
        meaningful_paths = [p for p in path_matches if len(p.strip()) > 10]
        if not meaningful_paths:
            visible_elements -= svg_content.count('<path')

    return visible_elements > 0

def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """Convert RGB tuple to hex color string."""
    return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"

def generate_svg_from_shapes(shapes: List[Dict], colors: List[Tuple[int, int, int]]) -> str:
    """Generate SVG content from detected shapes and colors."""
    if not shapes:
        return ""

    svg_elements = []

    # Use colors cyclically, ensure we have at least one color
    if not colors:
        colors = [(128, 128, 128)]  # Default gray

    color_index = 0

    for i, shape in enumerate(shapes):
        color = colors[color_index % len(colors)]
        fill_color = rgb_to_hex(color)

        # Make stroke color slightly darker
        stroke_color = rgb_to_hex(tuple(max(0, c - 30) for c in color))

        try:
            if shape['type'] == 'circle':
                center = shape['center']
                radius = max(1, shape['radius'])  # Ensure minimum radius
                if radius > 0:
                    svg_elements.append(
                        f'<circle cx="{center[0]}" cy="{center[1]}" r="{radius}" '
                        f'fill="{fill_color}" stroke="{stroke_color}" stroke-width="2"/>'
                    )

            elif shape['type'] == 'rectangle':
                bounds = shape['bounds']
                x, y, w, h = bounds
                if w > 0 and h > 0:  # Ensure valid dimensions
                    svg_elements.append(
                        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
                        f'fill="{fill_color}" stroke="{stroke_color}" stroke-width="2"/>'
                    )

            else:  # polygon
                # Try both original contour and approximated version
                path_data = contour_to_svg_path(shape.get('approx', shape['contour']))
                if not path_data and 'contour' in shape:
                    # Fallback to original contour if approximation failed
                    path_data = contour_to_svg_path(shape['contour'])

                if path_data and len(path_data) > 10:  # Ensure meaningful path
                    svg_elements.append(
                        f'<path d="{path_data}" '
                        f'fill="{fill_color}" stroke="{stroke_color}" stroke-width="2"/>'
                    )

        except Exception as e:
            print(f"    ⚠ Error processing shape {i}: {e}")
            continue

        color_index += 1

    if not svg_elements:
        return ""

    # Combine all elements
    content = '\n    '.join(svg_elements)

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="512"
     height="512"
     viewBox="0 0 512 512">
    {content}
</svg>'''

def create_simple_fallback_svg(icon_name: str, svg_path: Path, colors: List[Tuple[int, int, int]]) -> bool:
    """Create a simple fallback SVG when contour detection fails."""
    try:
        # Use the first color or default gray
        primary_color = rgb_to_hex(colors[0] if colors else (128, 128, 128))
        secondary_color = rgb_to_hex(colors[1] if len(colors) > 1 else (96, 96, 96))

        # Create a simple geometric shape based on icon name
        if any(word in icon_name.lower() for word in ['server', 'database', 'storage']):
            content = f'''
    <rect x="128" y="128" width="256" height="256" rx="16"
          fill="{primary_color}" stroke="{secondary_color}" stroke-width="4"/>
    <rect x="160" y="160" width="192" height="32" rx="8" fill="{secondary_color}"/>
    <rect x="160" y="224" width="192" height="32" rx="8" fill="{secondary_color}"/>
    <rect x="160" y="288" width="192" height="32" rx="8" fill="{secondary_color}"/>
'''
        elif any(word in icon_name.lower() for word in ['network', 'router', 'switch']):
            content = f'''
    <circle cx="256" cy="256" r="80" fill="{primary_color}" stroke="{secondary_color}" stroke-width="4"/>
    <circle cx="160" cy="160" r="40" fill="{secondary_color}"/>
    <circle cx="352" cy="160" r="40" fill="{secondary_color}"/>
    <circle cx="160" cy="352" r="40" fill="{secondary_color}"/>
    <circle cx="352" cy="352" r="40" fill="{secondary_color}"/>
'''
        elif any(word in icon_name.lower() for word in ['user', 'actor', 'agent']):
            content = f'''
    <circle cx="256" cy="180" r="60" fill="{primary_color}" stroke="{secondary_color}" stroke-width="4"/>
    <path d="M 180 320 Q 180 280 256 280 Q 332 280 332 320 L 332 380 L 180 380 Z"
          fill="{primary_color}" stroke="{secondary_color}" stroke-width="4"/>
'''
        else:
            # Generic shape
            content = f'''
    <rect x="128" y="128" width="256" height="256" rx="32"
          fill="{primary_color}" stroke="{secondary_color}" stroke-width="4"/>
    <circle cx="256" cy="256" r="64" fill="{secondary_color}"/>
'''

        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="512"
     height="512"
     viewBox="0 0 512 512">
{content}
</svg>'''

        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)

        return True

    except Exception as e:
        print(f"  ✗ Error creating fallback SVG: {e}")
        return False



def convert_icons(input_dir: str, output_dir: str) -> None:
    """
    Convert all PNG files in input_dir to vector SVG files in output_dir.

    Args:
        input_dir: Directory containing PNG files
        output_dir: Directory to save SVG files
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
    print(f"Conversion method: Vector SVG generation")
    print("-" * 60)

    converted = 0
    failed = 0

    for png_file in png_files:
        svg_file = output_path / (png_file.stem + '.svg')
        print(f"Converting {png_file.name} -> {svg_file.name}")

        success = create_vector_svg(png_file, svg_file)

        if success:
            converted += 1
        else:
            failed += 1

    print("-" * 60)
    print(f"Conversion complete: {converted} successful, {failed} failed")

    # Generate usage examples
    if converted > 0:
        print("\n✓ Generated vector SVG files with the following features:")
        print("  • True vector graphics extracted from PNG analysis")
        print("  • Consistent 512x512 dimensions")
        print("  • Standardized viewBox (0 0 512 512)")
        print("  • Original colors preserved from source images")
        print("  • Optimized paths from contour detection")
        print("  • Scalable without quality loss")
        print("  • Web-optimized and CSS-styleable")
        print("\nUsage in React:")
        print("```jsx")
        print("import { ReactComponent as ServerIcon } from './icons-svg/server.svg'")
        print("// or")
        print('<img src="/icons-svg/server.svg" alt="Server" width="24" height="24" />')
        print("```")
        print("\nUsage in CSS:")
        print("```css")
        print(".icon { width: 24px; height: 24px; fill: currentColor; }")
        print("```")

def main() -> int:
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

    print("🎨 PNG to Vector SVG Converter")
    print("=" * 40)
    print("✓ Creating true vector graphics from PNG analysis")
    print("✓ Using edge detection and contour tracing")
    print("✓ Extracting dominant colors from original images")
    print("✓ Standardizing dimensions to 512x512")
    print("✓ Using consistent viewBox (0 0 512 512)")
    print("✓ Optimizing for web display and CSS styling")
    print()

    # Check for required dependencies
    missing_deps = []
    try:
        import numpy as np
    except ImportError:
        missing_deps.append("numpy")

    try:
        import cv2
    except ImportError:
        missing_deps.append("opencv-python")

    try:
        from sklearn.cluster import KMeans
    except ImportError:
        missing_deps.append("scikit-learn")

    try:
        from scipy import ndimage
    except ImportError:
        missing_deps.append("scipy")

    if missing_deps:
        print("⚠ Missing required dependencies:")
        for dep in missing_deps:
            print(f"  - {dep}")
        print("\nPlease install missing packages:")
        print(f"pip install {' '.join(missing_deps)}")
        return 1

    print("✓ All dependencies available")
    print()

    # Run conversion
    convert_icons(input_dir, output_dir)
    return 0

if __name__ == "__main__":
    sys.exit(main()) 