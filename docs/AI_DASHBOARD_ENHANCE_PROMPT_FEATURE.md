# AI Dashboard Enhance Prompt Feature

## Overview

Added an AI-powered "Enhance Prompt" feature to the AI Dashboard card creation dialog that analyzes user prompts against the Neo4j database schema and rewrites them to be more specific, data-aware, and actionable.

## Features Implemented

### 1. Backend API Endpoint

**File**: `pages/api/ai-dashboards/enhance-prompt.ts`

**Functionality**:
- Accepts user's original prompt via POST request
- Retrieves Neo4j database schema context:
  - Node types with counts
  - Relationship types with counts
  - Sample properties for top node types
  - Common relationship patterns
- Sends prompt + schema to OpenAI/Gemini for enhancement
- Returns enhanced prompt that is more specific and schema-aware

**API Request**:
```json
POST /api/ai-dashboards/enhance-prompt
{
  "prompt": "show vulnerabilities"
}
```

**API Response**:
```json
{
  "originalPrompt": "show vulnerabilities",
  "enhancedPrompt": "Display the count of Vulnerability nodes categorized by their associated CvssSeverity levels, including the average CVSS score for each severity level, to visualize the distribution of vulnerabilities across different severity categories.",
  "schemaUsed": {
    "nodeTypeCount": 12,
    "relationshipTypeCount": 14,
    "patternCount": 15
  }
}
```

**Error Handling**:
- `MISSING_API_KEY`: OpenAI/Gemini API key not configured
- `INVALID_API_KEY`: API key is invalid or expired
- `QUOTA_EXCEEDED`: API quota has been exceeded
- `SCHEMA_ERROR`: Failed to retrieve Neo4j schema
- `INTERNAL_ERROR`: Unexpected error occurred

### 2. Frontend UI Enhancement

**File**: `components/DataViews/AIDashboardsView.tsx`

**UI Changes**:
- Added "Enhance Prompt" button with sparkle icon (StarIcon)
- Positioned below the prompt textarea in the Natural Language tab
- Shows loading state while enhancement is in progress
- Disabled when prompt is empty or enhancement is in progress
- Purple outline button with tooltip explaining the feature

**User Workflow**:
1. User types initial prompt (e.g., "show vulnerabilities")
2. User clicks "Enhance Prompt" button
3. System analyzes prompt against Neo4j schema
4. Enhanced prompt replaces original in textarea
5. User can further edit or proceed to create card

**State Management**:
- Added `enhancing` state to track enhancement loading
- Integrated with existing error handling and toast notifications
- Maintains consistency with existing API key validation

### 3. AI Enhancement Logic

**Schema Context Provided to AI**:
```
Available Neo4j Database Schema:

Node Types (with counts):
- Vulnerability (12 nodes)
- Machine (6 nodes)
- Domain (5 nodes)
- Cvss (4 nodes)
...

Relationship Types (with counts):
- CVSS (12 relationships)
- ON (12 relationships)
- LAUNCHES (6 relationships)
...

Common Relationship Patterns:
- (Vulnerability)-[CVSS]->(Cvss) [12 instances]
- (Vulnerability)-[ON]->(Machine) [12 instances]
...

Sample Properties by Node Type:
- Vulnerability: uid, showname, timestamp, TC_ALARM
- Machine: uid, showname, latitude, longitude
...
```

**AI Instructions**:
The AI is instructed to:
1. Analyze the user's original prompt
2. Match it against available Neo4j schema
3. Rewrite the prompt to be more specific and data-aware
4. Ensure enhanced prompt will generate valid Cypher queries
5. Include specific entity types, properties, and aggregations
6. Make the prompt clear enough for accurate visualizations

**Enhancement Guidelines**:
- Be specific about what data to show
- Include relevant entity types from schema
- Suggest appropriate groupings or filters
- Mention useful aggregations (counts, averages, top N)
- Keep enhanced prompt concise but descriptive (1-2 sentences)
- Focus on what makes a good dashboard card visualization

## Example Enhancements

### Example 1: Vulnerability Analysis

