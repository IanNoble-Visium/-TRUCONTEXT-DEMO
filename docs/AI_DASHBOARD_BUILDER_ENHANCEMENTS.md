# AI Dashboard Builder Enhancements

## Overview

Enhanced the AI Dashboard creation workflow in the TruContext Demo application with pre-creation visualization type selection, multi-card dashboard builder, and Mini Topology graph visualization support.

## Features Implemented

### 1. Pre-Creation Visualization Type Selection

**Description**: Users can now select the visualization type for each dashboard card before creating it.

**Available Visualization Types**:
- **Bar Chart**: Displays data as vertical bars (default)
- **Pie Chart**: Shows data distribution as pie slices
- **Table**: Displays raw data in tabular format
- **Line Chart**: Shows trends over time or ordered data
- **Mini Topology**: Renders a small Cytoscape.js graph visualization

**User Interface**:
- Each suggested prompt now has a dropdown selector next to it
- Selected prompt shows current visualization type in a highlighted box
- Visualization type can be changed before clicking "Create"
- The selected type is passed to the AI generation API

**Implementation Details**:
- Added `selectedVizTypes` state to track visualization type for each prompt
- Updated modal UI to show Select dropdowns for each suggestion
- Modified `onCreate()` function to pass `viz_type` to API
- API enforces the requested visualization type on generated cards

### 2. Multi-Card Dashboard Builder

**Description**: After creating the first card, users enter "builder mode" where they can add multiple cards before saving.

**Builder Mode Features**:
- **Add Another Card**: Button to generate additional cards from new prompts
- **Card Management**:
  - Reorder cards using up/down arrow buttons
  - Remove individual cards with delete button
  - Edit card titles inline (click to edit)
  - Change visualization type per card
  - Edit Cypher queries
- **Preview Layout**: Shows how the final dashboard will look
- **Save Dashboard**: Saves all cards together as a multi-card dashboard
- **Cancel**: Exits builder mode without saving

**User Interface**:
- Blue banner at top indicating "Dashboard Builder Mode"
- Cards have blue border to indicate they're in edit mode
- Control buttons (up/down/delete) on each card
- "Add Another Card" and "Save Dashboard" buttons in banner
- Card count shown in save modal

**Implementation Details**:
- Added `builderMode` state to track builder mode status
- Added `builderCards` state to accumulate cards before saving
- Created functions:
  - `addAnotherCard()`: Reopens modal to add more cards
  - `removeBuilderCard(cardId)`: Removes a card from builder
  - `moveBuilderCard(cardId, direction)`: Reorders cards
  - `updateBuilderCardVizType(cardId, vizType)`: Changes visualization type
  - `updateBuilderCardTitle(cardId, title)`: Updates card title
  - `saveDashboardFromBuilder()`: Saves multi-card dashboard

### 3. Mini Topology Visualization

**Description**: New visualization type that renders graph data using Cytoscape.js in a compact format.

**Features**:
- Renders nodes and relationships from Cypher query results
- Automatic detection of Neo4j node and relationship objects
- Fallback to simple node visualization for tabular data
- Circle layout for compact display
- Styled nodes with labels and colors
- Relationship arrows with type labels

**Use Cases**:
- Visualizing threat paths
- Showing vulnerability relationships
- Displaying network topology subsets
- Exploring connected entities

**Implementation Details**:
- Created `MiniTopology` component using Cytoscape.js
- Parses Neo4j node objects (with `labels` and `properties`)
- Parses Neo4j relationship objects (with `type`, `start`, `end`)
- Falls back to creating nodes from tabular data if no graph objects found
- Uses circle layout for consistent compact display
- Responsive to color mode (light/dark theme)

**Cytoscape.js Configuration**:
```typescript
{
  layout: { name: 'circle', animate: false },
  style: [
    {
      selector: 'node',
      style: {
        'background-color': nodeBg,
        'label': 'data(label)',
        'width': '30px',
        'height': '30px',
        'font-size': '10px'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '8px'
      }
    }
  ]
}
```

### 4. Line Chart Support

**Description**: Added line chart visualization type for trend analysis.

**Features**:
- Displays data as connected line segments
- Useful for time-series or ordered data
- Smooth monotone interpolation
- Tooltips on hover

**Implementation**:
- Added LineChart component from Recharts
- Configured with monotone curve type
- Blue stroke color matching theme

## API Changes

### `/api/ai-dashboards/generate`

**Request Body**:
```typescript
{
  prompt: string,
  viz_type?: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
}
```

**Response**:
```typescript
{
  dashboard: {
    name: string,
    prompt: string,
    cards: [
      {
        title: string,
        viz_type: string, // Matches requested viz_type
        cypher: string,
        options?: object
      }
    ]
  }
}
```

**Changes**:
- Accepts `viz_type` parameter in request body
- Passes requested viz_type to AI prompt
- Enforces viz_type on all generated cards
- Applies viz_type to fallback cards

## Component Changes

### `AIDashboardsView.tsx`

**New State Variables**:
- `builderMode: boolean` - Tracks if in builder mode
- `builderCards: AICard[]` - Accumulates cards before saving
- `suggestedCards: SuggestedCard[]` - Suggestions with viz types
- `selectedVizTypes: Record<string, VizType>` - Tracks selected viz type per prompt

