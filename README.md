# TruContext Demo - Graph Analytics Platform

A cutting-edge Next.js application that enables users to upload JSON datasets, save them to a PostgreSQL database, and visualize them as interactive graph topologies using Cytoscape.js. Features persistent dataset storage, seamless data management, modern graph-focused responsive design with advanced animations, mobile gesture support, interactive tooltips, and dynamic grouping capabilities.

![TruContext Demo](https://img.shields.io/badge/TruContext-Demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![Neo4j](https://img.shields.io/badge/Neo4j-Aura-green)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.26.0-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.0.0-purple)

## 🚀 Key Features

### 📤 Data Management
- **JSON Dataset Upload**: Drag-and-drop interface with real-time validation
- **PostgreSQL Persistence**: Save and load datasets from Neon PostgreSQL cloud database
- **Dataset Library**: Manage multiple saved datasets with metadata and descriptions
- **Data Source Integrations**: Configure connections to 10+ external platforms (DataDog, Tenable, Splunk, Kafka, etc.)
- **Integration Management**: Centralized settings for security tools, messaging systems, analytics platforms, and AI services
- **Seamless Integration**: Switch between JSON files and database storage
- **Neo4j Visualization**: Automatic import into Neo4j Aura for graph rendering
- **Data Processing**: Auto-generation of timestamps and geolocation data
- **Format Validation**: Comprehensive JSON structure checking

### 📊 Multiple Data Visualization Views
- **Graph View**: Interactive network topology with Cytoscape.js and SVG icons in circular markers
- **Table View**: Sortable and filterable data tables with dedicated Icon column (24px SVG icons)
- **Timeline View**: Chronological data visualization with SVG icons for node events (20px)
- **Cards View**: Grid-based card layout with SVG icons in headers (24px)
- **Dashboard View**: Summary statistics with SVG icons in type distribution and connected nodes
- **Geographic Map**: Interactive world map with SVG icons in location markers
- **View Switcher**: Seamless transitions between different visualization modes

### 🎨 Advanced Visualization & Animations
- **Graph-Focused Layout**: Maximum screen space dedicated to graph visualization
- **Unified SVG Icon System**: Dynamic vector icons across ALL views with intelligent fallback
- **Cross-View Icon Consistency**: Same icon loading system used in all 6 visualization modes
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
- **Enhanced Side Panel Navigation**: Three-tab drawer system for dataset management and integrations
- **Data Source Configuration**: Dedicated interface for managing external platform connections
- **Page Transitions**: Smooth enter/exit animations with staggered effects
- **Micro-interactions**: Enhanced button hover effects and visual feedback
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Visium Branding**: UI styled with Visium Technologies logo and colors

### 🔧 Technical Features
- **Dynamic Type Detection**: Automatically discovers and displays all node types in dataset
- **Context-Aware Interactions**: Different behaviors for regular nodes vs group nodes
- **State Management**: Proper tracking of selections, groups, and visibility states
- **Integration Configuration**: Persistent settings management with localStorage for data source connections
- **Modular Architecture**: Separate components for different integration categories and types
- **Error Handling**: Graceful handling of missing icons and malformed data
- **Performance Optimized**: Efficient re-layout and rendering with 60fps animations
- **Advanced Animation System**: Framer Motion + Lottie React for smooth UX
- **Enhanced Component Architecture**: Memoized components to prevent infinite loops
- **Stable React Patterns**: useCallback and useMemo for optimal performance

## 🛠️ Technologies

- **Framework**: Next.js 14.0.0 with TypeScript
- **UI Library**: Chakra UI with custom Visium theme and dark mode support
- **Animations**: Framer Motion 10.0.0 + Lottie React for advanced animations
- **Graph Visualization**: Cytoscape.js with multiple layout algorithms
- **Mobile Gestures**: @use-gesture/react for touch interactions
- **Persistent Storage**: PostgreSQL with Neon hosting for dataset management
- **Configuration Management**: Browser localStorage for integration settings persistence
- **Visualization Database**: Neo4j Aura (Cloud) with Cypher queries
- **Icons**: Custom SVG icon system with vector graphics
- **Deployment**: Vercel-ready with environment configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon hosted - credentials provided)
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
   # PostgreSQL Database (Neon)
   POSTGRES_URL=postgresql://neondb_owner:npg_cOSiwT1eE6Fn@ep-cold-haze-a8fhh5uh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

   # Neo4j Database (Aura)
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

