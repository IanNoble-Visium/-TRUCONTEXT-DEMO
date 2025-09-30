# AI Dashboard Neo4j Serialization Fix

## Problem Summary

The AI Dashboard feature was experiencing a React rendering error when displaying chart data:

**Error**: `Objects are not valid as a React child (found: object with keys {low, high})`

**Root Cause**: Neo4j returns integers as objects with `{low, high}` properties for large number support. These objects were being passed directly to React components (specifically Recharts tooltips) instead of being properly serialized to JavaScript numbers.

## Solution

### 1. Enhanced Neo4j Value Serialization (pages/api/ai-dashboards/execute.ts)

Added comprehensive Neo4j data type handling in the `serializeNeo4jValue` function:

```typescript
import neo4j from 'neo4j-driver'

function serializeNeo4jValue(v: any): any {
  if (!v) return v
  if (Array.isArray(v)) return v.map(serializeNeo4jValue)
  
  // Handle Neo4j Integer objects (they have {low, high} properties)
  if (neo4j.isInt(v)) {
    return neo4j.int(v).toNumber()
  }
  
  // Handle Neo4j Date/Time objects
  if (neo4j.isDate(v) || neo4j.isDateTime(v) || neo4j.isTime(v) || 
      neo4j.isLocalDateTime(v) || neo4j.isLocalTime(v)) {
    return v.toString()
  }
  
  // Handle Neo4j Duration objects
  if (neo4j.isDuration(v)) {
    return v.toString()
  }
  
  // Recursively serialize node/relationship properties
  // ... (see full implementation)
}
```

**Key Changes**:
- Added `neo4j.isInt()` check to detect Neo4j Integer objects
- Convert Neo4j Integers to JavaScript numbers using `.toNumber()`
- Added handling for Neo4j temporal types (Date, DateTime, Time, etc.)
- Recursively serialize nested properties in nodes and relationships
- Handle plain objects by recursively serializing their properties

### 2. Client-Side Safeguards (components/DataViews/AIDashboardsView.tsx)

Added defensive data sanitization in the `ChartPreview` component:

```typescript
function ChartPreview({ card }: { card: AICard }) {
  // Ensure all data values are properly serialized for React rendering
  const rawData = card.data?.rows || []
  const data = rawData.map(row => {
    const serializedRow: Record<string, any> = {}
    Object.entries(row).forEach(([key, value]) => {
      // Convert any remaining Neo4j objects to primitive values
      if (value && typeof value === 'object' && 'low' in value && 'high' in value) {
        serializedRow[key] = typeof value.low === 'number' ? value.low : Number(value.low) || 0
      } else if (value && typeof value === 'object' && value.toString) {
        serializedRow[key] = value.toString()
      } else {
        serializedRow[key] = value
      }
    })
    return serializedRow
  })
  // ... render charts with sanitized data
}
```

**Key Changes**:
- Added client-side detection of `{low, high}` objects as fallback
- Convert any remaining Neo4j objects to primitive values before rendering
- Enhanced table rendering with safe string conversion

### 3. Improved AI Dashboard Generation (pages/api/ai-dashboards/generate.ts)

Enhanced the AI dashboard generation with:

1. **Schema-Aware Query Generation**: Provided specific relationship paths to AI
   ```
   - Vulnerability → CVSS → Cvss → SEVERITY → CvssSeverity (for severity data)
   - Vulnerability → ON → Machine (for affected machines)
   - Machine → LAUNCHES → Exploit (for exploit capabilities)
   ```

2. **Query Validation**: Added validation to ensure queries return actual data
   ```typescript
   const validation = await validateQuery(card.cypher)
   if (validation.isValid && validation.hasResults) {
     validatedCards.push(card)
   }
   ```

3. **Fallback Queries**: Pre-validated queries for common use cases
   ```typescript
   function generateFallbackCards(prompt: string, schema: any): any[] {
     // Returns pre-validated queries based on prompt keywords
   }
   ```

## Testing

### Test Queries

1. **Vulnerability Severity Distribution**:
   ```cypher
   MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity) 
   WITH s.showname as severity, COUNT(v) as count 
   RETURN severity, count 
   ORDER BY count DESC LIMIT 10
   ```

2. **Machine Vulnerability Count**:
   ```cypher
   MATCH (v:Vulnerability)-[:ON]->(m:Machine) 
   WITH m.showname as machine, COUNT(v) as vuln_count 
   RETURN machine, vuln_count 
   ORDER BY vuln_count DESC LIMIT 10
   ```

### Verification

Run these commands to verify the fix:

```powershell
# Test query execution with count aggregation
Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/execute" `
  -Method POST -ContentType "application/json" `
  -Body '{"cypher":"MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity) WITH s.showname as severity, COUNT(v) as count RETURN severity, count ORDER BY count DESC LIMIT 10"}'

# Test AI dashboard generation
Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/generate" `
  -Method POST -ContentType "application/json" `
  -Body '{"prompt":"Show vulnerability distribution by severity levels"}'
```

## Files Modified

1. **pages/api/ai-dashboards/execute.ts**
   - Added `neo4j` driver import
   - Enhanced `serializeNeo4jValue()` function with comprehensive type handling

2. **components/DataViews/AIDashboardsView.tsx**
   - Added client-side data sanitization in `ChartPreview` component
   - Enhanced table rendering with safe string conversion

3. **pages/api/ai-dashboards/generate.ts**
   - Added query validation
   - Implemented fallback query generation
   - Enhanced schema-aware prompts with specific relationship paths

## Impact

- ✅ Fixes React rendering error in AI Dashboard charts
- ✅ Ensures all Neo4j data types are properly serialized
- ✅ Improves reliability of AI-generated queries
- ✅ Provides fallback mechanisms for better user experience
- ✅ Maintains compatibility with all chart types (bar, pie, table)

## Future Improvements

1. Add unit tests for `serializeNeo4jValue()` function
2. Create integration tests for AI dashboard generation
3. Add performance monitoring for large result sets
4. Implement caching for frequently used queries

