export type NarrationVariant = "drive" | "walk";

export type NarrationCatalogEntry = {
  drive?: string;
  walk?: string;
};

export const narrationCatalogByStopId: Record<string, NarrationCatalogEntry> = {
  "black-american-legacy-and-quaker-heritage-arch-street-friends-meeting-house": {
    drive: "/audio/arch-street-friends-meeting-house-drive.mp3",
    walk: "/audio/arch-street-friends-meeting-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-cliveden": {
    drive: "/audio/cliveden-drive.mp3",
    walk: "/audio/cliveden-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-free-quaker-meeting-house": {
    drive: "/audio/free-quaker-meeting-house-drive.mp3",
    walk: "/audio/free-quaker-meeting-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-germantown-mennonite-meetinghouse": {
    drive: "/audio/germantown-mennonite-meetinghouse-drive.mp3",
    walk: "/audio/germantown-mennonite-meetinghouse-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-johnson-house": {
    drive: "/audio/johnson-house-drive.mp3",
    walk: "/audio/johnson-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-lombard-street-free-african-society-ho": {
    drive: "/audio/lombard-street-free-african-society-homes-drive.mp3",
    walk: "/audio/lombard-street-free-african-society-homes-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-mother-bethel-ame-church": {
    drive: "/audio/mother-bethel-ame-church-drive.mp3",
    walk: "/audio/mother-bethel-ame-church-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-pennsylvania-abolition-society": {
    drive: "/audio/pennsylvania-abolition-society-drive.mp3",
    walk: "/audio/pennsylvania-abolition-society-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-president-s-house-liberty-bell-center": {
    drive: "/audio/presidents-house-liberty-bell-center-drive.mp3",
    walk: "/audio/presidents-house-liberty-bell-center-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-stenton": {
    drive: "/audio/stenton-drive.mp3",
    walk: "/audio/stenton-walk.mp3",
  },
  "black-american-sports-overbrook-high-school": {
    drive: "/audio/overbrook-high-school-drive.mp3",
    walk: "/audio/overbrook-high-school-walk.mp3",
  },
  "black-american-sports-sonny-hill-league-tustin": {
    drive: "/audio/sonny-hill-league-tustin-drive.mp3",
    walk: "/audio/sonny-hill-league-tustin-walk.mp3",
  },
  "black-american-sports-the-palestra": {
    drive: "/audio/the-palestra-drive.mp3",
    walk: "/audio/the-palestra-walk.mp3",
  },
  "black-architects-tour-zion-baptist-church": {
    drive: "/audio/zion-baptist-church-drive.mp3",
    walk: "/audio/zion-baptist-church-walk.mp3",
  },
  "black-inventors-tour-dr-charles-drew-blood-bank": {
    drive: "/audio/dr-charles-drew-blood-bank-drive.mp3",
    walk: "/audio/dr-charles-drew-blood-bank-walk.mp3",
  },
  "black-inventors-tour-frederick-mckinley-jones-route": {
    drive: "/audio/frederick-mckinley-jones-route-drive.mp3",
    walk: "/audio/frederick-mckinley-jones-route-walk.mp3",
  },
  "black-inventors-tour-garrett-morgan-traffic-signal": {
    drive: "/audio/garrett-morgan-traffic-signal-drive.mp3",
    walk: "/audio/garrett-morgan-traffic-signal-walk.mp3",
  },
  "black-inventors-tour-granville-t-woods-railway-site": {
    drive: "/audio/granville-t-woods-railway-site-drive.mp3",
    walk: "/audio/granville-t-woods-railway-site-walk.mp3",
  },
  "black-inventors-tour-lewis-latimer-light-bulb-exhibit": {
    drive: "/audio/lewis-latimer-light-bulb-exhibit-drive.mp3",
    walk: "/audio/lewis-latimer-light-bulb-exhibit-walk.mp3",
  },
  "black-inventors-tour-norbert-rillieux-way": {
    drive: "/audio/norbert-rillieux-way-drive.mp3",
    walk: "/audio/norbert-rillieux-way-walk.mp3",
  },
  "black-inventors-tour-sarah-e-goode-house": {
    drive: "/audio/sarah-e-goode-house-drive.mp3",
    walk: "/audio/sarah-e-goode-house-walk.mp3",
  },
  "black-medical-legacy-black-doctors-row": {
    drive: "/audio/black-doctors-row-drive.mp3",
    walk: "/audio/black-doctors-row-walk.mp3",
  },
  "black-medical-legacy-dr-virginia-alexander-clinic": {
    drive: "/audio/dr-virginia-alexander-clinic-drive.mp3",
    walk: "/audio/dr-virginia-alexander-clinic-walk.mp3",
  },
  "black-medical-legacy-frederick-douglass-hospital": {
    drive: "/audio/frederick-douglass-hospital-drive.mp3",
    walk: "/audio/frederick-douglass-hospital-walk.mp3",
  },
  "black-medical-legacy-holmesburg-prison": {
    drive: "/audio/holmesburg-prison-drive.mp3",
    walk: "/audio/holmesburg-prison-walk.mp3",
  },
  "black-medical-legacy-mercy-douglass-hospital": {
    drive: "/audio/mercy-douglass-hospital-drive.mp3",
    walk: "/audio/mercy-douglass-hospital-walk.mp3",
  },
  "college-hop-tour-chestnut-hill-college": {
    drive: "/audio/chestnut-hill-college-drive.mp3",
    walk: "/audio/chestnut-hill-college-walk.mp3",
  },
  "college-hop-tour-curtis-institute-of-music": {
    drive: "/audio/curtis-institute-of-music-drive.mp3",
    walk: "/audio/curtis-institute-of-music-walk.mp3",
  },
  "college-hop-tour-drexel-university": {
    drive: "/audio/drexel-university-drive.mp3",
    walk: "/audio/drexel-university-walk.mp3",
  },
  "college-hop-tour-la-salle-university": {
    drive: "/audio/la-salle-university-drive.mp3",
    walk: "/audio/la-salle-university-walk.mp3",
  },
  "college-hop-tour-temple-university": {
    drive: "/audio/temple-university-drive.mp3",
    walk: "/audio/temple-university-walk.mp3",
  },
  "college-hop-tour-thomas-jefferson-university": {
    drive: "/audio/thomas-jefferson-university-drive.mp3",
    walk: "/audio/thomas-jefferson-university-walk.mp3",
  },
  "college-hop-tour-university-of-pennsylvania": {
    drive: "/audio/university-of-pennsylvania-drive.mp3",
    walk: "/audio/university-of-pennsylvania-walk.mp3",
  },
  "college-hop-tour-university-of-the-arts": {
    drive: "/audio/university-of-the-arts-drive.mp3",
    walk: "/audio/university-of-the-arts-walk.mp3",
  },
  "divine-9-legacy-tour-alpha-phi-alpha-42nd-and-chestnut": {
    drive: "/audio/alpha-phi-alpha-42nd-and-chestnut-drive.mp3",
    walk: "/audio/alpha-phi-alpha-42nd-and-chestnut-walk.mp3",
  },
  "divine-9-legacy-tour-delta-sigma-theta-40th-and-market": {
    drive: "/audio/delta-sigma-theta-40th-and-market-drive.mp3",
    walk: "/audio/delta-sigma-theta-40th-and-market-walk.mp3",
  },
  "divine-9-legacy-tour-iota-phi-theta-temple-greek-row": {
    drive: "/audio/iota-phi-theta-temple-greek-row-drive.mp3",
    walk: "/audio/iota-phi-theta-temple-greek-row-walk.mp3",
  },
  "divine-9-legacy-tour-kappa-alpha-psi-44th-and-chestnut": {
    drive: "/audio/kappa-alpha-psi-44th-and-chestnut-drive.mp3",
    walk: "/audio/kappa-alpha-psi-44th-and-chestnut-walk.mp3",
  },
  "divine-9-legacy-tour-phi-beta-sigma-44th-and-market": {
    drive: "/audio/phi-beta-sigma-44th-and-market-drive.mp3",
    walk: "/audio/phi-beta-sigma-44th-and-market-walk.mp3",
  },
  "divine-9-legacy-tour-sigma-gamma-rho-48th-and-spruce": {
    drive: "/audio/sigma-gamma-rho-48th-and-spruce-drive.mp3",
    walk: "/audio/sigma-gamma-rho-48th-and-spruce-walk.mp3",
  },
  "divine-9-legacy-tour-zeta-phi-beta-17th-and-jefferson": {
    drive: "/audio/zeta-phi-beta-17th-and-jefferson-drive.mp3",
    walk: "/audio/zeta-phi-beta-17th-and-jefferson-walk.mp3",
  },
  "eastern-star-weekend-most-worshipful-prince-hall-oes": {
    drive: "/audio/most-worshipful-prince-hall-oes-drive.mp3",
    walk: "/audio/most-worshipful-prince-hall-oes-walk.mp3",
  },
  "job-s-daughters-original-bethel-no-1-hall": {
    drive: "/audio/original-bethel-no-1-hall-drive.mp3",
    walk: "/audio/original-bethel-no-1-hall-walk.mp3",
  },
  "library-story-hop-tour-athenaeum-of-philadelphia": {
    drive: "/audio/athenaeum-of-philadelphia-drive.mp3",
    walk: "/audio/athenaeum-of-philadelphia-walk.mp3",
  },
  "library-story-hop-tour-free-library-central-parkway": {
    drive: "/audio/free-library-central-parkway-drive.mp3",
    walk: "/audio/free-library-central-parkway-walk.mp3",
  },
  "library-story-hop-tour-historical-society-of-pennsylvania": {
    drive: "/audio/historical-society-of-pennsylvania-drive.mp3",
    walk: "/audio/historical-society-of-pennsylvania-walk.mp3",
  },
  "library-story-hop-tour-library-company-of-philadelphia": {
    drive: "/audio/library-company-of-philadelphia-drive.mp3",
    walk: "/audio/library-company-of-philadelphia-walk.mp3",
  },
  "library-story-hop-tour-rosenbach-museum-and-library": {
    drive: "/audio/rosenbach-museum-and-library-drive.mp3",
    walk: "/audio/rosenbach-museum-and-library-walk.mp3",
  },
  "old-york-road-corridor-cecil-b-moore-law-office": {
    drive: "/audio/cecil-b-moore-law-office-drive.mp3",
    walk: "/audio/cecil-b-moore-law-office-walk.mp3",
  },
  "old-york-road-corridor-cliveden-historic-site": {
    drive: "/audio/cliveden-historic-site-drive.mp3",
    walk: "/audio/cliveden-historic-site-walk.mp3",
  },
  "old-york-road-corridor-germantown-high-school": {
    drive: "/audio/germantown-high-school-drive.mp3",
    walk: "/audio/germantown-high-school-walk.mp3",
  },
  "old-york-road-corridor-ogontz-theatre-site": {
    drive: "/audio/ogontz-theatre-site-drive.mp3",
    walk: "/audio/ogontz-theatre-site-walk.mp3",
  },
  "old-york-road-corridor-old-york-road-and-north-broad": {
    drive: "/audio/old-york-road-and-north-broad-drive.mp3",
    walk: "/audio/old-york-road-and-north-broad-walk.mp3",
  },
  "old-york-road-corridor-the-nile-restaurant-and-lounge": {
    drive: "/audio/the-nile-restaurant-and-lounge-drive.mp3",
    walk: "/audio/the-nile-restaurant-and-lounge-walk.mp3",
  },
  "old-york-road-corridor-woodmere-art-museum": {
    drive: "/audio/woodmere-art-museum-drive.mp3",
    walk: "/audio/woodmere-art-museum-walk.mp3",
  },
  "philadelphia-foundations-belmont-mansion": {
    drive: "/audio/belmont-mansion-drive.mp3",
    walk: "/audio/belmont-mansion-walk.mp3",
  },
  "philadelphia-foundations-ebenezer-maxwell-mansion": {
    drive: "/audio/ebenezer-maxwell-mansion-drive.mp3",
    walk: "/audio/ebenezer-maxwell-mansion-walk.mp3",
  },
  "philadelphia-foundations-fair-hill-burial-ground": {
    drive: "/audio/fair-hill-burial-ground-drive.mp3",
    walk: "/audio/fair-hill-burial-ground-walk.mp3",
  },
  "philadelphia-foundations-harriet-tubman-mural": {
    drive: "/audio/harriet-tubman-mural-drive.mp3",
    walk: "/audio/harriet-tubman-mural-walk.mp3",
  },
  "philly-black-art-odyssey-brandywine-workshop": {
    drive: "/audio/brandywine-workshop-drive.mp3",
    walk: "/audio/brandywine-workshop-walk.mp3",
  },
  "philly-black-art-odyssey-moody-jones-gallery": {
    drive: "/audio/moody-jones-gallery-drive.mp3",
    walk: "/audio/moody-jones-gallery-walk.mp3",
  },
  "rainbow-girls-philadelphia-arch-street-presbyterian-church": {
    drive: "/audio/arch-street-presbyterian-church-drive.mp3",
    walk: "/audio/arch-street-presbyterian-church-walk.mp3",
  },
  "rainbow-girls-philadelphia-masonic-temple": {
    drive: "/audio/masonic-temple-drive.mp3",
    walk: "/audio/masonic-temple-walk.mp3",
  },
  "rainbow-girls-philadelphia-please-touch-museum": {
    drive: "/audio/please-touch-museum-drive.mp3",
    walk: "/audio/please-touch-museum-walk.mp3",
  },
  "rainbow-girls-philadelphia-reading-terminal-market": {
    drive: "/audio/reading-terminal-market-drive.mp3",
    walk: "/audio/reading-terminal-market-walk.mp3",
  },
  "rainbow-girls-philadelphia-shofuso-japanese-house-and-garden": {
    drive: "/audio/shofuso-japanese-house-and-garden-drive.mp3",
    walk: "/audio/shofuso-japanese-house-and-garden-walk.mp3",
  },
  "rainbow-girls-philadelphia-smith-memorial-playground": {
    drive: "/audio/smith-memorial-playground-drive.mp3",
    walk: "/audio/smith-memorial-playground-walk.mp3",
  },
  "septa-broad-street-line-aces-museum-black-wwii-veterans": {
    drive: "/audio/aces-museum-black-wwii-veterans-drive.mp3",
    walk: "/audio/aces-museum-black-wwii-veterans-walk.mp3",
  },
  "septa-broad-street-line-berks-street-arts-district": {
    drive: "/audio/berks-street-arts-district-drive.mp3",
    walk: "/audio/berks-street-arts-district-walk.mp3",
  },
  "septa-broad-street-line-divine-lorraine-hotel": {
    drive: "/audio/divine-lorraine-hotel-drive.mp3",
    walk: "/audio/divine-lorraine-hotel-walk.mp3",
  },
  "septa-broad-street-line-erie-avenue-cultural-corridor": {
    drive: "/audio/erie-avenue-cultural-corridor-drive.mp3",
    walk: "/audio/erie-avenue-cultural-corridor-walk.mp3",
  },
  "septa-broad-street-line-first-african-baptist-church": {
    drive: "/audio/first-african-baptist-church-drive.mp3",
    walk: "/audio/first-african-baptist-church-walk.mp3",
  },
  "septa-broad-street-line-hunting-park-centers": {
    drive: "/audio/hunting-park-centers-drive.mp3",
    walk: "/audio/hunting-park-centers-walk.mp3",
  },
  "septa-broad-street-line-julian-abele-sites": {
    drive: "/audio/julian-abele-sites-drive.mp3",
    walk: "/audio/julian-abele-sites-walk.mp3",
  },
  "septa-broad-street-line-lehigh-black-labor-sites": {
    drive: "/audio/lehigh-black-labor-sites-drive.mp3",
    walk: "/audio/lehigh-black-labor-sites-walk.mp3",
  },
  "septa-broad-street-line-north-philly-black-metropolis": {
    drive: "/audio/north-philly-black-metropolis-drive.mp3",
    walk: "/audio/north-philly-black-metropolis-walk.mp3",
  },
  "septa-broad-street-line-olney-black-history-markers": {
    drive: "/audio/olney-black-history-markers-drive.mp3",
    walk: "/audio/olney-black-history-markers-walk.mp3",
  },
  "septa-broad-street-line-rockland-black-churches": {
    drive: "/audio/rockland-black-churches-drive.mp3",
    walk: "/audio/rockland-black-churches-walk.mp3",
  },
  "septa-broad-street-line-william-still-marker": {
    drive: "/audio/william-still-marker-drive.mp3",
    walk: "/audio/william-still-marker-walk.mp3",
  },
  "speakeasy-tour-1-tippling-place": {
    drive: "/audio/1-tippling-place-drive.mp3",
    walk: "/audio/1-tippling-place-walk.mp3",
  },
  "speakeasy-tour-andra-hem": {
    drive: "/audio/andra-hem-drive.mp3",
    walk: "/audio/andra-hem-walk.mp3",
  },
  "speakeasy-tour-charlie-was-a-sinner": {
    drive: "/audio/charlie-was-a-sinner-drive.mp3",
    walk: "/audio/charlie-was-a-sinner-walk.mp3",
  },
  "speakeasy-tour-franklin-mortgage-and-investment": {
    drive: "/audio/franklin-mortgage-and-investment-drive.mp3",
    walk: "/audio/franklin-mortgage-and-investment-walk.mp3",
  },
  "speakeasy-tour-haunt": {
    drive: "/audio/haunt-drive.mp3",
    walk: "/audio/haunt-walk.mp3",
  },
  "speakeasy-tour-hop-sing-laundromat": {
    drive: "/audio/hop-sing-laundromat-drive.mp3",
    walk: "/audio/hop-sing-laundromat-walk.mp3",
  },
  "speakeasy-tour-mask-and-wig-club": {
    drive: "/audio/mask-and-wig-club-drive.mp3",
    walk: "/audio/mask-and-wig-club-walk.mp3",
  },
  "speakeasy-tour-midnight-and-the-wicked": {
    drive: "/audio/midnight-and-the-wicked-drive.mp3",
    walk: "/audio/midnight-and-the-wicked-walk.mp3",
  },
  "speakeasy-tour-the-library-bar": {
    drive: "/audio/the-library-bar-drive.mp3",
    walk: "/audio/the-library-bar-walk.mp3",
  },
  "speakeasy-tour-the-ranstead-room": {
    drive: "/audio/the-ranstead-room-drive.mp3",
    walk: "/audio/the-ranstead-room-walk.mp3",
  },
};