## 🎨 Unified SVG Icon System

The application features a comprehensive SVG icon system that provides consistent visual representation across ALL visualization views:

### Available Icons (`/public/icons-svg/`)
- `server.svg` - Server nodes
- `application.svg` - Application nodes
- `database.svg` - Database nodes
- `user.svg` / `actor.svg` - User/Actor nodes
- `firewall.svg` - Firewall nodes
- `router.svg` / `network.svg` - Router/Network nodes
- `switch.svg` - Switch nodes
- `workstation.svg` / `device.svg` - Workstation/Device nodes
- `client.svg` - Client nodes
- `entity.svg` - Entity nodes
- `threatactor.svg` / `vulnerability.svg` - Threat/Vulnerability nodes
- `agent.svg` - Agent/Process nodes
- `storage.svg` - Storage/File nodes
- `event.svg` - Event/Log nodes
- `communication.svg` - Communication/Message nodes
- `unknown.svg` - Fallback for unrecognized types

### Cross-View Icon Integration
- **Table View**: Dedicated "Icon" column with 24px SVG icons for easy type identification
- **Cards View**: SVG icons in card headers (24px) replacing emoji icons
- **Timeline View**: SVG icons next to node events (20px) for visual consistency
- **Dashboard View**: Icons in type distribution charts (16px) and connected nodes (20px)
- **Geographic Map**: SVG icons within circular location markers with background image rendering
- **Graph View**: SVG icons in network topology nodes with dynamic sizing

### Advanced Icon Features
- **Vector Graphics**: Scalable SVG format for crisp display at any size across all views
- **Intelligent Caching**: Shared icon loading system prevents duplicate network requests
- **Dynamic Loading**: Icons loaded based on node type with comprehensive fallback mapping
- **Embedded PNG Support**: Automatic extraction and rendering of PNG data from SVG files
- **Type Mapping**: Node type converted to lowercase with 40+ fallback mappings
- **Fallback System**: Multi-level fallback (type → mapping → unknown.svg → generated icon)
- **Performance Optimized**: React component with loading states and error handling
- **Consistent Sizing**: View-appropriate sizing (16px-27px) for optimal visual hierarchy
- **Background Rendering**: Advanced CSS background-image approach for circular containers

## 📋 Data Visualization Views

### Graph View (Default)
- **Interactive Network Topology**: Primary visualization using Cytoscape.js
- **Advanced Layout Algorithms**: 8 different layout options including the new Multi-Level Hierarchical Tree
- **Node Grouping**: Auto-group by type or create custom groups
- **Dynamic Icons**: SVG-based node icons with type-based styling
- **Real-time Interactions**: Click selection, hover tooltips, and smooth animations

### Table View
- **SVG Icon Column**: Dedicated icon column with 24px SVG icons for instant type recognition
- **Sortable Data Tables**: Click column headers to sort nodes and edges
- **Advanced Filtering**: Search by name, type, or properties with real-time results
- **Type-based Filtering**: Dropdown filters for specific node and edge types
- **Expandable Properties**: Accordion-style property viewing for detailed inspection
- **Tabbed Interface**: Separate tabs for nodes and edges with item counts
- **Responsive Design**: Mobile-optimized table layout with touch-friendly controls

### Timeline View
- **SVG Event Icons**: 20px SVG icons next to node events for visual consistency
- **Chronological Visualization**: Time-based layout using timestamp properties
- **Interactive Timeline**: Zoom and pan through time periods
- **Event Clustering**: Groups events by time proximity for better visibility
- **Time Filtering**: Range selectors and date pickers for focused analysis
- **Temporal Patterns**: Identify trends and sequences in your data

### Cards View
- **SVG Card Headers**: 24px SVG icons in card headers replacing emoji icons
- **Grid Layout**: Card-based representation for detailed node inspection
- **Rich Content**: Display all node properties in an easy-to-scan format
- **Search and Filter**: Full-text search across all visible properties
- **Type Grouping**: Organize cards by node type with visual separators
- **Responsive Grid**: Auto-adjusting columns based on screen size

### Dashboard View
- **SVG Statistical Icons**: Icons in type distribution (16px) and most connected nodes (20px)
- **Summary Statistics**: Key metrics and data overview at a glance
- **Node Type Distribution**: Charts showing the composition of your dataset with visual icons
- **Relationship Analysis**: Edge type statistics and connection patterns
- **Interactive Charts**: Click-to-filter functionality for deeper exploration
- **Export Capabilities**: Download reports and statistics

