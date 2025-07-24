# TruContext Demo - Advanced Graph Analytics Platform

A comprehensive cybersecurity graph analytics platform built with Next.js, Neo4j, and advanced visualization capabilities. This application provides real-time network analysis, threat detection, and comprehensive icon management for cybersecurity professionals.

## 🚀 Latest Updates & Enhancements

### ✨ **Icon Management System (v2.0)**
- **Complete Icon Management View** with centralized SVG icon management
- **AI-Powered Icon Generation** using Google Gemini API for creating custom network/cybersecurity icons
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
- **Google Gemini AI** for intelligent icon generation
- **Cloudinary CDN** for optimized media delivery
- **Vercel** for seamless deployment and hosting

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Neo4j Aura database instance
- PostgreSQL database
- Cloudinary account
- Google AI API key

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

# Google AI Configuration
GOOGLE_API_KEY=your-google-ai-api-key

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
- Google AI API key
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

## 📈 Performance & Scalability

### **Optimizations**
- **CDN Delivery**: Icons served via Cloudinary CDN
- **Automatic Format Optimization**: WebP, AVIF support
- **Lazy Loading**: On-demand resource loading
- **Caching**: Browser and server-side caching
- **Compression**: Gzip/Brotli compression for assets

### **Scalability Features**
- **Cloud Storage**: Unlimited icon storage capacity
- **Serverless APIs**: Auto-scaling API endpoints
- **Database Optimization**: Indexed queries and connection pooling
- **CDN Integration**: Global content delivery

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

### **Upcoming Features**
- **Advanced AI Integration**: Enhanced icon generation with style transfer
- **Collaborative Features**: Multi-user icon management
- **Version Control**: Icon versioning and rollback capabilities
- **Analytics Dashboard**: Icon usage analytics and insights
- **API Extensions**: RESTful API for external integrations
- **Mobile App**: Native mobile application for field operations

---

**Built with ❤️ by the Visium Technologies Team**

*Empowering cybersecurity professionals with advanced graph analytics and intelligent automation.*

