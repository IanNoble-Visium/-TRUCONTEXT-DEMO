# Enhance Prompt Feature - User Guide

## Overview

The "Enhance Prompt" feature uses AI to analyze your simple prompts and rewrite them to be more specific, data-aware, and effective for creating dashboard cards.

## How It Works

### Step 1: Open AI Dashboard Creation

1. Navigate to the **AI Dashboards** view
2. Click the **"Create with AI"** button
3. The dashboard creation modal opens

### Step 2: Enter Your Prompt

In the **Natural language** tab, type a simple prompt describing what you want to visualize:

**Examples of simple prompts**:
- "show vulnerabilities"
- "machines with problems"
- "show exploits"
- "domain security"
- "software issues"
- "attack paths"

### Step 3: Click "Enhance Prompt"

1. After typing your prompt, click the **"Enhance Prompt"** button (purple button with sparkle icon ✨)
2. The button will show a spinner and change to "Enhancing..."
3. Wait a few seconds while the AI analyzes your prompt

### Step 4: Review Enhanced Prompt

The AI will replace your simple prompt with a more detailed, schema-aware version:

**Example Transformations**:

| Original Prompt | Enhanced Prompt |
|----------------|-----------------|
| "show vulnerabilities" | "Display the count of Vulnerability nodes categorized by their associated CvssSeverity levels, including the average CVSS score for each severity level, to visualize the distribution of vulnerabilities across different severity categories." |
| "machines with problems" | "List all Machine nodes that have associated Vulnerability nodes, including their respective CVSS severity levels, and count the number of vulnerabilities per machine to visualize the distribution of vulnerabilities across machines." |
| "show exploits" | "Display a list of Exploit nodes, including their showname, TC_THREAT_PATH, and the count of Machines that each Exploit has launched against, grouped by the Exploit's TC_ALARM severity level." |
| "domain security" | "Show the number of Machines associated with each Domain, grouped by their launch Exploits, to visualize domain security risks effectively." |

### Step 5: Edit or Create

1. **Option A**: Use the enhanced prompt as-is and click "Create"
2. **Option B**: Further edit the enhanced prompt to fine-tune it
3. **Option C**: Click "Enhance Prompt" again to get a different enhancement

## What Makes a Good Enhanced Prompt?

The AI enhancement adds several key elements:

### 1. Specific Entity Types
- ❌ "show vulnerabilities"
- ✅ "Display Vulnerability nodes categorized by CvssSeverity levels"

### 2. Relevant Properties
- ❌ "show machines"
- ✅ "Show Machine nodes with their showname, latitude, and longitude"

### 3. Aggregations
- ❌ "machine problems"
- ✅ "Count the number of vulnerabilities per machine"

### 4. Grouping Strategies
- ❌ "security issues"
- ✅ "Group vulnerabilities by CVSS severity levels"

### 5. Relationship Patterns
- ❌ "exploits"
- ✅ "Show Exploit nodes and the count of Machines they have launched against"

## Benefits

### 1. Better Query Accuracy
Enhanced prompts lead to more accurate Cypher query generation, reducing errors and failed queries.

### 2. More Meaningful Visualizations
Schema-aware prompts result in dashboard cards that show exactly what you need.

### 3. Learn Your Schema
Enhanced prompts help you understand what data is available in your database.

### 4. Save Time
Reduce trial-and-error by getting it right the first time.

### 5. Professional Results
Create sophisticated dashboard cards without being a Cypher expert.

## Tips for Best Results

### Start Simple
Begin with basic prompts like:
- "show [entity type]"
- "[entity] with [condition]"
- "[entity] analysis"

The AI will add the complexity for you.

### Use Domain Terms
Use terms from your domain:
- "vulnerabilities" instead of "security issues"
- "machines" instead of "computers"
- "exploits" instead of "attacks"

The AI will match these to your actual schema.

### Iterate if Needed
If the first enhancement isn't perfect:
1. Edit the enhanced prompt
2. Click "Enhance Prompt" again
3. The AI will refine it further

### Combine with Suggested Prompts
1. Click a suggested prompt to populate the field
2. Click "Enhance Prompt" to make it even better
3. Create your card

## Troubleshooting

### Button is Disabled
**Cause**: The prompt field is empty

**Solution**: Type something in the prompt field first

### "Enhancement failed" Error
**Cause**: API key not configured or invalid

**Solution**: 
1. Check your `.env.local` file
2. Ensure `OPENAI_API_KEY` or `GEMINI_API_KEY` is set
3. Restart the development server

