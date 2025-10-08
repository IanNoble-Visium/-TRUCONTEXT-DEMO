# TruContext Demo - Advanced Graph Analytics Platform

**Version 0.2.0** - *Latest: Geographic Coordinate Persistence & Continuous Integration*

A comprehensive cybersecurity graph analytics platform built with Next.js, Neo4j, and advanced visualization capabilities. This application provides real-time network analysis, threat detection, and comprehensive icon management for cybersecurity professionals.

## 🚀 Latest Updates & Enhancements

### 🗺️ **Geographic Coordinate Assignment Wizard - PERSISTENT STORAGE & CONTINUOUS INTEGRATION!**

#### 🏗️ **Dual Database Persistence Architecture**
- **Neo4j Primary Storage**: Geographic coordinates now persist in the graph database, ensuring data survives page refreshes
- **PostgreSQL Backup**: Maintains coordinate data in relational database for archival and analytics
- **Automatic Synchronization**: Both databases updated simultaneously for data consistency

#### 🎯 **Enhanced Geographic Map Integration**
- **Continuous Addition**: "Add Coordinates" button enables ongoing geographic dataset expansion
- **Wizard Integration**: Coordinate assignment wizard accessible from populated maps, not just empty states
- **Real-time Updates**: Map refreshes immediately after coordinate assignment
- **Persistent Visualization**: Geographic data maintained across sessions and deployments

#### ⚡ **Technical Implementation**
- **New API Endpoint**: `/api/nodes/update-neo4j-properties` for direct Neo4j coordinate updates
- **Dual Update Logic**: Enhanced `EnhancedGraphVisualization.tsx` with parallel database operations
- **Error Handling**: Graceful degradation if one database update fails
- **Performance Optimized**: Minimal latency impact with parallel processing

#### ✅ **Key Benefits**
- **Zero Data Loss**: Coordinates persist through page refreshes and application restarts
- **Scalable Expansion**: Add geographic data to existing datasets without recreation
- **Production Ready**: Enterprise-grade persistence with dual database reliability
- **User-Friendly**: Seamless workflow with immediate visual feedback

## 📋 Changes

### **Version 0.2.0 (Latest)**
- ✅ **Geographic Coordinate Persistence**: Fixed coordinate loss on page refresh by implementing dual database updates (Neo4j + PostgreSQL)
- ✅ **Continuous Geographic Integration**: Added "Add Coordinates" button to Geographic Map view for ongoing dataset expansion
- ✅ **New API Endpoint**: `/api/nodes/update-neo4j-properties` for direct Neo4j coordinate updates
- ✅ **Enhanced User Experience**: Coordinate wizard now accessible from populated maps, not just empty states
- ✅ **Dual Database Architecture**: Simultaneous updates to both Neo4j (primary) and PostgreSQL (backup) databases
- ✅ **Real-time Map Updates**: Immediate visualization of coordinate changes without page refresh

### **Version 0.1.0**
- ✅ **Dynamic Icon Mapping Management System (v5.0)**: Complete PostgreSQL-powered icon mapping system
- ✅ **PostgreSQL Integration**: Migrated to enterprise-grade database for persistent storage
- ✅ **Enhanced Icon Generation Workflow (v4.0)**: Single-dialog experience with preview and approval
- ✅ **AI-Powered Icon Generation**: Dual API system with Recraft.ai primary and Gemini fallback

## 🐛 Known Issues

- **Real-time Shared Topology Persistence**: Node positioning currently local-only, multi-user synchronization planned for future release
- **Icon Style Transfer**: AI-powered style transfer between existing icons not yet implemented
- **Mobile Application**: Native mobile app for field operations not yet available

## 🤝 Contributing

We welcome contributions to the TruContext Demo project! Here's how you can help:

### **Development Setup**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Test thoroughly across different view modes and data scenarios
5. Commit with clear, descriptive messages
6. Push to your branch and create a Pull Request

### **Contribution Guidelines**
- **Code Quality**: Ensure TypeScript types are properly defined and code is well-documented
- **Testing**: Test changes across all dashboard views (Executive, SOC, Threat Analysis, Geographic Map, etc.)
- **Database Changes**: Any schema modifications must be backward compatible
- **UI/UX**: Maintain consistency with existing Chakra UI design system
- **Performance**: Ensure changes don't negatively impact graph rendering or data loading

### **Reporting Issues**
- Use the GitHub Issues template with detailed reproduction steps
- Include browser console logs and network tab information
- Specify which view mode and data scenario the issue occurs in
- Attach screenshots or screen recordings when possible

## 🔧 Adding New Views with Scrollable Content

When adding new dashboard views or content-heavy components that require vertical scrolling, developers must update **THREE overflow conditions** to ensure scroll bars appear correctly:

### **Required Updates**

#### **1. Main App Container** (`pages/index.tsx` ~line 231)
```tsx
// Add your new view to the overflow condition
<Box
  height="100dvh"
  overflow={currentView === 'executive' || currentView === 'soc-executive' || currentView === 'threat-analysis' || currentView === 'ai-agents' || currentView === 'ai-dashboards' || currentView === 'your-new-view' ? 'auto' : 'hidden'}
>
```

#### **2. Graph MotionBox Container** (`pages/index.tsx` ~line 369)
```tsx
// Add your new view to the overflow condition
<MotionBox
  height="100%"
  overflow={currentView === 'threat-analysis' || currentView === 'ai-agents' || currentView === 'ai-dashboards' || currentView === 'your-new-view' ? 'auto' : 'hidden'}
>
```

#### **3. ViewSwitcher Component** (`components/DataViews/ViewSwitcher.tsx` ~line 200)
```tsx
// Add your new view to the overflow condition
<Box
  flex="1"
  overflow={currentView === 'executive' || currentView === 'soc-executive' || currentView === 'threat-analysis' || currentView === 'ai-agents' || currentView === 'ai-dashboards' || currentView === 'your-new-view' ? 'auto' : 'hidden'}
  position="relative"
  minHeight={0}
>
```

### **View Component Requirements**

Your view component should use `minH="100%"` (not `height="100%"`) to allow content expansion:

```tsx
// ✅ Correct - allows content to expand beyond viewport
<Box p={6} bg={bgColor} minH="100%" w="100%">
  {/* Your content */}
</Box>

// ❌ Incorrect - constrains content to viewport height
<Box p={6} bg={bgColor} height="100%" overflow="hidden">
  {/* Content will be cut off */}
</Box>
```

### **How It Works**

1. **ViewSwitcher** handles the actual scrolling with `overflow='auto'`
2. **Parent containers** must allow scrolling by including the view in their overflow conditions
3. **View component** uses `minH="100%"` to expand beyond viewport when needed
4. **Scroll bar appears** on the right side when content exceeds viewport height

### **Testing Checklist**

- [ ] Scroll bar appears when content extends beyond viewport
- [ ] Scroll bar is visible on the right side of the screen
- [ ] All content is accessible via scrolling
- [ ] No content is cut off or hidden
- [ ] Scrolling works smoothly with mouse wheel and trackpad
- [ ] Layout remains responsive on different screen sizes

### **Common Issues**

- **Missing scroll bar**: Check that all three overflow conditions include your view
- **Content cut off**: Ensure view component uses `minH="100%"` not `height="100%"`
- **Double scroll bars**: Remove any internal `overflow="auto"` from view components

### 🤖 **AI-Powered Dashboard Generation - USER-FRIENDLY ERROR HANDLING!**

- **🚨 Clear Error Messages**: Friendly error handling for missing API keys and configuration issues
- **📋 Setup Instructions**: Step-by-step guidance for configuring Google Gemini API key
- **🔧 Environment Template**: Included `.env.local.example` file with all required variables
- **⚠️ Visual Indicators**: Warning alerts and disabled buttons when API key is missing
- **🔄 Graceful Fallbacks**: Heuristic suggestions when AI service is unavailable
- **📖 Documentation Links**: Direct links to API key registration and setup guides

#### 📋 **Copy-to-Clipboard Feature for Dashboard Prompts**

Every AI-generated dashboard card includes a convenient copy-to-clipboard feature for the natural language prompt that created it:

##### Features

- **📝 Dual Icon Display**: Info icon (ℹ️) shows the full prompt in a tooltip, Copy icon (📋) copies it to clipboard
- **🎨 Visual Design**: Blue info icon for viewing, green copy icon for copying
- **✅ Success Feedback**: Toast notification confirms successful copy: "Copied to clipboard - Prompt copied successfully"
- **🔄 Works Everywhere**: Available in both builder mode and saved dashboard views

##### How to Use

1. **View the Prompt**: Hover over the blue info icon (ℹ️) to see the full natural language prompt
2. **Copy the Prompt**: Click the green copy icon (📋) next to it
3. **Confirmation**: Success toast appears confirming the copy
4. **Paste Anywhere**: Use Ctrl+V (or Cmd+V on Mac) to paste the prompt elsewhere

##### Use Cases