### View Switcher
- **Seamless Transitions**: Smooth animations when switching between views
- **State Preservation**: Maintains selections and filters across view changes
- **Responsive Tabs**: Mobile-optimized navigation with clear view indicators
- **Keyboard Navigation**: Accessible tab switching with keyboard shortcuts

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

The TruContext Demo offers 8 sophisticated layout algorithms, each optimized for different types of graph analysis and visualization needs:

![Layout Options](public/images/layout-grid.png)
*Grid Layout - Organized square grid arrangement*

![Layout Options](public/images/layout-circle.png)
*Circle Layout - Nodes evenly spaced around a circle*

![Layout Options](public/images/layout-concentric.png)
*Concentric Layout - Concentric circles based on node properties*

![Layout Options](public/images/layout-hierarchicl_breath-first.png)
*Hierarchical (Breadth-First) Layout - Tree-like hierarchical structure*

![Layout Options](public/images/layout-multi-level_hierarchical_tree.png)
*Multi-Level Hierarchical Tree - Advanced multi-level tree hierarchy*

![Layout Options](public/images/layout-force-directed_cose.png)
*Force-Directed (CoSE) Layout - Physics-based organic positioning*

![Layout Options](public/images/layout-random.png)
*Random Layout - Random positioning for initial views*

#### Available Layout Algorithms

1. **Grid Layout**
   - Arranges nodes in a regular, square grid
   - Simple and useful for quickly displaying all nodes
   - Best for: Structured data inspection, equal node importance

2. **Random Layout**
   - Places nodes at random positions within the viewport
   - Useful for initial, unstructured views
   - Best for: Starting point before applying other layouts

3. **Circle Layout**
   - Positions nodes evenly spaced around a circle
   - Highlights groups or cycles in the data
   - Best for: Showing relationships, small to medium datasets

4. **Concentric Layout**
   - Arranges nodes in concentric circles based on node properties (e.g., degree)
   - Often used to show hierarchies or importance levels
   - Best for: Highlighting node importance, centrality analysis

5. **Hierarchical (Breadth-First) Layout**
   - Creates hierarchical layers from a root node using breadth-first traversal
   - Select a single node first to use as root, or the system will auto-select the most connected node
   - Best for: Tree structures, organizational charts, dependency analysis

6. **Multi-Level Hierarchical Tree** ⭐ *New Feature*
   - Creates a true multi-level tree hierarchy with proper vertical layering and horizontal spacing
   - Advanced breadth-first search (BFS) algorithm builds multiple hierarchy levels
   - Select a root node or the system will auto-select one based on highest degree
   - Best for: Complex hierarchical data, multi-level organizational structures, detailed tree analysis

7. **Force-Directed (CoSE) Layout**
   - Uses a physics simulation to position nodes where edges act like springs and nodes repel each other
   - Good for organic, visually balanced layouts
   - Best for: General-purpose visualization, relationship discovery, natural clustering

8. **Preset Layout**
   - Uses manually specified node positions from the data
   - Allows for custom or saved layouts
   - Best for: Maintaining specific positioning, custom arrangements

### Multi-Level Hierarchical Tree Layout - Detailed Features

The Multi-Level Hierarchical Tree layout is an advanced visualization algorithm that creates true hierarchical structures with multiple levels of depth. This layout is particularly powerful for analyzing complex organizational structures, dependency trees, and multi-level relationships.

#### Key Features

**Root Node Selection**
- **Manual Selection**: Click any node to select it as the hierarchy root before applying the layout
- **Auto-Selection**: If no node is selected, the system automatically chooses the node with the highest degree (most connections)
- **Visual Feedback**: The selected root node is highlighted with a distinct border color for easy identification

**Multi-Level Hierarchy Building**
- **Breadth-First Search (BFS) Algorithm**: Uses an enhanced BFS traversal to build hierarchy levels
- **Level Distribution**: Nodes are organized into distinct levels (Level 0, Level 1, Level 2, etc.)
- **Connected Node Discovery**: Advanced edge traversal ensures all connected nodes are properly discovered and placed
- **Group Filtering**: Automatically excludes group nodes from hierarchy building to maintain clean structure

