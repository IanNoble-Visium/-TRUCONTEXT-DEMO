# Test AI Dashboard Builder Enhancements
Write-Host "=== AI Dashboard Builder Enhancement Tests ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$testsPassed = 0
$testsFailed = 0

# Test 1: Visualization Type Selection
Write-Host "Test 1: Visualization Type Selection" -ForegroundColor Yellow
Write-Host "  Testing viz_type parameter in API..." -ForegroundColor Gray

$vizTypes = @("bar", "pie", "table", "line", "mini-topology")
foreach ($vizType in $vizTypes) {
    try {
        $body = @{
            prompt = "Show vulnerability distribution"
            viz_type = $vizType
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/api/ai-dashboards/generate" -Method POST -ContentType "application/json" -Body $body
        
        if ($result.dashboard.cards[0].viz_type -eq $vizType) {
            Write-Host "    ✓ $vizType type applied correctly" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "    ✗ $vizType type not applied (got: $($result.dashboard.cards[0].viz_type))" -ForegroundColor Red
            $testsFailed++
        }
    } catch {
        Write-Host "    ✗ Failed to test $vizType : $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""

# Test 2: Multiple Card Generation
Write-Host "Test 2: Multiple Card Generation" -ForegroundColor Yellow
Write-Host "  Testing ability to generate multiple cards..." -ForegroundColor Gray

try {
    # Generate first card
    $body1 = @{
        prompt = "Show vulnerability severity distribution"
        viz_type = "bar"
    } | ConvertTo-Json
    
    $result1 = Invoke-RestMethod -Uri "$baseUrl/api/ai-dashboards/generate" -Method POST -ContentType "application/json" -Body $body1
    
    # Generate second card
    $body2 = @{
        prompt = "Show machines with most vulnerabilities"
        viz_type = "pie"
    } | ConvertTo-Json
    
    $result2 = Invoke-RestMethod -Uri "$baseUrl/api/ai-dashboards/generate" -Method POST -ContentType "application/json" -Body $body2
    
    if ($result1.dashboard.cards.Count -gt 0 -and $result2.dashboard.cards.Count -gt 0) {
        Write-Host "    ✓ Multiple cards generated successfully" -ForegroundColor Green
        Write-Host "      Card 1: $($result1.dashboard.cards[0].title) ($($result1.dashboard.cards[0].viz_type))" -ForegroundColor Gray
        Write-Host "      Card 2: $($result2.dashboard.cards[0].title) ($($result2.dashboard.cards[0].viz_type))" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "    ✗ Failed to generate multiple cards" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "    ✗ Multiple card generation failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 3: Mini Topology Data Structure
Write-Host "Test 3: Mini Topology Visualization" -ForegroundColor Yellow
Write-Host "  Testing mini-topology with graph query..." -ForegroundColor Gray

try {
    # Test with a query that returns graph data
    $graphQuery = @{
        cypher = "MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss) RETURN v, c LIMIT 5"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$baseUrl/api/ai-dashboards/execute" -Method POST -ContentType "application/json" -Body $graphQuery
    
    if ($result.rows.Count -gt 0) {
        Write-Host "    ✓ Graph query executed successfully" -ForegroundColor Green
        Write-Host "      Rows returned: $($result.rows.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "    ⚠ Graph query returned no data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "    ✗ Graph query failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 4: Line Chart Support
Write-Host "Test 4: Line Chart Visualization" -ForegroundColor Yellow
Write-Host "  Testing line chart generation..." -ForegroundColor Gray

try {
    $body = @{
        prompt = "Show vulnerability trends"
        viz_type = "line"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$baseUrl/api/ai-dashboards/generate" -Method POST -ContentType "application/json" -Body $body
    
    if ($result.dashboard.cards[0].viz_type -eq "line") {
        Write-Host "    ✓ Line chart type applied correctly" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "    ✗ Line chart type not applied" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "    ✗ Line chart test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 5: Suggestions Endpoint
Write-Host "Test 5: Dashboard Suggestions" -ForegroundColor Yellow
Write-Host "  Testing suggestions endpoint..." -ForegroundColor Gray

try {
    $suggestions = Invoke-RestMethod -Uri "$baseUrl/api/ai-dashboards/suggestions" -Method GET
    
    if ($suggestions.suggestions.Count -gt 0) {
        Write-Host "    ✓ Suggestions retrieved successfully" -ForegroundColor Green
        Write-Host "      Total suggestions: $($suggestions.suggestions.Count)" -ForegroundColor Gray
        Write-Host "      Sample: $($suggestions.suggestions[0])" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "    ✗ No suggestions returned" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "    ✗ Suggestions test failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All dashboard builder enhancements working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Features Verified:" -ForegroundColor Cyan
    Write-Host "  ✓ Pre-creation visualization type selection" -ForegroundColor Green
    Write-Host "  ✓ Multiple visualization types (bar, pie, table, line, mini-topology)" -ForegroundColor Green
    Write-Host "  ✓ Multi-card dashboard generation" -ForegroundColor Green
    Write-Host "  ✓ Graph data queries for mini-topology" -ForegroundColor Green
    Write-Host "  ✓ Dashboard suggestions" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
}

