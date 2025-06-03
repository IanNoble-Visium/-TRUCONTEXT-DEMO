# TruContext Demo - Graph Analytics Platform

A cutting-edge Next.js application that enables users to upload JSON datasets, import them into a Neo4j Aura cloud database, and visualize them as interactive graph topologies using Cytoscape.js. Features a modern, graph-focused responsive design with advanced animations, mobile gesture support, interactive tooltips, and dynamic grouping capabilities.

![TruContext Demo](https://img.shields.io/badge/TruContext-Demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![Neo4j](https://img.shields.io/badge/Neo4j-Aura-green)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.26.0-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.0.0-purple)

## 🚀 Key Features

### 📤 Data Management
- **JSON Dataset Upload**: Drag-and-drop interface with real-time validation
- **Neo4j Integration**: Automatic import into Neo4j Aura cloud database
- **Data Processing**: Auto-generation of timestamps and geolocation data
- **Format Validation**: Comprehensive JSON structure checking

### 🎨 Advanced Visualization & Animations
- **Graph-Focused Layout**: Maximum screen space dedicated to graph visualization
- **Custom SVG Icons**: Dynamic vector icons based on node types with fallback system
- **Smooth Layout Transitions**: 800ms animated transitions between layout algorithms
- **Interactive Tooltips**: Rich hover tooltips with node/edge details and smooth animations
- **Lottie Animations**: Beautiful loading states and empty state animations
- **Multiple Layout Algorithms**: Grid, Circle, Concentric, Breadth First, and Cose layouts
- **Real-time Updates**: Instant graph refresh with smooth transitions after data upload

### 📱 Enhanced Mobile & Touch Support
- **Mobile Gesture Recognition**: Pinch-to-zoom, pan, and touch-optimized interactions
- **Responsive Controls**: Auto-adapting UI with larger touch targets on mobile
- **Mobile Zoom Controls**: Dedicated zoom in/out/fit buttons for touch devices
- **Touch-Friendly Animations**: Optimized animation timings for mobile performance
- **Adaptive Interface**: Controls automatically collapse on mobile for maximum graph space

### 🔗 Dynamic Grouping System
- **Auto-Group by Type**: One-click grouping of nodes by their type attribute
- **Manual Grouping**: Select multiple nodes to create custom groups
- **Group Management**: Toggle visibility, ungroup, and reset operations
- **Smart Group Naming**: Automatic naming with node counts (e.g., "Server (3)")
- **Visual Feedback**: Toast notifications for all grouping operations

### 🎛️ Modern User Interface
- **Dark/Light Mode Toggle**: Animated theme switching with smooth transitions
- **Collapsible Controls**: Grouping controls hidden by default to maximize graph space
- **Collapsible Header**: Optional header hiding for full-screen graph view
- **Side Panel Navigation**: Upload and help panels accessible via slide-out drawers
- **Page Transitions**: Smooth enter/exit animations with staggered effects
- **Micro-interactions**: Enhanced button hover effects and visual feedback
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Visium Branding**: UI styled with Visium Technologies logo and colors

### 🔧 Technical Features
- **Dynamic Type Detection**: Automatically discovers and displays all node types in dataset
- **Context-Aware Interactions**: Different behaviors for regular nodes vs group nodes
- **State Management**: Proper tracking of selections, groups, and visibility states
- **Error Handling**: Graceful handling of missing icons and malformed data
- **Performance Optimized**: Efficient re-layout and rendering with 60fps animations
- **Advanced Animation System**: Framer Motion + Lottie React for smooth UX

## 🛠️ Technologies

- **Framework**: Next.js 14.0.0 with TypeScript
- **UI Library**: Chakra UI with custom Visium theme and dark mode support
- **Animations**: Framer Motion 10.0.0 + Lottie React for advanced animations
- **Graph Visualization**: Cytoscape.js with multiple layout algorithms
- **Mobile Gestures**: @use-gesture/react for touch interactions
- **Database**: Neo4j Aura (Cloud) with Cypher queries
- **Icons**: Custom SVG icon system with vector graphics
- **Deployment**: Vercel-ready with environment configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- Neo4j Aura database instance (credentials provided)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trucontext-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM
   NEO4J_DATABASE=neo4j
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Dataset Format

The application expects JSON files with the following structure:

```json
{
  "nodes": [
    {
      "uid": "unique-id",
      "type": "NodeType",
      "showname": "Display Name",
      "properties": {
        "property1": "value1",
        "timestamp": "2023-12-31T12:00:00.000Z",
        "longitude": -74.0060,
        "latitude": 40.7128
      },
      "icon": "optional/path/to/icon.png"
    }
  ],
  "edges": [
    {
      "from": "source-node-uid",
      "to": "target-node-uid",
      "type": "RELATIONSHIP_TYPE",
      "properties": {
        "property1": "value1",
        "timestamp": "2023-12-30T18:30:00.000Z"
      }
    }
  ],
  "storedQueries": [
    {
      "query": "MATCH (n)-[r]->(m) RETURN n,r,m",
      "lang": "cypher",
      "description": "Retrieve all nodes and relationships"
    }
  ]
}
```

### Required Fields

**Nodes:**
- `uid`: Unique identifier (string)
- `type`: Node type (e.g., "Server", "Application", "User")
- `showname`: Display name for the node
- `properties`: Object containing additional properties

**Edges:**
- `from`: Source node UID
- `to`: Target node UID
- `type`: Relationship type (e.g., "CONNECTS_TO", "HOSTS")
- `properties`: Object containing additional properties

### Auto-Generated Properties

If missing, the application automatically adds:
- **Timestamps**: Random values between Dec 30-31, 2023
- **Geolocation**: Random longitude (-180 to 180) and latitude (-90 to 90)

## 🎨 Node Icons System

The application uses a dynamic SVG icon system for optimal visual node representation:

### Available Icons (`/public/icons-svg/`)
- `server.svg` - Server nodes
- `application.svg` - Application nodes
- `database.svg` - Database nodes
- `user.svg` - User nodes
- `firewall.svg` - Firewall nodes
- `router.svg` - Router nodes
- `switch.svg` - Switch nodes
- `workstation.svg` - Workstation nodes
- `client.svg` - Client nodes
- `entity.svg` - Entity nodes
- `threatactor.svg` - Threat actor nodes
- `unknown.svg` - Fallback for unrecognized types

### Icon Features
- **Vector Graphics**: Scalable SVG format for crisp display at any size
- **Dynamic Loading**: Icons loaded based on node type with intelligent fallback
- **Conversion Utility**: PNG-to-SVG conversion script included (`scripts/convert_png_to_svg.py`)
- **Type Mapping**: Node type converted to lowercase and matched to SVG filename
- **Fallback System**: Unknown.svg used for unrecognized types
- **Optimized Sizing**: 60x60 pixels for nodes, 80x80 for group nodes
- **Color Coding**: Each node type has unique border colors for quick identification

## 🎮 Interactive Features

### Enhanced Graph Interactions
- **Hover Tooltips**: Rich information panels with node/edge details on mouse hover
- **Smooth Animations**: 800ms layout transitions with custom easing curves
- **Visual Feedback**: Hover effects, selection states, and micro-interactions
- **Context Menus**: Right-click for additional options (future enhancement)
- **Zoom Controls**: Mouse wheel, pinch gestures, and dedicated mobile buttons

### Mobile-Optimized Touch Interactions
- **Touch Detection**: Automatic mobile device and touch capability detection
- **Gesture Support**: Pinch-to-zoom, pan, and optimized touch thresholds
- **Mobile Controls**: Dedicated zoom in/out/fit buttons for touch devices
- **Responsive Sizing**: Larger touch targets and improved spacing on mobile
- **Performance**: Optimized animation timings for smooth mobile performance

### Animation System
- **Page Transitions**: Smooth enter/exit animations using Framer Motion
- **Loading States**: Custom Lottie animations for loading and empty states
- **Layout Changes**: Animated transitions between different graph layouts
- **UI Micro-interactions**: Button hover effects, drawer slides, and state changes
- **Theme Transitions**: Smooth dark/light mode switching with color animations

## 🎛️ Graph Controls

### Layout Options
- **Grid Layout**: Organized grid arrangement
- **Circle Layout**: Circular node arrangement
- **Concentric Layout**: Concentric circles based on node degree
- **Breadth First Layout**: Hierarchical tree-like structure
- **Cose Layout**: Force-directed physics simulation

### Grouping Features

#### Auto-Group by Type
- Automatically detects all unique node types in dataset
- Creates groups for types with 2+ nodes
- Groups labeled with type name and count
- One-click operation with visual feedback

#### Manual Grouping
1. Click nodes to select them (selection counter appears)
2. Click "Group Selected" when 2+ nodes are selected
3. Enter custom group name in modal dialog
4. Group created with selected nodes hidden

#### Group Management
- **Click Group Nodes**: Toggle visibility of grouped nodes
- **Ungroup**: Select group nodes and click "Ungroup"
- **Reset Groups**: Remove all groups and show all nodes
- **Visual Indicators**: Group count shown in info panel

## 🎨 UI Design

### Graph-Focused Layout
- **Collapsible Header**: Hide/show with chevron button for maximum graph space
- **Compact Toolbar**: Essential controls in minimal space
- **Side Drawers**: Upload and help accessible via slide-out panels
- **Full-Screen Graph**: Up to 95% of screen space dedicated to visualization

### Responsive Behavior
- **Desktop**: Full-featured interface with all controls
- **Tablet**: Optimized touch controls and spacing
- **Mobile**: Simplified interface with drawer navigation

### Color Scheme (Visium Technologies)
- Primary Blue: `#003087`
- Node Border Colors: Type-specific for quick identification
- Group Nodes: Gold accent (`#ffcc00`)
- Background: Clean white and light gray

## 🔄 API Routes

### POST `/api/upload`
Handles JSON dataset upload and Neo4j import.

**Request Body**: JSON dataset
**Response**: Success message with node/edge counts

### GET `/api/graph`
Fetches all graph data from Neo4j for visualization.

**Response**: Cytoscape.js formatted nodes and edges

## 🎯 Usage Guide

### Basic Workflow
1. **Upload Dataset**: Click "Upload Dataset" → drag/drop JSON file
2. **Automatic Processing**: System validates and imports data
3. **Graph Visualization**: Interactive graph appears instantly
4. **Layout Selection**: Choose optimal layout from dropdown
5. **Node Interaction**: Click nodes to select, view properties

### Advanced Features
1. **Grouping by Type**: Click "Group by Type" for automatic organization
2. **Custom Groups**: Select nodes → "Group Selected" → name group
3. **Group Navigation**: Click group nodes to show/hide contents
4. **Layout Switching**: Try different layouts for best visualization
5. **Full-Screen Mode**: Hide header for maximum graph space

### Tips
- Use Grid layout for structured data analysis
- Use Circle layout for relationship overview
- Group by type to simplify complex networks
- Create custom groups for workflow organization
- Toggle group visibility to focus on specific areas

## 📱 Responsive Design & Mobile Support

### Enhanced Mobile Experience
- **Automatic Detection**: Mobile device and touch capability detection
- **Adaptive UI**: Controls automatically resize and reorganize for optimal touch interaction
- **Touch Gestures**: Native pinch-to-zoom, pan, and optimized touch thresholds
- **Mobile Zoom Controls**: Dedicated zoom in/out/fit buttons for precise control
- **Responsive Animations**: Performance-optimized animations for mobile devices
- **Auto-Collapse**: Complex controls automatically hidden on mobile for cleaner interface

### Screen Adaptations
- **Desktop (1200px+)**: Full interface with hover tooltips and advanced controls
- **Tablet (768-1199px)**: Touch-optimized layout with larger interactive elements
- **Mobile (< 768px)**: Streamlined interface with gesture navigation and simplified controls

### Touch-Optimized Features
- **Larger Touch Targets**: Buttons and controls sized for finger interaction
- **Gesture Recognition**: Multi-touch support for zoom and pan operations
- **Visual Feedback**: Enhanced touch states and haptic-style feedback
- **Tooltip Adaptation**: Touch-friendly tooltip behavior with tap-to-show functionality
- **Drawer Navigation**: Slide-out panels optimized for thumb navigation

### Performance Optimizations
- **Smooth 60fps**: Animations optimized for mobile GPU acceleration
- **Gesture Debouncing**: Smart gesture recognition to prevent accidental interactions
- **Battery Efficiency**: Reduced animation complexity on mobile devices
- **Network Awareness**: Optimized asset loading for mobile connections

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables**
   In Vercel dashboard, add the Neo4j credentials as environment variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables for Production
```env
NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM
NEO4J_DATABASE=neo4j
```

## 🔍 Sample Dataset

A sample dataset (`sample-dataset.json`) is included with:
- 5 nodes (Server, Application, Database, User, Vulnerability)
- 4 relationships (HOSTS, CONNECTS_TO, HAS_ACCESS, AFFECTS)
- 2 stored queries for testing
- Demonstrates icon mapping and grouping features

## 🛡️ Security Considerations

- Environment variables are used for database credentials
- Input validation on uploaded JSON files
- Error handling for malformed data
- Neo4j parameterized queries to prevent injection
- Secure icon loading with fallback system

## 🐛 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Verify JSON format is valid
   - Check all required fields are present
   - Ensure node UIDs are unique

2. **Graph Not Loading**
   - Check Neo4j connection in browser console
   - Verify environment variables are set
   - Ensure database is accessible

3. **Icons Not Displaying**
   - Check if SVG files exist in `/public/icons-svg/`
   - Verify node types match SVG filenames (lowercase)
   - Unknown.svg will be used as fallback for unrecognized types
   - Clear browser cache if icons appear corrupted

4. **Animation Performance Issues**
   - Disable hardware acceleration if animations are choppy
   - Check browser's animation preferences (reduced motion settings)
   - Reduce dataset size for complex graphs (>100 nodes may impact performance)
   - Close other browser tabs consuming GPU resources

5. **Mobile Gesture Problems**
   - Ensure device supports multi-touch (most modern devices do)
   - Check if browser zoom is interfering with gesture recognition
   - Try refreshing the page if gestures become unresponsive
   - Verify touch events are not blocked by other scripts

6. **Tooltips Not Appearing**
   - Check if hover events are working (desktop) or touch events (mobile)
   - Verify tooltip positioning is not off-screen
   - Clear browser cache if tooltip styles are broken
   - Check browser console for JavaScript errors

7. **Dark Mode Issues**
   - Clear localStorage if theme switching is stuck
   - Check if browser has forced color schemes enabled
   - Verify Chakra UI theme is loading properly

8. **Layout Transition Problems**
   - Try switching to a simpler layout (Grid) if transitions are slow
   - Reduce node count if transitions are taking too long
   - Check if hardware acceleration is available
   - Disable animations if performance is critical

9. **Visualization Issues**
   - Clear browser cache
   - Check for JavaScript errors in console
   - Verify Cytoscape.js is loading properly
   - Try different layout algorithms
   - Check if WebGL is supported for better performance

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Documentation](https://chakra-ui.com/docs)
- [Cytoscape.js Documentation](https://js.cytoscape.org/)
- [Neo4j Documentation](https://neo4j.com/docs/)

## 🤝 Contributing

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Make your changes following the existing patterns:
   - Use TypeScript for type safety
   - Follow Chakra UI theming conventions
   - Implement responsive design patterns
   - Add animations using Framer Motion
   - Include mobile gesture support where applicable
5. Test thoroughly on desktop, tablet, and mobile
6. Test dark/light mode switching
7. Verify animation performance
8. Submit a pull request with detailed description

### Code Standards
- **TypeScript**: Full type coverage for components and utilities
- **Responsive**: Mobile-first design with touch optimization
- **Animations**: Smooth 60fps animations with proper cleanup
- **Performance**: Optimized for mobile devices and slower connections
- **Accessibility**: ARIA labels and keyboard navigation support

## 📄 License

This project is licensed under the MIT License.

## 🏢 About Visium Technologies

TruContext is powered by Visium Technologies, a leader in graph analytics and cybersecurity solutions. Learn more at [visiumtechnologies.com](https://www.visiumtechnologies.com/).

---

**Built with ❤️ by the Visium Technologies team**

## 🌟 Advanced Features Completed

### ✅ Animation & Visual Enhancements
- **Smooth Layout Transitions**: 800ms animated graph layout changes with custom easing
- **Interactive Tooltips**: Rich hover tooltips with node/edge details and portal rendering
- **Lottie Animations**: Custom loading and empty state animations
- **Dark Mode Toggle**: Animated theme switching with smooth color transitions
- **Micro-interactions**: Enhanced button hover effects and visual feedback throughout

### ✅ Mobile & Touch Optimization
- **Gesture Recognition**: Advanced pinch-to-zoom and pan support via @use-gesture/react
- **Mobile-First Controls**: Auto-adapting interface with touch-optimized sizing
- **Responsive Animations**: Performance-optimized animations for mobile devices
- **Touch Detection**: Automatic mobile device and capability detection

### ✅ Technical Infrastructure
- **SVG Icon System**: Scalable vector graphics with PNG-to-SVG conversion utility
- **Page Transitions**: Smooth route and state change animations
- **Performance Optimized**: 60fps animations with GPU acceleration
- **TypeScript Enhanced**: Full type safety with advanced component patterns

## 🤝 Contributing

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Make your changes following the existing patterns:
   - Use TypeScript for type safety
   - Follow Chakra UI theming conventions
   - Implement responsive design patterns
   - Add animations using Framer Motion
   - Include mobile gesture support where applicable
5. Test thoroughly on desktop, tablet, and mobile
6. Test dark/light mode switching
7. Verify animation performance
8. Submit a pull request with detailed description

### Code Standards
- **TypeScript**: Full type coverage for components and utilities
- **Responsive**: Mobile-first design with touch optimization
- **Animations**: Smooth 60fps animations with proper cleanup
- **Performance**: Optimized for mobile devices and slower connections
- **Accessibility**: ARIA labels and keyboard navigation support 