**Visual Representation**
- **Distinct Vertical Layers**: Each hierarchy level is positioned at a different vertical position
- **Horizontal Spacing**: Nodes within each level are evenly distributed horizontally
- **Adaptive Positioning**: Layout automatically adjusts to container size and node count
- **Level Separation**: Configurable spacing between levels for optimal readability

**Technical Implementation**
- **Enhanced BFS Traversal**: Fixed algorithm that properly discovers neighbors through edge connections
- **Edge Validation**: Validates both incoming and outgoing edges for comprehensive neighbor discovery
- **Debugging Support**: Comprehensive console logging for troubleshooting hierarchy building
- **Performance Optimized**: Efficient traversal algorithm suitable for large graphs

#### Usage Instructions

1. **Select Root Node** (Optional)
   - Click on any node in the graph to select it as the hierarchy root
   - The selected node will be highlighted with a colored border
   - If no node is selected, the system will auto-select the most connected node

2. **Apply Layout**
   - Open the layout selector dropdown
   - Choose "Multi-Level Hierarchical Tree" from the options
   - The layout will automatically build the hierarchy starting from the root node

3. **Interpret Results**
   - **Level 0**: Contains only the root node
   - **Level 1**: Contains nodes directly connected to the root
   - **Level 2**: Contains nodes connected to Level 1 nodes
   - **Subsequent Levels**: Continue the pattern based on graph connectivity

4. **Layout Controls**
   - Use "Center & Fit" to optimize the view of the hierarchy
   - Zoom in/out to examine specific levels in detail
   - Switch to other layouts for different perspectives of the same data

#### When to Use This Layout

- **Organizational Charts**: Visualize company hierarchies, reporting structures
- **Dependency Analysis**: Show software dependencies, system architectures
- **Family Trees**: Display genealogical relationships and lineage
- **Network Topologies**: Analyze network infrastructure and routing paths
- **Decision Trees**: Visualize decision-making processes and outcomes
- **Taxonomies**: Display classification systems and category hierarchies

#### Technical Notes

The Multi-Level Hierarchical Tree layout includes recent bug fixes that resolved issues with the BFS algorithm not properly traversing connected nodes. The enhanced implementation now correctly:

- Discovers all connected nodes through manual edge traversal
- Builds multiple hierarchy levels instead of just Level 0
- Provides detailed debugging output for troubleshooting
- Handles both directed and undirected graph structures
- Maintains proper node positioning across different screen sizes

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

## 💾 Dataset Management

### Persistent Storage Features
- **Save Current Dataset**: Save the currently loaded graph data to PostgreSQL with custom name and description
- **Dataset Library**: Browse all saved datasets with metadata (creation date, node/edge counts)
- **One-Click Loading**: Load any saved dataset directly into the visualization
- **Dataset Deletion**: Remove unwanted datasets from the database
- **Seamless Integration**: Switch between JSON file uploads and database storage

### Dataset Management Interface
- **Enhanced Tabbed Interface**: Three tabs in the management drawer:
  - **Upload JSON**: Drag-and-drop interface with format validation
  - **Saved Datasets**: Browse and manage stored datasets
  - **Manage Datasets**: Configure data source integrations and settings
- **Save Dialog**: Modal form for naming and describing datasets before saving
- **Dataset List**: Visual cards showing dataset information with action buttons
- **Real-time Updates**: Immediate UI updates after save/load/delete operations
- **Data Validation**: Comprehensive validation before saving to ensure data integrity

### Database Schema
- **Datasets Table**: Stores metadata (name, description, timestamps, counts)
- **Nodes Table**: Stores node data with JSONB properties for flexibility
- **Edges Table**: Stores relationships with proper foreign key constraints
- **Automatic Schema**: Database tables created automatically on first use

## ⚙️ Data Source Integrations

### Integration Management
- **Centralized Configuration**: Manage all external data source connections from a single interface
- **Category Organization**: Integrations grouped by type (Security, Messaging, Analytics, Storage, AI)
- **Toggle Controls**: Enable/disable integrations with visual switch controls
- **Persistent Settings**: Configuration automatically saved to browser local storage
- **Real-time Status**: Live status indicators showing enabled/disabled state

### Supported Integrations

#### Security Tools
- **Tenable**: Vulnerability management and security scanning platform integration
- **PCAP**: Network packet capture and analysis file processing

#### Messaging Systems
- **Kafka Bus**: Real-time data streaming and message queuing integration
- **Web Hooks**: HTTP callbacks for real-time event notifications
- **Google Cloud Pub/Sub**: Managed messaging service for event-driven systems