**Original**: "show vulnerabilities"

**Enhanced**: "Display the count of Vulnerability nodes categorized by their associated CvssSeverity levels, including the average CVSS score for each severity level, to visualize the distribution of vulnerabilities across different severity categories."

**Improvements**:
- Specifies entity types (Vulnerability, CvssSeverity)
- Mentions specific aggregations (count, average)
- Includes grouping strategy (by severity levels)
- Clarifies visualization purpose

### Example 2: Machine Security

**Original**: "machines with problems"

**Enhanced**: "List all Machine nodes that have associated Vulnerability nodes, including their respective CVSS severity levels, and count the number of vulnerabilities per machine to visualize the distribution of vulnerabilities across machines."

**Improvements**:
- Specifies relationship pattern (Machine-Vulnerability)
- Includes relevant properties (CVSS severity)
- Mentions aggregation (count per machine)
- Clarifies data distribution goal

### Example 3: Exploit Analysis

**Original**: "show exploits"

**Enhanced**: "Display a list of Exploit nodes, including their showname, TC_THREAT_PATH, and the count of Machines that each Exploit has launched against, grouped by the Exploit's TC_ALARM severity level."

**Improvements**:
- Specifies entity type (Exploit)
- Includes specific properties (showname, TC_THREAT_PATH, TC_ALARM)
- Mentions relationship (Exploit-Machine)
- Includes grouping strategy (by alarm severity)

### Example 4: Domain Security

**Original**: "domain security"

**Enhanced**: "Show the number of Machines associated with each Domain, grouped by their launch Exploits, to visualize domain security risks effectively."

**Improvements**:
- Specifies entities (Machine, Domain, Exploit)
- Mentions aggregation (count of machines)
- Includes grouping strategy (by domain and exploits)
- Clarifies security risk visualization

## Technical Implementation

### Schema Retrieval Optimization

The schema retrieval is optimized for performance:
- Limits node label queries to top 20 by count
- Limits relationship type queries to top 20 by count
- Samples only 5 nodes per type for property extraction
- Limits property extraction to 10 properties per type
- Limits relationship patterns to top 15 by count

This ensures fast response times while providing sufficient context for AI enhancement.

### AI Model Configuration

**OpenAI**:
- Model: `gpt-4o-mini` (configurable via `OPENAI_MODEL` env var)
- Temperature: 0.7 (balanced creativity and consistency)
- Max tokens: 200 (concise enhanced prompts)

**Gemini**:
- Model: `gemini-1.5-flash`
- Fallback option if OpenAI is not configured

### Error Handling Flow

```
User clicks "Enhance Prompt"
  ↓
Check if prompt is empty → Disable button
  ↓
Call /api/ai-dashboards/enhance-prompt
  ↓
Retrieve Neo4j schema
  ↓ (if fails)
  Return SCHEMA_ERROR → Show error toast
  ↓
Call OpenAI/Gemini API
  ↓ (if fails)
  Check error type:
    - Missing API key → Set apiKeyMissing flag, show error
    - Invalid API key → Show error with configuration help
    - Quota exceeded → Show error with upgrade suggestion
    - Other error → Show generic error
  ↓ (if succeeds)
  Update prompt textarea with enhanced version
  ↓
Show success toast
```

## User Interface

### Button Appearance

**Normal State**:
- Purple outline button
- StarIcon on left
- Text: "Enhance Prompt"
- Tooltip: "Use AI to enhance your prompt with schema-aware details"

**Loading State**:
- Spinner replaces StarIcon
- Text: "Enhancing..."
- Button disabled

**Disabled State**:
- Grayed out when prompt is empty
- Grayed out during enhancement

### Toast Notifications

**Success**:
```
Title: "Prompt enhanced"
Description: "Your prompt has been enhanced with schema-aware details"
Status: success
Duration: 3 seconds
```

**Error - Missing API Key**:
```
Title: "Enhancement failed"
Description: "OpenAI or Gemini API key required. Add OPENAI_API_KEY or GEMINI_API_KEY to your .env.local file."
Status: error
Duration: 8 seconds
```