- **Testing**: Copy prompts to test in other AI tools or query builders
- **Documentation**: Save prompts for documentation or training materials
- **Sharing**: Share successful prompts with team members via email, chat, or collaboration tools
- **Debugging**: Copy prompts to analyze what generated specific results
- **Recreation**: Reuse successful prompts to create similar cards in other dashboards
- **Learning**: Study effective prompt patterns for better AI dashboard generation

##### Technical Details

- Uses browser's native `navigator.clipboard.writeText()` API
- Graceful error handling if clipboard access is denied
- Works across all modern browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies or permissions required

### 🤖 **AI-Powered Icon Generation (v4.0) - ENHANCED!**
- **🎯 Seamless Single-Dialog Workflow**: Complete redesign eliminating page refreshes and navigation
- **👁️ In-Dialog Preview System**: Generated icons display immediately within the same modal
- **✅ Accept/Regenerate Workflow**: Professional preview with Accept and Regenerate buttons for iterative refinement
- **⚙️ Advanced Recraft API Controls**: Experimental panel exposing configurable parameters:
  - **Model Selection**: Recraft V3 (recommended) or V2
  - **Style Options**: Vector illustration, digital illustration, icon, realistic image
  - **Substyle Variants**: Hand-drawn, flat design, isometric, minimalist, geometric
  - **Size Presets**: Multiple dimensions (1024x1024, landscape, portrait formats)
  - **Custom Prompt Prefix**: Additional customization options
- **🔄 Dual API Architecture**: Primary Recraft.ai API with Gemini fallback for maximum reliability
- **🎨 High-Quality Generation**: Vector illustration generation using recraftv3 model
- **🛡️ Intelligent Fallback System**: Automatic switching between APIs if primary service fails
- **⚡ Rate Limit Resolution**: Eliminates Gemini API busy/overload issues with Recraft.ai as primary
- **📝 Enhanced Prompting**: Optimized prompts for cybersecurity network icons with professional styling
- **🔧 Configurable API Selection**: Environment variable control for easy API switching
- **💬 Improved Error Handling**: Specific error messages and graceful degradation
- **📐 SVG Compatibility**: Maintains 512x512 SVG format for consistent icon system

### 🎆 **Enhanced Icon Generation Workflow (v4.0) - BREAKTHROUGH!**

#### 🎯 **Seamless Single-Dialog Experience**
- **No Page Refreshes**: Complete workflow happens within a single modal dialog
- **No Navigation Required**: Users stay in context throughout the entire process
- **Immediate Preview**: Generated icons display instantly within the same dialog
- **Professional UI**: Enhanced preview section with green styling, badges, and metadata

#### ⚙️ **Advanced API Controls Panel**
- **Experimental Features Badge**: Clearly marked advanced options for power users
- **Collapsible Interface**: Clean default experience with optional advanced controls
- **Comprehensive Parameters**:
  - **Model Selection**: Choose between Recraft V3 (recommended) or V2
  - **Style Options**: Vector illustration, digital illustration, icon, realistic image
  - **Substyle Variants**: Hand-drawn, flat design, isometric, minimalist, geometric
  - **Size Presets**: Multiple dimensions including landscape and portrait formats
  - **Custom Prompt Prefix**: Add personalized styling instructions
- **Tooltips & Help**: Detailed descriptions for each parameter
- **Reset to Defaults**: One-click restoration of optimal settings

#### ✅ **Accept/Regenerate Workflow**
- **Generation Mode**: "Cancel" and "Generate Icon" buttons with loading states
- **Preview Mode**: "Cancel", "Regenerate" (orange), and "Accept Icon" (green) buttons
- **Iterative Refinement**: Users can regenerate with same or modified settings
- **One-Click Acceptance**: Final approval saves icon and closes dialog
- **Visual Feedback**: Clear status indicators and success messages

#### 📊 **User Experience Metrics**
- **Reduced Clicks**: From 8+ clicks to 3 clicks for icon generation
- **Eliminated Wait Time**: No page refreshes or navigation delays
- **Improved Success Rate**: Preview system reduces generation attempts
- **Enhanced Satisfaction**: Professional workflow matches user expectations

### ✨ **Icon Management System (v3.0)**
- **Complete Icon Management View** with centralized SVG icon management
- **Enhanced AI-Powered Generation** using the new single-dialog workflow
- **Cloud Storage Integration** with Cloudinary for scalable, production-ready icon storage
- **Bulk Operations** including export all icons, import from ZIP, and bulk delete functionality
- **Drag & Drop Upload** with automatic PNG-to-SVG conversion
- **Advanced Search & Filtering** (All/Used/Unused icons)
- **Keyboard Navigation** support (Ctrl+U, Ctrl+G, Ctrl+A, Esc)
- **Enhanced Tooltips** and help system with keyboard shortcuts
- **Responsive Design** optimized for both desktop and mobile devices

### 🔧 **Technical Improvements**
- **Cloudinary Migration**: Resolved Vercel filesystem limitations (EROFS errors) by migrating from local file storage to cloud-based Cloudinary storage
- **API Modernization**: All icon-related APIs updated to use Cloudinary SDK
- **Enhanced Error Handling**: Comprehensive error handling for network requests and file operations
- **Performance Optimization**: Icons served via CDN with automatic format optimization and quality adjustment
- **Backward Compatibility**: Maintained all existing functionality while upgrading to cloud storage

### 🎨 **User Experience Enhancements**
- **Professional UI/UX**: Consistent with TruContext branding and design system
- **Real-time Feedback**: Loading states, progress indicators, and user feedback for all operations
- **Accessibility**: Keyboard navigation, screen reader support, and ARIA labels
- **Mobile Responsive**: Optimized for various screen sizes and touch interfaces
- **Help System**: Comprehensive tooltips and keyboard shortcut documentation

### 🗺️ **Dynamic Icon Mapping Management System (v5.0) - PRODUCTION READY!**

#### 🏢 **Enterprise-Grade PostgreSQL Integration**
- **Production Database**: Migrated from SQLite to PostgreSQL (Neon) for enterprise scalability
- **Vercel Compatible**: Persistent data storage that survives deployments and scaling
- **SSL Security**: Encrypted connections with automatic connection pooling
- **Auto-scaling**: Handles concurrent users and high-traffic scenarios
- **ACID Compliance**: Data integrity guaranteed with transaction support

#### 🎛️ **Comprehensive Management Interface**
- **4-Tab Dialog System**: Streamlined interface accessible via orange settings icon (⚙️) in main toolbar
  - **Mappings Tab**: View, search, filter, and manage all icon mappings with real-time updates
  - **Editor Tab**: Create and edit mappings with validation, priority settings, and descriptions
  - **Test Tab**: Real-time icon resolution testing with detailed chain analysis
  - **Export Tab**: Bulk export/import with usage statistics and validation data
- **Advanced Search & Filtering**: Find mappings by source type, target type, or description
- **Priority Management**: Control mapping precedence with numeric priority system
- **Active/Inactive States**: Enable/disable mappings without deletion

#### ⚡ **Dynamic Icon Resolution Engine**
- **Database-Driven Resolution**: Real-time icon mapping from PostgreSQL with intelligent caching
- **Usage Tracking**: Automatic analytics tracking resolution patterns and performance metrics
- **Cycle Detection**: Prevents infinite mapping loops with comprehensive validation
- **Fallback Chain**: Intelligent resolution path with graceful degradation to default icons
- **Performance Optimization**: 5-minute mapping cache and 10-minute icon existence cache
- **Context Awareness**: Component-specific resolution tracking (NodeIcon, GraphVisualization, LeafletMap)

#### 📊 **Production Analytics & Monitoring**
- **Real-time Usage Statistics**: Track icon resolution frequency, contexts, and components
- **Time-based Filtering**: Analyze usage patterns across 1h, 24h, 7d, 30d, and 90d periods
- **Performance Metrics**: Resolution time tracking and database health monitoring
- **Diagnostic Tools**: System health checks, connection pool statistics, and error tracking
- **Validation Reports**: Comprehensive mapping validation with Cloudinary icon existence verification

#### 🔄 **Advanced Operations**
- **Bulk Import/Export**: JSON-based configuration management with metadata preservation
- **Batch Validation**: Validate all mappings against Cloudinary icon repository
- **Migration Support**: Seamless component migration with helper utilities
- **API Integration**: RESTful endpoints for external system integration
- **Backup & Recovery**: Automated database backups with version control

#### 🎯 **Key Benefits**
- **Zero Downtime Updates**: Modify icon mappings without application restarts
- **Centralized Management**: Single interface for all icon mapping operations
- **Production Scalability**: Enterprise-grade database with connection pooling
- **Developer Friendly**: Easy component integration with dynamic resolver utilities
- **Analytics Driven**: Data-driven insights for icon usage optimization

## 🏗️ Architecture

### **Frontend**
- **Next.js 13+** with TypeScript for type-safe development
- **Chakra UI** for consistent, accessible component library
- **Cytoscape.js** for advanced graph visualization
- **React Hooks** for state management and lifecycle handling

