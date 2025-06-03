# TruContext Demo - Dataset Upload Guide

## Overview

The TruContext Demo platform allows you to upload structured datasets in JSON format to populate the Neo4j Aura cloud database. This guide explains how to prepare and upload your dataset for graph visualization.

## Dataset Format

Your dataset should be a JSON file with the following structure:

```json
{
  "nodes": [
    {
      "uid": "unique-id-1",
      "type": "NodeType",
      "showname": "Display Name",
      "properties": {
        "property1": "value1",
        "property2": "value2",
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
        "property2": "value2",
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

### Node Structure

Each node must have:
- `uid`: A unique identifier (string) - **Required**
- `type`: The type of node (e.g., "Server", "Application", "User") - **Required**
- `showname`: A human-readable display name - **Required**
- `properties`: An object containing additional properties - **Required**
- `icon`: (Optional) Path or identifier for an icon

### Edge Structure

Each edge must have:
- `from`: The UID of the source node - **Required**
- `to`: The UID of the target node - **Required**
- `type`: The relationship type (e.g., "CONNECTS_TO", "OWNS") - **Required**
- `properties`: An object containing additional properties - **Required**

### Stored Queries

Each stored query has:
- `query`: The Cypher query string
- `lang`: The language (typically "cypher")
- `description`: A description of what the query does

## Auto-Generated Properties

The TruContext Demo automatically enhances your dataset by adding missing properties:

### Timestamps
- **When**: If `timestamp` property is missing from nodes or edges
- **Value**: Random ISO timestamp between December 30-31, 2023
- **Format**: `2023-12-31T12:34:56.789Z`

### Geolocation (Nodes Only)
- **Longitude**: Random value between -180 and 180 degrees
- **Latitude**: Random value between -90 and 90 degrees
- **Purpose**: Enables future geo-mapping and location-based analytics

## Sample Dataset

A sample dataset is available at `/sample-dataset.json` that demonstrates:
- 5 different node types (Server, Application, Database, User, Vulnerability)
- 4 relationship types (HOSTS, CONNECTS_TO, HAS_ACCESS, AFFECTS)
- 2 sample Cypher queries
- Proper JSON structure and formatting

## Uploading a Dataset

### Step-by-Step Process

1. **Prepare Your Data**: Ensure your JSON file follows the required format
2. **Access the Upload Area**: Navigate to the "Dataset Upload" section
3. **Upload Method**: Either:
   - Drag and drop your JSON file onto the upload area
   - Click "Choose File" to select from your computer
4. **Automatic Processing**: The system will:
   - Validate your JSON structure
   - Check for required fields
   - Add missing timestamps and geolocation
   - Clear existing Neo4j data
   - Import your processed dataset
5. **Confirmation**: Wait for the success message showing node and edge counts

### Upload Interface Features

- **Drag & Drop**: Modern file upload interface
- **Real-time Validation**: Immediate feedback on file format
- **Progress Indicators**: Visual feedback during upload and processing
- **Error Handling**: Clear error messages for troubleshooting

## Data Processing Pipeline

1. **Validation**: JSON structure and required fields
2. **Reference Checking**: Ensure all edge references point to existing nodes
3. **Property Enhancement**: Add missing timestamps and geolocation
4. **Database Operations**:
   - Clear existing data: `MATCH (n) DETACH DELETE n`
   - Import nodes with labels based on `type`
   - Create relationships based on `type`
5. **Visualization Preparation**: Format data for Cytoscape.js

## Supported Node Types

The visualization uses color coding for different node types:
- **Server**: Dark blue (#003087)
- **Application**: Medium blue (#0066cc)
- **Database**: Navy blue (#004080)
- **User**: Light blue (#0080ff)
- **Vulnerability**: Red (#cc0000)
- **Other**: Gray (#666666)

## Important Notes

### Data Replacement
- **⚠️ Warning**: Uploading a dataset will **completely replace** all existing data in the Neo4j database
- **Backup**: Consider exporting existing data before uploading new datasets
- **Testing**: Use the sample dataset to test functionality before uploading production data

### Performance Considerations
- **File Size**: Large datasets may require additional processing time
- **Node Count**: Optimal performance with datasets under 1000 nodes
- **Relationships**: Complex relationship networks may affect visualization performance

### Database Requirements
- **Neo4j Aura**: Cloud-hosted Neo4j instance
- **APOC Plugin**: Required for advanced relationship creation
- **Cypher Support**: Full Cypher query language support

## Troubleshooting

### Common Upload Errors

1. **"Invalid JSON format"**
   - Use a JSON validator to check file syntax
   - Ensure proper quotes around strings
   - Check for trailing commas

2. **"Missing required fields"**
   - Verify all nodes have `uid`, `type`, `showname`, and `properties`
   - Verify all edges have `from`, `to`, `type`, and `properties`

3. **"Edge references non-existent node"**
   - Check that all `from` and `to` values in edges match node `uid` values
   - Ensure node UIDs are unique

4. **"Upload timeout"**
   - Try smaller datasets
   - Check internet connection
   - Verify Neo4j database accessibility

### Validation Checklist

Before uploading, ensure:
- [ ] JSON file is valid
- [ ] All required fields are present
- [ ] Node UIDs are unique
- [ ] Edge references exist as nodes
- [ ] Properties objects are valid JSON
- [ ] File size is reasonable (< 10MB recommended)

## Advanced Features

### Custom Properties
- Add any custom properties to nodes and edges
- Properties are preserved during import
- Use properties for filtering and analysis

### Cypher Queries
- Include stored queries for common analysis patterns
- Queries are stored but not automatically executed
- Use for documentation and future analysis

### Icon Support
- Specify icon paths for custom node visualization
- Icons are stored as metadata
- Future versions may support icon display

## Next Steps

After successful upload:
1. **View Graph**: Check the interactive visualization
2. **Explore Nodes**: Click nodes and edges to view properties
3. **Analyze Data**: Use the browser console to see detailed information
4. **Plan Enhancements**: Consider additional data sources or relationships

## Support

For technical support or questions:
- Check the main README.md for troubleshooting
- Review browser console for error messages
- Verify Neo4j connection and credentials
- Contact the development team for assistance

---

**TruContext Demo - Powered by Visium Technologies**
