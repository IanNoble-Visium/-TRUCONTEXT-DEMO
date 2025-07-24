const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'IconManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the first IconButton (Preview)
content = content.replace(
  /<IconButton\s+icon={<ViewIcon \/>}\s+size="xs"\s+variant="ghost"\s+onClick={\(e\) => {\s+e\.stopPropagation\(\)\s+onPreview\(\)\s+}}/,
  `<IconButton
                aria-label="Preview icon"
                icon={<ViewIcon />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview()
                }}`
);

// Fix the second IconButton (Delete)
content = content.replace(
  /<IconButton\s+icon={<DeleteIcon \/>}\s+size="xs"\s+variant="ghost"\s+colorScheme="red"\s+onClick={\(e\) => {\s+e\.stopPropagation\(\)\s+onDelete\(\)\s+}}/,
  `<IconButton
                aria-label="Delete icon"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}`
);

fs.writeFileSync(filePath, content);
console.log('Fixed aria-label attributes');