#### Analytics Platforms
- **DataDog**: Application performance monitoring and log aggregation
- **Splunk**: Enterprise search, monitoring, and analytics platform

#### Data Storage
- **Unified Data Lake**: Centralized repository for structured and unstructured data
- **Apache Iceberg**: Table format for large analytic datasets (staging area)

#### AI & Machine Learning
- **AI MCP (Model Context Protocol)**: AI model integration and context management

### Integration Features
- **Smart Categorization**: Color-coded badges and logical grouping by integration type
- **Detailed Descriptions**: Comprehensive explanations of each integration's purpose
- **Visual Feedback**: Hover effects, status badges, and smooth animations
- **Responsive Design**: Mobile-optimized interface with touch-friendly controls
- **Expandable Sections**: Collapsible categories for organized navigation
- **Configuration Summary**: Real-time count of enabled integrations with status overview

## 🔄 API Routes

### Dataset Management
- **GET `/api/datasets`**: List all saved datasets
- **POST `/api/datasets`**: Save current dataset to PostgreSQL
- **GET `/api/datasets/[id]`**: Get specific dataset details
- **DELETE `/api/datasets/[id]`**: Delete a saved dataset
- **POST `/api/datasets/load/[id]`**: Load dataset into Neo4j for visualization

### Legacy Routes
- **POST `/api/upload`**: Upload JSON dataset and import to Neo4j
- **GET `/api/graph`**: Fetch current graph data from Neo4j

## 🎯 Usage Guide

### Basic Workflow
1. **Manage Datasets**: Click "Manage Datasets" to open the data management drawer
2. **Upload or Load**: Either upload a new JSON file or load a saved dataset
3. **Automatic Processing**: System validates and imports data into visualization
4. **Save Dataset**: Optionally save your current dataset to the database for future use
5. **Multi-View Visualization**: Choose from 6 different visualization modes
6. **Data Exploration**: Use appropriate view for your analysis needs
7. **Interactive Analysis**: Click, filter, sort, and explore your data

### Dataset Management Workflow
1. **Upload New Data**: Use "Upload JSON" tab to import new datasets from files
2. **Save Current Dataset**: Click "Save Current Dataset" to store in PostgreSQL database
3. **Browse Saved Datasets**: Use "Saved Datasets" tab to view your dataset library
4. **Configure Integrations**: Use "Manage Datasets" tab to set up external data source connections
5. **Load Previous Work**: Click the download icon to load any saved dataset
6. **Manage Storage**: Delete unwanted datasets to keep your library organized

### Data Source Integration Workflow
1. **Access Settings**: Click "Manage Datasets" button to open the management drawer
2. **Navigate to Integrations**: Select the "Manage Datasets" tab (third tab)
3. **Browse Categories**: Expand integration categories (Security, Messaging, Analytics, Storage, AI)
4. **Enable Integrations**: Toggle switches to enable desired data source connections
5. **Review Configuration**: Check the summary section for enabled integration count
6. **Automatic Persistence**: Settings are automatically saved to browser storage

### View-Specific Features

#### Graph View
1. **Layout Selection**: Choose optimal layout from dropdown with 8 available options
   - **Grid**: Structured analysis and equal node importance
   - **Circle**: Relationship overview and small datasets
   - **Concentric**: Node importance and centrality analysis
   - **Hierarchical (Breadth-First)**: Basic tree structures
   - **Multi-Level Hierarchical Tree**: Advanced multi-level hierarchies ⭐
   - **Force-Directed (CoSE)**: General-purpose organic layouts
   - **Random**: Initial unstructured views
   - **Preset**: Custom positioning from data

2. **Hierarchical Tree Layout Usage**:
   - **Step 1**: Click any node to select it as hierarchy root (optional)
   - **Step 2**: Choose "Multi-Level Hierarchical Tree" from layout dropdown
   - **Step 3**: View the multi-level hierarchy with distinct vertical layers
   - **Step 4**: Use "Center & Fit" to optimize the hierarchy view
   - **Auto-Selection**: System automatically selects highest-degree node if none selected

3. **Node Interaction**: Click nodes to select, hover for details
4. **Grouping by Type**: Click "Group by Type" for automatic organization
5. **Custom Groups**: Select nodes → "Group Selected" → name group
6. **Group Navigation**: Click group nodes to show/hide contents

