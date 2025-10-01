# Mini Topology Visualization Fix

## Issue Summary

The Mini Topology visualization in AI Dashboard cards was not displaying relationship data from Cypher queries. When users created dashboard cards with visualization type "Mini Topology", the generated graph visualization showed only nodes without the relationships between them, even though the Cypher query included relationship patterns.

## Root Cause Analysis

The issue had three interconnected problems:

### 1. **Query Generation Problem**
The AI was generating aggregation queries (using `WITH` and `COUNT()`) instead of graph-returning queries for mini-topology visualizations.

**Example of Incorrect Query**:
```cypher
MATCH (m:Machine)-[:LAUNCHES]->(e:Exploit) 
WITH m.showname as machine, COUNT(e) as exploit_count 
RETURN machine, exploit_count 
ORDER BY exploit_count DESC 
LIMIT 10
```

This query returns aggregated data (machine names and counts), not the actual graph structure (nodes and relationships).

### 2. **Data Serialization Problem**
The execute API was serializing Neo4j nodes and relationships but wasn't properly capturing the source/target node IDs needed for graph visualization.

### 3. **Component Rendering Problem**
The MiniTopology component was trying to extract nodes and relationships from aggregated data, which doesn't contain graph structures.

## Solution Implemented

### 1. **Enhanced AI Query Generation** (`pages/api/ai-dashboards/generate.ts`)

Added visualization-type-aware query generation that detects when `viz_type` is "mini-topology" and generates appropriate queries:

**Key Changes**:
- Added conditional system prompt based on `viz_type`
- For mini-topology: Instructs AI to return actual node and relationship objects
- For charts/tables: Instructs AI to return aggregated data
- Added mini-topology-specific query examples

**Example of Correct Mini-Topology Query**:
```cypher
MATCH (m:Machine)-[r:LAUNCHES]->(e:Exploit) 
RETURN m, r, e 
LIMIT 10
```

This query returns the actual Machine nodes, LAUNCHES relationships, and Exploit nodes.

**System Prompt Enhancement**:
```typescript
VISUALIZATION TYPE HANDLING:
${requestedVizType === 'mini-topology' ? `
**MINI-TOPOLOGY MODE ACTIVATED**
For mini-topology visualizations, you MUST generate queries that return actual graph structures (nodes and relationships), NOT aggregated data.

MINI-TOPOLOGY QUERY RULES:
- RETURN actual node and relationship objects using variables: RETURN n, r, m
- DO NOT use WITH clause for aggregation
- DO NOT use COUNT(), SUM(), or other aggregation functions
- DO NOT return just properties - return the full node/relationship objects
- Use LIMIT 10-20 to keep the graph manageable
- Pattern: MATCH (n:Label1)-[r:REL_TYPE]->(m:Label2) RETURN n, r, m LIMIT 10
` : `
**CHART/TABLE MODE**
For ${requestedVizType} visualizations, generate queries that return aggregated data for charts/tables.
`}
```

### 2. **Improved Data Serialization** (`pages/api/ai-dashboards/execute.ts`)

Enhanced the `serializeNeo4jValue` function to properly capture node IDs and relationship source/target information:

**Node Serialization**:
```typescript
if (v.properties && v.labels) {
  return {
    labels: v.labels,
    properties: Object.fromEntries(
      Object.entries(v.properties).map(([key, value]) => [key, serializeNeo4jValue(value)])
    ),
    id: v.properties?.uid || v.identity?.toString() || `node-${Math.random()}`,
    elementId: v.elementId || v.identity?.toString()
  }
}
```

**Relationship Serialization**:
```typescript
if (v.properties && v.type) {
  return {
    type: v.type,
    properties: Object.fromEntries(
      Object.entries(v.properties).map(([key, value]) => [key, serializeNeo4jValue(value)])
    ),
    id: v.elementId || v.identity?.toString() || `edge-${Math.random()}`,
    source: v.start?.properties?.uid || v.startNodeElementId || v.start?.toString() || 'unknown',
    target: v.end?.properties?.uid || v.endNodeElementId || v.end?.toString() || 'unknown',
    startNodeElementId: v.startNodeElementId,
    endNodeElementId: v.endNodeElementId
  }
}
```

