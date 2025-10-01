# Test Mini Topology Fix
# This script tests the mini-topology visualization fix

Write-Host "=== Testing Mini Topology Visualization Fix ===" -ForegroundColor Cyan

# Test 1: Generate mini-topology card
Write-Host "`n1. Testing AI generation with mini-topology viz_type..." -ForegroundColor Yellow

$generatePayload = @{
    prompt = "Show machines and their exploit launch capabilities"
    viz_type = "mini-topology"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/generate" `
        -Method POST `
        -Body $generatePayload `
        -ContentType "application/json"
    
    Write-Host "   ✓ Generation successful" -ForegroundColor Green
    Write-Host "   Cards generated: $($response.cards.Count)" -ForegroundColor Cyan
    
    if ($response.cards.Count -gt 0) {
        $card = $response.cards[0]
        Write-Host "   Card title: $($card.title)" -ForegroundColor Cyan
        Write-Host "   Viz type: $($card.viz_type)" -ForegroundColor Cyan
        Write-Host "   Cypher query:" -ForegroundColor Cyan
        Write-Host "   $($card.cypher)" -ForegroundColor White
        
        # Check if query returns nodes and relationships (not aggregated data)
        $hasAggregation = $card.cypher -match "COUNT|SUM|AVG"
        $hasWithClause = $card.cypher -match "WITH"
        $hasReturn = $card.cypher -match "RETURN"

        if ($hasReturn -and -not $hasAggregation -and -not $hasWithClause) {
            Write-Host "   ✓ Query appears to return graph structure" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Query may return aggregated data" -ForegroundColor Yellow
            Write-Host "   Expected: RETURN n, r, m (nodes and relationships)" -ForegroundColor Yellow
        }
        
        # Test 2: Execute the query
        Write-Host "`n2. Testing query execution..." -ForegroundColor Yellow
        
        $executePayload = @{
            cypher = $card.cypher
        } | ConvertTo-Json
        
        try {
            $execResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/execute" `
                -Method POST `
                -Body $executePayload `
                -ContentType "application/json"
            
            Write-Host "   ✓ Query executed successfully" -ForegroundColor Green
            Write-Host "   Rows returned: $($execResponse.rows.Count)" -ForegroundColor Cyan
            
            # Check for graphData in response
            if ($execResponse.graphData) {
                Write-Host "   ✓ GraphData found in response!" -ForegroundColor Green
                Write-Host "   Nodes: $($execResponse.graphData.nodes.Count)" -ForegroundColor Cyan
                Write-Host "   Edges: $($execResponse.graphData.edges.Count)" -ForegroundColor Cyan
                
                if ($execResponse.graphData.nodes.Count -gt 0) {
                    $sampleNode = $execResponse.graphData.nodes[0]
                    Write-Host "   Sample node:" -ForegroundColor Cyan
                    Write-Host "     ID: $($sampleNode.id)" -ForegroundColor White
                    Write-Host "     Labels: $($sampleNode.labels -join ', ')" -ForegroundColor White
                    Write-Host "     Properties: $($sampleNode.properties.showname)" -ForegroundColor White
                }
                
                if ($execResponse.graphData.edges.Count -gt 0) {
                    $sampleEdge = $execResponse.graphData.edges[0]
                    Write-Host "   Sample edge:" -ForegroundColor Cyan
                    Write-Host "     Type: $($sampleEdge.type)" -ForegroundColor White
                    Write-Host "     Source: $($sampleEdge.source)" -ForegroundColor White
                    Write-Host "     Target: $($sampleEdge.target)" -ForegroundColor White
                }
                
                Write-Host "`n   ✅ MINI TOPOLOGY FIX WORKING!" -ForegroundColor Green
            } else {
                Write-Host "   ⚠ No graphData in response" -ForegroundColor Yellow
                Write-Host "   This may indicate the query returns aggregated data" -ForegroundColor Yellow
                
                # Check raw response structure
                if ($execResponse.rows.Count -gt 0) {
                    $firstRow = $execResponse.rows[0]
                    Write-Host "   First row keys: $($firstRow.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
                    
                    # Check if any values are objects (nodes/relationships)
                    $hasObjects = $false
                    foreach ($prop in $firstRow.PSObject.Properties) {
                        if ($prop.Value -is [PSCustomObject] -and $prop.Value.labels) {
                            $hasObjects = $true
                            Write-Host "   Found node object in column: $($prop.Name)" -ForegroundColor Cyan
                        }
                        if ($prop.Value -is [PSCustomObject] -and $prop.Value.type) {
                            $hasObjects = $true
                            Write-Host "   Found relationship object in column: $($prop.Name)" -ForegroundColor Cyan
                        }
                    }
                    
                    if (-not $hasObjects) {
                        Write-Host "   ❌ Query returns primitive values, not graph objects" -ForegroundColor Red
                        Write-Host "   The AI may need to regenerate the query" -ForegroundColor Yellow
                    }
                }
            }
        } catch {
            Write-Host "   ❌ Query execution failed" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.ErrorDetails) {
                Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "   ❌ Generation failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Compare with chart viz_type
Write-Host "`n3. Testing chart viz_type for comparison..." -ForegroundColor Yellow

$chartPayload = @{
    prompt = "Show machines and their exploit launch capabilities"
    viz_type = "bar"
} | ConvertTo-Json

try {
    $chartResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/ai-dashboards/generate" `
        -Method POST `
        -Body $chartPayload `
        -ContentType "application/json"
    
    if ($chartResponse.cards.Count -gt 0) {
        $chartCard = $chartResponse.cards[0]
        Write-Host "   Chart query:" -ForegroundColor Cyan
        Write-Host "   $($chartCard.cypher)" -ForegroundColor White
        
        if ($chartCard.cypher -match "COUNT|WITH|SUM|AVG") {
            Write-Host "   ✓ Chart query uses aggregation (as expected)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Chart query does not use aggregation" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ⚠ Chart generation test skipped" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "- Mini-topology should generate queries that RETURN nodes and relationships" -ForegroundColor White
Write-Host "- Chart/table should generate queries with aggregation (COUNT, WITH, etc.)" -ForegroundColor White
Write-Host "- Execute API should return graphData with nodes and edges arrays" -ForegroundColor White
Write-Host "- MiniTopology component should render the graph visualization" -ForegroundColor White