#### Table View
1. **Data Sorting**: Click column headers to sort nodes/edges
2. **Search & Filter**: Use search boxes and type filters
3. **Property Inspection**: Expand accordion items to view all properties
4. **Tab Navigation**: Switch between nodes and edges tables

#### Timeline View
1. **Time Navigation**: Use timeline controls to zoom and pan
2. **Event Filtering**: Select time ranges for focused analysis
3. **Pattern Recognition**: Identify temporal trends and sequences

#### Cards View
1. **Grid Browsing**: Scroll through card-based node representations
2. **Detailed Inspection**: View all properties in an organized format
3. **Search Functionality**: Find specific nodes using full-text search

#### Dashboard View
1. **Overview Analysis**: Get high-level statistics about your dataset
2. **Chart Interaction**: Click chart elements to filter data
3. **Export Reports**: Download analysis results and metrics

### Pro Tips

#### Layout Selection Strategy
- **Grid Layout**: Use for structured analysis and when all nodes have equal importance
- **Circle Layout**: Perfect for relationship overview and small to medium datasets
- **Concentric Layout**: Ideal for highlighting node importance and centrality analysis
- **Hierarchical (Breadth-First)**: Good for basic tree structures and simple hierarchies
- **Multi-Level Hierarchical Tree**: ⭐ Best for complex organizational structures, dependency trees, and detailed hierarchical analysis
- **Force-Directed (CoSE)**: Excellent general-purpose layout for relationship discovery
- **Random Layout**: Use as starting point before applying more structured layouts

#### Hierarchical Tree Layout Tips
- **Root Selection**: Choose nodes with high connectivity as roots for better hierarchy visualization
- **Level Analysis**: Pay attention to the number of nodes at each level - balanced trees often indicate well-structured data
- **Zoom Strategy**: Use zoom controls to focus on specific hierarchy levels for detailed analysis
- **Comparison**: Switch between Breadth-First and Multi-Level Hierarchical Tree to compare hierarchy representations

#### View-Specific Tips
- **Table View**: Great for detailed data inspection and property comparison
- **Timeline View**: Perfect for temporal analysis and event sequencing
- **Cards View**: Best for browsing and detailed individual node examination
- **Dashboard View**: Ideal for presentations and high-level data understanding
- **Geographic Map**: Use when nodes have location data for spatial analysis
- **View Switching**: Each view maintains your selections - switch freely for different perspectives

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
# PostgreSQL Database (Neon)
POSTGRES_URL=postgresql://neondb_owner:npg_cOSiwT1eE6Fn@ep-cold-haze-a8fhh5uh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

# Neo4j Database (Aura)
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
- Input validation on uploaded JSON files and saved datasets
- Error handling for malformed data
- PostgreSQL parameterized queries to prevent SQL injection
- Neo4j parameterized queries to prevent injection
- Database transactions for atomic operations
- Secure icon loading with fallback system
- SSL connections to both PostgreSQL and Neo4j databases

## 🐛 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Verify JSON format is valid
   - Check all required fields are present
   - Ensure node UIDs are unique

2. **Graph Not Loading**
   - Check Neo4j connection in browser console
   - Verify environment variables are set
   - Ensure both PostgreSQL and Neo4j databases are accessible

3. **Dataset Save/Load Issues**
   - Check PostgreSQL connection in browser console
   - Verify POSTGRES_URL environment variable is set correctly
   - Ensure dataset names are unique when saving
   - Check browser network tab for API errors

4. **Icons Not Displaying Across Views**
   - Check if SVG files exist in `/public/icons-svg/`
   - Verify node types match SVG filenames (lowercase)
   - Unknown.svg will be used as fallback for unrecognized types
   - Clear browser cache if icons appear corrupted
   - Check browser console for icon loading errors
   - Verify NodeIcon component is rendering properly in each view
   - Test fallback system by using unrecognized node types

5. **Animation Performance Issues**
   - Disable hardware acceleration if animations are choppy
   - Check browser's animation preferences (reduced motion settings)
   - Reduce dataset size for complex graphs (>100 nodes may impact performance)
   - Close other browser tabs consuming GPU resources

6. **Mobile Gesture Problems**
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

10. **Component Re-rendering Issues (Fixed)**
    - Previous infinite loop issues in GraphVisualization have been resolved
    - Enhanced component memoization prevents unnecessary re-renders
    - Stable prop references eliminate cascading updates
    - If you experience performance issues, refresh the page

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

## 🌟 Recent Updates & Improvements

