/* ============================================================
   FAMILY DATA - edit this file to maintain your family tree.

   1) people:   everyone in the tree. "photo" is a file name inside
                the images/ folder (leave it out to show initials).
   2) families: one entry per married/partnered couple.
                partners: the two person ids (husband and wife)
                children: ids of their children, oldest first.

   A child who has their own family entry is drawn as a couple
   with their own children below. Spouses who marry in only need
   a person entry and a family entry - no parents required.
   ============================================================ */
window.FAMILY = {
  title: "🌳 Sangar Family",

  people: [
    // Generation 1 - Root couple
    { id: "dad",    name: "Dad",    born: "1950", photo: "dad/profile.jpg" },
    { id: "mom",    name: "Mom",    born: "1952", photo: "mom/profile.jpg" },
    
    // Generation 2 - Their children
    { id: "amol",   name: "Amol",   born: "1975", photo: "amol/Profile Pic 2.jpg", parents: ["dad", "mom"] },
    { id: "poonam", name: "Poonam", born: "1983", photo: "poonam/profile.jpg", parents: ["dad", "mom"] },
    
    // Generation 2 - Spouse (married in)
    { id: "pranav", name: "Pranav", born: "1978", photo: "pranav/profile.jpg" },
    
    // Generation 3 - Grandchild
    { id: "meera",  name: "Meera",  born: "2005", photo: "meera/profile.jpg", parents: ["poonam", "pranav"] }
  ],

  families: [
    { partners: ["dad", "mom"], children: ["amol", "poonam"] },
    { partners: ["poonam", "pranav"], children: ["meera"] }
  ]
};
