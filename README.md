# TruContext Demo - Graph Analytics Platform

A Next.js application that enables users to upload JSON datasets, import them into a Neo4j Aura cloud database, and visualize them as interactive graph topologies using Cytoscape.js. The application features a responsive design matching the Visium Technologies brand.

![TruContext Demo](https://img.shields.io/badge/TruContext-Demo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![Neo4j](https://img.shields.io/badge/Neo4j-Aura-green)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.26.0-orange)

## 🚀 Features

- **JSON Dataset Upload**: Drag-and-drop interface for uploading JSON datasets
- **Neo4j Integration**: Automatic import into Neo4j Aura cloud database
- **Graph Visualization**: Interactive graph topology using Cytoscape.js
- **Data Processing**: Automatic timestamp and geolocation generation
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Visium Branding**: UI styled to match Visium Technologies website

## 🛠️ Technologies

- **Framework**: Next.js 14.0.0
- **UI Library**: Chakra UI
- **Graph Visualization**: Cytoscape.js with COSE layout
- **Database**: Neo4j Aura (Cloud)
- **Language**: TypeScript
- **Deployment**: Vercel-ready

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

## 🎨 UI Design

The application features a responsive single-page layout with:

- **Header**: Visium Technologies branding and navigation
- **Upload Section**: Drag-and-drop file upload with validation
- **Graph Area**: Interactive Cytoscape.js visualization
- **Instructions**: Dataset format guidelines and features

### Color Scheme (Visium Technologies)
- Primary Blue: `#003087`
- Accent Colors: Various shades of blue
- Background: Light gray (`#f7fafc`)
- Text: Dark gray (`#2d3748`)

## 🔄 API Routes

### POST `/api/upload`
Handles JSON dataset upload and Neo4j import.

**Request Body**: JSON dataset
**Response**: Success message with node/edge counts

### GET `/api/graph`
Fetches all graph data from Neo4j for visualization.

**Response**: Cytoscape.js formatted nodes and edges

## 🎯 Usage

1. **Upload Dataset**: Drag and drop a JSON file or click to select
2. **Automatic Processing**: The system validates and processes the data
3. **Neo4j Import**: Data is cleared and imported into the database
4. **Visualization**: Graph appears with interactive nodes and edges
5. **Exploration**: Click nodes and edges to view properties in console

## 📱 Responsive Design

The application adapts to different screen sizes:
- **Desktop**: Two-column layout with upload and graph side-by-side
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single-column layout with touch-friendly controls

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

## 🛡️ Security Considerations

- Environment variables are used for database credentials
- Input validation on uploaded JSON files
- Error handling for malformed data
- Neo4j parameterized queries to prevent injection

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