**Error - Invalid API Key**:
```
Title: "Enhancement failed"
Description: "The provided API key is invalid or expired. Please check your .env.local configuration."
Status: error
Duration: 8 seconds
```

**Error - Quota Exceeded**:
```
Title: "Enhancement failed"
Description: "Your API quota has been exceeded. Please try again later or upgrade your plan."
Status: error
Duration: 8 seconds
```

## Configuration

### Environment Variables

**Required** (at least one):
- `OPENAI_API_KEY`: OpenAI API key for GPT models
- `GEMINI_API_KEY`: Google Gemini API key (fallback)

**Optional**:
- `OPENAI_MODEL`: OpenAI model to use (default: `gpt-4o-mini`)

### Setup Instructions

1. **Add API key to `.env.local`**:
```bash
OPENAI_API_KEY=sk-...your-key-here...
# OR
GEMINI_API_KEY=...your-gemini-key...
```

2. **Restart development server**:
```bash
npm run dev
```

3. **Test the feature**:
   - Navigate to AI Dashboards view
   - Click "Create with AI"
   - Type a simple prompt
   - Click "Enhance Prompt"
   - Verify enhanced prompt appears

## Testing

### Manual Testing Steps

1. **Test Basic Enhancement**:
   - Type: "show vulnerabilities"
   - Click "Enhance Prompt"
   - Verify prompt is enhanced with specific details

2. **Test Empty Prompt**:
   - Leave prompt empty
   - Verify "Enhance Prompt" button is disabled

3. **Test Loading State**:
   - Type a prompt
   - Click "Enhance Prompt"
   - Verify button shows spinner and "Enhancing..." text

4. **Test Error Handling**:
   - Remove API key from `.env.local`
   - Restart server
   - Try to enhance prompt
   - Verify error message about missing API key

5. **Test Multiple Enhancements**:
   - Enhance a prompt
   - Edit the enhanced prompt
   - Enhance again
   - Verify it continues to improve

### API Testing

```powershell
# Test basic enhancement
Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/enhance-prompt" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"prompt":"show vulnerabilities"}'

# Test with different prompts
Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/enhance-prompt" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"prompt":"machines with problems"}'
```

## Benefits

1. **Improved Query Accuracy**: Enhanced prompts lead to more accurate Cypher query generation
2. **Better Visualizations**: Schema-aware prompts result in more meaningful dashboard cards
3. **User Guidance**: Helps users understand what data is available in their database
4. **Time Savings**: Reduces trial-and-error in crafting effective prompts
5. **Learning Tool**: Users learn about their schema through enhanced prompts

## Future Enhancements

1. **Prompt History**: Save and reuse previously enhanced prompts
2. **Suggestion Refinement**: Allow users to provide feedback on enhancements
3. **Multi-Card Optimization**: Enhance prompts considering existing cards in dashboard
4. **Schema Caching**: Cache schema information to reduce database queries
5. **Custom Enhancement Rules**: Allow users to define custom enhancement preferences
6. **Batch Enhancement**: Enhance multiple suggested prompts at once

## Files Modified

1. **pages/api/ai-dashboards/enhance-prompt.ts** (NEW)
   - API endpoint for prompt enhancement
   - Schema retrieval logic
   - OpenAI/Gemini integration

2. **components/DataViews/AIDashboardsView.tsx**
   - Added `enhancing` state
   - Added `enhancePrompt()` function
   - Added "Enhance Prompt" button UI
   - Integrated error handling

## Related Documentation

- [AI Dashboard Builder Enhancements](./AI_DASHBOARD_BUILDER_ENHANCEMENTS.md)
- [AI Dashboard Builder Fixes](./AI_DASHBOARD_BUILDER_FIXES.md)
- [AI Dashboard Neo4j Serialization Fix](./AI_DASHBOARD_NEO4J_SERIALIZATION_FIX.md)

## Conclusion

The "Enhance Prompt" feature significantly improves the AI Dashboard creation experience by helping users craft more effective, schema-aware prompts that lead to better dashboard cards and visualizations.

