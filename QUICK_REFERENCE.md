# Quick Reference: Adding Family Members

## Template for Adding Someone New

```javascript
// In the 'people' array, add:
{ id: "unique_id", name: "Full Name", born: "YYYY", died: "YYYY", photo: "unique_id/photo.jpg" }

// In the 'families' array, add or modify:
{ partners: ["spouse1_id", "spouse2_id"], children: ["child1_id", "child2_id"] }
```

## Current Family Structure

Your current tree in `family-data.js`:

```
Dad & Mom (Root Couple)
├── Amol (child)
├── Pranav (child)
├── Meera (child)
└── Poonam (child)
```

## To Expand the Tree

### Add a Spouse to a Child

Example: If Amol marries someone, add:

```javascript
people: [
  // ... existing people ...
  { id: "amol_spouse", name: "Amol's Spouse", born: "1978", photo: "amol_spouse/photo.jpg" }
],

families: [
  { partners: ["dad", "mom"], children: ["amol", "pranav", "meera", "poonam"] },
  { partners: ["amol", "amol_spouse"], children: [] }  // Add this line
]
```

### Add Grandchildren

```javascript
// Continue from above:
people: [
  // ... existing ...
  { id: "grandchild1", name: "Grandchild Name", born: "2010", photo: "grandchild1/photo.jpg" }
],

families: [
  // ... existing ...
  { partners: ["amol", "amol_spouse"], children: ["grandchild1"] }  // Update this line
]
```

## Image Folder Structure

```
images/
├── dad/
│   └── profile.jpg
├── mom/
│   └── profile.jpg
├── amol/
│   ├── Profile Pic 2.jpg
│   └── (add more photos here)
├── pranav/
│   └── profile.jpg
├── meera/
│   └── profile.jpg
└── poonam/
    └── profile.jpg
```

## Important Notes

- **Case Sensitive**: IDs like "amol" and families must match exactly
- **Oldest First**: Children in the tree appear in birth order
- **No Duplicates**: Each person should appear only once in the `people` array
- **Photo Optional**: Leave out the `photo` field to show initials instead

## Testing

1. Edit `family-data.js`
2. Save the file
3. Refresh `index.html` in browser (hard refresh: Ctrl+F5)
4. Check for errors using browser console (F12 → Console tab)

## Share Your Tree

Once pushed to GitHub:
- GitHub Pages URL: `https://github.com/[your-username]/Family-Tree`
- Visit: `https://[your-username].github.io/Family-Tree/`
- Share the GitHub Pages link with family!