### **Backend**
- **Next.js API Routes** for serverless backend functionality
- **Neo4j Aura** for graph database operations
- **PostgreSQL (Neon)** for enterprise-grade icon mapping management, usage analytics, and persistent configuration storage
- **Cloudinary** for cloud-based asset management and icon existence validation

### **External Integrations**

- **Recraft.ai API** for primary AI-powered icon generation (vector illustrations)
- **Google Gemini AI** for fallback icon generation and future features
- **Cloudinary CDN** for optimized media delivery and cloud storage
- **Vercel** for seamless deployment and hosting

## 📊 Application Architecture & Navigation Flow

This comprehensive architecture diagram visualizes the TruContext Demo application's user interface navigation flow, data architecture, and external integrations. Use this diagram for UI training, onboarding new team members, and understanding the complete application ecosystem.

```mermaid
graph TB
    %% Main Entry Point
    Start([User Access Application]) --> MainApp[Main Application<br/>pages/index.tsx]

    %% View Selection
    MainApp --> ViewSelector{View Selector}

    %% Dashboard Views
    ViewSelector -->|Executive| ExecDash[Executive Dashboard<br/>High-level Security Metrics]
    ViewSelector -->|SOC Executive| SOCDash[SOC Executive Dashboard<br/>Security Operations Center]
    ViewSelector -->|Threat Analysis| ThreatDash[Threat Path Analysis<br/>Interactive Threat Modeling]
    ViewSelector -->|Topology| TopologyView[Topology View<br/>Network Graph Visualization]
    ViewSelector -->|Table| TableView[Table View<br/>Tabular Data Display]
    ViewSelector -->|Timeline| TimelineView[Timeline View<br/>Chronological Events]
    ViewSelector -->|Cards| CardsView[Cards View<br/>Card-based Presentation]
    ViewSelector -->|Analytics| AnalyticsDash[Analytics Dashboard<br/>Advanced Reporting]
    ViewSelector -->|Geographic Map| GeoMap[Geographic Map<br/>Geospatial Visualization]
    ViewSelector -->|AI Agents| AIAgents[AI Agents View<br/>Agent Management]
    ViewSelector -->|AI Dashboards| AIDash[AI Dashboards<br/>AI-Generated Analytics]
    ViewSelector -->|Icon Management| IconMgmt[Icon Management<br/>SVG Icon System]

    %% AI Dashboard Workflows
    AIDash --> AIDashCreate{Create Dashboard}
    AIDashCreate -->|Natural Language| PromptInput[Enter Prompt<br/>Describe Dashboard]
    AIDashCreate -->|Enhance Prompt| EnhanceAPI[AI Prompt Enhancement<br/>Schema-Aware Rewriting]
    PromptInput --> GenerateCards[Generate Cards<br/>AI-Powered Creation]
    EnhanceAPI --> GenerateCards
    GenerateCards --> CardPreview[Preview Cards<br/>Edit & Customize]
    CardPreview --> SaveDash[Save Dashboard<br/>PostgreSQL Storage]
    CardPreview --> CopyPrompt[Copy Prompt<br/>Clipboard Feature]

    %% Icon Management Workflows
    IconMgmt --> IconActions{Icon Actions}
    IconActions -->|Generate| AIIconGen[AI Icon Generation<br/>Recraft.ai/Gemini]
    IconActions -->|Upload| IconUpload[Upload Icons<br/>Drag & Drop]
    IconActions -->|Manage Mappings| IconMapping[Dynamic Icon Mapping<br/>PostgreSQL Management]
    IconActions -->|Export/Import| IconBulk[Bulk Operations<br/>ZIP Export/Import]

    %% Geographic Map Workflows
    GeoMap --> GeoActions{Geographic Actions}
    GeoActions -->|View Map| LeafletMap[Interactive Map<br/>Leaflet.js]
    GeoActions -->|Assign Coordinates| CoordWizard[Coordinate Assignment Wizard<br/>Automated Geocoding]
    CoordWizard --> DualDBUpdate[Dual Database Update<br/>Neo4j + PostgreSQL]

    %% Threat Analysis Workflows
    ThreatDash --> ThreatActions{Threat Actions}
    ThreatActions -->|Create Path| ThreatPath[Define Threat Path<br/>Start/End Nodes]
    ThreatActions -->|Calculate| Neo4jPath[Neo4j Shortest Path<br/>Cypher Query]
    ThreatActions -->|Visualize| ThreatViz[Threat Visualization<br/>Highlighted Path]

    %% Topology View Workflows
    TopologyView --> TopoActions{Topology Actions}
    TopoActions -->|Select Layout| LayoutEngine[Layout Algorithms<br/>CoSE/Hierarchical/Random]
    TopoActions -->|Edit Properties| PropPanel[Properties Panel<br/>TC_ Custom Properties]
    TopoActions -->|Group Nodes| GroupOps[Grouping Operations<br/>Collapse/Expand]
    TopoActions -->|Filter| FilterOps[Filter by Alarms<br/>Threat Paths]

    %% Backend Data Layer
    ExecDash --> DataLayer[Data Layer<br/>API Routes]
    SOCDash --> DataLayer
    ThreatDash --> DataLayer
    TopologyView --> DataLayer
    TableView --> DataLayer
    TimelineView --> DataLayer
    CardsView --> DataLayer
    AnalyticsDash --> DataLayer
    GeoMap --> DataLayer
    AIAgents --> DataLayer
    AIDash --> DataLayer
    IconMgmt --> DataLayer

    %% Database Connections
    DataLayer --> Neo4jDB[(Neo4j Aura<br/>Graph Database)]
    DataLayer --> PostgresDB[(PostgreSQL/Neon<br/>Relational Database)]

    %% External API Integrations
    GenerateCards --> OpenAIAPI[OpenAI API<br/>GPT-4o-mini]
    EnhanceAPI --> OpenAIAPI
    AIIconGen --> RecraftAPI[Recraft.ai API<br/>Primary Icon Gen]
    AIIconGen --> GeminiAPI[Google Gemini API<br/>Fallback Icon Gen]
    IconUpload --> CloudinaryAPI[Cloudinary CDN<br/>Icon Storage]
    IconMapping --> CloudinaryAPI
    CoordWizard --> GeocodingAPI[Geocoding Service<br/>Address → Coordinates]

    %% Data Storage Details
    Neo4jDB -->|Stores| Neo4jData[Nodes, Edges<br/>Relationships<br/>Geographic Coordinates<br/>TC_ Properties]
    PostgresDB -->|Stores| PGData[Datasets<br/>AI Dashboards<br/>Icon Mappings<br/>Usage Analytics<br/>Coordinate Backup]

    %% User Interactions
    SaveDash --> PostgresDB
    DualDBUpdate --> Neo4jDB
    DualDBUpdate --> PostgresDB
    Neo4jPath --> Neo4jDB
    PropPanel --> Neo4jDB
    PropPanel --> PostgresDB

    %% Styling
    classDef viewClass fill:#4299e1,stroke:#2c5282,stroke-width:2px,color:#fff
    classDef dbClass fill:#48bb78,stroke:#276749,stroke-width:2px,color:#fff
    classDef apiClass fill:#ed8936,stroke:#9c4221,stroke-width:2px,color:#fff
    classDef workflowClass fill:#9f7aea,stroke:#553c9a,stroke-width:2px,color:#fff
    classDef dataClass fill:#38b2ac,stroke:#234e52,stroke-width:2px,color:#fff

    class ExecDash,SOCDash,ThreatDash,TopologyView,TableView,TimelineView,CardsView,AnalyticsDash,GeoMap,AIAgents,AIDash,IconMgmt viewClass
    class Neo4jDB,PostgresDB dbClass
    class OpenAIAPI,RecraftAPI,GeminiAPI,CloudinaryAPI,GeocodingAPI apiClass
    class GenerateCards,AIIconGen,CoordWizard,ThreatPath,LayoutEngine workflowClass
    class Neo4jData,PGData,DataLayer dataClass
```

### **Diagram Legend**

- **Blue Nodes**: Dashboard Views and UI Components
- **Green Nodes**: Database Systems (Neo4j, PostgreSQL)
- **Orange Nodes**: External API Integrations
- **Purple Nodes**: Key Workflow Actions
- **Teal Nodes**: Data Layer and Storage Details

### **Key Navigation Paths**

1. **AI Dashboard Creation**: Main App → AI Dashboards → Enter Prompt → Enhance (Optional) → Generate Cards → Preview → Save
2. **Icon Management**: Main App → Icon Management → Generate/Upload/Manage → Cloudinary Storage
3. **Geographic Mapping**: Main App → Geographic Map → Assign Coordinates → Dual Database Update (Neo4j + PostgreSQL)
4. **Threat Analysis**: Main App → Threat Analysis → Create Path → Neo4j Calculation → Visualize
5. **Topology Editing**: Main App → Topology View → Select Layout → Edit Properties → Save to Neo4j/PostgreSQL

