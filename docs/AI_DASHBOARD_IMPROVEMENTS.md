# AI Dashboard Improvements - Enhanced Query Generation & Prompt Transparency

## Overview

This document describes two critical improvements to the AI Dashboard Builder:

1. **Enhanced Cypher Query Generation**: Improved AI logic to generate complex, multi-entity queries that match the sophistication of enhanced prompts
2. **Original Prompt Display**: Added transparency by showing the natural language prompt that generated each dashboard card

---

## Issue 1: Enhanced Cypher Query Generation

### Problem

Enhanced prompts were detailed and schema-aware, but the resulting Cypher queries were too basic and didn't match the complexity of the natural language description.

**Example**:
- **Enhanced Prompt**: "Show the relationships and associated nodes for each Exploit, including the Machines it targets as Victims, the Vulnerabilities it exploits, and the CvssSeverity levels of those Vulnerabilities, visualized in a way that highlights the connections between these entities."
- **Generated Cypher** (Before Fix): `MATCH (v:Vulnerability) WITH v.showname as vulnerability, COUNT(v) as count RETURN vulnerability, count ORDER BY count DESC LIMIT 10`
- **Problem**: Query only shows vulnerability counts and completely ignores Exploits, Machines, Victims, and CvssSeverity relationships mentioned in the prompt

### Root Cause

The AI model in `/api/ai-dashboards/generate` was not receiving sufficient instructions to:
- Parse enhanced prompts carefully to identify all mentioned entity types
- Generate multi-hop relationship traversals when prompts mention connections
- Match query complexity to prompt complexity

### Solution

**File Modified**: `pages/api/ai-dashboards/generate.ts`

**Changes Made**:

1. **Added Query Complexity Matching Instructions**:
```typescript
QUERY COMPLEXITY MATCHING:
- Analyze the user prompt carefully to identify ALL mentioned entity types and relationships
- If the prompt mentions multiple entities (e.g., "Exploits, Machines, Vulnerabilities"), your query MUST include ALL of them
- If the prompt mentions relationships or connections (e.g., "targets", "exploits", "associated with"), use multi-hop relationship traversals
- Match the complexity of your Cypher query to the complexity of the user's request
- DO NOT simplify complex prompts into basic single-entity queries
- If the prompt asks about relationships between entities, your query must traverse those relationships
```

2. **Enhanced Cypher Syntax Rules**:
```typescript
- For multi-entity queries, use relationship patterns: MATCH (a:LabelA)-[:REL]->(b:LabelB)-[:REL2]->(c:LabelC)
```

3. **Added Complex Query Examples**:
```typescript
EXAMPLES OF COMPLEX QUERIES:
- For "Show Exploits and their target Machines": 
  MATCH (e:Exploit)-[:VICTIM]->(m:Machine) 
  WITH e.showname as exploit, COUNT(DISTINCT m) as machine_count 
  RETURN exploit, machine_count ORDER BY machine_count DESC LIMIT 10

- For "Vulnerabilities with severity and affected machines": 
  MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity), (v)-[:ON]->(m:Machine) 
  WITH v.showname as vuln, s.showname as severity, COUNT(DISTINCT m) as machines 
  RETURN vuln, severity, machines ORDER BY machines DESC LIMIT 10

- For "Exploits, Machines, and Vulnerabilities": 
  MATCH (e:Exploit)-[:VICTIM]->(m:Machine)<-[:ON]-(v:Vulnerability) 
  WITH e.showname as exploit, COUNT(DISTINCT m) as machines, COUNT(DISTINCT v) as vulns 
  RETURN exploit, machines, vulns ORDER BY machines DESC LIMIT 10
```

4. **Added Exploit-Victim Relationship**:
```typescript
- Exploit → VICTIM → Machine (for exploit targets)
```

### Expected Behavior After Fix

When a user provides an enhanced prompt mentioning multiple entities and relationships, the generated Cypher query will:
- Include ALL mentioned entity types (Exploit, Machine, Vulnerability, CvssSeverity, etc.)
- Traverse relationships between entities using multi-hop patterns
- Return data that actually answers the user's question
- Match the complexity and intent of the enhanced prompt

