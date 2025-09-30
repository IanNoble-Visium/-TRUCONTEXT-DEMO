# Test script for AI Dashboard Enhance Prompt feature
# Tests the /api/ai-dashboards/enhance-prompt endpoint

Write-Host "=== AI Dashboard Enhance Prompt Feature Test ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$endpoint = "$baseUrl/api/ai-dashboards/enhance-prompt"

# Test cases
$testCases = @(
    @{
        name = "Vulnerability Analysis"
        prompt = "show vulnerabilities"
    },
    @{
        name = "Machine Security"
        prompt = "machines with problems"
    },
    @{
        name = "Exploit Analysis"
        prompt = "show exploits"
    },
    @{
        name = "Domain Security"
        prompt = "domain security"
    },
    @{
        name = "Software Vulnerabilities"
        prompt = "software issues"
    },
    @{
        name = "CVSS Severity"
        prompt = "severity levels"
    },
    @{
        name = "Network Topology"
        prompt = "show network"
    },
    @{
        name = "Threat Paths"
        prompt = "attack paths"
    }
)

$successCount = 0
$failCount = 0

foreach ($test in $testCases) {
    Write-Host "Test: $($test.name)" -ForegroundColor Yellow
    Write-Host "  Original: '$($test.prompt)'" -ForegroundColor Gray
    
    try {
        $body = @{
            prompt = $test.prompt
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $endpoint `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "  Enhanced: '$($response.enhancedPrompt)'" -ForegroundColor Green
        Write-Host "  Schema: $($response.schemaUsed.nodeTypeCount) node types, $($response.schemaUsed.relationshipTypeCount) relationship types" -ForegroundColor Cyan
        Write-Host ""
        
        $successCount++
    }
    catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.ErrorDetails) {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "  Details: $($errorDetails.details)" -ForegroundColor Red
            Write-Host "  Code: $($errorDetails.code)" -ForegroundColor Red
        }
        
        Write-Host ""
        $failCount++
    }
}

Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Total tests: $($testCases.Count)" -ForegroundColor White
Write-Host "Passed: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`nAll tests passed! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed! ✗" -ForegroundColor Red
    exit 1
}

