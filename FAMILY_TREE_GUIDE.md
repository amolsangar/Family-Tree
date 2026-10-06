# Family Tree Editing Guide

This guide shows you how to modify and extend your family tree.

## Adding a New Person

Open `family-data.js` and add an entry to the `people` array:

```javascript
{ id: "john", name: "John Smith", born: "1980", photo: "john/photo.jpg" }
```

**Fields:**
- `id`: Unique identifier (use lowercase, no spaces)
- `name`: Full name as it should display
- `born`: Birth year (required for sorting as oldest first)
- `died`: Death year (optional; if included, shows as "born – died")  
- `photo`: Path to image file (optional; shows initials if omitted)

## Adding Relationships

Add an entry to the `families` array:

```javascript
{ partners: ["person1_id", "person2_id"], children: ["child1_id", "child2_id"] }
```

**Rules:**
- **partners**: First person is on the left, second on the right
- **children**: List in birth order (oldest to youngest)
- **optional**: Omit `parents` field (used internally)

## Example: Multi-Generation Tree

```javascript
people: [
  // Generation 1 (Grandparents)
  { id: "grandpa", name: "Grandpa", born: "1930", photo: "grandpa/photo.jpg" },
  { id: "grandma", name: "Grandma", born: "1932", photo: "grandma/photo.jpg" },
  
  // Generation 2 (Parents)
  { id: "dad",     name: "Dad",     born: "1960", photo: "dad/photo.jpg" },
  { id: "mom",     name: "Mom",     born: "1962", photo: "mom/photo.jpg" },
  { id: "uncle",   name: "Uncle",   born: "1965", photo: "uncle/photo.jpg" },
  { id: "aunt",    name: "Aunt",    born: "1966", photo: "aunt/photo.jpg" },
  
  // Generation 3 (Children)
  { id: "son",     name: "Son",     born: "1990", photo: "son/photo.jpg" },
  { id: "daughter",name: "Daughter",born: "1993", photo: "daughter/photo.jpg" }
],

families: [
  { partners: ["grandpa", "grandma"], children: ["dad", "uncle"] },
  { partners: ["dad", "mom"], children: ["son", "daughter"] },
  { partners: ["uncle", "aunt"], children: [] }
]
```

## Photo Setup

1. Create a folder in `images/` for each person (e.g., `images/john/`)
2. Add their photo(s) in that folder
3. Reference in `family-data.js`: `"photo": "john/photo.jpg"`

### If a Photo Fails to Load

- Check that the file path is correct
- Verify the file exists in the `images/` folder
- Ensure there are no typos in the filename
- The tree will show the person's initials as a fallback

## Editing the Title

In `family-data.js`, change the `title` field:

```javascript
window.FAMILY = {
  title: "Smith Family Tree",  // Change this
  ...
}
```

## Marriage & Divorce Handling

**If someone remarries:**
- Create two separate `families` entries (one for each spouse pairing)
- List each person once in `people`

Example (if person X marries both Y and Z):
```javascript
{ partners: ["X", "Y"], children: ["child1"] },
{ partners: ["X", "Z"], children: ["child2"] }
```

## Testing Your Changes

1. Save `family-data.js`
2. Refresh your browser (Ctrl+F5 or Cmd+Shift+R to clear cache)
3. The tree should update automatically
4. Use the zoom buttons to view different generations

## Common Issues

| Issue | Solution |
|-------|----------|
| Person appears but no image | Check photo path is correct; file should exist in `images/` |
| Person doesn't appear at all | Verify `id` is spelled correctly in both `people` and `families` |
| Children not connected to parents | Ensure parent `id` values in `families` match exactly (case-sensitive) |
| Tree layout is cramped | The layout adjusts automatically; zoom out to see full tree |
| Photo shows as broken | Check file path and ensure image file exists in correct folder |

## Commit & Push to GitHub

After editing:
```bash
git add family-data.js README.md
git commit -m "Update family tree with new members"
git push origin main
```

Your GitHub Pages site will auto-update within seconds!
