export type NarrationVariant = "drive" | "walk";

export type NarrationCatalogEntry = {
  drive?: string;
  walk?: string;
};

export const narrationCatalogByStopId: Record<string, NarrationCatalogEntry> = {
  "black-american-legacy-and-quaker-heritage-3200-3400-blocks-diamond-and-susquehan": {
    drive: "/audio/3200-3400-blocks-diamond-and-susquehanna-drive.mp3",
    walk: "/audio/3200-3400-blocks-diamond-and-susquehanna-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-3911-delancey-street": {
    drive: "/audio/3911-delancey-street-drive.mp3",
    walk: "/audio/3911-delancey-street-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-4600-spruce-street": {
    drive: "/audio/4600-spruce-street-drive.mp3",
    walk: "/audio/4600-spruce-street-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-4700-4800-blocks-of-walnut-street": {
    drive: "/audio/4700-4800-blocks-of-walnut-street-drive.mp3",
    walk: "/audio/4700-4800-blocks-of-walnut-street-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-arch-street-friends-meeting-house": {
    drive: "/audio/arch-street-friends-meeting-house-drive.mp3",
    walk: "/audio/arch-street-friends-meeting-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-belfield-mansion": {
    drive: "/audio/belfield-mansion-drive.mp3",
    walk: "/audio/belfield-mansion-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-belmont-mansion": {
    drive: "/audio/belmont-mansion-drive.mp3",
    walk: "/audio/belmont-mansion-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-cecil-b-moore-avenue": {
    drive: "/audio/cecil-b-moore-avenue-drive.mp3",
    walk: "/audio/cecil-b-moore-avenue-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-cedar-grove-and-laurel-hill-mansions": {
    drive: "/audio/cedar-grove-and-laurel-hill-mansions-drive.mp3",
    walk: "/audio/cedar-grove-and-laurel-hill-mansions-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-christian-street-ymca": {
    drive: "/audio/christian-street-ymca-drive.mp3",
    walk: "/audio/christian-street-ymca-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-cliveden": {
    drive: "/audio/cliveden-drive.mp3",
    walk: "/audio/cliveden-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-deshler-morris-house": {
    drive: "/audio/deshler-morris-house-drive.mp3",
    walk: "/audio/deshler-morris-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-free-quaker-meeting-house": {
    drive: "/audio/free-quaker-meeting-house-drive.mp3",
    walk: "/audio/free-quaker-meeting-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-freedom-theatre": {
    drive: "/audio/freedom-theatre-drive.mp3",
    walk: "/audio/freedom-theatre-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-germantown-mennonite-meetinghouse": {
    drive: "/audio/germantown-mennonite-meetinghouse-drive.mp3",
    walk: "/audio/germantown-mennonite-meetinghouse-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-grumblethorpe": {
    drive: "/audio/grumblethorpe-drive.mp3",
    walk: "/audio/grumblethorpe-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-john-coltrane-house": {
    drive: "/audio/john-coltrane-house-drive.mp3",
    walk: "/audio/john-coltrane-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-johnson-house": {
    drive: "/audio/johnson-house-drive.mp3",
    walk: "/audio/johnson-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-lemon-hill-mansion": {
    drive: "/audio/lemon-hill-mansion-drive.mp3",
    walk: "/audio/lemon-hill-mansion-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-lombard-street-free-african-society-ho": {
    drive: "/audio/lombard-street-free-african-society-homes-drive.mp3",
    walk: "/audio/lombard-street-free-african-society-homes-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-mother-bethel-ame-church": {
    drive: "/audio/mother-bethel-ame-church-drive.mp3",
    walk: "/audio/mother-bethel-ame-church-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-mount-pleasant": {
    drive: "/audio/mount-pleasant-drive.mp3",
    walk: "/audio/mount-pleasant-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-ormiston": {
    drive: "/audio/ormiston-drive.mp3",
    walk: "/audio/ormiston-walk.mp3",
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
  "black-american-legacy-and-quaker-heritage-strawberry-mansion": {
    drive: "/audio/strawberry-mansion-drive.mp3",
    walk: "/audio/strawberry-mansion-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-the-woodlands": {
    drive: "/audio/the-woodlands-drive.mp3",
    walk: "/audio/the-woodlands-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-upsala": {
    drive: "/audio/upsala-drive.mp3",
    walk: "/audio/upsala-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-w-e-b-du-bois-college-house": {
    drive: "/audio/w-e-b-du-bois-college-house-drive.mp3",
    walk: "/audio/w-e-b-du-bois-college-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-wyck": {
    drive: "/audio/wyck-drive.mp3",
    walk: "/audio/wyck-walk.mp3",
  },
  "black-american-sports-allen-iverson-s-hampton-park-courts": {
    drive: "/audio/allen-iverson-s-hampton-park-courts-drive.mp3",
    walk: "/audio/allen-iverson-s-hampton-park-courts-walk.mp3",
  },
  "black-american-sports-dell-music-center": {
    drive: "/audio/dell-music-center-drive.mp3",
    walk: "/audio/dell-music-center-walk.mp3",
  },
  "black-american-sports-joe-frazier-s-gym-cloverlay": {
    drive: "/audio/joe-frazier-s-gym-cloverlay-drive.mp3",
    walk: "/audio/joe-frazier-s-gym-cloverlay-walk.mp3",
  },
  "black-american-sports-marian-anderson-rec-center": {
    drive: "/audio/marian-anderson-rec-center-drive.mp3",
    walk: "/audio/marian-anderson-rec-center-walk.mp3",
  },
  "black-american-sports-maxie-s-pizza": {
    drive: "/audio/maxie-s-pizza-drive.mp3",
    walk: "/audio/maxie-s-pizza-walk.mp3",
  },
  "black-american-sports-overbrook-high-school": {
    drive: "/audio/overbrook-high-school-drive.mp3",
    walk: "/audio/overbrook-high-school-walk.mp3",
  },
  "black-american-sports-sonny-hill-league-tustin": {
    drive: "/audio/sonny-hill-league-tustin-drive.mp3",
    walk: "/audio/sonny-hill-league-tustin-walk.mp3",
  },
  "black-american-sports-south-kitchen-and-jazz-club": {
    drive: "/audio/south-kitchen-and-jazz-club-drive.mp3",
    walk: "/audio/south-kitchen-and-jazz-club-walk.mp3",
  },
  "black-american-sports-the-palestra": {
    drive: "/audio/the-palestra-drive.mp3",
    walk: "/audio/the-palestra-walk.mp3",
  },
  "black-architects-tour-african-american-museum": {
    drive: "/audio/african-american-museum-drive.mp3",
    walk: "/audio/african-american-museum-walk.mp3",
  },
  "black-architects-tour-berean-savings-and-loan": {
    drive: "/audio/berean-savings-and-loan-drive.mp3",
    walk: "/audio/berean-savings-and-loan-walk.mp3",
  },
  "black-architects-tour-free-library-central": {
    drive: "/audio/free-library-central-drive.mp3",
    walk: "/audio/free-library-central-walk.mp3",
  },
  "black-architects-tour-irvine-auditorium": {
    drive: "/audio/irvine-auditorium-drive.mp3",
    walk: "/audio/irvine-auditorium-walk.mp3",
  },
  "black-architects-tour-penn-campus-fisher-library": {
    drive: "/audio/penn-campus-fisher-library-drive.mp3",
    walk: "/audio/penn-campus-fisher-library-walk.mp3",
  },
  "black-architects-tour-philadanco-building": {
    drive: "/audio/philadanco-building-drive.mp3",
    walk: "/audio/philadanco-building-walk.mp3",
  },
  "black-architects-tour-philadelphia-museum-of-art": {
    drive: "/audio/philadelphia-museum-of-art-drive.mp3",
    walk: "/audio/philadelphia-museum-of-art-walk.mp3",
  },
  "black-architects-tour-progress-plaza": {
    drive: "/audio/progress-plaza-drive.mp3",
    walk: "/audio/progress-plaza-walk.mp3",
  },
  "black-architects-tour-union-league": {
    drive: "/audio/union-league-drive.mp3",
    walk: "/audio/union-league-walk.mp3",
  },
  "black-architects-tour-zion-baptist-church": {
    drive: "/audio/zion-baptist-church-drive.mp3",
    walk: "/audio/zion-baptist-church-walk.mp3",
  },
  "black-inventors-tour-african-american-museum": {
    drive: "/audio/african-american-museum-drive.mp3",
    walk: "/audio/african-american-museum-walk.mp3",
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
  "black-medical-legacy-barbara-bates-center": {
    drive: "/audio/barbara-bates-center-drive.mp3",
    walk: "/audio/barbara-bates-center-walk.mp3",
  },
  "black-medical-legacy-black-doctors-row": {
    drive: "/audio/black-doctors-row-drive.mp3",
    walk: "/audio/black-doctors-row-walk.mp3",
  },
  "black-medical-legacy-city-almshouse": {
    drive: "/audio/city-almshouse-drive.mp3",
    walk: "/audio/city-almshouse-walk.mp3",
  },
  "black-medical-legacy-dr-virginia-alexander-clinic": {
    drive: "/audio/dr-virginia-alexander-clinic-drive.mp3",
    walk: "/audio/dr-virginia-alexander-clinic-walk.mp3",
  },
  "black-medical-legacy-frederick-douglass-hospital": {
    drive: "/audio/frederick-douglass-hospital-drive.mp3",
    walk: "/audio/frederick-douglass-hospital-walk.mp3",
  },
  "black-medical-legacy-free-african-society": {
    drive: "/audio/free-african-society-drive.mp3",
    walk: "/audio/free-african-society-walk.mp3",
  },
  "black-medical-legacy-holmesburg-prison": {
    drive: "/audio/holmesburg-prison-drive.mp3",
    walk: "/audio/holmesburg-prison-walk.mp3",
  },
  "black-medical-legacy-mercy-douglass-hospital": {
    drive: "/audio/mercy-douglass-hospital-drive.mp3",
    walk: "/audio/mercy-douglass-hospital-walk.mp3",
  },
  "black-medical-legacy-mercy-douglass-nurse-training": {
    drive: "/audio/mercy-douglass-nurse-training-drive.mp3",
    walk: "/audio/mercy-douglass-nurse-training-walk.mp3",
  },
  "black-medical-legacy-mercy-hospital-site": {
    drive: "/audio/mercy-hospital-site-drive.mp3",
    walk: "/audio/mercy-hospital-site-walk.mp3",
  },
  "black-medical-legacy-mother-bethel-ame-church": {
    drive: "/audio/mother-bethel-ame-church-drive.mp3",
    walk: "/audio/mother-bethel-ame-church-walk.mp3",
  },
  "black-medical-legacy-move-bombing-sites": {
    drive: "/audio/move-bombing-sites-drive.mp3",
    walk: "/audio/move-bombing-sites-walk.mp3",
  },
  "black-medical-legacy-pennsylvania-hospital": {
    drive: "/audio/pennsylvania-hospital-drive.mp3",
    walk: "/audio/pennsylvania-hospital-walk.mp3",
  },
  "black-medical-legacy-philadelphia-general-hospital": {
    drive: "/audio/philadelphia-general-hospital-drive.mp3",
    walk: "/audio/philadelphia-general-hospital-walk.mp3",
  },
  "black-medical-legacy-yellow-fever-sites": {
    drive: "/audio/yellow-fever-sites-drive.mp3",
    walk: "/audio/yellow-fever-sites-walk.mp3",
  },
  "college-hop-tour-chestnut-hill-college": {
    drive: "/audio/chestnut-hill-college-drive.mp3",
    walk: "/audio/chestnut-hill-college-walk.mp3",
  },
  "college-hop-tour-community-college-of-philly": {
    drive: "/audio/community-college-of-philly-drive.mp3",
    walk: "/audio/community-college-of-philly-walk.mp3",
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
  "college-hop-tour-pa-academy-of-fine-arts": {
    drive: "/audio/pa-academy-of-fine-arts-drive.mp3",
    walk: "/audio/pa-academy-of-fine-arts-walk.mp3",
  },
  "college-hop-tour-saint-joseph-s-university": {
    drive: "/audio/saint-joseph-s-university-drive.mp3",
    walk: "/audio/saint-joseph-s-university-walk.mp3",
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
  "divine-9-legacy-tour-alpha-kappa-alpha-ivy-legacy": {
    drive: "/audio/alpha-kappa-alpha-ivy-legacy-drive.mp3",
    walk: "/audio/alpha-kappa-alpha-ivy-legacy-walk.mp3",
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
  "eastern-star-weekend-masonic-temple": {
    drive: "/audio/masonic-temple-drive.mp3",
    walk: "/audio/masonic-temple-walk.mp3",
  },
  "eastern-star-weekend-most-worshipful-prince-hall-oes": {
    drive: "/audio/most-worshipful-prince-hall-oes-drive.mp3",
    walk: "/audio/most-worshipful-prince-hall-oes-walk.mp3",
  },
  "eastern-star-weekend-mother-bethel-ame-church": {
    drive: "/audio/mother-bethel-ame-church-drive.mp3",
    walk: "/audio/mother-bethel-ame-church-walk.mp3",
  },
  "eastern-star-weekend-prince-hall-grand-lodge": {
    drive: "/audio/prince-hall-grand-lodge-drive.mp3",
    walk: "/audio/prince-hall-grand-lodge-walk.mp3",
  },
  "eastern-star-weekend-relish": {
    drive: "/audio/relish-drive.mp3",
    walk: "/audio/relish-walk.mp3",
  },
  "eastern-star-weekend-robert-h-johnson-chapter-no-5": {
    drive: "/audio/robert-h-johnson-chapter-no-5-drive.mp3",
    walk: "/audio/robert-h-johnson-chapter-no-5-walk.mp3",
  },
  "eastern-star-weekend-south-kitchen-and-jazz-club": {
    drive: "/audio/south-kitchen-and-jazz-club-drive.mp3",
    walk: "/audio/south-kitchen-and-jazz-club-walk.mp3",
  },
  "eastern-star-weekend-sweetbriar-mansion": {
    drive: "/audio/sweetbriar-mansion-drive.mp3",
    walk: "/audio/sweetbriar-mansion-walk.mp3",
  },
  "eastern-star-weekend-the-breakfast-den": {
    drive: "/audio/the-breakfast-den-drive.mp3",
    walk: "/audio/the-breakfast-den-walk.mp3",
  },
  "eastern-star-weekend-widow-s-son-hall": {
    drive: "/audio/widow-s-son-hall-drive.mp3",
    walk: "/audio/widow-s-son-hall-walk.mp3",
  },
  "job-s-daughters-arch-street-united-methodist": {
    drive: "/audio/arch-street-united-methodist-drive.mp3",
    walk: "/audio/arch-street-united-methodist-walk.mp3",
  },
  "job-s-daughters-christ-church": {
    drive: "/audio/christ-church-drive.mp3",
    walk: "/audio/christ-church-walk.mp3",
  },
  "job-s-daughters-crystal-tea-room": {
    drive: "/audio/crystal-tea-room-drive.mp3",
    walk: "/audio/crystal-tea-room-walk.mp3",
  },
  "job-s-daughters-free-quaker-meeting-house": {
    drive: "/audio/free-quaker-meeting-house-drive.mp3",
    walk: "/audio/free-quaker-meeting-house-walk.mp3",
  },
  "job-s-daughters-green-eggs-caf": {
    drive: "/audio/green-eggs-caf-drive.mp3",
    walk: "/audio/green-eggs-caf-walk.mp3",
  },
  "job-s-daughters-masonic-temple": {
    drive: "/audio/masonic-temple-drive.mp3",
    walk: "/audio/masonic-temple-walk.mp3",
  },
  "job-s-daughters-original-bethel-no-1-hall": {
    drive: "/audio/original-bethel-no-1-hall-drive.mp3",
    walk: "/audio/original-bethel-no-1-hall-walk.mp3",
  },
  "job-s-daughters-reading-terminal-market": {
    drive: "/audio/reading-terminal-market-drive.mp3",
    walk: "/audio/reading-terminal-market-walk.mp3",
  },
  "job-s-daughters-sweetbriar-mansion": {
    drive: "/audio/sweetbriar-mansion-drive.mp3",
    walk: "/audio/sweetbriar-mansion-walk.mp3",
  },
  "library-story-hop-tour-athenaeum-of-philadelphia": {
    drive: "/audio/athenaeum-of-philadelphia-drive.mp3",
    walk: "/audio/athenaeum-of-philadelphia-walk.mp3",
  },
  "library-story-hop-tour-charles-l-blockson-collection": {
    drive: "/audio/charles-l-blockson-collection-drive.mp3",
    walk: "/audio/charles-l-blockson-collection-walk.mp3",
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
  "library-story-hop-tour-parkway-central-children-s-dept": {
    drive: "/audio/parkway-central-children-s-dept-drive.mp3",
    walk: "/audio/parkway-central-children-s-dept-walk.mp3",
  },
  "library-story-hop-tour-rosenbach-museum-and-library": {
    drive: "/audio/rosenbach-museum-and-library-drive.mp3",
    walk: "/audio/rosenbach-museum-and-library-walk.mp3",
  },
  "masonic-scavenger-hunt-city-hall": {
    drive: "/audio/city-hall-drive.mp3",
    walk: "/audio/city-hall-walk.mp3",
  },
  "masonic-scavenger-hunt-masonic-temple": {
    drive: "/audio/masonic-temple-drive.mp3",
    walk: "/audio/masonic-temple-walk.mp3",
  },
  "masonic-scavenger-hunt-pennsylvania-hospital": {
    drive: "/audio/pennsylvania-hospital-drive.mp3",
    walk: "/audio/pennsylvania-hospital-walk.mp3",
  },
  "masonic-scavenger-hunt-prince-hall-grand-lodge": {
    drive: "/audio/prince-hall-grand-lodge-drive.mp3",
    walk: "/audio/prince-hall-grand-lodge-walk.mp3",
  },
  "move-bombing-memorial-african-american-museum": {
    drive: "/audio/african-american-museum-drive.mp3",
    walk: "/audio/african-american-museum-walk.mp3",
  },
  "move-bombing-memorial-chef-curt-s-bbq": {
    drive: "/audio/chef-curt-s-bbq-drive.mp3",
    walk: "/audio/chef-curt-s-bbq-walk.mp3",
  },
  "move-bombing-memorial-cobbs-creek-park": {
    drive: "/audio/cobbs-creek-park-drive.mp3",
    walk: "/audio/cobbs-creek-park-walk.mp3",
  },
  "move-bombing-memorial-municipal-services-building": {
    drive: "/audio/municipal-services-building-drive.mp3",
    walk: "/audio/municipal-services-building-walk.mp3",
  },
  "move-bombing-memorial-osage-avenue": {
    drive: "/audio/osage-avenue-drive.mp3",
    walk: "/audio/osage-avenue-walk.mp3",
  },
  "move-bombing-memorial-powelton-village": {
    drive: "/audio/powelton-village-drive.mp3",
    walk: "/audio/powelton-village-walk.mp3",
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
  "old-york-road-corridor-happy-hollow-rec-center": {
    drive: "/audio/happy-hollow-rec-center-drive.mp3",
    walk: "/audio/happy-hollow-rec-center-walk.mp3",
  },
  "old-york-road-corridor-johnson-house-historic-site": {
    drive: "/audio/johnson-house-historic-site-drive.mp3",
    walk: "/audio/johnson-house-historic-site-walk.mp3",
  },
  "old-york-road-corridor-ogontz-theatre-site": {
    drive: "/audio/ogontz-theatre-site-drive.mp3",
    walk: "/audio/ogontz-theatre-site-walk.mp3",
  },
  "old-york-road-corridor-old-york-road-and-north-broad": {
    drive: "/audio/old-york-road-and-north-broad-drive.mp3",
    walk: "/audio/old-york-road-and-north-broad-walk.mp3",
  },
  "old-york-road-corridor-relish-restaurant": {
    drive: "/audio/relish-restaurant-drive.mp3",
    walk: "/audio/relish-restaurant-walk.mp3",
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
  "philadelphia-foundations-cliveden": {
    drive: "/audio/cliveden-drive.mp3",
    walk: "/audio/cliveden-walk.mp3",
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
  "philadelphia-foundations-johnson-house": {
    drive: "/audio/johnson-house-drive.mp3",
    walk: "/audio/johnson-house-walk.mp3",
  },
  "philly-black-art-odyssey-african-american-museum": {
    drive: "/audio/african-american-museum-drive.mp3",
    walk: "/audio/african-american-museum-walk.mp3",
  },
  "philly-black-art-odyssey-barnes-foundation": {
    drive: "/audio/barnes-foundation-drive.mp3",
    walk: "/audio/barnes-foundation-walk.mp3",
  },
  "philly-black-art-odyssey-brandywine-workshop": {
    drive: "/audio/brandywine-workshop-drive.mp3",
    walk: "/audio/brandywine-workshop-walk.mp3",
  },
  "philly-black-art-odyssey-moody-jones-gallery": {
    drive: "/audio/moody-jones-gallery-drive.mp3",
    walk: "/audio/moody-jones-gallery-walk.mp3",
  },
  "philly-black-art-odyssey-mural-arts-tour": {
    drive: "/audio/mural-arts-tour-drive.mp3",
    walk: "/audio/mural-arts-tour-walk.mp3",
  },
  "philly-black-art-odyssey-october-gallery": {
    drive: "/audio/october-gallery-drive.mp3",
    walk: "/audio/october-gallery-walk.mp3",
  },
  "philly-black-art-odyssey-pa-academy-fine-arts": {
    drive: "/audio/pa-academy-fine-arts-drive.mp3",
    walk: "/audio/pa-academy-fine-arts-walk.mp3",
  },
  "philly-black-art-odyssey-philadelphia-museum-of-art": {
    drive: "/audio/philadelphia-museum-of-art-drive.mp3",
    walk: "/audio/philadelphia-museum-of-art-walk.mp3",
  },
  "philly-black-art-odyssey-public-sculptures": {
    drive: "/audio/public-sculptures-drive.mp3",
    walk: "/audio/public-sculptures-walk.mp3",
  },
  "philly-black-art-odyssey-woodmere-art-museum": {
    drive: "/audio/woodmere-art-museum-drive.mp3",
    walk: "/audio/woodmere-art-museum-walk.mp3",
  },
  "rainbow-girls-philadelphia-arch-street-presbyterian-church": {
    drive: "/audio/arch-street-presbyterian-church-drive.mp3",
    walk: "/audio/arch-street-presbyterian-church-walk.mp3",
  },
  "rainbow-girls-philadelphia-covenant-house-pa": {
    drive: "/audio/covenant-house-pa-drive.mp3",
    walk: "/audio/covenant-house-pa-walk.mp3",
  },
  "rainbow-girls-philadelphia-green-eggs-caf": {
    drive: "/audio/green-eggs-caf-drive.mp3",
    walk: "/audio/green-eggs-caf-walk.mp3",
  },
  "rainbow-girls-philadelphia-hard-rock-cafe": {
    drive: "/audio/hard-rock-cafe-drive.mp3",
    walk: "/audio/hard-rock-cafe-walk.mp3",
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
  "rainbow-girls-philadelphia-sweetbriar-mansion-lawn": {
    drive: "/audio/sweetbriar-mansion-lawn-drive.mp3",
    walk: "/audio/sweetbriar-mansion-lawn-walk.mp3",
  },
  "septa-broad-street-line-aces-museum-black-wwii-veterans": {
    drive: "/audio/aces-museum-black-wwii-veterans-drive.mp3",
    walk: "/audio/aces-museum-black-wwii-veterans-walk.mp3",
  },
  "septa-broad-street-line-berks-street-arts-district": {
    drive: "/audio/berks-street-arts-district-drive.mp3",
    walk: "/audio/berks-street-arts-district-walk.mp3",
  },
  "septa-broad-street-line-cecil-b-moore-mural": {
    drive: "/audio/cecil-b-moore-mural-drive.mp3",
    walk: "/audio/cecil-b-moore-mural-walk.mp3",
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
  "septa-broad-street-line-wyoming-ave-business-district": {
    drive: "/audio/wyoming-ave-business-district-drive.mp3",
    walk: "/audio/wyoming-ave-business-district-walk.mp3",
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

