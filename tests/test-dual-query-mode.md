# Dual Query Mode - Manual Test Plan

## Prerequisites
- Application running locally
- Neo4j database connected with sample data
- PostgreSQL database initialized

---

## Test 1: Manual Graph Query Entry

**Objective**: Verify that manually entering a graph-returning Cypher query works without crashes.

### Steps:
1. Navigate to AI Dashboards view
2. Click "Create Dashboard Card"
3. Enter prompt: "Show threat paths"
4. Select visualization type: "Mini Topology"
5. Click "Create"
6. In the card editor, manually edit the Cypher query to:
   ```cypher
   MATCH (n)-[r]->(m) WHERE r.TC_THREAT_PATH IS NOT NULL RETURN n, r, m LIMIT 10
   ```
7. Click "Run"

### Expected Results:
- ✅ No Cytoscape.js errors in console
- ✅ Graph visualization renders successfully
- ✅ Nodes and edges are displayed
- ✅ Edges connect to valid nodes (no orphaned edges)
- ✅ UI shows "Edit Cypher (Graph Query)" label

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 2: Visualization Type Switching

**Objective**: Verify that switching between visualization types uses the correct query.

### Steps:
1. Create a new dashboard card with prompt: "Show machines and exploits"
2. Select visualization type: "Bar Chart"
3. Click "Create"
4. Click "Run" to execute the aggregation query
5. Verify bar chart displays correctly
6. Change visualization type dropdown to "Mini Topology"
7. Click "Run" again

### Expected Results:
- ✅ Bar chart displays with aggregated data initially
- ✅ Warning toast appears: "No graph query available" (if AI didn't generate both)
- ✅ After switching to Mini Topology, graph query is used (if available)
- ✅ UI label changes from "(Aggregation Query)" to "(Graph Query)"

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 3: AI Generation with Both Query Types

**Objective**: Verify that AI generates both query types for new cards.

### Steps:
1. Create a new dashboard card with prompt: "Show vulnerabilities and affected machines"
2. Select visualization type: "Bar Chart"
3. Click "Create"
4. Open browser DevTools Console
5. Inspect the card object in React DevTools or console log
6. Check for `cypherAggregation` and `cypherGraph` fields

### Expected Results:
- ✅ Card object contains `cypherAggregation` field with aggregation query
- ✅ Card object contains `cypherGraph` field with graph-returning query
- ✅ Both queries are valid Cypher syntax
- ✅ Legacy `cypher` field is also populated

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 4: Database Persistence

**Objective**: Verify that both query types are saved and loaded correctly.

### Steps:
1. Create a dashboard card with both query types (from Test 3)
2. Click "Save" and enter dashboard name: "Test Dual Query"
3. Click "Save Dashboard"
4. Refresh the page
5. Click "Load"
6. Select "Test Dual Query" dashboard
7. Click "Load"
8. Inspect the loaded card

### Expected Results:
- ✅ Dashboard saves successfully
- ✅ After reload, dashboard appears in load list
- ✅ Loaded card contains both `cypherAggregation` and `cypherGraph` fields
- ✅ Queries are identical to before save
- ✅ Visualization works correctly

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 5: Backward Compatibility

**Objective**: Verify that existing dashboards with legacy `cypher` field still work.

### Steps:
1. If you have existing saved dashboards, load one
2. Verify it displays correctly
3. Edit the Cypher query
4. Save the dashboard
5. Reload and verify

### Expected Results:
- ✅ Legacy dashboards load without errors
- ✅ Visualizations render correctly
- ✅ Editing queries works
- ✅ After editing, both new and legacy fields are updated

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 6: Query Type Warnings

**Objective**: Verify that warnings appear when switching to a viz type without the appropriate query.

### Steps:
1. Create a card with only `cypherAggregation` (manually delete `cypherGraph` in DevTools if needed)
2. Switch visualization type to "Mini Topology"
3. Observe toast notification

### Expected Results:
- ✅ Warning toast appears
- ✅ Toast title: "No graph query available"
- ✅ Toast description explains the issue
- ✅ Toast is yellow/warning color
- ✅ Toast auto-dismisses after 5 seconds

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 7: Manual Query Editing with Type Switching

**Objective**: Verify that manually edited queries are saved to the correct field.

### Steps:
1. Create a card with "Bar Chart" visualization
2. Manually edit Cypher to an aggregation query:
   ```cypher
   MATCH (m:Machine) WITH m.showname as machine, COUNT(m) as count RETURN machine, count LIMIT 10
   ```
3. Click "Run" and verify bar chart displays
4. Switch visualization type to "Mini Topology"
5. Manually edit Cypher to a graph query:
   ```cypher
   MATCH (m:Machine)-[r:IN]->(d:Domain) RETURN m, r, d LIMIT 10
   ```
6. Click "Run" and verify graph displays
7. Switch back to "Bar Chart"
8. Verify the aggregation query is still there

### Expected Results:
- ✅ Aggregation query is saved to `cypherAggregation`
- ✅ Graph query is saved to `cypherGraph`
- ✅ Switching between viz types preserves both queries
- ✅ Correct query is used for each viz type

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 8: Edge Validation (from previous fix)

**Objective**: Verify that edge validation still works with dual query mode.

### Steps:
1. Create a card with "Mini Topology" visualization
2. Enter a graph query that might produce orphaned edges
3. Click "Run"
4. Open browser console
5. Look for "MiniTopology: Filtering out orphaned edge" warnings

### Expected Results:
- ✅ No Cytoscape.js errors
- ✅ Console shows edge validation warnings (if orphaned edges exist)
- ✅ Graph renders successfully
- ✅ Only valid edges are displayed

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 9: Multiple Cards with Different Types

**Objective**: Verify that multiple cards with different viz types work together.

### Steps:
1. Create a dashboard with 3 cards:
   - Card 1: Bar Chart with aggregation query
   - Card 2: Mini Topology with graph query
   - Card 3: Pie Chart with aggregation query
2. Run all cards
3. Save dashboard
4. Reload dashboard
5. Verify all cards work

### Expected Results:
- ✅ All cards render correctly
- ✅ Each card uses appropriate query type
- ✅ No interference between cards
- ✅ Dashboard saves and loads correctly

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Test 10: Database Migration

**Objective**: Verify that database migration adds new columns correctly.

### Steps:
1. Check PostgreSQL database schema
2. Run query:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'ai_dashboard_cards';
   ```
3. Verify new columns exist

### Expected Results:
- ✅ `cypher_aggregation` column exists (type: TEXT)
- ✅ `cypher_graph` column exists (type: TEXT)
- ✅ Legacy `cypher` column still exists
- ✅ No errors during schema initialization

### Actual Results:
- [ ] Pass
- [ ] Fail (describe issue):

---

## Summary

**Total Tests**: 10  
**Passed**: ___  
**Failed**: ___  

**Overall Status**: [ ] PASS [ ] FAIL

**Notes**:


**Tester**: _______________  
**Date**: _______________  
**Build Version**: _______________

