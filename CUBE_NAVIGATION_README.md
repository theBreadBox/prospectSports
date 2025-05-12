# 3D Cube Navigation Implementation

This README provides information about the 3D cube navigation system implemented in the Next.js project.

## Overview

The implementation adds a 3D cube navigation system while preserving the existing single-page application functionality. The cube navigation system allows users to navigate to different pages in the application by clicking on the faces of a 3D cube.

## Features

- **Preserved Landing Page**: The original landing page at the root URL (`/`) remains unchanged.
- **Navigation Hub Page**: Added a new page at `/navigate` that displays a 3D interactive cube.
- **Cube Navigation**: Each face of the cube links to a different internal application route.
- **Interactive Controls**: The cube can be rotated and manipulated using OrbitControls.
- **Automatic Animation**: Added subtle automatic rotation to enhance visual appeal.
- **Easy Access**: Added both a navbar link and a prominent button on the main page to access the cube navigation.
- **Placeholder Pages**: Created basic placeholder pages for the target routes.
- **Numbered Faces**: Each cube face displays its corresponding number (1-6) for easy identification.

## Files Created/Modified

### New Files
- `src/app/navigate/page.jsx` - The navigation page displaying the 3D cube
- `src/app/navigate/navigate.module.css` - Styles for the navigation page
- `src/components/CubeNav.jsx` - Modified cube component for navigation
- `src/components/cubenav.module.css` - Styles for the cube component
- `src/app/page1/page.jsx` - Placeholder for Page 1 
- `src/app/page1/page.module.css` - Styles for Page 1
- `src/app/page2/page.jsx` - Placeholder for Page 2
- `src/app/page2/page.module.css` - Styles for Page 2
- `src/app/page3/page.jsx` - Placeholder for Page 3
- `src/app/page3/page.module.css` - Styles for Page 3
- `src/app/page4/page.jsx` - Placeholder for Page 4
- `src/app/page4/page.module.css` - Styles for Page 4
- `src/app/page5/page.jsx` - Placeholder for Page 5
- `src/app/page5/page.module.css` - Styles for Page 5
- `src/app/page6/page.jsx` - Placeholder for Page 6
- `src/app/page6/page.module.css` - Styles for Page 6
- `generate-textures.mjs` - Script to generate numbered cube face textures

### Modified Files
- `src/components/Navbar.jsx` - Added a link to the navigation page
- `src/app/page.tsx` - Added Navbar rendering and a prominent navigation button

## Required Textures

Create the following textures and place them in the `/public/assets/` directory:
- `page1_texture.jpg` - Texture for Page 1 face with "1" in white text
- `page2_texture.jpg` - Texture for Page 2 face with "2" in white text
- `page3_texture.jpg` - Texture for Page 3 face with "3" in white text
- `page4_texture.jpg` - Texture for Page 4 face with "4" in white text
- `page5_texture.jpg` - Texture for Page 5 face with "5" in white text
- `page6_texture.jpg` - Texture for Page 6 face with "6" in white text

## Setup Instructions

1. **Create Texture Assets**:
   You have two options for creating the numbered cube face textures:

   **Option 1: Use the texture generator script**
   ```bash
   # Install the required package first
   npm install canvas
   
   # Run the script to generate textures
   node generate-textures.mjs
   ```
   This will create six textures with large white numbers on a gradient background.

   **Option 2: Create custom textures**
   Create 6 texture images manually with your preferred design tools, ensuring each has its corresponding number (1-6) clearly visible in white.

2. **Navigation Links**:
   Two navigation links have been added to make it easy to access the 3D cube:
   - A link in the Navbar ("Explore 3D")
   - A prominent button at the bottom of the main page ("Explore in 3D")

3. **Custom Styling**:
   Adjust the CSS modules as needed to match your application's design system.

## Face Numbering System

The cube faces are numbered as follows:
- Face 1: Right side (+X)
- Face 2: Left side (-X)
- Face 3: Top side (+Y)
- Face 4: Bottom side (-Y)
- Face 5: Front side (+Z)
- Face 6: Back side (-Z)

This numbering corresponds to both the texture files and the route mapping in the CubeNav component.

## Usage

1. Navigate to the root URL (`/`) to access the main application.
2. Click on either the "Explore 3D" link in the navbar or the "Explore in 3D" button at the bottom to access the 3D cube navigation.
3. On the navigation page, interact with the cube:
   - Click and drag to rotate the cube
   - Click on a face to navigate to the corresponding page
   - Use mouse wheel to zoom in/out if needed
4. From any page, use the "Back to Navigation Cube" link to return to the cube. 