**Graph Data Extraction**:
Added logic to track nodes and relationships while processing query results and include them in the API response:

```typescript
// Track nodes and relationships for graph visualization
const nodeMap = new Map<string, any>()
const relationships: any[] = []

const records = result.records.map(r => {
  // ... process each record
  // Track nodes and relationships
  if (serialized.labels && serialized.properties) {
    nodeMap.set(nodeId, serialized)
  } else if (serialized.type && serialized.source && serialized.target) {
    relationships.push(serialized)
  }
})

// Add graph data if nodes/relationships were found
if (nodeMap.size > 0 || relationships.length > 0) {
  response.graphData = {
    nodes: Array.from(nodeMap.values()),
    edges: relationships
  }
}
```

### 3. **Enhanced MiniTopology Component** (`components/DataViews/AIDashboardsView.tsx`)

Completely rewrote the MiniTopology component to properly handle graph data with a three-tier fallback strategy:

**Priority 1: Use graphData from API Response**
```typescript
if (graphData && graphData.nodes && graphData.nodes.length > 0) {
  graphNodes = graphData.nodes.map((node: any) => ({
    data: {
      id: node.id || node.elementId,
      label: node.properties?.showname || node.properties?.name || node.id,
      type: node.labels?.[0] || 'Node',
      ...node.properties
    }
  }))
  
  graphEdges = (graphData.edges || []).map((edge: any, idx: number) => ({
    data: {
      id: edge.id || `edge-${idx}`,
      source: edge.source,
      target: edge.target,
      label: edge.type || 'RELATED',
      ...edge.properties
    }
  }))
}
```

**Priority 2: Extract from Raw Query Results** (fallback)
```typescript
data.forEach((row, idx) => {
  Object.values(row).forEach((value: any) => {
    if (value && typeof value === 'object' && value.labels && value.properties) {
      // Extract node
    }
    if (value && typeof value === 'object' && value.type && (value.source || value.start)) {
      // Extract relationship
    }
  })
})
```

**Priority 3: Create Simple Visualization from Tabular Data** (last resort)
```typescript
if (graphNodes.length === 0 && data.length > 0) {
  data.slice(0, 10).forEach((row, idx) => {
    // Create simple nodes from table data
  })
}
```

**Improved Cytoscape Configuration**:
- Dynamic layout selection: `cose` for graphs with edges, `circle` for node-only graphs
- Better edge styling with arrows and labels
- Console logging for debugging
- Empty state message when no data is available

## Files Modified

### 1. `pages/api/ai-dashboards/generate.ts`
- **Lines 245-293**: Added visualization-type-aware system prompt
- **Lines 295-320**: Added mini-topology-specific query examples
- **Impact**: AI now generates graph-returning queries for mini-topology

### 2. `pages/api/ai-dashboards/execute.ts`
- **Lines 31-87**: Enhanced query execution to track and return graph data
- **Lines 64-131**: Improved `serializeNeo4jValue` to capture node IDs and relationship endpoints
- **Impact**: API now returns structured graph data in `response.graphData`

### 3. `components/DataViews/AIDashboardsView.tsx`
- **Lines 62-74**: Updated `AICard` interface to include `graphData` field
- **Lines 885-1079**: Completely rewrote `MiniTopology` component
- **Line 1038**: Updated `ChartPreview` to pass `graphData` to `MiniTopology`
- **Impact**: Component now properly renders graph visualizations

## Testing

### Test Case 1: Machine-Exploit Relationships
**Prompt**: "Show machines and their exploit launch capabilities"

