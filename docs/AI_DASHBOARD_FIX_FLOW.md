# AI Dashboard Card Creation Flow

## Before Fix (Duplicate Cards Issue)

```
User clicks "Create with AI"
         ↓
    onClick={onCreate}
         ↓
    onCreate() called
         ↓
    setLoading(true)
         ↓
    Fetch API...
         ↓
    [User clicks again during API call]
         ↓
    onCreate() called AGAIN ❌
         ↓
    setLoading(true) AGAIN
         ↓
    Fetch API... AGAIN
         ↓
    Both API calls complete
         ↓
    setBuilderCards([...prev, ...mapped]) × 2
         ↓
    RESULT: TWO IDENTICAL CARDS ❌
```

---

## After Fix (Single Card)

```
User clicks "Create with AI"
         ↓
    onClick={onCreate}
         ↓
    onCreate() called
         ↓
    if (loading) return ✅ [DUPLICATE PREVENTION]
         ↓
    setLoading(true)
         ↓
    Button becomes disabled ✅
         ↓
    Fetch API...
         ↓
    [User clicks again during API call]
         ↓
    Button is DISABLED - click ignored ✅
         ↓
    OR if somehow called:
    onCreate() → if (loading) return ✅
         ↓
    API call completes
         ↓
    Generate unique IDs:
    card-${timestamp}-${randomSuffix}-${idx} ✅
         ↓
    setBuilderCards([...prev, ...mapped])
         ↓
    setLoading(false)
         ↓
    RESULT: EXACTLY ONE CARD ✅
```

---

## AI Title Generation Flow

### Before Fix (Generic Titles)

```
User prompt: "Show vulnerability severity"
         ↓
    AI generates query
         ↓
    No specific title instructions
         ↓
    Fallback: title = `Card ${idx + 1}`
         ↓
    RESULT: "Card 1" ❌
```

### After Fix (Descriptive Titles)

```
User prompt: "Show vulnerability severity"
         ↓
    AI receives enhanced instructions:
    - "Generate descriptive, human-readable title"
    - "Summarize what the query shows"
    - "Use business-friendly language"
    - Examples: "Vulnerability Severity Distribution"
         ↓
    AI analyzes query pattern:
    MATCH (v:Vulnerability)-[:CVSS]->...
    WITH s.showname as severity, COUNT(v) as count
         ↓
    AI generates title:
    "Vulnerability Severity Distribution" ✅
         ↓
    RESULT: Descriptive, business-friendly title ✅
```

---

## Editable Title UI Flow

```
Card rendered with title
         ↓
    User hovers over title
         ↓
    Tooltip appears: "Click to edit title" ✅
    Background highlights (gray) ✅
         ↓
    User clicks title
         ↓
    EditablePreview → EditableInput
         ↓
    User types new title
         ↓
    User presses Enter or clicks outside
         ↓
    onChange={(value) => updateBuilderCardTitle(card.id, value)}
         ↓
    setBuilderCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, title: value } : c
    ))
         ↓
    Title updated in state ✅
         ↓
    Title persists when saving dashboard ✅
```

---

## Duplicate Prevention Mechanisms

### **Layer 1: Loading State Check**
```typescript
async function onCreate() {
  if (loading) {
    console.warn('ignoring duplicate call')
    return  // ✅ Exit immediately
  }
  setLoading(true)
  // ... rest of function
}
```

### **Layer 2: Button Disable**
```typescript
<Button
  onClick={onCreate}
  isLoading={loading}
  isDisabled={!prompt.trim() || apiKeyMissing || loading}  // ✅ Disabled during loading
  loadingText="Creating..."
>
  Create
</Button>
```

### **Layer 3: Unique ID Generation**
```typescript
const timestamp = Date.now()
const randomSuffix = Math.random().toString(36).substring(2, 9)
const id = `card-${timestamp}-${randomSuffix}-${idx}`
// ✅ Even if duplicates occur, IDs are unique
```

---

## Console Logging Flow

