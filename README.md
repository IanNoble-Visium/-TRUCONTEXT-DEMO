# TruContext Demo - Advanced Graph Analytics Platform

A comprehensive cybersecurity graph analytics platform built with Next.js, Neo4j, and advanced visualization capabilities. This application provides real-time network analysis, threat detection, and comprehensive icon management for cybersecurity professionals.

## 🚀 Latest Updates & Enhancements

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

## 🏗️ Architecture

### **Frontend**
- **Next.js 13+** with TypeScript for type-safe development
- **Chakra UI** for consistent, accessible component library
- **Cytoscape.js** for advanced graph visualization
- **React Hooks** for state management and lifecycle handling

### **Backend**
- **Next.js API Routes** for serverless backend functionality
- **Neo4j Aura** for graph database operations
- **PostgreSQL** for relational data storage
- **Cloudinary** for cloud-based asset management

### **External Integrations**
- **Recraft.ai API** for primary AI-powered icon generation (vector illustrations)
- **Google Gemini AI** for fallback icon generation and future features
- **Cloudinary CDN** for optimized media delivery and cloud storage
- **Vercel** for seamless deployment and hosting

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Neo4j Aura database instance
- PostgreSQL database
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

# PostgreSQL Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

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
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

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
- **Geographic Map**: Geospatial threat visualization
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software developed for Visium Technologies.

## 🆘 Support

For support and questions:
- **Email**: inoble.ctr@visiumtechnologies.com
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Refer to inline code documentation

## 🎯 Roadmap

### **Recently Completed**
- ✅ **Enhanced Icon Generation Workflow (v4.0)**: Complete redesign of icon generation UX with in-dialog preview and approval system
- ✅ **Advanced Recraft API Controls**: Exposed configurable parameters (model, style, substyle, size) with experimental UI panel
- ✅ **Seamless Single-Dialog Experience**: Eliminated page refreshes and navigation - users stay in context throughout generation process
- ✅ **Accept/Regenerate Workflow**: Professional preview system with Accept and Regenerate buttons for iterative refinement
- ✅ **Recraft.ai Integration**: Dual API system with automatic fallback
- ✅ **Rate Limit Resolution**: Eliminated Gemini API busy/overload issues
- ✅ **Enhanced Error Handling**: Improved user feedback and error recovery
- ✅ **Vector Illustration Support**: High-quality icon generation with recraftv3

### **Upcoming Features**
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

