# TruContext Demo - Graph Analytics Platform

A Next.js application that enables users to upload JSON datasets, import them into a Neo4j Aura cloud database, and visualize them as interactive graph topologies using Cytoscape.js. The application features a graph-focused responsive design with advanced layout options, dynamic grouping, and custom node icons.

![TruContext Demo](https://img.shields.io/badge/TruContext-Demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![Neo4j](https://img.shields.io/badge/Neo4j-Aura-green)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.26.0-orange)

## 🚀 Key Features

### 📤 Data Management
- **JSON Dataset Upload**: Drag-and-drop interface with real-time validation
- **Neo4j Integration**: Automatic import into Neo4j Aura cloud database
- **Data Processing**: Auto-generation of timestamps and geolocation data
- **Format Validation**: Comprehensive JSON structure checking

### 🎨 Advanced Visualization
- **Graph-Focused Layout**: Maximum screen space dedicated to graph visualization
- **Custom Node Icons**: Dynamic PNG icons based on node types with fallback system
- **Multiple Layout Algorithms**: Grid, Circle, Concentric, Breadth First, and Cose layouts
- **Interactive Controls**: Click to select, drag to reposition, zoom and pan
- **Real-time Updates**: Instant graph refresh after data upload

### 🔗 Dynamic Grouping System
- **Auto-Group by Type**: One-click grouping of nodes by their type attribute
- **Manual Grouping**: Select multiple nodes to create custom groups
- **Group Management**: Toggle visibility, ungroup, and reset operations
- **Smart Group Naming**: Automatic naming with node counts (e.g., "Server (3)")
- **Visual Feedback**: Toast notifications for all grouping operations

### 🎛️ User Interface
- **Collapsible Controls**: Grouping controls hidden by default to maximize graph space
- **Collapsible Header**: Optional header hiding for full-screen graph view
- **Side Panel Navigation**: Upload and help panels accessible via slide-out drawers
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Visium Branding**: UI styled with Visium Technologies logo and colors

### 🔧 Technical Features
- **Dynamic Type Detection**: Automatically discovers and displays all node types in dataset
- **Context-Aware Interactions**: Different behaviors for regular nodes vs group nodes
- **State Management**: Proper tracking of selections, groups, and visibility states
- **Error Handling**: Graceful handling of missing icons and malformed data
- **Performance Optimized**: Efficient re-layout and rendering

## 🛠️ Technologies

- **Framework**: Next.js 14.0.0 with TypeScript
- **UI Library**: Chakra UI with custom Visium theme
- **Graph Visualization**: Cytoscape.js with multiple layout algorithms
- **Database**: Neo4j Aura (Cloud) with Cypher queries
- **Icons**: Custom PNG icon system with dynamic loading
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

The application uses a dynamic icon system for visual node representation:

### Available Icons (`/public/icons/`)
- `server.png` - Server nodes
- `application.png` - Application nodes
- `database.png` - Database nodes
- `user.png` - User nodes
- `firewall.png` - Firewall nodes
- `router.png` - Router nodes
- `switch.png` - Switch nodes
- `workstation.png` - Workstation nodes
- `client.png` - Client nodes
- `entity.png` - Entity nodes
- `threatactor.png` - Threat actor nodes
- `unknown.png` - Fallback for unrecognized types

### Icon Mapping
- Node type is converted to lowercase and matched to PNG filename
- If no matching icon exists, `unknown.png` is used as fallback
- Icons are sized at 60x60 pixels (80x80 for group nodes)
- Each node type has a unique border color for quick identification

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

## 📱 Responsive Design

### Screen Adaptations
- **Desktop (1200px+)**: Full interface with side-by-side panels
- **Tablet (768-1199px)**: Stacked layout with touch optimization
- **Mobile (< 768px)**: Drawer navigation with minimalist controls

### Touch Features
- **Touch-friendly buttons**: Larger tap targets on mobile
- **Gesture support**: Pinch to zoom, drag to pan
- **Modal interfaces**: Large dialogs for touch interaction

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
   - Check if icon files exist in `/public/icons/`
   - Verify node types match icon filenames
   - Unknown.png will be used as fallback

3. **Visualization Issues**
   - Clear browser cache
   - Check for JavaScript errors in console
   - Verify Cytoscape.js is loading properly

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Documentation](https://chakra-ui.com/docs)
- [Cytoscape.js Documentation](https://js.cytoscape.org/)
- [Neo4j Documentation](https://neo4j.com/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🏢 About Visium Technologies

TruContext is powered by Visium Technologies, a leader in graph analytics and cybersecurity solutions. Learn more at [visiumtechnologies.com](https://www.visiumtechnologies.com/).

---

**Built with ❤️ by the Visium Technologies team** 