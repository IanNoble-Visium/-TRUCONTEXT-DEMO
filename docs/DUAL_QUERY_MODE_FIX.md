# Dual Query Mode Fix for AI Dashboard Cards

## Problem Summary

When manually entering graph-returning Cypher queries (e.g., `MATCH (n)-[r]->(m) WHERE r.TC_THREAT_PATH IS NOT NULL RETURN n, r, m`) into AI Dashboard cards, the application crashed with a Cytoscape.js error: `"Can not create edge 'edge-0' with nonexistant source 'node-0'"`.

This occurred because the application assumed all cards store a single Cypher query, but different visualization types need different query formats:
- **Chart/Table visualizations** (bar, pie, line, table): Need aggregation queries returning primitive values
- **Mini-Topology visualization**: Needs graph-returning queries that return node and relationship objects

## Root Cause

The original implementation had three critical issues:

1. **Single Query Storage**: Cards only stored one `cypher` field, which couldn't accommodate both query types
2. **Query Type Mismatch**: When users manually edited queries or switched visualization types, the wrong query format would be used
3. **Data Structure Incompatibility**: Aggregation queries return primitive values, while graph queries return complex node/relationship objects

## Solution Implemented

### 1. Dual Query Storage

Extended the `AICard` interface to support both query types:

```typescript
interface AICard {
  id: string
  title: string
  viz_type: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
  cypher: string // Legacy field - kept for backward compatibility
  cypherAggregation?: string // For chart/table visualizations
  cypherGraph?: string // For mini-topology visualization
  options?: any
  data?: {
    columns: string[]
    rows: any[]
    graphData?: { nodes: any[], edges: any[] }
  }
  originalPrompt?: string
}
```

### 2. Automatic Query Selection

Updated the `runCard` function to automatically select the appropriate query based on `viz_type`:

```typescript
async function runCard(index: number) {
  const c = cardList[index]
  
  // Select the appropriate query based on visualization type
  let queryToExecute: string
  if (c.viz_type === 'mini-topology') {
    // For mini-topology, prefer cypherGraph, fallback to cypher
    queryToExecute = c.cypherGraph || c.cypher
  } else {
    // For charts/tables, prefer cypherAggregation, fallback to cypher
    queryToExecute = c.cypherAggregation || c.cypher
  }
  
  // Execute the appropriate query...
}
```

### 3. Smart Cypher Editing

Updated manual Cypher edit handlers to save to the appropriate field based on current `viz_type`:

```typescript
// Builder mode Cypher editor
<Input
  value={card.viz_type === 'mini-topology' ? (card.cypherGraph || card.cypher) : (card.cypherAggregation || card.cypher)}
  onChange={(e) => {
    const v = e.target.value
    setBuilderCards(prev => prev.map((c) => {
      if (c.id !== card.id) return c
      // Update the appropriate query field based on viz_type
      if (c.viz_type === 'mini-topology') {
        return { ...c, cypherGraph: v, cypher: v } // Update both for backward compatibility
      } else {
        return { ...c, cypherAggregation: v, cypher: v }
      }
    }))
  }}
/>
```

### 4. Database Schema Updates

Added new columns to the `ai_dashboard_cards` table:

```sql
ALTER TABLE ai_dashboard_cards ADD COLUMN cypher_aggregation TEXT;
ALTER TABLE ai_dashboard_cards ADD COLUMN cypher_graph TEXT;
```

Updated the TypeScript interface:

```typescript
export interface AIDashboardCardRecord {
  id: number
  dashboard_id: number
  title: string
  viz_type: string
  cypher: string
  cypher_aggregation?: string
  cypher_graph?: string
  options: Record<string, any>
  order_index: number
  original_prompt?: string
}
```

### 5. AI Generation Enhancement

Updated the AI generation endpoint to generate BOTH query types for every card:

**System Prompt Addition**:
```
DUAL QUERY GENERATION:
For each card, you MUST generate TWO queries:
- **cypherAggregation**: Returns aggregated data for charts/tables (WITH ... COUNT() RETURN field, count)
- **cypherGraph**: Returns nodes and relationships for mini-topology visualization (RETURN n, r, m)

This allows users to switch between visualization types without regenerating queries.
```

**Validation Logic**:
```typescript
// Validate both query types
if (card.cypherAggregation) {
  const validation = await validateQuery(card.cypherAggregation)
  if (validation.isValid && validation.hasResults) {
    isValid = true
  }
}

if (card.cypherGraph) {
  const validation = await validateQuery(card.cypherGraph)
  if (validation.isValid && validation.hasResults) {
    isValid = true
  }
}
```