**Example After Fix**:
- **Enhanced Prompt**: "Show the relationships and associated nodes for each Exploit, including the Machines it targets as Victims, the Vulnerabilities it exploits, and the CvssSeverity levels of those Vulnerabilities"
- **Generated Cypher** (After Fix): 
```cypher
MATCH (e:Exploit)-[:VICTIM]->(m:Machine)<-[:ON]-(v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity)
WITH e.showname as exploit, 
     COUNT(DISTINCT m) as target_machines, 
     COUNT(DISTINCT v) as vulnerabilities,
     COLLECT(DISTINCT s.showname) as severity_levels
RETURN exploit, target_machines, vulnerabilities, severity_levels
ORDER BY target_machines DESC 
LIMIT 10
```

---

## Issue 2: Original Prompt Display

### Problem

Users had no way to see what natural language prompt generated each dashboard card, making it difficult to:
- Understand how a card was created
- Reproduce similar cards
- Debug unexpected results
- Maintain transparency in the AI generation process

### Solution

Added an info icon (ℹ️) to each dashboard card that displays the original natural language prompt in a tooltip.

### Implementation Details

#### 1. Updated AICard Interface

**File**: `components/DataViews/AIDashboardsView.tsx`

```typescript
interface AICard {
  id: string
  title: string
  viz_type: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
  cypher: string
  options?: any
  data?: { columns: string[]; rows: any[] }
  originalPrompt?: string // NEW: The natural language prompt that generated this card
}
```

#### 2. Captured Original Prompt During Card Creation

**File**: `components/DataViews/AIDashboardsView.tsx` (onCreate function)

```typescript
const mapped: AICard[] = (gen.cards || []).map((c: any, idx: number) => ({
  id: `card-${Date.now()}-${idx}`,
  title: c.title || `Card ${idx + 1}`,
  viz_type: c.viz_type || selectedVizType || 'table',
  cypher: c.cypher || 'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count LIMIT 10',
  options: c.options || {},
  originalPrompt: prompt // NEW: Capture the original natural language prompt
}))
```

#### 3. Added Info Icon to Card Headers

**Builder Mode Cards**:
```typescript
{card.originalPrompt && (
  <Tooltip 
    label={
      <Box>
        <Text fontWeight="bold" mb={1}>Generated from prompt:</Text>
        <Text fontSize="sm">{card.originalPrompt}</Text>
      </Box>
    }
    placement="top"
    hasArrow
  >
    <IconButton
      aria-label="View original prompt"
      icon={<InfoIcon />}
      size="xs"
      variant="ghost"
      colorScheme="blue"
    />
  </Tooltip>
)}
```

**Saved Dashboard Cards**: Same implementation in the saved cards view.

#### 4. Updated Database Schema

**File**: `lib/postgres.ts`

**Table Schema**:
```sql
CREATE TABLE IF NOT EXISTS ai_dashboard_cards (
  id SERIAL PRIMARY KEY,
  dashboard_id INTEGER REFERENCES ai_dashboards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  viz_type VARCHAR(50) NOT NULL,
  cypher TEXT NOT NULL,
  options JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  original_prompt TEXT  -- NEW COLUMN
)
```

**Interface**:
```typescript
export interface AIDashboardCardRecord {
  id: number
  dashboard_id: number
  title: string
  viz_type: string
  cypher: string
  options: Record<string, any>
  order_index: number
  original_prompt?: string  // NEW FIELD
}
```

#### 5. Updated Save/Load Functions

**Save Function** (`lib/postgres.ts`):
```typescript
export async function saveAIDashboard(
  name: string,
  prompt: string,
  cards: Array<{ 
    title: string; 
    viz_type: string; 
    cypher: string; 
    options?: any; 
    originalPrompt?: string  // NEW PARAMETER
  }>,
  datasetId?: number | null,
  metadata?: Record<string, any>
): Promise<AIDashboardRecord>
```

