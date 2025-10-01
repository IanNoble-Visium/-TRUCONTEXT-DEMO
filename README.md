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
   - Get an OpenAI API key at: https://platform.openai.com/api-keys
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
- **Email**: inoble.ctr@visiumtechnologies.com
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