**Expected Query** (mini-topology):
```cypher
MATCH (m:Machine)-[r:LAUNCHES]->(e:Exploit) 
RETURN m, r, e 
LIMIT 10
```

**Expected Result**:
- Machine nodes displayed
- Exploit nodes displayed
- LAUNCHES relationships visible as arrows connecting them

### Test Case 2: Vulnerability-Machine Relationships
**Prompt**: "Show vulnerabilities on machines"

**Expected Query** (mini-topology):
```cypher
MATCH (v:Vulnerability)-[r:ON]->(m:Machine) 
RETURN v, r, m 
LIMIT 15
```

**Expected Result**:
- Vulnerability nodes displayed
- Machine nodes displayed
- ON relationships visible as arrows

### Test Case 3: Domain Structure
**Prompt**: "Show domain structure with machines"

**Expected Query** (mini-topology):
```cypher
MATCH (m:Machine)-[r:IN]->(d:Domain) 
RETURN m, r, d 
LIMIT 20
```

**Expected Result**:
- Machine nodes displayed
- Domain nodes displayed
- IN relationships visible as arrows

## Benefits

1. **Proper Graph Visualization**: Mini-topology cards now display actual graph structures with visible relationships
2. **Visualization-Aware Queries**: AI generates appropriate queries based on the selected visualization type
3. **Better Data Handling**: API properly serializes and transmits graph data
4. **Robust Fallbacks**: Component handles multiple data formats gracefully
5. **Debugging Support**: Console logging helps diagnose issues
6. **User Feedback**: Empty state messages guide users when data is missing

## Usage Instructions

### Creating a Mini-Topology Card

1. **Open AI Dashboards View**
2. **Click "Create with AI"**
3. **Select "Mini Topology" from visualization type dropdown**
4. **Enter a prompt** describing the relationships you want to see:
   - "Show machines and exploits"
   - "Display vulnerabilities on machines"
   - "Show domain structure"
5. **Click "Create"**
6. **Verify** the generated query returns nodes and relationships (not aggregated data)
7. **Click "Run"** to execute and visualize

### Editing Existing Cards

If you have existing mini-topology cards with aggregation queries:

1. **Click "Edit Cypher"** on the card
2. **Modify the query** to return nodes and relationships:
   - Change: `WITH ... COUNT(...) RETURN ...`
   - To: `RETURN n, r, m LIMIT 10`
3. **Click "Run"** to see the graph visualization

## Known Limitations

1. **Query Complexity**: Very complex multi-hop queries may generate large graphs that are hard to visualize in the small card format
2. **Layout Performance**: Graphs with 50+ nodes may render slowly
3. **Label Overlap**: Dense graphs may have overlapping labels
4. **Fallback Behavior**: If the query returns aggregated data, the visualization will fall back to simple node display without relationships

## Future Enhancements

1. **Interactive Graph**: Add zoom, pan, and node selection
2. **Layout Options**: Allow users to choose different layouts (circle, grid, hierarchical)
3. **Filtering**: Add ability to filter nodes/edges by type
4. **Tooltips**: Show node/edge properties on hover
5. **Export**: Allow exporting graph as image
6. **Query Validation**: Warn users if their query won't produce graph data
7. **Auto-Fix**: Automatically convert aggregation queries to graph queries

## Troubleshooting

### Issue: No relationships visible
**Solution**: Check that the query returns relationship objects (e.g., `RETURN m, r, e` not `RETURN m.name, COUNT(e)`)

### Issue: Empty graph
**Solution**: Verify the query returns results by checking the "Edit Cypher" section

### Issue: Nodes but no edges
**Solution**: Ensure the query includes relationship patterns and returns the relationship variable

### Issue: "No graph data available" message
**Solution**: The query likely returns aggregated data. Modify it to return actual nodes and relationships.

---

**Fix Date**: 2025-09-30
**Status**: ✅ COMPLETE
**Version**: 1.0.0