**Insert Query**:
```typescript
await client.query(
  `INSERT INTO ai_dashboard_cards (dashboard_id, title, viz_type, cypher, options, order_index, original_prompt)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [dashboard.id, c.title, c.viz_type, c.cypher, JSON.stringify(c.options || {}), idx++, c.originalPrompt || null]
)
```

**Load Function** (`components/DataViews/AIDashboardsView.tsx`):
```typescript
const mapped: AICard[] = (data.cards || []).map((c: any) => ({
  id: `card-${c.id}`,
  title: c.title,
  viz_type: c.viz_type,
  cypher: c.cypher,
  options: c.options,
  originalPrompt: c.original_prompt  // NEW: Load from database
}))
```

### User Experience

1. **Creating a Card**:
   - User types or enhances a prompt: "Show machines with most vulnerabilities"
   - User clicks "Create"
   - Card is created with the prompt stored in `originalPrompt` field

2. **Viewing the Prompt**:
   - User sees an info icon (ℹ️) next to the card title
   - User hovers over the icon
   - Tooltip appears showing:
     ```
     Generated from prompt:
     Show machines with most vulnerabilities
     ```

3. **Persistence**:
   - When user saves the dashboard, the original prompt is saved to PostgreSQL
   - When user loads the dashboard, the original prompt is restored
   - Info icon appears on all cards that have an original prompt

### Backward Compatibility

- Existing cards without `originalPrompt` will not show the info icon
- The field is optional (`originalPrompt?: string`)
- Database migration script provided to add column to existing databases
- No breaking changes to existing functionality

---

## Migration Instructions

### For Existing Databases

Run the migration script to add the `original_prompt` column:

```bash
npx ts-node scripts/migrate-add-original-prompt.ts
```

Or manually execute:

```sql
ALTER TABLE ai_dashboard_cards 
ADD COLUMN original_prompt TEXT;
```

### For New Installations

The schema is automatically created with the `original_prompt` column when initializing the database.

---

## Testing

### Test Enhanced Query Generation

1. Open AI Dashboards view
2. Click "Create with AI"
3. Enter a complex prompt: "Show the relationships between Exploits, Machines, and Vulnerabilities with severity levels"
4. Click "Enhance Prompt"
5. Click "Create"
6. Verify the generated Cypher query includes:
   - Multiple entity types (Exploit, Machine, Vulnerability, CvssSeverity)
   - Relationship traversals between entities
   - Appropriate aggregations

### Test Original Prompt Display

1. Create a card with prompt: "Show machines with vulnerabilities"
2. Verify info icon (ℹ️) appears next to card title
3. Hover over icon
4. Verify tooltip shows: "Generated from prompt: Show machines with vulnerabilities"
5. Save the dashboard
6. Reload the page
7. Load the dashboard
8. Verify info icon still appears and shows the same prompt

---

## Benefits

### Enhanced Query Generation
- ✅ More accurate Cypher queries that match user intent
- ✅ Support for complex multi-entity analysis
- ✅ Better utilization of enhanced prompts
- ✅ Reduced need for manual query editing

### Original Prompt Display
- ✅ Transparency in AI generation process
- ✅ Easier to understand how cards were created
- ✅ Ability to reproduce similar cards
- ✅ Better debugging of unexpected results
- ✅ Documentation of dashboard creation process

---

## Files Modified

1. `pages/api/ai-dashboards/generate.ts` - Enhanced query generation logic
2. `components/DataViews/AIDashboardsView.tsx` - Added originalPrompt field and info icon UI
3. `lib/postgres.ts` - Updated database schema and save/load functions
4. `scripts/migrate-add-original-prompt.ts` - Migration script for existing databases

---

## Future Enhancements

1. **Prompt History**: Track all prompts used to create/modify a card
2. **Prompt Editing**: Allow users to edit the original prompt and regenerate the query
3. **Prompt Suggestions**: Suggest similar prompts based on card performance
4. **Prompt Analytics**: Track which prompts generate the most useful cards
5. **Prompt Templates**: Save successful prompts as reusable templates

---

**Implementation Date**: 2025-09-30
**Status**: ✅ COMPLETE
**Version**: 1.0.0

