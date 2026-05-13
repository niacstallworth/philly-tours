import { Tour } from "../types";

export const tours: Tour[] = [
  {
    "id": "black-american-legacy-and-quaker-heritage",
    "title": "Black American Legacy & Quaker Heritage",
    "durationMin": 248,
    "distanceMiles": 5.6,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/black-american-legacy-and-quaker-heritage-hero.jpeg",
      "alt": "Historic black-and-white group portrait tied to Black American and Quaker abolitionist history."
    },
    "stops": [
      {
        "id": "black-american-legacy-and-quaker-heritage-president-s-house-liberty-bell-center",
        "title": "President's House / Liberty Bell Center",
        "description": "George Washington's enslaved household exhibits | Day: Day 1 | Time: Afternoon | Location: 526 Market St, Philadelphia, PA 19106",
        "lat": 39.950546398838,
        "lng": -75.149351569291,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/president-s-house-liberty-bell-center.glb",
        "audioUrl": "/audio/president-s-house-liberty-bell-center.mp3",
        "arType": "portal_reconstruction",
        "arPriority": 2,
        "assetNeeded": "household reconstruction; figure markers; timeline overlays",
        "estimatedEffort": "high"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-pennsylvania-abolition-society",
        "title": "Pennsylvania Abolition Society",
        "description": "First abolitionist organization in the world (1775) | Day: Day 1 | Time: Morning | Location: 525 Chestnut St, Philadelphia, PA",
        "lat": 39.94961,
        "lng": -75.14908,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/pennsylvania-abolition-society.glb",
        "audioUrl": "/audio/pennsylvania-abolition-society.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-free-quaker-meeting-house",
        "title": "Free Quaker Meeting House",
        "description": "Quakers who supported the Revolution (1783) | Day: Day 1 | Time: Morning | Location: 500 Arch St, Philadelphia, PA 19106",
        "lat": 39.952528509318,
        "lng": -75.148558439592,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/free-quaker-meeting-house.glb",
        "audioUrl": "/audio/free-quaker-meeting-house.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-arch-street-friends-meeting-house",
        "title": "Arch Street Friends Meeting House",
        "description": "Oldest continuously used Quaker meeting house (1669-present) | Day: Day 1 | Time: Morning | Location: 320 Arch St, Philadelphia, PA 19106",
        "lat": 39.95183,
        "lng": -75.14619,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/arch-street-friends-meeting-house.glb",
        "audioUrl": "/audio/arch-street-friends-meeting-house.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-mother-bethel-ame-church",
        "title": "Mother Bethel AME Church",
        "description": "Founded 1794 by Richard Allen, oldest parcel owned by African Americans | Day: Day 1 | Time: Morning | Location: 419 S 6th St, Philadelphia, PA 19147",
        "lat": 39.943334757651,
        "lng": -75.151977924141,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mother-bethel-ame-church.glb",
        "audioUrl": "/audio/mother-bethel-ame-church.mp3",
        "arType": "portal_reconstruction",
        "arPriority": 1,
        "assetNeeded": "exterior reconstruction scene; site card; archival textures",
        "estimatedEffort": "high"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-lombard-street-free-african-society-ho",
        "title": "Lombard Street Free African Society homes",
        "description": "Richard Allen, Absalom Jones, Cyrus Bustill homes | Day: Day 1 | Time: Afternoon | Location: 600-700 block Lombard St, Philadelphia, PA",
        "lat": 39.943168393929,
        "lng": -75.153778315938,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/lombard-street-free-african-society-homes.glb",
        "audioUrl": "/audio/lombard-street-free-african-society-homes.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-christian-street-ymca",
        "title": "Christian Street YMCA",
        "description": "Pivotal site for Black intellectual life | Day: Day 3 | Time: Afternoon | Location: 1724 Christian St, Philadelphia, PA 19146",
        "lat": 39.940620633837,
        "lng": -75.171560086836,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/christian-street-ymca.glb",
        "audioUrl": "/audio/christian-street-ymca.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-the-woodlands",
        "title": "The Woodlands",
        "description": "1770s neoclassical mansion and cemetery | Day: Day 3 | Time: Morning | Location: 4000 Woodland Ave, Philadelphia, PA 19104",
        "lat": 39.946761172315,
        "lng": -75.206946956348,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/the-woodlands.glb",
        "audioUrl": "/audio/the-woodlands.mp3",
        "arType": "before_after_overlay",
        "arPriority": 4,
        "assetNeeded": "mansion overlay; cemetery context cards",
        "estimatedEffort": "medium"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-w-e-b-du-bois-college-house",
        "title": "W.E.B. Du Bois College House",
        "description": "Exhibit on The Philadelphia Negro study | Day: Day 3 | Time: Evening | Location: 3900 Walnut St, Philadelphia, PA 19104",
        "lat": 39.95337,
        "lng": -75.19844,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/w-e-b-du-bois-college-house.glb",
        "audioUrl": "/audio/w-e-b-du-bois-college-house.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-3911-delancey-street",
        "title": "3911 Delancey Street",
        "description": "Childhood home of Marian Anderson | Day: Day 3 | Time: Afternoon | Location: 3911 Delancey St, Philadelphia, PA",
        "lat": 39.951017022299,
        "lng": -75.201158513635,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/3911-delancey-street.glb",
        "audioUrl": "/audio/3911-delancey-street.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-4600-spruce-street",
        "title": "4600 Spruce Street",
        "description": "Former home of Dr. Nathan F. Mossell | Day: Day 3 | Time: Afternoon | Location: 4600 Spruce St, Philadelphia, PA 19139",
        "lat": 39.953077084792,
        "lng": -75.214231014752,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/4600-spruce-street.glb",
        "audioUrl": "/audio/4600-spruce-street.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-4700-4800-blocks-of-walnut-street",
        "title": "4700-4800 blocks of Walnut Street",
        "description": "Twin Victorian mansions | Day: Day 3 | Time: Afternoon | Location: 4750 Walnut St, Philadelphia, PA",
        "lat": 39.9543,
        "lng": -75.2172,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/4700-4800-blocks-of-walnut-street.glb",
        "audioUrl": "/audio/4700-4800-blocks-of-walnut-street.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-lemon-hill-mansion",
        "title": "Lemon Hill Mansion",
        "description": "1799 Federal mansion, owned by Quaker Henry Pratt | Day: Day 3 | Time: Morning | Location: Lemon Hill Drive, Philadelphia, PA 19130",
        "lat": 39.9707321,
        "lng": -75.1872031,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/lemon-hill-mansion.glb",
        "audioUrl": "/audio/lemon-hill-mansion.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-freedom-theatre",
        "title": "Freedom Theatre",
        "description": "Key cultural landmark | Day: Day 4 | Time: Afternoon | Location: 1346 N Broad St, Philadelphia, PA 19121",
        "lat": 39.97376,
        "lng": -75.15927,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/freedom-theatre.glb",
        "audioUrl": "/audio/freedom-theatre.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-cecil-b-moore-avenue",
        "title": "Cecil B. Moore Avenue",
        "description": "Center of 1960s-70s Black Power era | Day: Day 4 | Time: Afternoon | Location: 1600 Cecil B. Moore Ave, Philadelphia, PA 19121",
        "lat": 39.979059822157,
        "lng": -75.161220817288,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cecil-b-moore-avenue.glb",
        "audioUrl": "/audio/cecil-b-moore-avenue.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-john-coltrane-house",
        "title": "John Coltrane House",
        "description": "Home of legendary jazz musician | Day: Day 4 | Time: Afternoon | Location: 1511 N 33rd St, Philadelphia, PA 19121",
        "lat": 39.9800611265,
        "lng": -75.188844766108,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/john-coltrane-house.glb",
        "audioUrl": "/audio/john-coltrane-house.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-belmont-mansion",
        "title": "Belmont Mansion",
        "description": "Underground Railroad stop | Day: Day 3 | Time: Morning | Location: 2032 Belmont Mansion Dr, Philadelphia, PA 19131",
        "lat": 39.9909604,
        "lng": -75.2130597,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/belmont-mansion.glb",
        "audioUrl": "/audio/belmont-mansion.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-mount-pleasant",
        "title": "Mount Pleasant",
        "description": "Georgian masterpiece | Day: Day 4 | Time: Late Afternoon | Location: 3800 Mount Pleasant Dr, Philadelphia, PA 19121",
        "lat": 39.9833812,
        "lng": -75.1998419,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mount-pleasant.glb",
        "audioUrl": "/audio/mount-pleasant.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-ormiston",
        "title": "Ormiston",
        "description": "Smallest Quaker-built Park mansion | Day: Day 4 | Time: Late Afternoon | Location: Reservoir Dr, Philadelphia, PA 19121",
        "lat": 39.9887049,
        "lng": -75.1962827,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/ormiston.glb",
        "audioUrl": "/audio/ormiston.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-cedar-grove-and-laurel-hill-mansions",
        "title": "Cedar Grove & Laurel Hill mansions",
        "description": "Quaker summer estates | Day: Day 3 | Time: Morning | Location: Laurel Hill Mansion, Edgley Dr, Philadelphia, PA 19129",
        "lat": 39.9913818,
        "lng": -75.1948371,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cedar-grove-and-laurel-hill-mansions.glb",
        "audioUrl": "/audio/cedar-grove-and-laurel-hill-mansions.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-strawberry-mansion",
        "title": "Strawberry Mansion",
        "description": "Largest Federal-era mansion in Fairmount Park | Day: Day 4 | Time: Morning | Location: 2450 Strawberry Mansion Dr, Philadelphia, PA",
        "lat": 39.995669245522,
        "lng": -75.190227022377,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/strawberry-mansion.glb",
        "audioUrl": "/audio/strawberry-mansion.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-3200-3400-blocks-diamond-and-susquehan",
        "title": "3200-3400 blocks Diamond & Susquehanna",
        "description": "Historic Doctor's Row townhouses | Day: Day 4 | Time: Afternoon | Location: 3300 N Broad St, Philadelphia, PA 19140",
        "lat": 40.003248577622,
        "lng": -75.152611725256,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/3200-3400-blocks-diamond-and-susquehanna.glb",
        "audioUrl": "/audio/3200-3400-blocks-diamond-and-susquehanna.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-stenton",
        "title": "Stenton",
        "description": "Georgian mansion with complex slavery history | Day: Day 2 | Time: Morning | Location: 4601 N 18th St, Philadelphia, PA",
        "lat": 40.023849953432,
        "lng": -75.154525511519,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/stenton.glb",
        "audioUrl": "/audio/stenton.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-belfield-mansion",
        "title": "Belfield Mansion",
        "description": "1711 Quaker summer estate, abolitionist ties | Day: Day 1 | Time: Afternoon | Location: 2100 W Clarkson Ave, Philadelphia, PA 19144",
        "lat": 40.038190898967,
        "lng": -75.156717419902,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/belfield-mansion.glb",
        "audioUrl": "/audio/belfield-mansion.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-grumblethorpe",
        "title": "Grumblethorpe",
        "description": "1744 summer home of Wister family | Day: Day 2 | Time: Morning | Location: 5267 Germantown Ave, Philadelphia, PA",
        "lat": 40.03195990911,
        "lng": -75.168420267294,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/grumblethorpe.glb",
        "audioUrl": "/audio/grumblethorpe.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-deshler-morris-house",
        "title": "Deshler-Morris House",
        "description": "Washington's Germantown White House 1793-94 | Day: Day 2 | Time: Morning | Location: 5442 Germantown Ave, Philadelphia, PA",
        "lat": 40.0338725,
        "lng": -75.1722563,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/deshler-morris-house.glb",
        "audioUrl": "/audio/deshler-morris-house.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-wyck",
        "title": "Wyck",
        "description": "One of Germantown's oldest houses, abolitionist ties | Day: Day 2 | Time: Morning | Location: 6026 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.039539389943,
        "lng": -75.177963310125,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/wyck.glb",
        "audioUrl": "/audio/wyck.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-germantown-mennonite-meetinghouse",
        "title": "Germantown Mennonite Meetinghouse",
        "description": "Site of 1688 Protest Against Slavery | Day: Day 2 | Time: Afternoon | Location: 6133 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.041419855634,
        "lng": -75.179329625593,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/germantown-mennonite-meetinghouse.glb",
        "audioUrl": "/audio/germantown-mennonite-meetinghouse.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-johnson-house",
        "title": "Johnson House",
        "description": "Underground Railroad station | Day: Day 2 | Time: Afternoon | Location: 6306 Germantown Ave, Philadelphia, PA",
        "lat": 40.043414697068,
        "lng": -75.181116152631,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/johnson-house.glb",
        "audioUrl": "/audio/johnson-house.mp3",
        "arType": "historical_figure_presence",
        "arPriority": 3,
        "assetNeeded": "Underground Railroad scene; host figure silhouette; route overlay",
        "estimatedEffort": "high"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-cliveden",
        "title": "Cliveden",
        "description": "1767 mansion, Battle of Germantown site | Day: Day 2 | Time: Morning | Location: 6401 Germantown Ave, Philadelphia, PA 19119",
        "lat": 40.0473825,
        "lng": -75.1811631,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cliveden.glb",
        "audioUrl": "/audio/cliveden.mp3"
      },
      {
        "id": "black-american-legacy-and-quaker-heritage-upsala",
        "title": "Upsala",
        "description": "1798 Federal-style mansion | Day: Day 2 | Time: Morning | Location: 6430 Germantown Ave, Philadelphia, PA",
        "lat": 40.0466326,
        "lng": -75.1832504,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/upsala.glb",
        "audioUrl": "/audio/upsala.mp3"
      }
    ]
  },
  {
    "id": "rainbow-girls-philadelphia",
    "title": "Rainbow Girls Philadelphia",
    "durationMin": 80,
    "distanceMiles": 1.8,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/rainbow-girls-philadelphia-hero.jpg",
      "alt": "Rainbow Girls Philadelphia collage featuring leadership, service, and friendship moments."
    },
    "stops": [
      {
        "id": "rainbow-girls-philadelphia-masonic-temple",
        "title": "Masonic Temple",
        "description": "Rainbow Check-In & Tour - Seven lodge rooms, Rainbow jewels, 1922 charter | Day: Day 1 | Time: 9:00 AM | Location: 1 N Broad St, Philadelphia, PA 19107",
        "lat": 39.953405220467,
        "lng": -75.163235969318,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/masonic-temple.glb",
        "audioUrl": "/audio/masonic-temple.mp3",
        "arType": "object_on_plinth",
        "arPriority": 5,
        "assetNeeded": "Rainbow jewels; ceremonial symbols; spatial story cards",
        "estimatedEffort": "medium"
      },
      {
        "id": "rainbow-girls-philadelphia-reading-terminal-market",
        "title": "Reading Terminal Market",
        "description": "Rainbow-Colored Lunch - color-themed food stations | Day: Day 1 | Time: 12:30 PM | Location: 1136 Arch St, Philadelphia, PA 19107",
        "lat": 39.953766169681,
        "lng": -75.158473474948,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/reading-terminal-market.glb",
        "audioUrl": "/audio/reading-terminal-market.mp3"
      },
      {
        "id": "rainbow-girls-philadelphia-hard-rock-cafe",
        "title": "Hard Rock Cafe",
        "description": "Rainbow Friendship Dinner with karaoke | Day: Day 1 | Time: 6:00 PM | Location: 1119 Market St, Philadelphia, PA 19107",
        "lat": 39.951810696626,
        "lng": -75.158629946618,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/hard-rock-cafe.glb",
        "audioUrl": "/audio/hard-rock-cafe.mp3"
      },
      {
        "id": "rainbow-girls-philadelphia-arch-street-presbyterian-church",
        "title": "Arch Street Presbyterian Church",
        "description": "Rainbow Worship Service | Day: Day 2 | Time: 8:45 AM | Location: 1724 Arch St, Philadelphia, PA 19103",
        "lat": 39.955002597364,
        "lng": -75.16842574209,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/arch-street-presbyterian-church.glb",
        "audioUrl": "/audio/arch-street-presbyterian-church.mp3"
      },
      {
        "id": "rainbow-girls-philadelphia-green-eggs-caf",
        "title": "Green Eggs Café",
        "description": "Colorful Brunch with rainbow bagels | Day: Day 2 | Time: 10:30 AM | Location: 33 S 18th St, Philadelphia, PA 19103",
        "lat": 39.952138327067,
        "lng": -75.17016253944,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/green-eggs-caf.glb",
        "audioUrl": "/audio/green-eggs-caf.mp3"
      },
      {
        "id": "rainbow-girls-philadelphia-sweetbriar-mansion-lawn",
        "title": "Sweetbriar Mansion lawn",
        "description": "Closing Rainbow Ceremony with Pot of Gold | Day: Day 2 | Time: 3:30 PM | Location: 1 Sweetbriar Ln, Philadelphia, PA 19131",
        "lat": 39.976605171234,
        "lng": -75.200781024221,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/sweetbriar-mansion-lawn.glb",
        "audioUrl": "/audio/sweetbriar-mansion-lawn.mp3"
      },
      {
        "id": "rainbow-girls-philadelphia-smith-memorial-playground",
        "title": "Smith Memorial Playground",
        "description": "Giant wooden slide tradition | Day: Day 2 | Location: 3500 Reservoir Dr, Philadelphia, PA 19121",
        "lat": 39.9814625,
        "lng": -75.1960241,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/smith-memorial-playground.glb",
        "audioUrl": "/audio/smith-memorial-playground.mp3"
      },
      {
        "id": "rainbow-girls-philadelphia-please-touch-museum",
        "title": "Please Touch Museum",
        "description": "Rainbow Adventure - Imagination Playground | Day: Day 2 | Time: 12:00 PM | Location: 4231 Avenue of the Republic, Philadelphia, PA 19131",
        "lat": 39.9794694,
        "lng": -75.2091302,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/please-touch-museum.glb",
        "audioUrl": "/audio/please-touch-museum.mp3",
        "arType": "floating_story_card",
        "arPriority": 6,
        "assetNeeded": "animated story cards; photo frames",
        "estimatedEffort": "low"
      },
      {
        "id": "rainbow-girls-philadelphia-shofuso-japanese-house-and-garden",
        "title": "Shofuso Japanese House & Garden",
        "description": "Walk the rainbow bridge | Day: Day 2 | Location: Lansdowne Dr & Horticultural Dr, Philadelphia, PA 19131",
        "lat": 39.9815027,
        "lng": -75.2129462,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/shofuso-japanese-house-and-garden.glb",
        "audioUrl": "/audio/shofuso-japanese-house-and-garden.mp3",
        "arType": "portal_reconstruction",
        "arPriority": 7,
        "assetNeeded": "garden scene extension; cultural context overlay",
        "estimatedEffort": "high"
      },
      {
        "id": "rainbow-girls-philadelphia-covenant-house-pa",
        "title": "Covenant House PA",
        "description": "Service Project - Pack 150 hygiene kits | Day: Day 1 | Time: 2:00 PM | Location: 31 E Armat St, Philadelphia, PA 19144",
        "lat": 40.035586240392,
        "lng": -75.173233757808,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/covenant-house-pa.glb",
        "audioUrl": "/audio/covenant-house-pa.mp3"
      }
    ]
  },
  {
    "id": "divine-9-legacy-tour",
    "title": "Divine 9 Legacy Tour",
    "durationMin": 64,
    "distanceMiles": 1.4,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/divine-9-legacy-tour-hero.png",
      "alt": "Divine Nine organization colors and Greek letters arranged in vertical bands."
    },
    "stops": [
      {
        "id": "divine-9-legacy-tour-alpha-kappa-alpha-ivy-legacy",
        "title": "Alpha Kappa Alpha - Ivy Legacy",
        "description": "First alumnae chapter (1918) | Day: Day 2 | Time: 9:00 AM | Location: 1824 South St, Philadelphia, PA",
        "lat": 39.944436616003,
        "lng": -75.172339660864,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/alpha-kappa-alpha-ivy-legacy.glb",
        "audioUrl": "/audio/alpha-kappa-alpha-ivy-legacy.mp3"
      },
      {
        "id": "divine-9-legacy-tour-zeta-phi-beta-17th-and-jefferson",
        "title": "Zeta Phi Beta - 17th & Jefferson",
        "description": "First graduate chapter (1925), now mural | Day: Day 2 | Time: 10:30 AM | Location: 17th & Jefferson St, Philadelphia, PA",
        "lat": 39.976470929981,
        "lng": -75.163327227673,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/zeta-phi-beta-17th-and-jefferson.glb",
        "audioUrl": "/audio/zeta-phi-beta-17th-and-jefferson.mp3"
      },
      {
        "id": "divine-9-legacy-tour-iota-phi-theta-temple-greek-row",
        "title": "Iota Phi Theta - Temple Greek Row",
        "description": "First chapter north of Baltimore (1972) | Day: Day 2 | Time: 2:30 PM | Location: 1900 N 13th St, Philadelphia, PA",
        "lat": 39.981469029184,
        "lng": -75.155126391124,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/iota-phi-theta-temple-greek-row.glb",
        "audioUrl": "/audio/iota-phi-theta-temple-greek-row.mp3",
        "arType": "historical_figure_presence",
        "arPriority": 10,
        "assetNeeded": "legacy scene; organization timeline; marker overlay",
        "estimatedEffort": "medium"
      },
      {
        "id": "divine-9-legacy-tour-delta-sigma-theta-40th-and-market",
        "title": "Delta Sigma Theta - 40th & Market",
        "description": "First public act marker, chartered 1920 | Day: Day 1 | Time: 10:30 AM | Location: 40th & Market St, Philadelphia, PA",
        "lat": 39.957147935208,
        "lng": -75.201955216617,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/delta-sigma-theta-40th-and-market.glb",
        "audioUrl": "/audio/delta-sigma-theta-40th-and-market.mp3",
        "arType": "floating_story_card",
        "arPriority": 9,
        "assetNeeded": "public act timeline; archival photos; chapter card",
        "estimatedEffort": "low"
      },
      {
        "id": "divine-9-legacy-tour-alpha-phi-alpha-42nd-and-chestnut",
        "title": "Alpha Phi Alpha - 42nd & Chestnut",
        "description": "First graduate chapter house in America (1922) | Day: Day 1 | Time: 9:00 AM | Location: 42nd & Chestnut St, Philadelphia, PA",
        "lat": 39.956112935564,
        "lng": -75.206126715359,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/alpha-phi-alpha-42nd-and-chestnut.glb",
        "audioUrl": "/audio/alpha-phi-alpha-42nd-and-chestnut.mp3",
        "arType": "object_on_plinth",
        "arPriority": 8,
        "assetNeeded": "crest; chapter marker; founding timeline objects",
        "estimatedEffort": "medium"
      },
      {
        "id": "divine-9-legacy-tour-phi-beta-sigma-44th-and-market",
        "title": "Phi Beta Sigma - 44th & Market",
        "description": "First graduate chapter (1921) | Day: Day 2 | Time: 11:30 AM | Location: 44th & Market St, Philadelphia, PA",
        "lat": 39.958074935293,
        "lng": -75.209420714197,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/phi-beta-sigma-44th-and-market.glb",
        "audioUrl": "/audio/phi-beta-sigma-44th-and-market.mp3"
      },
      {
        "id": "divine-9-legacy-tour-kappa-alpha-psi-44th-and-chestnut",
        "title": "Kappa Alpha Psi - 44th & Chestnut",
        "description": "First graduate chapter in nation (1919) | Day: Day 1 | Time: 12:00 PM | Location: 44th & Chestnut St, Philadelphia, PA",
        "lat": 39.956562935605,
        "lng": -75.209740214188,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/kappa-alpha-psi-44th-and-chestnut.glb",
        "audioUrl": "/audio/kappa-alpha-psi-44th-and-chestnut.mp3"
      },
      {
        "id": "divine-9-legacy-tour-sigma-gamma-rho-48th-and-spruce",
        "title": "Sigma Gamma Rho - 48th & Spruce",
        "description": "First graduate chapter Rho Sigma (1929) | Day: Day 1 | Time: 2:30 PM | Location: 48th & Spruce St, Philadelphia, PA",
        "lat": 39.953610936493,
        "lng": -75.218132711711,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/sigma-gamma-rho-48th-and-spruce.glb",
        "audioUrl": "/audio/sigma-gamma-rho-48th-and-spruce.mp3"
      }
    ]
  },
  {
    "id": "black-american-sports",
    "title": "Black American Sports",
    "durationMin": 72,
    "distanceMiles": 1.6,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/black-american-sports-hero.jpeg",
      "alt": "Black American sports collage featuring Philadelphia athletes and community figures."
    },
    "stops": [
      {
        "id": "black-american-sports-south-kitchen-and-jazz-club",
        "title": "South Kitchen & Jazz Club",
        "description": "Soul food dinner with live music | Day: 1 Day | Time: 6:00 PM | Location: 600 N Broad St, Philadelphia, PA 19130",
        "lat": 39.9643953,
        "lng": -75.1613228,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/south-kitchen-and-jazz-club.glb",
        "audioUrl": "/audio/south-kitchen-and-jazz-club.mp3"
      },
      {
        "id": "black-american-sports-marian-anderson-rec-center",
        "title": "Marian Anderson Rec Center",
        "description": "Dawn Staley's training grounds | Day: 1 Day | Time: 3:30 PM | Location: 740 S 17th St, Philadelphia, PA 19146",
        "lat": 39.942521259833,
        "lng": -75.170791613247,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/marian-anderson-rec-center.glb",
        "audioUrl": "/audio/marian-anderson-rec-center.mp3"
      },
      {
        "id": "black-american-sports-the-palestra",
        "title": "The Palestra",
        "description": "Cathedral of College Basketball, Wilt Chamberlain history | Day: 1 Day | Time: 9:00 AM | Location: 235 S 33rd St, Philadelphia, PA 19104",
        "lat": 39.951325044425,
        "lng": -75.190420086879,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/the-palestra.glb",
        "audioUrl": "/audio/the-palestra.mp3",
        "arType": "portal_reconstruction",
        "arPriority": 11,
        "assetNeeded": "historic game scene; score overlay; court reconstruction",
        "estimatedEffort": "high"
      },
      {
        "id": "black-american-sports-joe-frazier-s-gym-cloverlay",
        "title": "Joe Frazier's Gym (Cloverlay)",
        "description": "Smokin' Joe's legendary training grounds | Day: 1 Day | Time: 11:00 AM | Location: 2917 N Broad St, Philadelphia, PA 19132",
        "lat": 39.997489442382,
        "lng": -75.153756782567,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/joe-frazier-s-gym-cloverlay.glb",
        "audioUrl": "/audio/joe-frazier-s-gym-cloverlay.mp3",
        "arType": "historical_figure_presence",
        "arPriority": 12,
        "assetNeeded": "training scene; gloves and belt object set; archival card",
        "estimatedEffort": "high"
      },
      {
        "id": "black-american-sports-dell-music-center",
        "title": "Dell Music Center",
        "description": "Joe Louis Boxing Ring, 1940s-50s matches | Day: 1 Day | Time: 1:00 PM | Location: 2400 Strawberry Mansion Dr, Philadelphia, PA 19132",
        "lat": 39.9962783,
        "lng": -75.1889115,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/dell-music-center.glb",
        "audioUrl": "/audio/dell-music-center.mp3"
      },
      {
        "id": "black-american-sports-allen-iverson-s-hampton-park-courts",
        "title": "Allen Iverson's Hampton Park Courts",
        "description": "Where AI perfected his crossover, 2019 mural | Day: 1 Day | Time: 10:00 AM | Location: 3601 S Broad St, Philadelphia, PA 19148",
        "lat": 39.9012015,
        "lng": -75.1719797,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/allen-iverson-s-hampton-park-courts.glb",
        "audioUrl": "/audio/allen-iverson-s-hampton-park-courts.mp3"
      },
      {
        "id": "black-american-sports-overbrook-high-school",
        "title": "Overbrook High School",
        "description": "Wilt Chamberlain & Kobe Bryant's high school | Day: 1 Day | Time: 2:00 PM | Location: 5898 Lancaster Ave, Philadelphia, PA 19131",
        "lat": 39.9811248,
        "lng": -75.2381377,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/overbrook-high-school.glb",
        "audioUrl": "/audio/overbrook-high-school.mp3",
        "arType": "floating_story_card",
        "arPriority": 13,
        "assetNeeded": "Wilt and Kobe legacy cards; stats overlays",
        "estimatedEffort": "low"
      },
      {
        "id": "black-american-sports-sonny-hill-league-tustin",
        "title": "Sonny Hill League @ Tustin",
        "description": "Oldest summer basketball league (1968) | Day: 1 Day | Time: 4:30 PM | Location: 5900 W Columbia Ave, Philadelphia, PA 19151",
        "lat": 39.981382810898,
        "lng": -75.239399628608,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/sonny-hill-league-tustin.glb",
        "audioUrl": "/audio/sonny-hill-league-tustin.mp3"
      },
      {
        "id": "black-american-sports-maxie-s-pizza",
        "title": "Maxie's Pizza",
        "description": "North Philly staple, Joe Frazier favorite | Day: 1 Day | Time: 12:00 PM | Location: 5500 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.034356163144,
        "lng": -75.172814429981,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/maxie-s-pizza.glb",
        "audioUrl": "/audio/maxie-s-pizza.mp3"
      }
    ]
  },
  {
    "id": "black-inventors-tour",
    "title": "Black Inventors Tour",
    "durationMin": 64,
    "distanceMiles": 1.4,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/black-inventors-tour-hero.jpg",
      "alt": "Black Inventors Tour collage featuring historic Black inventors and innovators."
    },
    "stops": [
      {
        "id": "black-inventors-tour-garrett-morgan-traffic-signal",
        "title": "Garrett Morgan Traffic Signal",
        "description": "Three-position traffic light inventor (1923) | Day: 1 Day | Time: 5:00 PM | Location: S 13th St & Market St, Philadelphia, PA 19107",
        "lat": 39.952098934751,
        "lng": -75.161437229754,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/garrett-morgan-traffic-signal.glb",
        "audioUrl": "/audio/garrett-morgan-traffic-signal.mp3",
        "arType": "animated_diagram",
        "arPriority": 15,
        "assetNeeded": "signal mechanism; intersection overlay; patent timeline",
        "estimatedEffort": "medium"
      },
      {
        "id": "black-inventors-tour-african-american-museum",
        "title": "African American Museum",
        "description": "Black Inventors Hall of Fame exhibit | Day: 1 Day | Time: 8:00 PM | Location: 701 Arch St, Philadelphia, PA 19106",
        "lat": 39.953010995469,
        "lng": -75.151598440748,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/african-american-museum.glb",
        "audioUrl": "/audio/african-american-museum.mp3"
      },
      {
        "id": "black-inventors-tour-lewis-latimer-light-bulb-exhibit",
        "title": "Lewis Latimer Light Bulb Exhibit",
        "description": "Carbon filament patent (1881) | Day: 1 Day | Time: 1:00 PM | Location: 15 S 7th St, Philadelphia, PA 19106",
        "lat": 39.950751020239,
        "lng": -75.151973988349,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/lewis-latimer-light-bulb-exhibit.glb",
        "audioUrl": "/audio/lewis-latimer-light-bulb-exhibit.mp3",
        "arType": "animated_diagram",
        "arPriority": 14,
        "assetNeeded": "filament model; patent diagram animation; inventor card",
        "estimatedEffort": "medium"
      },
      {
        "id": "black-inventors-tour-dr-charles-drew-blood-bank",
        "title": "Dr. Charles Drew Blood Bank",
        "description": "Blood plasma storage pioneer (1940s) | Day: 1 Day | Time: 3:30 PM | Location: 800 Spruce St, Philadelphia, PA 19107",
        "lat": 39.945680181785,
        "lng": -75.154845554289,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/dr-charles-drew-blood-bank.glb",
        "audioUrl": "/audio/dr-charles-drew-blood-bank.mp3",
        "arType": "animated_diagram",
        "arPriority": 16,
        "assetNeeded": "blood plasma storage explainer; medical card set",
        "estimatedEffort": "medium"
      },
      {
        "id": "black-inventors-tour-sarah-e-goode-house",
        "title": "Sarah E. Goode House",
        "description": "First Black woman patent holder (1885) | Day: 1 Day | Time: 11:00 AM | Location: 1724 South St, Philadelphia, PA 19146",
        "lat": 39.944238633413,
        "lng": -75.17076809007,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/sarah-e-goode-house.glb",
        "audioUrl": "/audio/sarah-e-goode-house.mp3"
      },
      {
        "id": "black-inventors-tour-granville-t-woods-railway-site",
        "title": "Granville T. Woods Railway Site",
        "description": "Black Edison, railway telegraph inventor (1887) | Day: 1 Day | Time: 10:00 AM | Location: N Broad St & W Girard Ave, Philadelphia, PA 19121",
        "lat": 39.971466930834,
        "lng": -75.159443729208,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/granville-t-woods-railway-site.glb",
        "audioUrl": "/audio/granville-t-woods-railway-site.mp3"
      },
      {
        "id": "black-inventors-tour-norbert-rillieux-way",
        "title": "Norbert Rillieux Way",
        "description": "Sugar refining inventor, first Black Penn student (1830-32) | Day: 1 Day | Time: 9:00 AM | Location: S 33rd St & Walnut St, Philadelphia, PA 19104",
        "lat": 39.95255793569,
        "lng": -75.190034720671,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/norbert-rillieux-way.glb",
        "audioUrl": "/audio/norbert-rillieux-way.mp3"
      },
      {
        "id": "black-inventors-tour-frederick-mckinley-jones-route",
        "title": "Frederick McKinley Jones Route",
        "description": "Portable refrigeration inventor (1940) | Day: 1 Day | Time: 2:30 PM | Location: 1612 Vandike St, Philadelphia, PA 19124",
        "lat": 40.005810144893,
        "lng": -75.091752598026,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/frederick-mckinley-jones-route.glb",
        "audioUrl": "/audio/frederick-mckinley-jones-route.mp3"
      }
    ]
  },
  {
    "id": "library-story-hop-tour",
    "title": "Library Story Hop Tour",
    "durationMin": 56,
    "distanceMiles": 1.3,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/library-story-hop-tour-hero.jpg",
      "alt": "Exterior of the Free Library of Philadelphia main branch on the Parkway."
    },
    "stops": [
      {
        "id": "library-story-hop-tour-library-company-of-philadelphia",
        "title": "Library Company of Philadelphia",
        "description": "1739 story of enslaved boy Othello granted reading privilege | Day: 1 Day | Time: 9:00 AM | Location: 1314 Locust St, Philadelphia, PA 19107",
        "lat": 39.94795872719,
        "lng": -75.163002384984,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/library-company-of-philadelphia.glb",
        "audioUrl": "/audio/library-company-of-philadelphia.mp3"
      },
      {
        "id": "library-story-hop-tour-historical-society-of-pennsylvania",
        "title": "Historical Society of Pennsylvania",
        "description": "Original Constitution draft with Jefferson's edit | Day: 1 Day | Location: 1300 Locust St, Philadelphia, PA 19107",
        "lat": 39.947885206323,
        "lng": -75.162446077311,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/historical-society-of-pennsylvania.glb",
        "audioUrl": "/audio/historical-society-of-pennsylvania.mp3"
      },
      {
        "id": "library-story-hop-tour-free-library-central-parkway",
        "title": "Free Library - Central Parkway",
        "description": "Charles Dickens and Grip the raven inspiration | Day: 1 Day | Location: 1901 Vine St, Philadelphia, PA 19103",
        "lat": 39.959157790597,
        "lng": -75.17040431366,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/free-library-central-parkway.glb",
        "audioUrl": "/audio/free-library-central-parkway.mp3",
        "arType": "floating_story_card",
        "arPriority": 18,
        "assetNeeded": "literary quote cards; raven and book overlays; facade card",
        "estimatedEffort": "low"
      },
      {
        "id": "library-story-hop-tour-parkway-central-children-s-dept",
        "title": "Parkway Central Children's Dept",
        "description": "Original Winnie-the-Pooh toys (40 years) | Day: 1 Day | Location: 1901 Vine St, Philadelphia, PA 19103",
        "lat": 39.959157790597,
        "lng": -75.17040431366,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/parkway-central-children-s-dept.glb",
        "audioUrl": "/audio/parkway-central-children-s-dept.mp3"
      },
      {
        "id": "library-story-hop-tour-rosenbach-museum-and-library",
        "title": "Rosenbach Museum & Library",
        "description": "Maurice Sendak and Winnie-the-Pooh toys | Day: 1 Day | Location: 2008 Delancey Pl, Philadelphia, PA 19103",
        "lat": 39.947388912205,
        "lng": -75.17471860127,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/rosenbach-museum-and-library.glb",
        "audioUrl": "/audio/rosenbach-museum-and-library.mp3",
        "arType": "floating_story_card",
        "arPriority": 17,
        "assetNeeded": "manuscript cards; toy and book reveal; collection overlay",
        "estimatedEffort": "low"
      },
      {
        "id": "library-story-hop-tour-athenaeum-of-philadelphia",
        "title": "Athenaeum of Philadelphia",
        "description": "Edgar Allan Poe carved initials (1843) | Day: 1 Day | Location: 219 S 6th St, Philadelphia, PA 19106",
        "lat": 39.946715009344,
        "lng": -75.15123784827,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/athenaeum-of-philadelphia.glb",
        "audioUrl": "/audio/athenaeum-of-philadelphia.mp3"
      },
      {
        "id": "library-story-hop-tour-charles-l-blockson-collection",
        "title": "Charles L. Blockson Collection",
        "description": "Harriet Tubman's personal hymnbook | Day: 1 Day | Location: Sullivan Hall, 1st Floor, 1330 Polett Walk, Philadelphia, PA 19122",
        "lat": 39.981367,
        "lng": -75.1561946,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/charles-l-blockson-collection.glb",
        "audioUrl": "/audio/charles-l-blockson-collection.mp3",
        "arType": "object_on_plinth",
        "arPriority": 19,
        "assetNeeded": "hymnbook or archival object model; collection card",
        "estimatedEffort": "medium"
      }
    ]
  },
  {
    "id": "old-york-road-corridor",
    "title": "Old York Road Corridor",
    "durationMin": 80,
    "distanceMiles": 1.8,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/old-york-road-corridor-hero.jpg",
      "alt": "Historic Old York Road marker plaque set into cobblestones."
    },
    "stops": [
      {
        "id": "old-york-road-corridor-happy-hollow-rec-center",
        "title": "Happy Hollow Rec Center",
        "description": "1967 race riots site, now community hub | Day: Afternoon | Time: 1:00 PM | Location: 4740 Wayne Ave, Philadelphia, PA 19144",
        "lat": 40.023831555249,
        "lng": -75.164942218862,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/happy-hollow-rec-center.glb",
        "audioUrl": "/audio/happy-hollow-rec-center.mp3",
        "arType": "before_after_overlay",
        "arPriority": 22,
        "assetNeeded": "riot and community timeline; neighborhood memory overlay",
        "estimatedEffort": "medium"
      },
      {
        "id": "old-york-road-corridor-germantown-high-school",
        "title": "Germantown High School",
        "description": "First integrated high school in Philly | Day: Late Afternoon | Time: 4:00 PM | Location: 2950 W School House Ln, Philadelphia, PA 19144",
        "lat": 40.024959254044,
        "lng": -75.183320092418,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/germantown-high-school.glb",
        "audioUrl": "/audio/germantown-high-school.mp3"
      },
      {
        "id": "old-york-road-corridor-the-nile-restaurant-and-lounge",
        "title": "The Nile Restaurant & Lounge",
        "description": "Vegan soul food, founded by Black Panthers | Day: Evening | Time: 6:30 PM | Location: 6008 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.039439020352,
        "lng": -75.177880396133,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/the-nile-restaurant-and-lounge.glb",
        "audioUrl": "/audio/the-nile-restaurant-and-lounge.mp3"
      },
      {
        "id": "old-york-road-corridor-johnson-house-historic-site",
        "title": "Johnson House Historic Site",
        "description": "Active Underground Railroad station | Day: Afternoon | Time: 2:00 PM | Location: 6306 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.043414697068,
        "lng": -75.181116152631,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/johnson-house-historic-site.glb",
        "audioUrl": "/audio/johnson-house-historic-site.mp3"
      },
      {
        "id": "old-york-road-corridor-cliveden-historic-site",
        "title": "Cliveden Historic Site",
        "description": "1777 Battle of Germantown, enslaved Africans' contributions | Day: Afternoon | Time: 3:00 PM | Location: 6401 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.04597099227,
        "lng": -75.182161819444,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cliveden-historic-site.glb",
        "audioUrl": "/audio/cliveden-historic-site.mp3"
      },
      {
        "id": "old-york-road-corridor-ogontz-theatre-site",
        "title": "Ogontz Theatre Site",
        "description": "Vaudeville palace for Black artists during segregation | Day: Morning | Time: 9:45 AM | Location: 6037 Ogontz Ave, Philadelphia, PA 19141",
        "lat": 40.04726302459,
        "lng": -75.150993075727,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/ogontz-theatre-site.glb",
        "audioUrl": "/audio/ogontz-theatre-site.mp3",
        "arType": "portal_reconstruction",
        "arPriority": 20,
        "assetNeeded": "theatre facade reconstruction; performance poster overlays",
        "estimatedEffort": "high"
      },
      {
        "id": "old-york-road-corridor-old-york-road-and-north-broad",
        "title": "Old York Road & North Broad",
        "description": "Colonial gateway, free Black laborers built milestones | Day: Morning | Time: 9:00 AM | Location: 6704 Old York Rd, Philadelphia, PA 19126",
        "lat": 40.054099719327,
        "lng": -75.1415888166,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/old-york-road-and-north-broad.glb",
        "audioUrl": "/audio/old-york-road-and-north-broad.mp3",
        "arType": "route_ghost",
        "arPriority": 26,
        "assetNeeded": "corridor route arrows; milestone reveal; wayfinding card",
        "estimatedEffort": "low"
      },
      {
        "id": "old-york-road-corridor-cecil-b-moore-law-office",
        "title": "Cecil B. Moore Law Office",
        "description": "Civil rights leader's law practice | Day: Morning | Time: 10:30 AM | Location: 7101 Ogontz Ave, Philadelphia, PA 19138",
        "lat": 40.062299380483,
        "lng": -75.151721055766,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cecil-b-moore-law-office.glb",
        "audioUrl": "/audio/cecil-b-moore-law-office.mp3",
        "arType": "historical_figure_presence",
        "arPriority": 21,
        "assetNeeded": "speech and activism overlay; office card; archival layer",
        "estimatedEffort": "medium"
      },
      {
        "id": "old-york-road-corridor-relish-restaurant",
        "title": "Relish Restaurant",
        "description": "Upscale soul food in historic mansion | Day: Lunch | Time: 12:00 PM | Location: 7152 Ogontz Ave, Philadelphia, PA 19138",
        "lat": 40.063297494417,
        "lng": -75.152580977181,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/relish-restaurant.glb",
        "audioUrl": "/audio/relish-restaurant.mp3"
      },
      {
        "id": "old-york-road-corridor-woodmere-art-museum",
        "title": "Woodmere Art Museum",
        "description": "We Speak: Black Artists exhibit | Day: Evening | Time: 5:00 PM | Location: 9201 Germantown Ave, Philadelphia, PA 19118",
        "lat": 40.082166765075,
        "lng": -75.219813650213,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/woodmere-art-museum.glb",
        "audioUrl": "/audio/woodmere-art-museum.mp3"
      }
    ]
  },
  {
    "id": "black-medical-legacy",
    "title": "Black Medical Legacy",
    "durationMin": 120,
    "distanceMiles": 2.7,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/black-medical-legacy-hero.avif",
      "alt": "Black Doctors Row tour hero image for the Black Medical Legacy route."
    },
    "stops": [
      {
        "id": "black-medical-legacy-frederick-douglass-hospital",
        "title": "Frederick Douglass Hospital",
        "description": "Founded 1895 by Dr. Nathan F. Mossell | Day: Day 1 | Time: 10:30 AM | Location: 1512 Lombard St, Philadelphia, PA 19146",
        "lat": 39.944869295981,
        "lng": -75.167368249045,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/frederick-douglass-hospital.glb",
        "audioUrl": "/audio/frederick-douglass-hospital.mp3"
      },
      {
        "id": "black-medical-legacy-pennsylvania-hospital",
        "title": "Pennsylvania Hospital",
        "description": "Used enslaved bodies for anatomy (1760s-1800s) | Day: Day 3 | Time: 11:30 AM | Location: 800 Spruce St, Philadelphia, PA 19107",
        "lat": 39.945680181785,
        "lng": -75.154845554289,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/pennsylvania-hospital.glb",
        "audioUrl": "/audio/pennsylvania-hospital.mp3"
      },
      {
        "id": "black-medical-legacy-mercy-hospital-site",
        "title": "Mercy Hospital Site",
        "description": "Pre-merger Black hospital (1907) | Day: Day 1 | Time: 2:30 PM | Location: S 17th St & Fitzwater St, Philadelphia, PA 19146",
        "lat": 39.942414937009,
        "lng": -75.170738727397,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mercy-hospital-site.glb",
        "audioUrl": "/audio/mercy-hospital-site.mp3"
      },
      {
        "id": "black-medical-legacy-free-african-society",
        "title": "Free African Society",
        "description": "Black nurses saved Philly in 1793 yellow fever epidemic | Day: Day 2 | Time: 9:00 AM | Location: 650 Lombard St, Philadelphia, PA 19147",
        "lat": 39.943066577398,
        "lng": -75.152931353864,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/free-african-society.glb",
        "audioUrl": "/audio/free-african-society.mp3"
      },
      {
        "id": "black-medical-legacy-mother-bethel-ame-church",
        "title": "Mother Bethel AME Church",
        "description": "Hub for Black nurses during epidemics | Day: Day 2 | Time: 10:30 AM | Location: 419 S 6th St, Philadelphia, PA 19147",
        "lat": 39.943334757651,
        "lng": -75.151977924141,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mother-bethel-ame-church.glb",
        "audioUrl": "/audio/mother-bethel-ame-church.mp3"
      },
      {
        "id": "black-medical-legacy-black-doctors-row",
        "title": "Black Doctors Row",
        "description": "Philly's first Black Historic District (2022) | Day: Day 1 | Time: 9:00 AM | Location: 1724 Christian St, Philadelphia, PA 19146",
        "lat": 39.940620633837,
        "lng": -75.171560086836,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/black-doctors-row.glb",
        "audioUrl": "/audio/black-doctors-row.mp3"
      },
      {
        "id": "black-medical-legacy-yellow-fever-sites",
        "title": "Yellow Fever Sites",
        "description": "1793 epidemic exploitation | Day: Day 3 | Time: 3:00 PM | Location: 1 N Front St, Philadelphia, PA 19106",
        "lat": 39.949965555128,
        "lng": -75.141994508517,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/yellow-fever-sites.glb",
        "audioUrl": "/audio/yellow-fever-sites.mp3"
      },
      {
        "id": "black-medical-legacy-city-almshouse",
        "title": "City Almshouse",
        "description": "1800s dissection without consent | Day: Day 3 | Time: 10:30 AM | Location: S 34th St & Spruce St, Philadelphia, PA 19104",
        "lat": 39.950442936202,
        "lng": -75.192586219991,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/city-almshouse.glb",
        "audioUrl": "/audio/city-almshouse.mp3"
      },
      {
        "id": "black-medical-legacy-philadelphia-general-hospital",
        "title": "Philadelphia General Hospital",
        "description": "Old Blockley, Black nurses training | Day: Day 2 | Time: 1:00 PM | Location: 3400 Civic Center Blvd, Philadelphia, PA 19104",
        "lat": 39.948440359796,
        "lng": -75.192257508702,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/philadelphia-general-hospital.glb",
        "audioUrl": "/audio/philadelphia-general-hospital.mp3"
      },
      {
        "id": "black-medical-legacy-dr-virginia-alexander-clinic",
        "title": "Dr. Virginia Alexander Clinic",
        "description": "1930s Aspiranto Health Home, fought TB disparities | Day: Day 1 | Time: 1:30 PM | Location: 2104 W Jefferson St, Philadelphia, PA 19121",
        "lat": 39.977278347644,
        "lng": -75.170057159918,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/dr-virginia-alexander-clinic.glb",
        "audioUrl": "/audio/dr-virginia-alexander-clinic.mp3"
      },
      {
        "id": "black-medical-legacy-barbara-bates-center",
        "title": "Barbara Bates Center",
        "description": "Archives on Black nurses | Day: Day 2 | Time: 4:30 PM | Location: Claire M. Fagin Hall, 418 Curie Blvd, Philadelphia, PA 19104",
        "lat": 39.947704823472,
        "lng": -75.198449879025,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/barbara-bates-center.glb",
        "audioUrl": "/audio/barbara-bates-center.mp3"
      },
      {
        "id": "black-medical-legacy-mercy-douglass-hospital",
        "title": "Mercy-Douglass Hospital",
        "description": "Merged 1948, served Black patients | Day: Day 1 | Time: 11:30 AM | Location: 5000 Woodland Ave, Philadelphia, PA 19143",
        "lat": 39.939894967524,
        "lng": -75.213870665494,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mercy-douglass-hospital.glb",
        "audioUrl": "/audio/mercy-douglass-hospital.mp3"
      },
      {
        "id": "black-medical-legacy-mercy-douglass-nurse-training",
        "title": "Mercy-Douglass Nurse Training",
        "description": "Graduated 1,000+ Black nurses (1920s-1960s) | Day: Day 2 | Time: 2:30 PM | Location: 5000 Woodland Ave, Philadelphia, PA 19143",
        "lat": 39.939894967524,
        "lng": -75.213870665494,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mercy-douglass-nurse-training.glb",
        "audioUrl": "/audio/mercy-douglass-nurse-training.mp3"
      },
      {
        "id": "black-medical-legacy-move-bombing-sites",
        "title": "MOVE Bombing Sites",
        "description": "1985 remains withheld and experimented on | Day: Day 3 | Time: 1:30 PM | Location: 6221 Osage Ave, Philadelphia, PA 19143",
        "lat": 39.955569337985,
        "lng": -75.24661904899,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/move-bombing-sites.glb",
        "audioUrl": "/audio/move-bombing-sites.mp3"
      },
      {
        "id": "black-medical-legacy-holmesburg-prison",
        "title": "Holmesburg Prison",
        "description": "Dr. Kligman unauthorized testing 1951-1974 | Day: Day 3 | Time: 9:00 AM | Location: 8215 Torresdale Ave, Philadelphia, PA 19136",
        "lat": 40.03715296261,
        "lng": -75.02141629538,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/holmesburg-prison.glb",
        "audioUrl": "/audio/holmesburg-prison.mp3"
      }
    ]
  },
  {
    "id": "eastern-star-weekend",
    "title": "Eastern Star Weekend",
    "durationMin": 80,
    "distanceMiles": 1.8,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/eastern-star-weekend-hero.webp",
      "alt": "Eastern Star Weekend members gathered outside in white attire."
    },
    "stops": [
      {
        "id": "eastern-star-weekend-masonic-temple",
        "title": "Masonic Temple",
        "description": "Private Eastern Star tour, jewels, robes | Day: Day 1 | Time: 10:00 AM | Location: 1 N Broad St, Philadelphia, PA 19107",
        "lat": 39.953405220467,
        "lng": -75.163235969318,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/masonic-temple.glb",
        "audioUrl": "/audio/masonic-temple.mp3"
      },
      {
        "id": "eastern-star-weekend-the-breakfast-den",
        "title": "The Breakfast Den",
        "description": "Black-woman owned brunch spot | Day: Day 2 | Time: 11:30 AM | Location: 1500 South St, Philadelphia, PA 19146",
        "lat": 39.943799082836,
        "lng": -75.167265456106,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/the-breakfast-den.glb",
        "audioUrl": "/audio/the-breakfast-den.mp3"
      },
      {
        "id": "eastern-star-weekend-south-kitchen-and-jazz-club",
        "title": "SOUTH Kitchen & Jazz Club",
        "description": "Award-winning jazz brunch | Day: Day 1 | Time: 1:00 PM | Location: 600 N Broad St, Philadelphia, PA 19130",
        "lat": 39.9643953,
        "lng": -75.1613228,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/south-kitchen-and-jazz-club.glb",
        "audioUrl": "/audio/south-kitchen-and-jazz-club.mp3"
      },
      {
        "id": "eastern-star-weekend-mother-bethel-ame-church",
        "title": "Mother Bethel AME Church",
        "description": "Eastern Star Sunday worship | Day: Day 2 | Time: 9:00 AM | Location: 419 S 6th St, Philadelphia, PA 19147",
        "lat": 39.943334757651,
        "lng": -75.151977924141,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mother-bethel-ame-church.glb",
        "audioUrl": "/audio/mother-bethel-ame-church.mp3"
      },
      {
        "id": "eastern-star-weekend-sweetbriar-mansion",
        "title": "Sweetbriar Mansion",
        "description": "Closing ceremony | Day: Day 2 | Location: 1 Sweetbriar Ln, Philadelphia, PA 19131",
        "lat": 39.976605171234,
        "lng": -75.200781024221,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/sweetbriar-mansion.glb",
        "audioUrl": "/audio/sweetbriar-mansion.mp3",
        "arType": "object_on_plinth",
        "arPriority": 27,
        "assetNeeded": "ceremonial symbol set; closing ritual object; chapter story card",
        "estimatedEffort": "medium"
      },
      {
        "id": "eastern-star-weekend-prince-hall-grand-lodge",
        "title": "Prince Hall Grand Lodge",
        "description": "1929 Egyptian Revival building | Day: Day 1 | Time: 3:00 PM | Location: 4611 Lancaster Ave, Philadelphia, PA 19131",
        "lat": 39.970655910531,
        "lng": -75.21438129055,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/prince-hall-grand-lodge.glb",
        "audioUrl": "/audio/prince-hall-grand-lodge.mp3"
      },
      {
        "id": "eastern-star-weekend-widow-s-son-hall",
        "title": "Widow's Son Hall",
        "description": "Early Black OES chapters home | Day: Day 1 | Location: 3427 Germantown Ave, Philadelphia, PA 19140",
        "lat": 40.005123777034,
        "lng": -75.149468170854,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/widow-s-son-hall.glb",
        "audioUrl": "/audio/widow-s-son-hall.mp3"
      },
      {
        "id": "eastern-star-weekend-robert-h-johnson-chapter-no-5",
        "title": "Robert H. Johnson Chapter No. 5",
        "description": "OES Memorial Marker | Day: Day 2 | Time: 1:30 PM | Location: 3822 Ridge Ave, Philadelphia, PA 19132",
        "lat": 40.006503752524,
        "lng": -75.18832700407,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/robert-h-johnson-chapter-no-5.glb",
        "audioUrl": "/audio/robert-h-johnson-chapter-no-5.mp3"
      },
      {
        "id": "eastern-star-weekend-most-worshipful-prince-hall-oes",
        "title": "Most Worshipful Prince Hall OES",
        "description": "Grand Chapter OES Temple | Day: Day 1 | Location: Prince Hall Grand Lodge complex, 4301 N Broad St, Philadelphia, PA 19140",
        "lat": 40.018547975624,
        "lng": -75.149142594173,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/most-worshipful-prince-hall-oes.glb",
        "audioUrl": "/audio/most-worshipful-prince-hall-oes.mp3"
      },
      {
        "id": "eastern-star-weekend-relish",
        "title": "Relish",
        "description": "Upscale soul food in mansion | Day: Day 1 | Time: 6:30 PM | Location: 7152 Ogontz Ave, Philadelphia, PA 19138",
        "lat": 40.063297494417,
        "lng": -75.152580977181,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/relish.glb",
        "audioUrl": "/audio/relish.mp3"
      }
    ]
  },
  {
    "id": "job-s-daughters",
    "title": "Job's Daughters",
    "durationMin": 72,
    "distanceMiles": 1.6,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/job-s-daughters-hero.webp",
      "alt": "Two smiling girls featured for the Job's Daughters tour."
    },
    "stops": [
      {
        "id": "job-s-daughters-masonic-temple",
        "title": "Masonic Temple",
        "description": "First Bethel tour - Egyptian Hall initiation site (1921) | Day: Day 1 | Time: 9:15 AM | Location: 1 N Broad St, Philadelphia, PA 19107",
        "lat": 39.953405220467,
        "lng": -75.163235969318,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/masonic-temple.glb",
        "audioUrl": "/audio/masonic-temple.mp3"
      },
      {
        "id": "job-s-daughters-arch-street-united-methodist",
        "title": "Arch Street United Methodist",
        "description": "Historical installation site | Day: Day 1 | Location: 55 N Broad St, Philadelphia, PA 19107",
        "lat": 39.953650538487,
        "lng": -75.163178596547,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/arch-street-united-methodist.glb",
        "audioUrl": "/audio/arch-street-united-methodist.mp3"
      },
      {
        "id": "job-s-daughters-crystal-tea-room",
        "title": "Crystal Tea Room",
        "description": "Purple & White Gala Dinner | Day: Day 1 | Time: 6:00 PM | Location: 100 E Penn Square, Philadelphia, PA 19107",
        "lat": 39.952974051177,
        "lng": -75.162503636264,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/crystal-tea-room.glb",
        "audioUrl": "/audio/crystal-tea-room.mp3"
      },
      {
        "id": "job-s-daughters-original-bethel-no-1-hall",
        "title": "Original Bethel No. 1 Hall",
        "description": "1921-1930s meeting hall site | Day: Day 1 | Time: 2:00 PM | Location: N 13th St & Arch St, Philadelphia, PA 19107",
        "lat": 39.95414193433,
        "lng": -75.161009729765,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/original-bethel-no-1-hall.glb",
        "audioUrl": "/audio/original-bethel-no-1-hall.mp3",
        "arType": "historical_figure_presence",
        "arPriority": 28,
        "assetNeeded": "legacy hall overlay; youth lineage cards; memory scene",
        "estimatedEffort": "medium"
      },
      {
        "id": "job-s-daughters-reading-terminal-market",
        "title": "Reading Terminal Market",
        "description": "Lunch with purple lemonade | Day: Day 1 | Time: 12:30 PM | Location: 1136 Arch St, Philadelphia, PA 19107",
        "lat": 39.953766169681,
        "lng": -75.158473474948,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/reading-terminal-market.glb",
        "audioUrl": "/audio/reading-terminal-market.mp3"
      },
      {
        "id": "job-s-daughters-free-quaker-meeting-house",
        "title": "Free Quaker Meeting House",
        "description": "Job's daughters during Revolution lesson | Day: Day 1 | Location: N 5th St & Arch St, Philadelphia, PA 19106",
        "lat": 39.95257593419,
        "lng": -75.14847273383,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/free-quaker-meeting-house.glb",
        "audioUrl": "/audio/free-quaker-meeting-house.mp3"
      },
      {
        "id": "job-s-daughters-christ-church",
        "title": "Christ Church",
        "description": "Bethel Worship Service | Day: Day 2 | Time: 9:00 AM | Location: N 2nd St & Market St, Philadelphia, PA 19106",
        "lat": 39.949929934546,
        "lng": -75.14373873549,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/christ-church.glb",
        "audioUrl": "/audio/christ-church.mp3"
      },
      {
        "id": "job-s-daughters-green-eggs-caf",
        "title": "Green Eggs Café",
        "description": "Brunch with purple ube lattes | Day: Day 2 | Time: 10:45 AM | Location: 1306 Dickinson St, Philadelphia, PA 19147",
        "lat": 39.931432229816,
        "lng": -75.166487399465,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/green-eggs-caf.glb",
        "audioUrl": "/audio/green-eggs-caf.mp3"
      },
      {
        "id": "job-s-daughters-sweetbriar-mansion",
        "title": "Sweetbriar Mansion",
        "description": "Closing ceremony with purple roses | Day: Day 2 | Time: 12:30 PM | Location: 3801 Lansdowne Dr, Philadelphia, PA 19131",
        "lat": 39.9896532,
        "lng": -75.2108124,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/sweetbriar-mansion.glb",
        "audioUrl": "/audio/sweetbriar-mansion.mp3"
      }
    ]
  },
  {
    "id": "masonic-scavenger-hunt",
    "title": "Masonic Scavenger Hunt",
    "durationMin": 45,
    "distanceMiles": 0.8,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/masonic-scavenger-hunt-hero.jpg",
      "alt": "Prince Hall Grand Lodge sign featured for the Masonic Scavenger Hunt."
    },
    "stops": [
      {
        "id": "masonic-scavenger-hunt-masonic-temple",
        "title": "Masonic Temple",
        "description": "The Temple That Watched City Hall Rise | Day: 1 Day | Time: Start | Location: 1 N Broad St, Philadelphia, PA 19107",
        "lat": 39.953405220467,
        "lng": -75.163235969318,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/masonic-temple.glb",
        "audioUrl": "/audio/masonic-temple.mp3"
      },
      {
        "id": "masonic-scavenger-hunt-city-hall",
        "title": "City Hall",
        "description": "Compass & Square on Penn's Hat | Day: 1 Day | Location: 1400 John F Kennedy Blvd, Philadelphia, PA 19107",
        "lat": 39.95331099351,
        "lng": -75.163407945548,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/city-hall.glb",
        "audioUrl": "/audio/city-hall.mp3"
      },
      {
        "id": "masonic-scavenger-hunt-pennsylvania-hospital",
        "title": "Pennsylvania Hospital",
        "description": "Hospital Gate With Oldest Masonic Mark | Day: 1 Day | Location: 8th & Spruce St, Philadelphia, PA",
        "lat": 39.945726935777,
        "lng": -75.154759232255,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/pennsylvania-hospital.glb",
        "audioUrl": "/audio/pennsylvania-hospital.mp3"
      },
      {
        "id": "masonic-scavenger-hunt-prince-hall-grand-lodge",
        "title": "Prince Hall Grand Lodge",
        "description": "Prince Hall's 1920s Egyptian Fortress | Day: 1 Day | Location: 4301 N Broad St, Philadelphia, PA",
        "lat": 40.018547975624,
        "lng": -75.149142594173,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/prince-hall-grand-lodge.glb",
        "audioUrl": "/audio/prince-hall-grand-lodge.mp3"
      }
    ]
  },
  {
    "id": "black-architects-tour",
    "title": "Black Architects Tour",
    "durationMin": 80,
    "distanceMiles": 1.8,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/black-architects-tour-hero.jpg",
      "alt": "Philadelphia Museum of Art exterior featured for the Black Architects Tour."
    },
    "stops": [
      {
        "id": "black-architects-tour-union-league",
        "title": "Union League",
        "description": "Abele's Renaissance Revival additions (1909-1911) | Day: Day 1 | Time: 3:30 PM | Location: 140 S Broad St, Philadelphia, PA 19102",
        "lat": 39.950063796725,
        "lng": -75.164260118103,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/union-league.glb",
        "audioUrl": "/audio/union-league.mp3"
      },
      {
        "id": "black-architects-tour-philadanco-building",
        "title": "Philadanco Building",
        "description": "Joan Myers Brown, first Black woman major arts facility | Day: Day 2 | Time: 5:00 PM | Location: 1735 Market St, Philadelphia, PA 19103",
        "lat": 39.953100018733,
        "lng": -75.168995848211,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/philadanco-building.glb",
        "audioUrl": "/audio/philadanco-building.mp3"
      },
      {
        "id": "black-architects-tour-free-library-central",
        "title": "Free Library Central",
        "description": "Abele's grand staircase and rotunda (1917-1927) | Day: Day 1 | Time: 10:30 AM | Location: 1901 Vine St, Philadelphia, PA 19103",
        "lat": 39.959157790597,
        "lng": -75.17040431366,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/free-library-central.glb",
        "audioUrl": "/audio/free-library-central.mp3"
      },
      {
        "id": "black-architects-tour-african-american-museum",
        "title": "African American Museum",
        "description": "Theodore Cam Jr. design (1976) | Day: Day 2 | Time: 2:00 PM | Location: 701 Arch St, Philadelphia, PA 19106",
        "lat": 39.953010995469,
        "lng": -75.151598440748,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/african-american-museum.glb",
        "audioUrl": "/audio/african-american-museum.mp3"
      },
      {
        "id": "black-architects-tour-philadelphia-museum-of-art",
        "title": "Philadelphia Museum of Art",
        "description": "Julian Abele design (1916-1928) | Day: Day 1 | Time: 9:00 AM | Location: 2600 Benjamin Franklin Parkway, Philadelphia, PA 19130",
        "lat": 39.9655661,
        "lng": -75.1815202,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/philadelphia-museum-of-art.glb",
        "audioUrl": "/audio/philadelphia-museum-of-art.mp3"
      },
      {
        "id": "black-architects-tour-penn-campus-fisher-library",
        "title": "Penn Campus - Fisher Library",
        "description": "Abele's Gothic masterpiece (1891/1911) | Day: Day 1 | Time: 1:30 PM | Location: 220 S 34th St, Philadelphia, PA 19104",
        "lat": 39.952267366429,
        "lng": -75.192284788855,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/penn-campus-fisher-library.glb",
        "audioUrl": "/audio/penn-campus-fisher-library.mp3"
      },
      {
        "id": "black-architects-tour-irvine-auditorium",
        "title": "Irvine Auditorium",
        "description": "Abele's neo-Gothic concert hall (1925-1931) | Day: Day 1 | Location: 3401 Spruce St, Philadelphia, PA 19104",
        "lat": 39.950508705953,
        "lng": -75.192647957851,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/irvine-auditorium.glb",
        "audioUrl": "/audio/irvine-auditorium.mp3"
      },
      {
        "id": "black-architects-tour-progress-plaza",
        "title": "Progress Plaza",
        "description": "Louis de Moll, first Black-owned shopping center (1968) | Day: Day 2 | Time: 3:30 PM | Location: 1501 N Broad St, Philadelphia, PA 19122",
        "lat": 39.975896883895,
        "lng": -75.158439554174,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/progress-plaza.glb",
        "audioUrl": "/audio/progress-plaza.mp3"
      },
      {
        "id": "black-architects-tour-berean-savings-and-loan",
        "title": "Berean Savings & Loan",
        "description": "Walter Livingston Jr. Brutalist design (1972) | Day: Day 2 | Time: 9:30 AM | Location: 5419 W Girard Ave, Philadelphia, PA 19131",
        "lat": 39.971083097331,
        "lng": -75.229452069444,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/berean-savings-and-loan.glb",
        "audioUrl": "/audio/berean-savings-and-loan.mp3"
      },
      {
        "id": "black-architects-tour-zion-baptist-church",
        "title": "Zion Baptist Church",
        "description": "Livingston's 1970s modernist sanctuary | Day: Day 2 | Time: 11:00 AM | Location: 3600 N Broad St, Philadelphia, PA 19140",
        "lat": 40.0079556,
        "lng": -75.1520225,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/zion-baptist-church.glb",
        "audioUrl": "/audio/zion-baptist-church.mp3"
      }
    ]
  },
  {
    "id": "septa-broad-street-line",
    "title": "SEPTA Broad Street Line",
    "durationMin": 112,
    "distanceMiles": 2.5,
    "rating": 4.8,
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/septa-broad-street-line-hero.avif",
      "alt": "SEPTA Broad Street Line commuters boarding at NRG Station."
    },
    "stops": [
      {
        "id": "septa-broad-street-line-julian-abele-sites",
        "title": "Julian Abele Sites",
        "description": "First Black UPenn architect | Day: Part 3 | Location: 200 S Broad St, Philadelphia, PA 19102",
        "lat": 39.949297633616,
        "lng": -75.164425546201,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/julian-abele-sites.glb",
        "audioUrl": "/audio/julian-abele-sites.mp3"
      },
      {
        "id": "septa-broad-street-line-william-still-marker",
        "title": "William Still Marker",
        "description": "Father of the Underground Railroad | Day: Part 3 | Location: 244 S 12th St, Philadelphia, PA",
        "lat": 39.947151326964,
        "lng": -75.160995212827,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/william-still-marker.glb",
        "audioUrl": "/audio/william-still-marker.mp3"
      },
      {
        "id": "septa-broad-street-line-divine-lorraine-hotel",
        "title": "Divine Lorraine Hotel",
        "description": "Nation's first racially integrated hotel | Day: Part 2 | Location: 699 N Broad St, Philadelphia, PA 19123",
        "lat": 39.96699965389,
        "lng": -75.16033240896,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/divine-lorraine-hotel.glb",
        "audioUrl": "/audio/divine-lorraine-hotel.mp3"
      },
      {
        "id": "septa-broad-street-line-first-african-baptist-church",
        "title": "First African Baptist Church",
        "description": "Key abolition site | Day: Part 3 | Location: 1608 Christian St, Philadelphia, PA 19146",
        "lat": 39.940400372896,
        "lng": -75.169752403311,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/first-african-baptist-church.glb",
        "audioUrl": "/audio/first-african-baptist-church.mp3"
      },
      {
        "id": "septa-broad-street-line-cecil-b-moore-mural",
        "title": "Cecil B. Moore Mural",
        "description": "NAACP leader, voting rights | Day: Part 2 | Location: N 15th St & Cecil B Moore Ave, Philadelphia, PA 19121",
        "lat": 39.978909929361,
        "lng": -75.159556228719,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cecil-b-moore-mural.glb",
        "audioUrl": "/audio/cecil-b-moore-mural.mp3"
      },
      {
        "id": "septa-broad-street-line-berks-street-arts-district",
        "title": "Berks Street Arts District",
        "description": "1950s Black poets and painters hub | Day: Part 2 | Location: N 7th St & W Berks St, Philadelphia, PA 19122",
        "lat": 39.980304928607,
        "lng": -75.146303732832,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/berks-street-arts-district.glb",
        "audioUrl": "/audio/berks-street-arts-district.mp3"
      },
      {
        "id": "septa-broad-street-line-north-philly-black-metropolis",
        "title": "North Philly Black Metropolis",
        "description": "Historic zone for Black commerce | Day: Part 1 | Location: 2601 N Broad St, Philadelphia, PA 19132",
        "lat": 39.992402544468,
        "lng": -75.154861723303,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/north-philly-black-metropolis.glb",
        "audioUrl": "/audio/north-philly-black-metropolis.mp3"
      },
      {
        "id": "septa-broad-street-line-lehigh-black-labor-sites",
        "title": "Lehigh Black Labor Sites",
        "description": "Factories where Black workers unionized | Day: Part 2 | Location: N Broad St & W Lehigh Ave, Philadelphia, PA 19132",
        "lat": 39.9939399262,
        "lng": -75.154588229378,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/lehigh-black-labor-sites.glb",
        "audioUrl": "/audio/lehigh-black-labor-sites.mp3"
      },
      {
        "id": "septa-broad-street-line-erie-avenue-cultural-corridor",
        "title": "Erie Avenue Cultural Corridor",
        "description": "1940s jazz clubs, Coltrane influence | Day: Part 1 | Location: 500 E Erie Ave, Philadelphia, PA 19134",
        "lat": 40.0066,
        "lng": -75.118,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/erie-avenue-cultural-corridor.glb",
        "audioUrl": "/audio/erie-avenue-cultural-corridor.mp3"
      },
      {
        "id": "septa-broad-street-line-hunting-park-centers",
        "title": "Hunting Park Centers",
        "description": "Early Black mutual aid societies | Day: Part 1 | Location: N Broad St & W Hunting Park Ave, Philadelphia, PA 19140",
        "lat": 40.016934921459,
        "lng": -75.149584229563,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/hunting-park-centers.glb",
        "audioUrl": "/audio/hunting-park-centers.mp3"
      },
      {
        "id": "septa-broad-street-line-wyoming-ave-business-district",
        "title": "Wyoming Ave Business District",
        "description": "1920s Black entrepreneurs corridor | Day: Part 1 | Location: N 13th St & W Wyoming Ave, Philadelphia, PA 19140",
        "lat": 40.024278919863,
        "lng": -75.145705230344,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/wyoming-ave-business-district.glb",
        "audioUrl": "/audio/wyoming-ave-business-district.mp3"
      },
      {
        "id": "septa-broad-street-line-aces-museum-black-wwii-veterans",
        "title": "Aces Museum Black WWII Veterans",
        "description": "Philly's Black troops artifacts | Day: Part 3 | Location: 5801 Germantown Ave, Philadelphia, PA",
        "lat": 40.036849627915,
        "lng": -75.175596081946,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/aces-museum-black-wwii-veterans.glb",
        "audioUrl": "/audio/aces-museum-black-wwii-veterans.mp3"
      },
      {
        "id": "septa-broad-street-line-olney-black-history-markers",
        "title": "Olney Black History Markers",
        "description": "Black WWII veterans plaques | Day: Part 1 | Location: 5th St & Olney Ave, Philadelphia, PA 19120",
        "lat": 40.036437916906,
        "lng": -75.130517734416,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/olney-black-history-markers.glb",
        "audioUrl": "/audio/olney-black-history-markers.mp3"
      },
      {
        "id": "septa-broad-street-line-rockland-black-churches",
        "title": "Rockland Black Churches",
        "description": "AME-affiliated churches cluster | Day: Part 2 | Location: N 11th St & W Grange Ave, Philadelphia, PA 19141",
        "lat": 40.040802916368,
        "lng": -75.139612231267,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/rockland-black-churches.glb",
        "audioUrl": "/audio/rockland-black-churches.mp3"
      }
    ]
  },
  {
    "id": "philadelphia-foundations",
    "title": "Philadelphia Foundations",
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/philadelphia-foundations-hero.jpeg",
      "alt": "Philadelphia Foundations mural featuring William Still, Lucretia Mott, Jacob Blockson, and Harriet Tubman."
    },
    "durationMin": 48,
    "distanceMiles": 1.1,
    "rating": 4.8,
    "stops": [
      {
        "id": "philadelphia-foundations-harriet-tubman-mural",
        "title": "Harriet Tubman Mural",
        "description": "AR overlay with coded signals | Day: Day 1 | Time: Morning | Location: 2900 Germantown Ave, Philadelphia, PA 19133",
        "lat": 39.996211788425,
        "lng": -75.147141977427,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/harriet-tubman-mural.glb",
        "audioUrl": "/audio/harriet-tubman-mural.mp3"
      },
      {
        "id": "philadelphia-foundations-fair-hill-burial-ground",
        "title": "Fair Hill Burial Ground",
        "description": "Quaker site (1703), Lucretia Mott, Robert Purvis | Day: Day 1 | Time: Morning | Location: 2901 Germantown Ave, Philadelphia, PA 19133",
        "lat": 39.996190696018,
        "lng": -75.146994953189,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/fair-hill-burial-ground.glb",
        "audioUrl": "/audio/fair-hill-burial-ground.mp3"
      },
      {
        "id": "philadelphia-foundations-belmont-mansion",
        "title": "Belmont Mansion",
        "description": "1742 estate, Underground Railroad sanctuary | Day: Day 1 | Time: Afternoon | Location: 2000 Belmont Mansion Dr, Philadelphia, PA 19131",
        "lat": 39.986759074559,
        "lng": -75.213670141104,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/belmont-mansion.glb",
        "audioUrl": "/audio/belmont-mansion.mp3"
      },
      {
        "id": "philadelphia-foundations-ebenezer-maxwell-mansion",
        "title": "Ebenezer Maxwell Mansion",
        "description": "Victorian abolition network hub | Day: Day 2 | Time: Afternoon | Location: 200 W Tulpehocken St, Philadelphia, PA 19144",
        "lat": 40.03852650903,
        "lng": -75.183654166956,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/ebenezer-maxwell-mansion.glb",
        "audioUrl": "/audio/ebenezer-maxwell-mansion.mp3"
      },
      {
        "id": "philadelphia-foundations-johnson-house",
        "title": "Johnson House",
        "description": "Philly's only intact Underground Railroad station | Day: Day 2 | Time: Morning | Location: 6306 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.043414697068,
        "lng": -75.181116152631,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/johnson-house.glb",
        "audioUrl": "/audio/johnson-house.mp3"
      },
      {
        "id": "philadelphia-foundations-cliveden",
        "title": "Cliveden",
        "description": "Underground Railroad role | Day: Day 2 | Time: Afternoon | Location: 6401 Germantown Ave, Philadelphia, PA 19144",
        "lat": 40.04597099227,
        "lng": -75.182161819444,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cliveden.glb",
        "audioUrl": "/audio/cliveden.mp3"
      }
    ]
  },
  {
    "id": "move-bombing-memorial",
    "title": "MOVE Bombing Memorial",
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/move-bombing-memorial-hero.jpg",
      "alt": "Community members gathered beside a Pennsylvania historical marker for the MOVE Bombing Memorial."
    },
    "durationMin": 48,
    "distanceMiles": 1.1,
    "rating": 4.8,
    "stops": [
      {
        "id": "move-bombing-memorial-municipal-services-building",
        "title": "Municipal Services Building",
        "description": "Remembering MOVE exhibit, Commission testimonies | Day: 1 Day | Time: 9:00 AM | Location: 1401 John F Kennedy Blvd, Philadelphia, PA 19102",
        "lat": 39.953507111002,
        "lng": -75.163975835726,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/municipal-services-building.glb",
        "audioUrl": "/audio/municipal-services-building.mp3"
      },
      {
        "id": "move-bombing-memorial-african-american-museum",
        "title": "African American Museum",
        "description": "Medical Apartheid exhibit, healing panels | Day: 1 Day | Time: 5:15 PM | Location: 701 Arch St, Philadelphia, PA 19106",
        "lat": 39.953010995469,
        "lng": -75.151598440748,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/african-american-museum.glb",
        "audioUrl": "/audio/african-american-museum.mp3"
      },
      {
        "id": "move-bombing-memorial-powelton-village",
        "title": "Powelton Village",
        "description": "MOVE's first stronghold (1973-1978) | Day: 1 Day | Time: 11:00 AM | Location: 311 N 33rd St, Philadelphia, PA 19104",
        "lat": 39.961064589603,
        "lng": -75.189498501935,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/powelton-village.glb",
        "audioUrl": "/audio/powelton-village.mp3"
      },
      {
        "id": "move-bombing-memorial-chef-curt-s-bbq",
        "title": "Chef Curt's BBQ",
        "description": "Community lunch, owner stories | Day: Chef Curt's BBQ | Time: 12:00 PM | Location: N 62nd St & Market St, Philadelphia, PA 19139",
        "lat": 39.962448935698,
        "lng": -75.244709702759,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/chef-curt-s-bbq.glb",
        "audioUrl": "/audio/chef-curt-s-bbq.mp3"
      },
      {
        "id": "move-bombing-memorial-osage-avenue",
        "title": "Osage Avenue",
        "description": "Bomb site, 11 victims memorial | Day: 1 Day | Time: 2:00 PM | Location: 6221 Osage Ave, Philadelphia, PA 19143",
        "lat": 39.955569337985,
        "lng": -75.24661904899,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/osage-avenue.glb",
        "audioUrl": "/audio/osage-avenue.mp3"
      },
      {
        "id": "move-bombing-memorial-cobbs-creek-park",
        "title": "Cobbs Creek Park",
        "description": "Where firefighters let it burn | Day: 1 Day | Time: 3:30 PM | Location: N 63rd St & Vine St, Philadelphia, PA 19139",
        "lat": 39.967317934771,
        "lng": -75.24578970212,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/cobbs-creek-park.glb",
        "audioUrl": "/audio/cobbs-creek-park.mp3"
      }
    ]
  },
  {
    "id": "philly-black-art-odyssey",
    "title": "Philly Black Art Odyssey",
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/philly-black-art-odyssey-hero.avif",
      "alt": "Thomas J Price installation at the Philadelphia Museum of Art for Philly Black Art Odyssey."
    },
    "durationMin": 80,
    "distanceMiles": 1.8,
    "rating": 4.8,
    "stops": [
      {
        "id": "philly-black-art-odyssey-pa-academy-fine-arts",
        "title": "PA Academy Fine Arts",
        "description": "Kehinde Wiley, Nick Cave, Mickalene Thomas | Day: Day 2 | Time: 2:30 PM | Location: 128 N Broad St, Philadelphia, PA 19102",
        "lat": 39.95589,
        "lng": -75.16382,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/pa-academy-fine-arts.glb",
        "audioUrl": "/audio/pa-academy-fine-arts.mp3"
      },
      {
        "id": "philly-black-art-odyssey-public-sculptures",
        "title": "Public Sculptures",
        "description": "Octavius Catto, Tuskegee Airmen, Keith Haring murals | Day: Day 3 | Time: 2:30 PM | Location: 151 N 15th St, Philadelphia, PA 19102",
        "lat": 39.95589,
        "lng": -75.16382,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/public-sculptures.glb",
        "audioUrl": "/audio/public-sculptures.mp3"
      },
      {
        "id": "philly-black-art-odyssey-brandywine-workshop",
        "title": "Brandywine Workshop",
        "description": "Elizabeth Catlett lithographs, prints | Day: Day 2 | Time: 10:00 AM | Location: 1520 Sansom St, Philadelphia, PA",
        "lat": 39.95008,
        "lng": -75.16667,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/brandywine-workshop.glb",
        "audioUrl": "/audio/brandywine-workshop.mp3"
      },
      {
        "id": "philly-black-art-odyssey-african-american-museum",
        "title": "African American Museum",
        "description": "CCH Pounder collection, African diaspora art | Day: Day 1 | Time: 9:00 AM | Location: 701 Arch St, Philadelphia, PA 19106",
        "lat": 39.953010995469,
        "lng": -75.151598440748,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/african-american-museum.glb",
        "audioUrl": "/audio/african-american-museum.mp3"
      },
      {
        "id": "philly-black-art-odyssey-barnes-foundation",
        "title": "Barnes Foundation",
        "description": "African masks, Mickalene Thomas exhibit | Day: Day 1 | Time: 3:00 PM | Location: 2025 Benjamin Franklin Pkwy, Philadelphia, PA 19130",
        "lat": 39.95965360771,
        "lng": -75.172301646081,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/barnes-foundation.glb",
        "audioUrl": "/audio/barnes-foundation.mp3"
      },
      {
        "id": "philly-black-art-odyssey-mural-arts-tour",
        "title": "Mural Arts Tour",
        "description": "Black Be Beautiful, Cecil B. Moore murals | Day: Day 3 | Time: 9:00 AM | Location: 1729 Mount Vernon St, Philadelphia, PA 19130",
        "lat": 39.965191350311,
        "lng": -75.166278675894,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mural-arts-tour.glb",
        "audioUrl": "/audio/mural-arts-tour.mp3"
      },
      {
        "id": "philly-black-art-odyssey-philadelphia-museum-of-art",
        "title": "Philadelphia Museum of Art",
        "description": "Time is Always Now - 60 works by 28 artists | Day: Day 1 | Time: 11:30 AM | Location: 2600 Benjamin Franklin Parkway, Philadelphia, PA 19130",
        "lat": 39.9655661,
        "lng": -75.1815202,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/philadelphia-museum-of-art.glb",
        "audioUrl": "/audio/philadelphia-museum-of-art.mp3"
      },
      {
        "id": "philly-black-art-odyssey-october-gallery",
        "title": "October Gallery",
        "description": "Emerging Black artists, mixed media | Day: Day 2 | Time: 11:30 AM | Location: 2101 N Front St, Philadelphia, PA",
        "lat": 39.98167493668,
        "lng": -75.132794105601,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/october-gallery.glb",
        "audioUrl": "/audio/october-gallery.mp3"
      },
      {
        "id": "philly-black-art-odyssey-woodmere-art-museum",
        "title": "Woodmere Art Museum",
        "description": "We Speak exhibit - 70 works, 1920s-1970s | Day: Day 1 | Time: Evening | Location: 9201 Germantown Ave, Philadelphia, PA 19118",
        "lat": 40.082166765075,
        "lng": -75.219813650213,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/woodmere-art-museum.glb",
        "audioUrl": "/audio/woodmere-art-museum.mp3"
      },
      {
        "id": "philly-black-art-odyssey-moody-jones-gallery",
        "title": "Moody Jones Gallery",
        "description": "New and emerging Black artists | Day: Day 2 | Time: 5:00 PM | Location: 107 S Easton Rd, Glenside, PA 19038",
        "lat": 40.099848197575,
        "lng": -75.15410162564,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/moody-jones-gallery.glb",
        "audioUrl": "/audio/moody-jones-gallery.mp3"
      }
    ]
  },
  {
    "id": "college-hop-tour",
    "title": "College Hop Tour",
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/college-hop-tour-hero.avif",
      "alt": "Aerial autumn view of the University of Pennsylvania campus for the College Hop Tour."
    },
    "durationMin": 88,
    "distanceMiles": 2,
    "rating": 4.8,
    "stops": [
      {
        "id": "college-hop-tour-pa-academy-of-fine-arts",
        "title": "PA Academy of Fine Arts",
        "description": "Historic cast collection, student galleries | Day: Day 3 | Time: 3:30 PM | Location: 128 N Broad St, Philadelphia, PA 19102",
        "lat": 39.95589,
        "lng": -75.16382,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/pa-academy-of-fine-arts.glb",
        "audioUrl": "/audio/pa-academy-of-fine-arts.mp3"
      },
      {
        "id": "college-hop-tour-university-of-the-arts",
        "title": "University of the Arts",
        "description": "Terra Hall, dance/music rehearsals | Day: Day 3 | Time: 9:30 AM | Location: 211 S Broad St, Philadelphia, PA 19107",
        "lat": 39.94896968211,
        "lng": -75.164195387606,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/university-of-the-arts.glb",
        "audioUrl": "/audio/university-of-the-arts.mp3"
      },
      {
        "id": "college-hop-tour-curtis-institute-of-music",
        "title": "Curtis Institute of Music",
        "description": "Free student recitals, world-class classical | Day: Day 3 | Time: 11:00 AM | Location: 1726 Locust St, Philadelphia, PA 19103",
        "lat": 39.948865535277,
        "lng": -75.170347451244,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/curtis-institute-of-music.glb",
        "audioUrl": "/audio/curtis-institute-of-music.mp3"
      },
      {
        "id": "college-hop-tour-community-college-of-philly",
        "title": "Community College of Philly",
        "description": "Rooftop garden, Career & Tech Center | Day: Day 3 | Time: 1:00 PM | Location: 1700 Spring Garden St, Philadelphia, PA 19130",
        "lat": 39.962942113276,
        "lng": -75.166338511049,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/community-college-of-philly.glb",
        "audioUrl": "/audio/community-college-of-philly.mp3"
      },
      {
        "id": "college-hop-tour-drexel-university",
        "title": "Drexel University",
        "description": "Mario the Dragon statue, Health Sciences Building | Day: Day 1 | Time: 11:00 AM | Location: 3201 Market St, Philadelphia, PA 19104",
        "lat": 39.955358857288,
        "lng": -75.187127971375,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/drexel-university.glb",
        "audioUrl": "/audio/drexel-university.mp3"
      },
      {
        "id": "college-hop-tour-university-of-pennsylvania",
        "title": "University of Pennsylvania",
        "description": "Ivy League campus, Fisher Library, College Hall | Day: Day 1 | Time: 9:00 AM | Location: 3401 Walnut St, Philadelphia, PA 19104",
        "lat": 39.95222,
        "lng": -75.19321,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/university-of-pennsylvania.glb",
        "audioUrl": "/audio/university-of-pennsylvania.mp3"
      },
      {
        "id": "college-hop-tour-temple-university",
        "title": "Temple University",
        "description": "Bell Tower, Diamond Band, 30+ murals | Day: Day 2 | Time: 9:00 AM | Location: 1801 N Broad St, Philadelphia, PA 19122",
        "lat": 39.980270860851,
        "lng": -75.15749452815,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/temple-university.glb",
        "audioUrl": "/audio/temple-university.mp3"
      },
      {
        "id": "college-hop-tour-saint-joseph-s-university",
        "title": "Saint Joseph's University",
        "description": "Hawk Hill, Barbelin Tower | Day: Day 2 | Time: 4:30 PM | Location: 5600 City Ave, Philadelphia, PA 19131",
        "lat": 39.995265135631,
        "lng": -75.239028370772,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/saint-joseph-s-university.glb",
        "audioUrl": "/audio/saint-joseph-s-university.mp3"
      },
      {
        "id": "college-hop-tour-thomas-jefferson-university",
        "title": "Thomas Jefferson University",
        "description": "100-acre wooded campus, fashion studios | Day: Day 1 | Time: 3:30 PM | Location: 4201 Henry Ave, Philadelphia, PA 19144",
        "lat": 40.022293225446,
        "lng": -75.194118790633,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/thomas-jefferson-university.glb",
        "audioUrl": "/audio/thomas-jefferson-university.mp3"
      },
      {
        "id": "college-hop-tour-la-salle-university",
        "title": "La Salle University",
        "description": "1930s Collegiate Gothic, De La Salle chapel | Day: Day 2 | Time: 11:30 AM | Location: 1900 W Olney Ave, Philadelphia, PA 19141",
        "lat": 40.0376298,
        "lng": -75.1540025,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/la-salle-university.glb",
        "audioUrl": "/audio/la-salle-university.mp3"
      },
      {
        "id": "college-hop-tour-chestnut-hill-college",
        "title": "Chestnut Hill College",
        "description": "1920s castle campus on hill | Day: Day 2 | Time: 2:30 PM | Location: 9601 Germantown Ave, Philadelphia, PA 19118",
        "lat": 40.084355407553,
        "lng": -75.226484077259,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/chestnut-hill-college.glb",
        "audioUrl": "/audio/chestnut-hill-college.mp3"
      }
    ]
  },
  {
    "id": "speakeasy-tour",
    "title": "Speakeasy Tour",
    "cardMedia": {
      "type": "image",
      "src": "/assets/generated/tour-heroes/speakeasy-tour-hero.jpg",
      "alt": "Warmly lit speakeasy lounge interior with red booths and a chandelier for the Speakeasy Tour."
    },
    "durationMin": 80,
    "distanceMiles": 1.8,
    "rating": 4.8,
    "stops": [
      {
        "id": "speakeasy-tour-haunt",
        "title": "Haunt",
        "description": "#7 Spooky - Gothic decor, 1800s morgue site | Day: 1 Day | Time: 6:00 PM | Location: 1315 Sansom St, Philadelphia, PA 19107",
        "lat": 39.949972753135,
        "lng": -75.162565949324,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/haunt.glb",
        "audioUrl": "/audio/haunt.mp3"
      },
      {
        "id": "speakeasy-tour-midnight-and-the-wicked",
        "title": "Midnight & The Wicked",
        "description": "#10 Jazz - Live jazz, 1920s glamour | Day: 1 Day | Time: 9:00 PM | Location: 111 S 13th St, Philadelphia, PA 19107",
        "lat": 39.950084319127,
        "lng": -75.161819399966,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/midnight-and-the-wicked.glb",
        "audioUrl": "/audio/midnight-and-the-wicked.mp3"
      },
      {
        "id": "speakeasy-tour-charlie-was-a-sinner",
        "title": "Charlie Was A Sinner",
        "description": "#8 Dramatic - Burlesque nights | Day: 1 Day | Time: 7:00 PM | Location: 131 S 13th St, Philadelphia, PA 19107",
        "lat": 39.94969168351,
        "lng": -75.161906256905,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/charlie-was-a-sinner.glb",
        "audioUrl": "/audio/charlie-was-a-sinner.mp3"
      },
      {
        "id": "speakeasy-tour-andra-hem",
        "title": "Andra Hem",
        "description": "#6 Swedish - Nordic cocktails, hidden behind furniture | Day: 1 Day | Time: 5:00 PM | Location: 218 S 16th St, Philadelphia, PA 19102",
        "lat": 39.949189322692,
        "lng": -75.167719251835,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/andra-hem.glb",
        "audioUrl": "/audio/andra-hem.mp3"
      },
      {
        "id": "speakeasy-tour-hop-sing-laundromat",
        "title": "Hop Sing Laundromat",
        "description": "#3 Iconic - World's 50 Best Bars, password entry | Day: 1 Day | Time: 2:00 PM | Location: 1029 Race St, Philadelphia, PA 19107",
        "lat": 39.955489005711,
        "lng": -75.156363110093,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/hop-sing-laundromat.glb",
        "audioUrl": "/audio/hop-sing-laundromat.mp3"
      },
      {
        "id": "speakeasy-tour-franklin-mortgage-and-investment",
        "title": "Franklin Mortgage & Investment",
        "description": "#2 Elite - USA TODAY top speakeasy | Day: 1 Day | Time: 1:00 PM | Location: 112 S 18th St, Philadelphia, PA 19103",
        "lat": 39.951268402583,
        "lng": -75.170498442779,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/franklin-mortgage-and-investment.glb",
        "audioUrl": "/audio/franklin-mortgage-and-investment.mp3"
      },
      {
        "id": "speakeasy-tour-mask-and-wig-club",
        "title": "Mask and Wig Club",
        "description": "#9 Collegiate - 1889 private club | Day: 1 Day | Time: 8:00 PM | Location: 310 S Quince St, Philadelphia, PA 19107",
        "lat": 39.945820040462,
        "lng": -75.160472352535,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/mask-and-wig-club.glb",
        "audioUrl": "/audio/mask-and-wig-club.mp3"
      },
      {
        "id": "speakeasy-tour-the-ranstead-room",
        "title": "The Ranstead Room",
        "description": "#1 Classic - 1920s alley bootlegger site | Day: 1 Day | Time: Noon | Location: 2013 Ranstead St, Philadelphia, PA 19103",
        "lat": 39.952703937864,
        "lng": -75.173642685874,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/the-ranstead-room.glb",
        "audioUrl": "/audio/the-ranstead-room.mp3"
      },
      {
        "id": "speakeasy-tour-1-tippling-place",
        "title": "1 Tippling Place",
        "description": "#4 Craft - James Beard bartenders | Day: 1 Day | Time: 3:00 PM | Location: 2006 Chestnut St, Philadelphia, PA 19103",
        "lat": 39.952036272352,
        "lng": -75.173826478165,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/1-tippling-place.glb",
        "audioUrl": "/audio/1-tippling-place.mp3"
      },
      {
        "id": "speakeasy-tour-the-library-bar",
        "title": "The Library Bar",
        "description": "#5 Literary - Behind bookcase in Bar Hygge | Day: 1 Day | Time: 4:00 PM | Location: 210 W Rittenhouse Sq, Philadelphia, PA 19103",
        "lat": 39.949747504291,
        "lng": -75.172965339681,
        "coordQuality": "verified",
        "triggerRadiusM": 40,
        "modelUrl": "/models/the-library-bar.glb",
        "audioUrl": "/audio/the-library-bar.mp3"
      }
    ]
  }
];