### ✅ Multi-Level Hierarchical Tree Layout Implementation (Latest)
- **Advanced BFS Algorithm**: Implemented sophisticated breadth-first search traversal for building true multi-level hierarchies
- **Root Node Selection**: Support for manual root node selection or automatic selection based on highest degree connectivity
- **Multi-Level Visualization**: Creates distinct vertical layers (Level 0, Level 1, Level 2, etc.) with proper horizontal spacing
- **Enhanced Edge Traversal**: Fixed BFS algorithm to properly discover connected nodes through manual edge inspection
- **Visual Hierarchy Representation**: Nodes positioned in clear hierarchical structure with adaptive container sizing
- **Debugging & Troubleshooting**: Comprehensive console logging for hierarchy building process and edge discovery
- **Performance Optimized**: Efficient algorithm suitable for complex graphs with multiple hierarchy levels
- **User-Friendly Interface**: Human-readable layout names and descriptive tooltips for better user experience

### ✅ Unified SVG Icon System Across All Views
- **Cross-View Icon Consistency**: SVG icons implemented in ALL 6 visualization views
- **Table View Icons**: Dedicated Icon column with 24px SVG icons for type identification
- **Cards View Icons**: SVG icons in card headers (24px) replacing emoji icons
- **Timeline View Icons**: SVG icons next to node events (20px) for visual consistency
- **Dashboard View Icons**: Icons in type distribution (16px) and connected nodes (20px)
- **Geographic Map Icons**: SVG icons in circular location markers with background rendering
- **Shared Icon System**: Unified `NodeIcon` component with caching and fallback handling
- **Performance Optimized**: Icon caching prevents duplicate network requests across views

### ✅ Multi-View Data Visualization Architecture
- **Complete Visualization System**: 6 distinct view types for comprehensive data analysis
- **Table View**: Advanced sortable/filterable tables with SVG icon column
- **Timeline View**: Chronological data visualization with SVG event icons
- **Cards View**: Grid-based detailed inspection with SVG header icons
- **Dashboard View**: Summary statistics with SVG icons in charts and lists
- **Geographic Map**: Interactive world map with SVG location markers
- **ViewSwitcher Component**: Seamless navigation between different visualization modes

### ✅ Performance & Stability Fixes (Latest)
- **Infinite Loop Resolution**: Fixed React rendering cycles in GraphVisualization component
- **Component Memoization**: Enhanced with useCallback and useMemo for optimal performance
- **Stable References**: Prevented prop recreation causing unnecessary re-renders
- **Duplicate Key Fixes**: Resolved React key warnings in TableView edge rendering
- **Enhanced Error Handling**: Improved robustness and user experience

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

### ✅ Advanced Technical Infrastructure
- **Unified SVG Icon System**: Cross-view icon consistency with intelligent caching and fallback
- **Icon Utilities**: Shared `utils/iconUtils.ts` with 40+ type mappings and PNG extraction
- **React Icon Component**: Reusable `NodeIcon` component with loading states and error handling
- **Background Image Rendering**: Advanced CSS approach for circular container compatibility
- **Page Transitions**: Smooth route and state change animations
- **Performance Optimized**: 60fps animations with GPU acceleration and icon caching
- **TypeScript Enhanced**: Full type safety with advanced component patterns
- **Modern React Patterns**: Best practices for hooks, memoization, and component architecture

### ✅ Geographic Map View & Icon Rendering Fixes (June 2024)
- **Geographic Map Responsiveness**: The Geographic Map view now auto-fills its parent container responsively, adapting to all device sizes (desktop, tablet, mobile) with a minimum height fallback for small screens.
- **Icon Rendering Bugfixes**: Fixed a bug where node icons/markers were not displaying on the Geographic Map due to a type mismatch in the icon preloading logic. All node types now display the correct SVG icon or fallback.
- **Type Safety for Cloud Builds**: Addressed strict type errors in the icon preloading logic, ensuring all required properties are present for type safety. The codebase now passes Vercel/Next.js cloud builds without type errors.
- **Debugging & Developer Experience**: Improved debugging instructions and added temporary debug styles to help diagnose map rendering and overlay issues. These have been reverted for production.
- **Unified Icon System**: The unified SVG icon system is now robust across all views, with consistent fallback and caching behavior.
- **Documentation Updated**: README and troubleshooting sections updated to reflect new fixes and best practices for debugging map/icon issues.

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