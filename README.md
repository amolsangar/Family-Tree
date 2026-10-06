# Family Tree

A beautiful, interactive family tree visualization that can be hosted on GitHub Pages. Couples are displayed side by side with their children arranged below them in a hierarchical tree format.

## Quick Start

### Add Family Members

1. **Add their photos:**
   - Each family member has a folder in `images/` (e.g., `images/dad/`, `images/mom/`, `images/amol/`)
   - Place their photo files in their respective folder
   - Supported formats: JPG, PNG
   - Recommended size: square or nearly square images work best (e.g., 200×200px)

2. **Edit `family-data.js`:**
   - Add each person in the `people` array with:
     - `id`: unique identifier (used internally)
     - `name`: person's full name
     - `born`: birth year (optional)
     - `died`: death year (optional, shows as "born – died")
     - `photo`: path to photo file in `images/` folder (optional; omit to show initials)
   
   - Add relationships in the `families` array with:
     - `partners`: array of two person IDs (husband and wife)
     - `children`: array of their children's IDs (oldest first)

### Example Structure

```javascript
people: [
  { id: "dad",    name: "Dad",    born: "1950", photo: "dad/profile.jpg" },
  { id: "mom",    name: "Mom",    born: "1952", photo: "mom/profile.jpg" },
  { id: "amol",   name: "Amol",   born: "1975", photo: "amol/Profile Pic 2.jpg" }
],
families: [
  { partners: ["dad", "mom"], children: ["amol", "pranav", "meera", "poonam"] }
]
```

3. **Commit and push** to your repository

## View Locally

Open `index.html` directly in your web browser to preview the family tree.

## Publish to GitHub Pages

1. Go to your repository Settings
2. Navigate to **Pages** section
3. Select **Deploy from branch** → **main** branch → **/ (root)** folder
4. Save and wait for the site to deploy
5. Your family tree will be live at: `https://your-username.github.io/repo-name/`

## Features

- **Interactive zoom**: Use the buttons to zoom in/out or fit to width
- **Responsive design**: Works on desktop, tablet, and mobile
- **Dark mode support**: Automatically adapts to your system theme
- **Photo fallback**: If a photo is missing or fails to load, the person's initials display instead

## Tree Structure Rules

- **Root level**: Couples where neither partner is a child of another family (your oldest generation)
- **Children**: Listed below their parents, connected by lines showing relationships
- **Spouses**: Married couples are shown side by side
- **Multiple families**: You can have multiple root couples (e.g., different branches of the family tree)

## Tips

- Keep family member folders organized: `images/firstname/photo.jpg`
- Use consistent photo names for easier management
- Add birth/death years to show life progression
- If you add new people who marry in, they only need a `person` entry + a `families` entry; no parents required