### **Successful Single Card Creation**
```
1. AIDashboards: onCreate() called {prompt: "...", builderMode: false, existingCards: 0}
2. AIDashboards: Fetching AI generation... {prompt: "...", selectedVizType: "bar"}
3. AIDashboards: AI generation response: {cardCount: 1, cards: [...]}
4. AIDashboards: Mapped cards: {count: 1, ids: ["card-1735689123456-abc123-0"]}
5. AIDashboards: Entering builder mode with new cards {count: 1}
6. AIDashboards: onCreate() completed
```

### **Duplicate Call Prevention**
```
1. AIDashboards: onCreate() called {prompt: "...", builderMode: false, existingCards: 0}
2. AIDashboards: onCreate() called while already loading - ignoring duplicate call  ✅
3. AIDashboards: Fetching AI generation... {prompt: "...", selectedVizType: "bar"}
4. AIDashboards: onCreate() completed
```

### **Adding Another Card**
```
1. AIDashboards: onCreate() called {prompt: "...", builderMode: true, existingCards: 1}
2. AIDashboards: Fetching AI generation...
3. AIDashboards: AI generation response: {cardCount: 1, cards: [...]}
4. AIDashboards: Mapped cards: {count: 1, ids: ["card-1735689234567-def456-0"]}
5. AIDashboards: Appending to existing builder cards {existing: 1, new: 1}
6. AIDashboards: Builder cards updated {previousCount: 1, newCount: 2, newIds: [...]}
7. AIDashboards: onCreate() completed
```

---

## State Management Flow

### **Initial State**
```typescript
builderMode: false
builderCards: []
loading: false
```

### **After First Card Creation**
```typescript
builderMode: true
builderCards: [
  {
    id: "card-1735689123456-abc123-0",
    title: "Vulnerability Severity Distribution",  // ✅ AI-generated
    viz_type: "bar",
    cypher: "MATCH (v:Vulnerability)...",
    originalPrompt: "Show vulnerability severity"
  }
]
loading: false
```

### **After Adding Second Card**
```typescript
builderMode: true
builderCards: [
  {
    id: "card-1735689123456-abc123-0",
    title: "Vulnerability Severity Distribution",
    // ... first card
  },
  {
    id: "card-1735689234567-def456-0",
    title: "Top 10 Machines with Most Exploits",  // ✅ AI-generated
    viz_type: "bar",
    cypher: "MATCH (m:Machine)...",
    originalPrompt: "Show machines with exploits"
  }
]
loading: false
```

---

## Error Handling Flow

### **API Key Missing**
```
onCreate() called
    ↓
Fetch API...
    ↓
API returns: {code: 'MISSING_API_KEY'}
    ↓
setApiKeyMissing(true)
setLastError('API key configuration issue')
    ↓
Toast: "AI service not configured"
    ↓
setLoading(false)
```

### **Quota Exceeded**
```
onCreate() called
    ↓
Fetch API...
    ↓
API returns: {code: 'QUOTA_EXCEEDED'}
    ↓
setLastError('API quota exceeded')
    ↓
Toast: "API quota exceeded"
    ↓
setLoading(false)
```

### **Invalid Query**
```
AI generates query
    ↓
validateQuery(cypher)
    ↓
Query validation fails
    ↓
Try to fix common issues:
- Remove GROUP BY
- Add LIMIT
    ↓
Re-validate
    ↓
If still invalid: Use fallback cards
    ↓
Return validated cards only
```

---

## Summary

### **Duplicate Prevention**
- ✅ **Layer 1**: Loading state check in `onCreate()`
- ✅ **Layer 2**: Button disabled during loading
- ✅ **Layer 3**: Unique ID generation (timestamp + random)
- ✅ **Layer 4**: Comprehensive logging for debugging

### **AI Title Generation**
- ✅ Enhanced AI prompt with title requirements
- ✅ Examples of good/bad titles
- ✅ Business-friendly language emphasis
- ✅ Fallback to generic titles if AI fails

### **Editable Titles**
- ✅ Tooltip: "Click to edit title"
- ✅ Hover effect for visual feedback
- ✅ Click-to-edit interface
- ✅ Persistent title changes

**Status**: ✅ All flows tested and working correctly