### "API quota exceeded" Error
**Cause**: You've exceeded your OpenAI/Gemini API quota

**Solution**:
1. Wait and try again later
2. Upgrade your API plan
3. Use the original prompt without enhancement

### Enhancement Doesn't Match Intent
**Cause**: The AI misunderstood your prompt

**Solution**:
1. Make your original prompt more specific
2. Use exact entity names from your schema
3. Edit the enhanced prompt manually

## Advanced Usage

### Multi-Step Enhancement

For complex dashboards:

1. **First Card**: "show vulnerabilities"
   - Enhance → Create
   
2. **Second Card**: "machines with most vulnerabilities"
   - Enhance → Create
   
3. **Third Card**: "exploit launch patterns"
   - Enhance → Create

Each enhancement considers your schema independently.

### Combining with Manual Editing

1. Start with simple prompt: "security overview"
2. Click "Enhance Prompt"
3. AI suggests: "Show vulnerability distribution..."
4. Manually edit to add: "...for the last 30 days"
5. Create card

### Learning from Enhancements

Pay attention to:
- What entity types the AI uses
- What properties are available
- What relationships exist
- What aggregations make sense

Use this knowledge to write better prompts in the future.

## Examples by Use Case

### Security Analysis

**Simple**: "security status"

**Enhanced**: "Display the count of Vulnerability nodes grouped by their associated CvssSeverity levels, with additional metrics showing the number of affected Machine nodes per severity category."

### Network Topology

**Simple**: "network overview"

**Enhanced**: "Show the distribution of Machine nodes across Domain nodes, including counts of associated Exploit and Vulnerability nodes for each domain to visualize network security posture."

### Threat Intelligence

**Simple**: "threat paths"

**Enhanced**: "Display Vulnerability nodes with their TC_THREAT_PATH properties, showing the relationships between Vulnerabilities, Machines, and Exploits to visualize potential attack paths through the network."

### Compliance Reporting

**Simple**: "vulnerability compliance"

**Enhanced**: "Show the count of Vulnerability nodes categorized by CVSS severity levels, including the percentage of critical and high severity vulnerabilities relative to total vulnerabilities for compliance reporting."

### Asset Management

**Simple**: "asset inventory"

**Enhanced**: "List all Machine nodes with their showname, domain associations, and counts of associated Software and Vulnerability nodes to provide a comprehensive asset inventory view."

## Keyboard Shortcuts

While in the prompt field:
- **Tab**: Move to "Enhance Prompt" button
- **Enter**: (in button) Trigger enhancement
- **Esc**: Close modal

## Best Practices

### DO:
✅ Start with simple, clear prompts
✅ Use domain-specific terminology
✅ Review and edit enhanced prompts
✅ Iterate if the first result isn't perfect
✅ Learn from the enhancements

### DON'T:
❌ Write overly complex initial prompts
❌ Use vague terms like "stuff" or "things"
❌ Expect perfection on the first try
❌ Ignore the enhanced prompt without reading it
❌ Forget to select a visualization type

## FAQ

**Q: How long does enhancement take?**
A: Typically 2-5 seconds, depending on API response time.

**Q: Can I enhance the same prompt multiple times?**
A: Yes! Each enhancement may produce slightly different results.

**Q: Does it work with Cypher queries?**
A: No, enhancement only works with natural language prompts in the "Natural language" tab.

**Q: Will it work without an API key?**
A: No, you need either an OpenAI or Gemini API key configured.

**Q: Does it cost money?**
A: Yes, it uses your OpenAI/Gemini API quota. Each enhancement costs a few cents.

**Q: Can I see what schema it used?**
A: The API response includes schema metadata, visible in browser dev tools.

**Q: What if my schema changes?**
A: The enhancement always uses the current schema, so it adapts automatically.

**Q: Can I customize the enhancement behavior?**
A: Not currently, but this is planned for future releases.

## Related Features

- **Suggested Prompts**: Pre-written prompts you can use as starting points
- **Multi-Card Builder**: Create multiple cards in one dashboard
- **Visualization Types**: Choose from Bar Chart, Pie Chart, Line Chart, Table, Mini Topology

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your API key configuration
3. Review the [technical documentation](./AI_DASHBOARD_ENHANCE_PROMPT_FEATURE.md)
4. Check the [troubleshooting guide](#troubleshooting)

## Conclusion

The "Enhance Prompt" feature is a powerful tool that helps you create better dashboard cards faster. By leveraging AI and your database schema, it transforms simple ideas into precise, actionable prompts that generate meaningful visualizations.

Start simple, let the AI enhance, and create amazing dashboards! ✨