**New Functions**:
- `addAnotherCard()` - Adds another card to builder
- `removeBuilderCard(cardId)` - Removes card from builder
- `moveBuilderCard(cardId, direction)` - Reorders cards
- `updateBuilderCardVizType(cardId, vizType)` - Changes viz type
- `updateBuilderCardTitle(cardId, title)` - Updates title
- `saveDashboardFromBuilder()` - Saves multi-card dashboard

**Updated Functions**:
- `onCreate()` - Enters builder mode instead of immediately saving
- `runCard(index)` - Works with both builder and regular mode
- `ChartPreview()` - Supports all visualization types including mini-topology

**New Components**:
- `MiniTopology` - Cytoscape.js graph visualization component

**UI Enhancements**:
- Visualization type selectors for each suggestion
- Builder mode banner with controls
- Card reordering buttons
- Inline title editing
- Per-card visualization type selector
- Enhanced save modal with card count

## User Workflow

### Creating a Multi-Card Dashboard

1. **Open AI Dashboard Creator**:
   - Click "Create with AI" button
   - Modal opens with suggested prompts

2. **Select First Card**:
   - Click a suggested prompt (or type custom prompt)
   - Select desired visualization type from dropdown
   - Click "Create"

3. **Enter Builder Mode**:
   - First card is created and displayed
   - Blue banner appears: "Dashboard Builder Mode"
   - Options: Add Another Card, Save Dashboard, Cancel

4. **Add More Cards** (Optional):
   - Click "Add Another Card"
   - Select new prompt and visualization type
   - Click "Create"
   - Repeat as needed

5. **Customize Cards**:
   - Click card title to edit
   - Use up/down arrows to reorder
   - Change visualization type with dropdown
   - Edit Cypher query if needed
   - Click "Run" to preview data
   - Remove unwanted cards with delete button

6. **Save Dashboard**:
   - Click "Save Dashboard" in banner
   - Enter dashboard name
   - Click "Save"
   - Dashboard is saved with all cards

### Using Mini Topology

**Best Practices**:
- Use for queries that return graph data (nodes and relationships)
- Ideal for visualizing connections and paths
- Limit to 10-20 nodes for readability
- Works with any Cypher query that returns Neo4j objects

**Example Queries**:
```cypher
// Vulnerability relationships
MATCH (v:Vulnerability)-[r:CVSS]->(c:Cvss)
RETURN v, r, c LIMIT 10

// Threat paths
MATCH path = (m:Machine)-[:LAUNCHES]->(e:Exploit)
RETURN path LIMIT 5

// Domain topology
MATCH (m:Machine)-[r:IN]->(d:Domain)
RETURN m, r, d LIMIT 15
```

## Technical Notes

### Neo4j Data Serialization

All Neo4j objects are properly serialized before rendering:
- Integer objects (`{low, high}`) → JavaScript numbers
- Node objects → Extracted labels and properties
- Relationship objects → Extracted type and endpoints
- Temporal types → String representations

### Cytoscape.js Integration

- Lightweight instance per Mini Topology card
- Automatic cleanup on component unmount
- Responsive to theme changes
- Circle layout for consistent display
- Configurable node/edge styling

### State Management

- Builder mode uses separate state (`builderCards`) from saved cards (`cards`)
- Visualization type selection persists across modal open/close
- Card operations (move, delete, edit) update builder state
- Save operation transfers builder cards to main cards state

## Future Enhancements

1. **Drag-and-Drop Reordering**: Replace up/down buttons with drag handles
2. **Card Templates**: Pre-configured card templates for common use cases
3. **Layout Options**: Grid size and card arrangement customization
4. **Export/Import**: Export dashboard configuration as JSON
5. **Mini Topology Layouts**: Additional layout options (CoSE, hierarchical)
6. **Card Duplication**: Clone existing cards with modifications
7. **Conditional Formatting**: Color coding based on data values
8. **Real-time Updates**: Auto-refresh cards on data changes

## Files Modified

1. `components/DataViews/AIDashboardsView.tsx` - Main component with builder mode
2. `pages/api/ai-dashboards/generate.ts` - API with viz_type support
3. `docs/AI_DASHBOARD_BUILDER_ENHANCEMENTS.md` - This documentation

## Testing

### Manual Testing Steps

1. **Test Visualization Type Selection**:
   - Open AI Dashboard creator
   - Change viz type for a suggestion
   - Create card and verify correct visualization

2. **Test Builder Mode**:
   - Create first card
   - Verify builder mode banner appears
   - Add second card
   - Verify both cards display

3. **Test Card Management**:
   - Reorder cards with up/down buttons
   - Edit card title
   - Change visualization type
   - Remove a card
   - Verify changes persist

4. **Test Mini Topology**:
   - Create card with mini-topology viz type
   - Use graph-returning Cypher query
   - Verify graph renders correctly

5. **Test Save**:
   - Create multi-card dashboard
   - Save with custom name
   - Load dashboard
   - Verify all cards restored correctly

## Conclusion

The enhanced AI Dashboard builder provides a flexible, user-friendly workflow for creating sophisticated multi-card dashboards with mixed visualization types, including the new Mini Topology graph visualization. Users can now compose complex dashboards iteratively before committing to save.