### 6. User Experience Improvements

Added warning toasts when switching to a visualization type without the appropriate query:

```typescript
function updateBuilderCardVizType(cardId: string, vizType: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology') {
  setBuilderCards(prev => prev.map(c => {
    if (c.id !== cardId) return c
    
    // Check if the appropriate query exists for the new viz type
    const needsGraph = vizType === 'mini-topology'
    const needsAggregation = vizType !== 'mini-topology'
    
    if (needsGraph && !c.cypherGraph && !c.cypher) {
      toast({
        title: 'No graph query available',
        description: 'This card does not have a graph-returning query. The visualization may not work correctly.',
        status: 'warning',
        duration: 5000
      })
    } else if (needsAggregation && !c.cypherAggregation && !c.cypher) {
      toast({
        title: 'No aggregation query available',
        description: 'This card does not have an aggregation query. The visualization may not work correctly.',
        status: 'warning',
        duration: 5000
      })
    }
    
    return { ...c, viz_type: vizType }
  }))
}
```

## Files Modified

### 1. `components/DataViews/AIDashboardsView.tsx`
- Updated `AICard` interface to include `cypherAggregation` and `cypherGraph` fields
- Modified `runCard` function to select appropriate query based on `viz_type`
- Updated manual Cypher edit handlers (builder and display modes) to save to correct field
- Enhanced `updateBuilderCardVizType` to show warnings when appropriate query is missing
- Updated `loadDashboard` to load new fields from database
- Updated `onCreate` to capture new fields from AI generation

### 2. `lib/postgres.ts`
- Added `cypher_aggregation` and `cypher_graph` columns to table schema
- Added migration logic to add columns to existing databases
- Updated `AIDashboardCardRecord` interface
- Modified save function to persist both query types

### 3. `pages/api/ai-dashboards/generate.ts`
- Updated schema description to include both query fields
- Enhanced system prompt to instruct AI to generate both query types
- Modified validation logic to validate both queries independently
- Added migration logic for legacy `cypher` field

## Query Examples

### Aggregation Query (for Charts/Tables)
```cypher
MATCH (m:Machine)-[:LAUNCHES]->(e:Exploit) 
WITH m.showname as machine, COUNT(e) as exploit_count 
RETURN machine, exploit_count 
ORDER BY exploit_count DESC 
LIMIT 10
```

### Graph Query (for Mini-Topology)
```cypher
MATCH (m:Machine)-[r:LAUNCHES]->(e:Exploit) 
RETURN m, r, e 
LIMIT 10
```

## Backward Compatibility

The implementation maintains full backward compatibility:

1. **Legacy `cypher` field**: Still stored and used as fallback
2. **Automatic migration**: When editing queries, both new and legacy fields are updated
3. **Fallback logic**: If new fields are missing, falls back to legacy `cypher` field
4. **Database migration**: Existing databases automatically get new columns added

## Testing

### Test Case 1: Manual Graph Query Entry
1. Create a card with mini-topology visualization
2. Manually edit Cypher to: `MATCH (n)-[r]->(m) WHERE r.TC_THREAT_PATH IS NOT NULL RETURN n, r, m`
3. Click "Run"
4. **Expected**: Graph renders without crashes, showing nodes and edges with TC_THREAT_PATH property

### Test Case 2: Visualization Type Switching
1. Create a card with bar chart visualization
2. Switch visualization type to "Mini Topology"
3. **Expected**: Warning toast appears if no graph query exists
4. Switch back to "Bar Chart"
5. **Expected**: Aggregation query is used

### Test Case 3: AI Generation
1. Generate a new dashboard card with any prompt
2. **Expected**: Both `cypherAggregation` and `cypherGraph` fields are populated
3. Switch between visualization types
4. **Expected**: Appropriate query is used for each type

### Test Case 4: Database Persistence
1. Create cards with both query types
2. Save dashboard
3. Reload dashboard
4. **Expected**: Both query types are preserved and loaded correctly

## Benefits

1. **No More Crashes**: Proper query selection prevents Cytoscape.js errors
2. **Flexible Visualization**: Users can switch between chart and graph views without regenerating
3. **Better UX**: Clear warnings when queries are missing
4. **Future-Proof**: Supports adding more visualization types easily
5. **Backward Compatible**: Existing dashboards continue to work

## Future Enhancements

1. **Auto-Generate Missing Query**: When switching viz types, automatically generate the missing query using AI
2. **Query Preview**: Show which query will be used before running
3. **Dual Editor**: Allow editing both queries simultaneously in advanced mode
4. **Query Validation UI**: Visual indicators showing which queries are valid/invalid