### **Data Flow Summary**

- **User Input** → **UI Components** → **API Routes** → **Databases/External APIs** → **Response** → **UI Update**
- **Dual Database Architecture**: Critical data (coordinates, TC_ properties) persists in both Neo4j (primary) and PostgreSQL (backup)
- **AI Integration**: OpenAI for dashboards, Recraft.ai/Gemini for icons, with automatic fallback mechanisms
- **Cloud Storage**: Cloudinary CDN for scalable icon storage and delivery

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Neo4j Aura database instance
- PostgreSQL database (Neon recommended for production)
- Cloudinary account
- Recraft.ai API key (primary)
- Google AI API key (fallback)

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j

# PostgreSQL Configuration (Icon Mapping Management)
POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
# Alternative: DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# AI Icon Generation Configuration
# Recraft.ai API (Primary)
RECRAFT_API_KEY=your-recraft-api-key

# Google AI API (Fallback)
GOOGLE_API_KEY=your-google-ai-api-key

# Icon Generation API Selection (recraft or gemini)
ICON_GENERATION_API=recraft

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/IanNoble-Visium/-TRUCONTEXT-DEMO.git
   cd trucontext-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

   **🚨 Important for AI Dashboard Generation:**
   - Get an OpenAI API key at: [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add `OPENAI_API_KEY=your_api_key_here` to your `.env.local` file
   - Optionally set `OPENAI_MODEL=gpt-4o-mini` (default) or another model
   - Without this key, AI dashboard generation will be disabled with helpful error messages

4. **Migrate existing icons to Cloudinary** (if upgrading)
   ```bash
   node scripts/migrate-icons-to-cloudinary.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Features

### **Dashboard Views**
- **Executive Dashboard**: High-level security metrics and KPIs
- **SOC Executive Dashboard**: Security Operations Center overview
- **Threat Path Analysis**: Interactive threat modeling and analysis
- **Topology View**: Network topology visualization
- **Table View**: Tabular data representation
- **Timeline View**: Chronological event analysis
- **Cards View**: Card-based data presentation
- **Analytics Dashboard**: Advanced analytics and reporting
- **Geographic Map**: Geospatial threat visualization with persistent coordinate assignment
- **Icon Management**: Comprehensive icon management system

### **Icon Management Features**
- **36+ Professional Icons**: Comprehensive library of cybersecurity and network icons
- **AI Generation**: Create custom icons using natural language descriptions
- **Cloud Storage**: Scalable, CDN-delivered icon storage
- **Bulk Operations**: Export, import, and manage icons in bulk
- **Search & Filter**: Find icons by name, usage status, or type
- **Drag & Drop**: Intuitive file upload with format conversion
- **Usage Tracking**: Monitor which icons are actively used
- **Responsive Grid**: Adaptive layout for different screen sizes

### **Graph Visualization**
- **Interactive Network Graphs**: Drag, zoom, and explore network relationships
- **Multiple Layout Algorithms**: Cola, ELK, Klay, and custom layouts
- **Dynamic Styling**: Node and edge styling based on properties
- **Real-time Updates**: Live data synchronization
- **Context Menus**: Right-click actions for nodes and edges
- **Property Panels**: Detailed information display
- **Geographic Mapping**: Interactive map view with persistent coordinate assignment
- **Coordinate Wizard**: Automated geographic coordinate assignment with dual database persistence
- **Export Capabilities**: Save visualizations and data

### **Security Features**
- **Threat Path Analysis**: Identify and analyze attack vectors
- **Risk Assessment**: Automated risk scoring and categorization
- **Compliance Monitoring**: SOC 2, ISO 27001, GDPR compliance tracking
- **Real-time Alerts**: Immediate notification of security events
- **Performance Metrics**: Network efficiency and response time monitoring

## 🔌 API Endpoints

### **Icon Management APIs**
- `GET /api/icons` - Retrieve all icons from Cloudinary
- `POST /api/icons/generate` - Generate new icon using AI
- `POST /api/icons/upload` - Upload icon to Cloudinary
- `GET /api/icons/export` - Export all icons as ZIP
- `DELETE /api/icons/bulk-delete` - Delete multiple icons
- `GET /api/icons/[name]` - Get specific icon details
- `DELETE /api/icons/[name]` - Delete specific icon

### **Data APIs**
- `GET /api/graph-data` - Retrieve graph data from Neo4j
- `POST /api/nodes/update-properties` - Update node properties in PostgreSQL
- `POST /api/nodes/update-neo4j-properties` - Update node properties in Neo4j (for coordinate persistence)
- `POST /api/threat-paths` - Create new threat path
- `GET /api/analytics` - Get analytics data
- `POST /api/export` - Export data in various formats

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**
Ensure all environment variables are configured in your deployment platform:
- Neo4j credentials
- PostgreSQL connection string
- Recraft.ai API key (primary icon generation)
- Google AI API key (fallback icon generation)
- Icon generation API selection (`ICON_GENERATION_API=recraft`)
- Cloudinary configuration

### **Kubernetes Deployment**

Deploy the TruContext Demo application to a Kubernetes cluster for production-grade scalability, high availability, and enterprise deployment scenarios.

#### **Prerequisites**

Before deploying to Kubernetes, ensure you have:

- **Docker** installed (version 20.10+)
- **Kubernetes cluster** (v1.24+) - Options include:
  - Cloud providers: AWS EKS, Google GKE, Azure AKS
  - On-premises: kubeadm, Rancher, OpenShift
  - Local development: Minikube, kind, Docker Desktop
- **kubectl** configured and connected to your cluster
- **Container registry** access (Docker Hub, AWS ECR, Google GCR, Azure ACR, or private registry)
- **Helm** (optional, for advanced deployments)

#### **Deployment Workflow Overview**

The following diagram illustrates the complete deployment process from building the Docker image to accessing the application in production. This timeline shows the sequential steps and their dependencies.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Docker as Docker Build
    participant Registry as Container Registry
    participant kubectl as kubectl CLI
    participant K8s as Kubernetes Cluster
    participant ConfigMap as ConfigMap
    participant Secret as Secret
    participant Deploy as Deployment
    participant Pods as Pods (3 replicas)
    participant Service as Service
    participant Ingress as Ingress Controller
    participant HPA as HorizontalPodAutoscaler
    participant User as End User

    Note over Dev,Registry: Step 1-2: Build & Push Image
    Dev->>Docker: docker build -t trucontext-demo:latest
    Docker-->>Dev: Image built successfully
    Dev->>Registry: docker push trucontext-demo:latest
    Registry-->>Dev: Image pushed

    Note over kubectl,K8s: Step 3: Apply Kubernetes Manifests
    Dev->>kubectl: kubectl apply -f configmap.yaml
    kubectl->>K8s: Create ConfigMap
    K8s->>ConfigMap: ConfigMap created
    ConfigMap-->>kubectl: ✓ Created

    Dev->>kubectl: kubectl apply -f secret.yaml
    kubectl->>K8s: Create Secret
    K8s->>Secret: Secret created (encrypted)
    Secret-->>kubectl: ✓ Created

    Dev->>kubectl: kubectl apply -f deployment.yaml
    kubectl->>K8s: Create Deployment
    K8s->>Deploy: Deployment created
    Deploy->>Registry: Pull image trucontext-demo:latest
    Registry-->>Deploy: Image pulled
    Deploy->>Pods: Create 3 replica Pods

    Note over Pods: Pod Initialization
    Pods->>Pods: Load env from ConfigMap
    Pods->>Pods: Load secrets from Secret
    Pods->>Pods: Start Next.js application
    Pods->>Pods: Execute liveness probe (30s delay)
    Pods->>Pods: Execute readiness probe (10s delay)
    Pods-->>Deploy: All Pods ready ✓
    Deploy-->>kubectl: Deployment ready (3/3)

    Dev->>kubectl: kubectl apply -f service.yaml
    kubectl->>K8s: Create Service
    K8s->>Service: Service created (LoadBalancer)
    Service->>Pods: Register Pod endpoints
    Pods-->>Service: Endpoints registered
    Service->>Service: Allocate external IP
    Service-->>kubectl: ✓ Service ready with external IP

    Dev->>kubectl: kubectl apply -f ingress.yaml
    kubectl->>K8s: Create Ingress
    K8s->>Ingress: Ingress created
    Ingress->>Service: Configure routing rules
    Service-->>Ingress: Routes configured
    Ingress->>Ingress: Request TLS certificate
    Ingress-->>kubectl: ✓ Ingress ready

    Dev->>kubectl: kubectl apply -f hpa.yaml
    kubectl->>K8s: Create HPA
    K8s->>HPA: HPA created
    HPA->>Pods: Monitor CPU/Memory metrics
    Pods-->>HPA: Metrics collected
    HPA-->>kubectl: ✓ HPA active (min: 3, max: 10)

    Note over Dev,User: Step 4-6: Verification & Access
    Dev->>kubectl: kubectl get pods
    kubectl-->>Dev: 3 Pods running
    Dev->>kubectl: kubectl get service
    kubectl-->>Dev: External IP: 203.0.113.10
    Dev->>kubectl: kubectl get ingress
    kubectl-->>Dev: Host: trucontext.yourdomain.com

    Note over User,Ingress: Production Access
    User->>Ingress: HTTPS request to trucontext.yourdomain.com
    Ingress->>Service: Route to backend service
    Service->>Pods: Load balance to Pod (round-robin)
    Pods->>Pods: Process request
    Pods-->>Service: Response
    Service-->>Ingress: Response
    Ingress-->>User: HTTPS response ✓
```

**Deployment Timeline Summary:**

1. **Build Phase** (5-10 min): Docker image creation and registry push
2. **Configuration Phase** (1-2 min): ConfigMap and Secret creation
3. **Deployment Phase** (3-5 min): Pod creation, image pull, initialization
4. **Health Check Phase** (30-60 sec): Liveness and readiness probes
5. **Service Phase** (1-2 min): Service creation and endpoint registration
6. **Ingress Phase** (2-5 min): Ingress configuration and TLS certificate
7. **Auto-scaling Phase** (30 sec): HPA activation and metric collection
8. **Verification Phase** (1-2 min): Status checks and testing

**Total Deployment Time**: Approximately 15-30 minutes for initial deployment

#### **Step 1: Create Dockerfile**

Create a `Dockerfile` in the project root:

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for Next.js
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start application
CMD ["node", "server.js"]
```

**Note**: Ensure `next.config.js` includes `output: 'standalone'` for Docker optimization:

```javascript
module.exports = {
  output: 'standalone',
  // ... other config
}
```

#### **Step 2: Build and Push Docker Image**

```bash
# Build the Docker image
docker build -t trucontext-demo:latest .

# Tag for your container registry
docker tag trucontext-demo:latest your-registry.com/trucontext-demo:latest

# Push to container registry
docker push your-registry.com/trucontext-demo:latest
```

**For specific registries:**

```bash
# Docker Hub
docker tag trucontext-demo:latest yourusername/trucontext-demo:latest
docker push yourusername/trucontext-demo:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag trucontext-demo:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/trucontext-demo:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/trucontext-demo:latest

# Google GCR
gcloud auth configure-docker
docker tag trucontext-demo:latest gcr.io/your-project-id/trucontext-demo:latest
docker push gcr.io/your-project-id/trucontext-demo:latest
```

#### **Step 3: Create Kubernetes Manifests**

Create a `k8s/` directory with the following manifest files:

**3.1 ConfigMap** (`k8s/configmap.yaml`)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: trucontext-config
  namespace: default
data:
  # Neo4j Configuration
  NEO4J_URI: "neo4j+s://your-instance.databases.neo4j.io"
  NEO4J_USERNAME: "neo4j"
  NEO4J_DATABASE: "neo4j"

  # Icon Generation API Selection
  ICON_GENERATION_API: "recraft"

  # Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: "your-cloud-name"

  # Application Configuration
  NODE_ENV: "production"
```

**3.2 Secret** (`k8s/secret.yaml`)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: trucontext-secrets
  namespace: default
type: Opaque
stringData:
  # Neo4j Password
  NEO4J_PASSWORD: "your-neo4j-password"

  # PostgreSQL Connection String
  POSTGRES_URL: "postgresql://username:password@host:port/database?sslmode=require"

  # AI API Keys
  RECRAFT_API_KEY: "your-recraft-api-key"
  GOOGLE_API_KEY: "your-google-api-key"
  OPENAI_API_KEY: "your-openai-api-key"

  # Cloudinary Credentials
  CLOUDINARY_URL: "cloudinary://api_key:api_secret@cloud_name"
  CLOUDINARY_API_KEY: "your-cloudinary-api-key"
  CLOUDINARY_API_SECRET: "your-cloudinary-api-secret"
```

**Security Best Practice**: Use base64 encoding or external secret management:

```bash
# Create secret from literal values
kubectl create secret generic trucontext-secrets \
  --from-literal=NEO4J_PASSWORD='your-password' \
  --from-literal=POSTGRES_URL='postgresql://...' \
  --from-literal=RECRAFT_API_KEY='your-key' \
  --dry-run=client -o yaml > k8s/secret.yaml

# Or use external secret managers (AWS Secrets Manager, HashiCorp Vault, etc.)
```

**3.3 Deployment** (`k8s/deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trucontext-demo
  namespace: default
  labels:
    app: trucontext-demo
spec:
  replicas: 3  # High availability with 3 replicas
  selector:
    matchLabels:
      app: trucontext-demo
  template:
    metadata:
      labels:
        app: trucontext-demo
    spec:
      containers:
      - name: trucontext-demo
        image: your-registry.com/trucontext-demo:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP

        # Environment variables from ConfigMap
        envFrom:
        - configMapRef:
            name: trucontext-config

        # Sensitive environment variables from Secret
        env:
        - name: NEO4J_PASSWORD
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: NEO4J_PASSWORD
        - name: POSTGRES_URL
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: POSTGRES_URL
        - name: RECRAFT_API_KEY
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: RECRAFT_API_KEY
        - name: GOOGLE_API_KEY
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: GOOGLE_API_KEY
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: OPENAI_API_KEY
        - name: CLOUDINARY_URL
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: CLOUDINARY_URL
        - name: CLOUDINARY_API_KEY
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: CLOUDINARY_API_KEY
        - name: CLOUDINARY_API_SECRET
          valueFrom:
            secretKeyRef:
              name: trucontext-secrets
              key: CLOUDINARY_API_SECRET

        # Resource limits and requests
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

        # Health checks
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3

      # Image pull secrets (if using private registry)
      # imagePullSecrets:
      # - name: registry-credentials

      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
```

**3.4 Service** (`k8s/service.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: trucontext-demo-service
  namespace: default
  labels:
    app: trucontext-demo
spec:
  type: LoadBalancer  # Use ClusterIP for internal-only, LoadBalancer for external access
  selector:
    app: trucontext-demo
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  sessionAffinity: ClientIP  # Sticky sessions for better user experience
```

**3.5 Ingress** (Optional - `k8s/ingress.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: trucontext-demo-ingress
  namespace: default
  annotations:
    # NGINX Ingress Controller annotations
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"

    # Certificate Manager (for HTTPS)
    cert-manager.io/cluster-issuer: "letsencrypt-prod"

    # Rate limiting
    nginx.ingress.kubernetes.io/limit-rps: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - trucontext.yourdomain.com
    secretName: trucontext-tls-cert
  rules:
  - host: trucontext.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: trucontext-demo-service
            port:
              number: 80
```

**3.6 HorizontalPodAutoscaler** (Optional - `k8s/hpa.yaml`)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trucontext-demo-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trucontext-demo
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### **Kubernetes Cluster Architecture**

This diagram visualizes how all Kubernetes components work together in the deployed cluster. It shows the relationships between Deployments, Pods, Services, Ingress, ConfigMaps, Secrets, and external dependencies.

```mermaid
graph TB
    subgraph Internet["🌐 Internet"]
        User([End Users])
        DNS[DNS Resolution<br/>trucontext.yourdomain.com]
    end

    subgraph K8sCluster["☸️ Kubernetes Cluster (Production)"]
        subgraph Namespace["Namespace: trucontext"]
            subgraph IngressLayer["Ingress Layer"]
                Ingress[Ingress Controller<br/>NGINX/Traefik<br/>TLS/SSL Termination]
                IngressRules[Ingress Rules<br/>Host: trucontext.yourdomain.com<br/>Path: /]
            end

            subgraph ServiceLayer["Service Layer"]
                Service[Service: trucontext-demo-service<br/>Type: LoadBalancer<br/>Port: 80 → 3000<br/>Session Affinity: ClientIP]
                Endpoints[Service Endpoints<br/>Pod IPs registered]
            end

            subgraph DeploymentLayer["Deployment Layer"]
                Deployment[Deployment: trucontext-demo<br/>Replicas: 3<br/>Strategy: RollingUpdate]

                subgraph Pods["Pod Replicas"]
                    Pod1[Pod 1<br/>trucontext-demo-xxx<br/>Status: Running<br/>IP: 10.244.1.10]
                    Pod2[Pod 2<br/>trucontext-demo-yyy<br/>Status: Running<br/>IP: 10.244.1.11]
                    Pod3[Pod 3<br/>trucontext-demo-zzz<br/>Status: Running<br/>IP: 10.244.1.12]
                end

                subgraph PodDetails["Pod Container Specs"]
                    Container[Container: trucontext-demo<br/>Image: registry/trucontext:latest<br/>Port: 3000<br/>Resources: 512Mi-1Gi RAM, 250m-500m CPU]
                    LivenessProbe[Liveness Probe<br/>HTTP GET /api/health<br/>Initial Delay: 30s]
                    ReadinessProbe[Readiness Probe<br/>HTTP GET /api/health<br/>Initial Delay: 10s]
                end
            end

            subgraph ConfigLayer["Configuration Layer"]
                ConfigMap[ConfigMap: trucontext-config<br/>NEO4J_URI, NEO4J_USERNAME<br/>CLOUDINARY_CLOUD_NAME<br/>ICON_GENERATION_API<br/>NODE_ENV]
                Secret[Secret: trucontext-secrets<br/>🔒 NEO4J_PASSWORD<br/>🔒 POSTGRES_URL<br/>🔒 API Keys<br/>Type: Opaque]
            end

            subgraph AutoScaling["Auto-scaling Layer"]
                HPA[HorizontalPodAutoscaler<br/>Min: 3, Max: 10<br/>Target CPU: 70%<br/>Target Memory: 80%]
                Metrics[Metrics Server<br/>CPU/Memory Usage<br/>Custom Metrics]
            end
        end
    end

    subgraph ExternalServices["☁️ External Services"]
        subgraph Databases["Databases"]
            Neo4j[(Neo4j Aura<br/>Graph Database<br/>Nodes, Edges, Relationships)]
            PostgreSQL[(PostgreSQL/Neon<br/>Relational Database<br/>Datasets, Dashboards, Icons)]
        end

        subgraph APIs["External APIs"]
            OpenAI[OpenAI API<br/>GPT-4o-mini<br/>Dashboard Generation]
            Recraft[Recraft.ai API<br/>Icon Generation<br/>Primary]
            Gemini[Google Gemini API<br/>Icon Generation<br/>Fallback]
            Cloudinary[Cloudinary CDN<br/>Icon Storage<br/>Media Delivery]
        end
    end

    subgraph Registry["📦 Container Registry"]
        DockerRegistry[Docker Hub / ECR / GCR<br/>trucontext-demo:latest<br/>trucontext-demo:v1.0.0]
    end

    %% User Flow
    User -->|HTTPS Request| DNS
    DNS -->|Resolve IP| Ingress
    Ingress -->|Route by Host/Path| IngressRules
    IngressRules -->|Forward to Service| Service
    Service -->|Load Balance| Endpoints
    Endpoints -->|Round-robin| Pod1
    Endpoints -->|Round-robin| Pod2
    Endpoints -->|Round-robin| Pod3

    %% Deployment Flow
    Deployment -->|Manages| Pod1
    Deployment -->|Manages| Pod2
    Deployment -->|Manages| Pod3
    Pod1 -->|Contains| Container
    Pod2 -->|Contains| Container
    Pod3 -->|Contains| Container
    Container -->|Health Checks| LivenessProbe
    Container -->|Health Checks| ReadinessProbe

    %% Configuration Flow
    Pod1 -.->|Load Env Vars| ConfigMap
    Pod2 -.->|Load Env Vars| ConfigMap
    Pod3 -.->|Load Env Vars| ConfigMap
    Pod1 -.->|Load Secrets| Secret
    Pod2 -.->|Load Secrets| Secret
    Pod3 -.->|Load Secrets| Secret

    %% Auto-scaling Flow
    HPA -->|Monitor| Metrics
    Metrics -->|Collect from| Pod1
    Metrics -->|Collect from| Pod2
    Metrics -->|Collect from| Pod3
    HPA -->|Scale Up/Down| Deployment

    %% External Connections
    Pod1 -->|Cypher Queries| Neo4j
    Pod2 -->|Cypher Queries| Neo4j
    Pod3 -->|Cypher Queries| Neo4j
    Pod1 -->|SQL Queries| PostgreSQL
    Pod2 -->|SQL Queries| PostgreSQL
    Pod3 -->|SQL Queries| PostgreSQL
    Pod1 -->|API Calls| OpenAI
    Pod1 -->|API Calls| Recraft
    Pod1 -->|API Calls| Gemini
    Pod1 -->|API Calls| Cloudinary

    %% Image Pull
    Deployment -.->|Pull Image| DockerRegistry

    %% Styling
    classDef userClass fill:#667eea,stroke:#5a67d8,stroke-width:3px,color:#fff
    classDef k8sClass fill:#326ce5,stroke:#1a4d8f,stroke-width:2px,color:#fff
    classDef podClass fill:#48bb78,stroke:#2f855a,stroke-width:2px,color:#fff
    classDef configClass fill:#ed8936,stroke:#c05621,stroke-width:2px,color:#fff
    classDef dbClass fill:#9f7aea,stroke:#6b46c1,stroke-width:2px,color:#fff
    classDef apiClass fill:#f56565,stroke:#c53030,stroke-width:2px,color:#fff
    classDef registryClass fill:#4299e1,stroke:#2c5282,stroke-width:2px,color:#fff

    class User,DNS userClass
    class Ingress,IngressRules,Service,Endpoints,Deployment,HPA,Metrics k8sClass
    class Pod1,Pod2,Pod3,Container,LivenessProbe,ReadinessProbe podClass
    class ConfigMap,Secret configClass
    class Neo4j,PostgreSQL dbClass
    class OpenAI,Recraft,Gemini,Cloudinary apiClass
    class DockerRegistry registryClass
```

**Architecture Components Legend:**

- **Purple Nodes**: User access and DNS resolution
- **Blue Nodes**: Kubernetes resources (Ingress, Service, Deployment, HPA)
- **Green Nodes**: Pods and container specifications
- **Orange Nodes**: Configuration resources (ConfigMap, Secret)
- **Purple Nodes**: Database systems (Neo4j, PostgreSQL)
- **Red Nodes**: External API integrations
- **Light Blue Nodes**: Container registry

**Key Architecture Features:**

1. **High Availability**: 3 Pod replicas ensure zero-downtime deployments
2. **Load Balancing**: Service distributes traffic across healthy Pods
3. **Auto-scaling**: HPA scales from 3 to 10 Pods based on CPU/Memory
4. **Health Monitoring**: Liveness and readiness probes ensure Pod health
5. **Secure Configuration**: Secrets encrypted at rest, ConfigMaps for non-sensitive data
6. **External Access**: Ingress provides HTTPS termination and domain routing
7. **Persistent Connections**: Session affinity maintains user sessions

#### **Step 4: Deploy to Kubernetes**

```bash
# Create namespace (optional)
kubectl create namespace trucontext

# Apply all manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml  # Optional
kubectl apply -f k8s/hpa.yaml      # Optional

# Or apply all at once
kubectl apply -f k8s/
```

#### **Step 5: Verify Deployment**

```bash
# Check deployment status
kubectl get deployments
kubectl rollout status deployment/trucontext-demo

# Check pods
kubectl get pods -l app=trucontext-demo
kubectl describe pod <pod-name>

# Check service
kubectl get services
kubectl describe service trucontext-demo-service

# Check ingress (if configured)
kubectl get ingress
kubectl describe ingress trucontext-demo-ingress

# View logs
kubectl logs -f deployment/trucontext-demo
kubectl logs -f <pod-name>

# Check resource usage
kubectl top pods -l app=trucontext-demo
kubectl top nodes
```

#### **Step 6: Access the Application**

##### Option 1: LoadBalancer Service

```bash
# Get external IP
kubectl get service trucontext-demo-service

# Access via external IP
# http://<EXTERNAL-IP>
```

##### Option 2: Ingress

```bash
# Access via configured domain
# https://trucontext.yourdomain.com
```

##### Option 3: Port Forwarding (Development/Testing)

```bash
# Forward local port to service
kubectl port-forward service/trucontext-demo-service 3000:80

# Access at http://localhost:3000
```

#### **Troubleshooting Common Issues**

##### 1. Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common issues:
# - Image pull errors: Verify registry credentials
# - CrashLoopBackOff: Check application logs and environment variables
# - Resource limits: Adjust memory/CPU requests
```

##### 2. Service Not Accessible

```bash
# Verify service endpoints
kubectl get endpoints trucontext-demo-service

# Check service selector matches pod labels
kubectl get pods --show-labels

# Test service internally
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://trucontext-demo-service
```

##### 3. Environment Variables Not Loading

```bash
# Verify ConfigMap
kubectl get configmap trucontext-config -o yaml

# Verify Secret
kubectl get secret trucontext-secrets -o yaml

# Check pod environment
kubectl exec <pod-name> -- env | grep NEO4J
```

##### 4. Database Connection Issues

```bash
# Test Neo4j connectivity from pod
kubectl exec -it <pod-name> -- sh
# Inside pod: curl -v neo4j+s://your-instance.databases.neo4j.io

# Check PostgreSQL connection
kubectl exec -it <pod-name> -- sh
# Inside pod: nc -zv your-postgres-host 5432
```

##### 5. Image Pull Errors

```bash
# Create image pull secret for private registry
kubectl create secret docker-registry registry-credentials \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@example.com

# Add to deployment spec under imagePullSecrets
```

#### **Scaling Considerations**

##### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment trucontext-demo --replicas=5

# Verify scaling
kubectl get pods -l app=trucontext-demo
```

##### Auto-scaling with HPA

```bash
# Check HPA status
kubectl get hpa
kubectl describe hpa trucontext-demo-hpa

# Monitor auto-scaling events
kubectl get hpa trucontext-demo-hpa --watch
```

##### Resource Optimization

- **CPU**: Start with 250m request, 500m limit; adjust based on metrics
- **Memory**: Start with 512Mi request, 1Gi limit; monitor for OOM errors
- **Replicas**: Minimum 3 for high availability, scale based on traffic
- **Database Connections**: Configure connection pooling in PostgreSQL/Neo4j

##### Performance Tuning

```yaml
# Add to deployment for better performance
env:
- name: NODE_OPTIONS
  value: "--max-old-space-size=768"  # Adjust based on memory limits
```

#### **Production Request Flow**

This diagram illustrates how user requests flow through the Kubernetes infrastructure, from initial DNS resolution through Ingress routing, Service load balancing, Pod processing, and external service interactions. Understanding this flow is critical for debugging production issues and optimizing performance.

```mermaid
graph LR
    subgraph ClientSide["👤 Client Side"]
        Browser[Web Browser<br/>User Device]
        DNSClient[DNS Resolver<br/>Local Cache]
    end

    subgraph EdgeLayer["🌐 Edge Layer"]
        DNS[DNS Server<br/>trucontext.yourdomain.com<br/>→ Ingress IP]
        CDN[CDN/CloudFlare<br/>Optional<br/>Static Assets]
    end

    subgraph K8sIngress["☸️ Kubernetes Ingress Layer"]
        IngressCtrl[Ingress Controller<br/>NGINX/Traefik]
        TLS[TLS Termination<br/>SSL Certificate<br/>HTTPS → HTTP]
        Routing[Routing Rules<br/>Host: trucontext.yourdomain.com<br/>Path: / → Service]
    end

    subgraph K8sService["☸️ Kubernetes Service Layer"]
        ServiceLB[Service Load Balancer<br/>trucontext-demo-service<br/>Algorithm: Round-robin<br/>Session: ClientIP]
        HealthCheck{Health Check<br/>Readiness Probe<br/>Only route to healthy Pods}
    end

    subgraph K8sPods["☸️ Kubernetes Pod Layer (3 Replicas)"]
        Pod1Process[Pod 1 Processing<br/>Next.js App<br/>Port 3000]
        Pod2Process[Pod 2 Processing<br/>Next.js App<br/>Port 3000]
        Pod3Process[Pod 3 Processing<br/>Next.js App<br/>Port 3000]
    end

    subgraph AppLogic["🔧 Application Logic"]
        Router[Next.js Router<br/>API Routes<br/>Page Routes]
        APIHandler[API Handler<br/>/api/graph-data<br/>/api/ai-dashboards<br/>/api/icons]
        DataLayer[Data Layer<br/>Database Clients<br/>API Clients]
    end

    subgraph ExternalDB["💾 External Databases"]
        Neo4jQuery[Neo4j Aura<br/>Cypher Queries<br/>Graph Operations]
        PostgresQuery[PostgreSQL/Neon<br/>SQL Queries<br/>Relational Data]
    end

    subgraph ExternalAPIs["🔌 External APIs"]
        OpenAICall[OpenAI API<br/>Dashboard Generation<br/>Prompt Enhancement]
        RecraftCall[Recraft.ai API<br/>Icon Generation<br/>Vector Illustrations]
        CloudinaryCall[Cloudinary CDN<br/>Icon Storage<br/>Image Delivery]
    end

    subgraph ResponsePath["📤 Response Path"]
        JSONResponse[JSON Response<br/>Data Payload]
        HTMLResponse[HTML Response<br/>Server-Side Rendered]
        StaticAssets[Static Assets<br/>JS, CSS, Images]
    end

    %% Request Flow
    Browser -->|1. HTTPS Request<br/>trucontext.yourdomain.com| DNSClient
    DNSClient -->|2. DNS Lookup| DNS
    DNS -->|3. Return Ingress IP<br/>203.0.113.10| DNSClient
    DNSClient -->|4. Connect to IP| IngressCtrl

    IngressCtrl -->|5. TLS Handshake| TLS
    TLS -->|6. Decrypt HTTPS| Routing
    Routing -->|7. Match Host/Path<br/>Route to Service| ServiceLB

    ServiceLB -->|8. Check Pod Health| HealthCheck
    HealthCheck -->|9a. Route to Pod 1<br/>33% traffic| Pod1Process
    HealthCheck -->|9b. Route to Pod 2<br/>33% traffic| Pod2Process
    HealthCheck -->|9c. Route to Pod 3<br/>34% traffic| Pod3Process

    Pod1Process -->|10. Process Request| Router
    Pod2Process -->|10. Process Request| Router
    Pod3Process -->|10. Process Request| Router

    Router -->|11a. API Request| APIHandler
    Router -->|11b. Page Request| HTMLResponse

    APIHandler -->|12. Query Data| DataLayer

    %% External Service Calls
    DataLayer -->|13a. Cypher Query<br/>MATCH (n)-[r]->(m)| Neo4jQuery
    DataLayer -->|13b. SQL Query<br/>SELECT * FROM datasets| PostgresQuery
    DataLayer -->|13c. Generate Dashboard<br/>POST /v1/chat/completions| OpenAICall
    DataLayer -->|13d. Generate Icon<br/>POST /v3/images| RecraftCall
    DataLayer -->|13e. Upload/Fetch Icon<br/>GET/POST /v1_1/| CloudinaryCall

    %% Response Flow
    Neo4jQuery -->|14a. Graph Data<br/>Nodes & Edges| DataLayer
    PostgresQuery -->|14b. Relational Data<br/>Rows & Columns| DataLayer
    OpenAICall -->|14c. AI Response<br/>Generated Cards| DataLayer
    RecraftCall -->|14d. Icon Image<br/>SVG/PNG| DataLayer
    CloudinaryCall -->|14e. Icon URL<br/>CDN Link| DataLayer

    DataLayer -->|15. Aggregate Data| APIHandler
    APIHandler -->|16. Format Response| JSONResponse

    JSONResponse -->|17. Return to Pod| Pod1Process
    HTMLResponse -->|17. Return to Pod| Pod2Process
    StaticAssets -->|17. Return to Pod| Pod3Process

    Pod1Process -->|18. Send Response| ServiceLB
    Pod2Process -->|18. Send Response| ServiceLB
    Pod3Process -->|18. Send Response| ServiceLB

    ServiceLB -->|19. Forward Response| Routing
    Routing -->|20. Add Headers| TLS
    TLS -->|21. Encrypt Response<br/>HTTP → HTTPS| IngressCtrl
    IngressCtrl -->|22. Send to Client| Browser

    Browser -->|23. Render UI<br/>Display Data| Browser

    %% Optional CDN Path
    Browser -.->|Static Assets Request| CDN
    CDN -.->|Cached Response| Browser

    %% Styling
    classDef clientClass fill:#667eea,stroke:#5a67d8,stroke-width:2px,color:#fff
    classDef edgeClass fill:#48bb78,stroke:#2f855a,stroke-width:2px,color:#fff
    classDef k8sClass fill:#326ce5,stroke:#1a4d8f,stroke-width:2px,color:#fff
    classDef appClass fill:#ed8936,stroke:#c05621,stroke-width:2px,color:#fff
    classDef dbClass fill:#9f7aea,stroke:#6b46c1,stroke-width:2px,color:#fff
    classDef apiClass fill:#f56565,stroke:#c53030,stroke-width:2px,color:#fff
    classDef responseClass fill:#4299e1,stroke:#2c5282,stroke-width:2px,color:#fff

    class Browser,DNSClient clientClass
    class DNS,CDN edgeClass
    class IngressCtrl,TLS,Routing,ServiceLB,HealthCheck,Pod1Process,Pod2Process,Pod3Process k8sClass
    class Router,APIHandler,DataLayer appClass
    class Neo4jQuery,PostgresQuery dbClass
    class OpenAICall,RecraftCall,CloudinaryCall apiClass
    class JSONResponse,HTMLResponse,StaticAssets responseClass
```

**Request Flow Summary:**

1. **DNS Resolution** (10-50ms): Browser resolves domain to Ingress IP
2. **TLS Handshake** (50-200ms): Secure connection establishment
3. **Ingress Routing** (1-5ms): Route request to appropriate Service
4. **Service Load Balancing** (1-5ms): Distribute to healthy Pod
5. **Pod Processing** (50-500ms): Next.js application handles request
6. **Database Queries** (10-100ms): Neo4j/PostgreSQL data retrieval
7. **External API Calls** (100-2000ms): OpenAI, Recraft.ai, Cloudinary
8. **Response Assembly** (10-50ms): Format and aggregate data
9. **Response Encryption** (5-20ms): TLS encryption for HTTPS
10. **Client Rendering** (100-1000ms): Browser displays UI

**Total Request Time**: 300ms - 4 seconds (depending on complexity and external API calls)

**Performance Optimization Points:**

- **Caching**: Implement Redis for frequently accessed data
- **Connection Pooling**: Reuse database connections across requests
- **CDN**: Serve static assets from edge locations
- **Compression**: Enable gzip/brotli for response compression
- **Keep-Alive**: Maintain persistent connections to external services
- **Horizontal Scaling**: HPA automatically adds Pods under high load

#### **Production Best Practices**

1. **Security**
   - Use non-root containers (already configured in Dockerfile)
   - Enable Pod Security Policies or Pod Security Standards
   - Rotate secrets regularly
   - Use network policies to restrict traffic
   - Enable RBAC for service accounts

2. **Monitoring**
   - Deploy Prometheus and Grafana for metrics
   - Configure application performance monitoring (APM)
   - Set up log aggregation (ELK stack, Loki, CloudWatch)
   - Create alerts for critical metrics

3. **Backup & Recovery**
   - Regular database backups (Neo4j, PostgreSQL)
   - Version control for Kubernetes manifests
   - Disaster recovery plan and testing
   - Multi-region deployment for critical workloads

4. **CI/CD Integration**

   ```bash
   # Example GitHub Actions workflow
   # .github/workflows/deploy.yml
   - name: Deploy to Kubernetes
     run: |
       kubectl set image deployment/trucontext-demo \
         trucontext-demo=your-registry.com/trucontext-demo:${{ github.sha }}
       kubectl rollout status deployment/trucontext-demo
   ```

5. **Cost Optimization**
   - Use cluster autoscaler for node scaling
   - Implement pod disruption budgets
   - Use spot/preemptible instances for non-critical workloads
   - Monitor and optimize resource requests/limits

## 🔧 Development

### **Project Structure**
```
trucontext-demo/
├── components/           # React components
│   ├── DataViews/       # View-specific components
│   ├── IconManagement.tsx # Icon management component
│   └── GraphVisualization.tsx # Main graph component
├── pages/               # Next.js pages and API routes
│   ├── api/            # API endpoints
│   │   └── icons/      # Icon management APIs
│   └── index.tsx       # Main application page
├── utils/              # Utility functions
│   └── cloudinary-icons.ts # Cloudinary helper functions
├── scripts/            # Build and migration scripts
├── public/             # Static assets
└── styles/             # CSS and styling
```

### **Key Technologies**
- **Next.js**: React framework with API routes
- **TypeScript**: Type-safe JavaScript development
- **Chakra UI**: Component library for consistent UI
- **Cytoscape.js**: Graph visualization library
- **Neo4j**: Graph database for network data
- **Cloudinary**: Cloud-based media management
- **Formidable**: File upload handling
- **Archiver**: ZIP file creation for exports

### **Development Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🔧 API Architecture

### **Dual API System for Icon Generation**

The application uses a sophisticated dual API architecture to ensure maximum reliability:

#### **Primary API: Recraft.ai**
- **Model**: `recraftv3` with `vector_illustration` style
- **Advantages**: High-quality vector icons, reliable service, optimized for technical diagrams
- **Output**: 1024x1024 images wrapped in 512x512 SVG format
- **Prompt Optimization**: "Flat minimalist [nodeType] cybersecurity network icon, [description]. Vector illustration style."

#### **Fallback API: Google Gemini**
- **Model**: `gemini-1.5-flash`
- **Purpose**: Automatic fallback when Recraft.ai is unavailable
- **Output**: Native SVG generation with 512x512 viewBox
- **Enhanced Processing**: Regex-based SVG extraction and validation

#### **API Selection Logic**
```typescript
// Environment variable controls primary API
ICON_GENERATION_API=recraft  // or 'gemini'

// Automatic fallback sequence:
1. Try primary API (Recraft.ai)
2. If fails → Switch to Gemini API
3. If both fail → Return detailed error
```

#### **Error Handling & Recovery**
- **Specific Error Messages**: Different messages for API key issues, rate limits, network errors
- **Graceful Degradation**: Fallback system ensures icon generation continues
- **Detailed Logging**: API usage tracking and error categorization
- **User Feedback**: Clear indication of which API was used for generation

### **Troubleshooting Guide**

#### **Common Issues & Solutions**

**1. Recraft API 400 Error**
```
Error: "invalid combination of model recraftv3 and image type icon"
Solution: ✅ Fixed - Now uses style: 'vector_illustration'
```

**2. Gemini "Generated content is not valid SVG"**
```
Solution: ✅ Enhanced SVG extraction with regex matching
```

**3. Rate Limiting Issues**
```
Solution: ✅ Recraft.ai primary API eliminates Gemini rate limits
```

**4. API Key Configuration**
```bash
# Required environment variables:
RECRAFT_API_KEY=your-key-here
GOOGLE_API_KEY=your-key-here  # For fallback
ICON_GENERATION_API=recraft   # Primary API selection
```

## 📈 Performance & Scalability

### **Optimizations**
- **CDN Delivery**: Icons served via Cloudinary CDN
- **Automatic Format Optimization**: WebP, AVIF support
- **Lazy Loading**: On-demand resource loading
- **Caching**: Browser and server-side caching
- **Compression**: Gzip/Brotli compression for assets
- **API Efficiency**: Dual API system reduces single points of failure

### **Scalability Features**
- **Cloud Storage**: Unlimited icon storage capacity
- **Serverless APIs**: Auto-scaling API endpoints
- **Database Optimization**: Indexed queries and connection pooling
- **CDN Integration**: Global content delivery
- **API Load Balancing**: Automatic switching between AI services

## 🔒 Security

### **Security Measures**
- **Environment Variable Protection**: Sensitive data in environment variables
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: Type validation and size limits
- **HTTPS Enforcement**: Secure data transmission


## 📝 License

This project is proprietary software developed for Visium Technologies.

## 🆘 Support

For support and questions:

- **Email**: [inoble.ctr@visiumtechnologies.com](mailto:inoble.ctr@visiumtechnologies.com)
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Refer to inline code documentation

## 🎯 Roadmap

### **Recently Completed**
- ✅ **Geographic Coordinate Assignment Wizard - Persistent Storage**: Dual database architecture ensuring coordinates persist in both Neo4j and PostgreSQL, with continuous integration into Geographic Map view
- ✅ **Dynamic Icon Mapping Management System (v5.0)**: Complete PostgreSQL-powered icon mapping system with real-time configuration, usage analytics, and production-ready deployment
- ✅ **PostgreSQL Integration**: Migrated from SQLite to enterprise-grade PostgreSQL (Neon) for persistent, scalable data storage compatible with Vercel deployments
- ✅ **Advanced Icon Resolution**: Database-driven dynamic icon resolution with caching, usage tracking, and cycle detection for optimal performance
- ✅ **Comprehensive Management UI**: 4-tab interface (Mappings, Editor, Test, Export) with full CRUD operations, real-time validation, and bulk import/export capabilities
- ✅ **Production Analytics**: Usage tracking, performance monitoring, and detailed diagnostics with time-based filtering and component-level insights
- ✅ **Enhanced Icon Generation Workflow (v4.0)**: Complete redesign of icon generation UX with in-dialog preview and approval system
- ✅ **Advanced Recraft API Controls**: Exposed configurable parameters (model, style, substyle, size) with experimental UI panel
- ✅ **Seamless Single-Dialog Experience**: Eliminated page refreshes and navigation - users stay in context throughout generation process
- ✅ **Accept/Regenerate Workflow**: Professional preview system with Accept and Regenerate buttons for iterative refinement
- ✅ **Recraft.ai Integration**: Dual API system with automatic fallback
- ✅ **Rate Limit Resolution**: Eliminated Gemini API busy/overload issues
- ✅ **Enhanced Error Handling**: Improved user feedback and error recovery
- ✅ **Vector Illustration Support**: High-quality icon generation with recraftv3

### **Upcoming Features**
- **Real-time Shared Topology Persistence**: Multi-user synchronized node positioning with WebSocket-based updates (currently local-only)
- **Icon Style Transfer**: AI-powered style transfer between existing icons
- **Custom AI Model Training**: Training specialized models for cybersecurity iconography
- **Collaborative Features**: Multi-user icon management and sharing capabilities
- **Version Control System**: Icon versioning, rollback, and change tracking
- **Analytics Dashboard**: Icon usage analytics, performance insights, and optimization recommendations
- **RESTful API Extensions**: External integrations and third-party access
- **Mobile Application**: Native mobile app for field operations and remote icon management
- **Batch Generation**: Generate multiple icon variations simultaneously
- **Icon Templates**: Pre-configured templates for common cybersecurity scenarios

---

**Built with ❤️ by the Visium Technologies Team**

*Empowering cybersecurity professionals with advanced graph analytics and intelligent automation.*

