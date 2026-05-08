# Black Inventors Tour Audio Production Sheet

Use this sheet to record or outsource the private narration audio for
[private-content/black-inventors-tour.catalog.json](/Users/nia/Documents/GitHub/philly-tours/private-content/black-inventors-tour.catalog.json).

Save final MP3s into:

`/Users/nia/Documents/GitHub/philly-tours/private-content/assets/tour-audio-private/audio/black-inventors-tour/`

Then upload them with:

```bash
npm run content:upload:private-assets -- --file private-content/black-inventors-tour.catalog.json --kind audio
```

## File Map

1. `dr-charles-drew-blood-bank-drive.mp3`
   Stop: Dr. Charles Drew Blood Bank
   Mode: drive
   Script: Ahead is the Charles Drew stop. Drew's legacy is not just brilliance in a lab. It is the system that lets blood be stored, moved, and used in time to save a stranger. This is invention as medical infrastructure, where precision becomes survival.

2. `dr-charles-drew-blood-bank-walk.mp3`
   Stop: Dr. Charles Drew Blood Bank
   Mode: walk
   Script: At this stop, treat Charles Drew as more than a famous name in medicine. His work helped turn blood storage into a usable public system. What matters here is not only discovery, but the way Black knowledge became care at scale.

3. `garrett-morgan-traffic-signal-drive.mp3`
   Stop: Garrett Morgan Traffic Signal
   Mode: drive
   Script: This Garrett Morgan stop asks you to notice something easy to ignore: order. Traffic lights feel ordinary now, but they are part of how a city learns to slow danger down. Morgan's invention belongs to the history of public safety, where movement becomes more livable because someone redesigned the rules.

4. `garrett-morgan-traffic-signal-walk.mp3`
   Stop: Garrett Morgan Traffic Signal
   Mode: walk
   Script: Standing here, think about the intersection as a piece of choreography. Garrett Morgan helped imagine a city where motion could be interrupted before it became harm. His work sits inside the daily rhythm of caution, pause, and release.

5. `lewis-latimer-light-bulb-exhibit-drive.mp3`
   Stop: Lewis Latimer Light Bulb Exhibit
   Mode: drive
   Script: Ahead is the Lewis Latimer stop. Latimer reminds us that invention is not only the flash of an idea. It is drafting, refinement, materials, and the labor that makes a breakthrough usable. Behind the glow of electric light is a Black engineer whose precision helped modern life stay switched on.

6. `lewis-latimer-light-bulb-exhibit-walk.mp3`
   Stop: Lewis Latimer Light Bulb Exhibit
   Mode: walk
   Script: At this stop, light becomes a story about invisible labor. Lewis Latimer worked in the space between inspiration and implementation, where drawings, patents, and materials turn possibility into something durable. This is invention with both elegance and discipline.

7. `norbert-rillieux-way-drive.mp3`
   Stop: Norbert Rillieux Way
   Mode: drive
   Script: Norbert Rillieux belongs to the history of systems most people never see. His work in refining sugar was about heat, pressure, control, and efficiency. This stop helps widen the tour from single objects to industrial engineering, where Black invention reshapes entire processes rather than one isolated tool.

8. `norbert-rillieux-way-walk.mp3`
   Stop: Norbert Rillieux Way
   Mode: walk
   Script: Here, use Rillieux as a bridge into hidden infrastructure. His engineering was about mastering heat and sequence so that industry could run with greater intelligence and less waste. It is a reminder that some of the most powerful inventions disappear into the system they improve.

9. `granville-t-woods-railway-site-drive.mp3`
   Stop: Granville T. Woods Railway Site
   Mode: drive
   Script: Ahead is the Granville T. Woods stop, where invention becomes communication in motion. Rail systems only work when timing, signaling, and distance can be managed together. Woods helps us understand that mobility is not just speed. It is information, coordination, and trust built into public movement.

10. `granville-t-woods-railway-site-walk.mp3`
    Stop: Granville T. Woods Railway Site
    Mode: walk
    Script: At this stop, think about transit as a language of signals. Granville T. Woods worked in the world of moving vehicles, crowded routes, and the need for clear communication across distance. His inventions helped make motion more legible, and therefore safer.

11. `sarah-e-goode-house-drive.mp3`
    Stop: Sarah E. Goode House
    Mode: drive
    Script: This Sarah E. Goode stop shifts the tour from large systems to intimate space. Goode's folding cabinet bed answered a simple but profound question: how should design respond when room is limited and life must still function with dignity. Black invention lives in everyday interiors too.

12. `sarah-e-goode-house-walk.mp3`
    Stop: Sarah E. Goode House
    Mode: walk
    Script: Standing here, let the scale of invention get smaller and more personal. Sarah E. Goode designed for constrained space, for practical living, and for people whose daily needs were often overlooked. This is innovation measured in comfort, flexibility, and the architecture of ordinary life.

13. `frederick-mckinley-jones-route-drive.mp3`
    Stop: Frederick McKinley Jones Route
    Mode: drive
    Script: Frederick McKinley Jones helps this route move into logistics. Refrigerated transport changed what distance could mean for food, medicine, and commerce. His work belongs to the history of connection, where a technical solution quietly reshapes what can survive a journey.

14. `frederick-mckinley-jones-route-walk.mp3`
    Stop: Frederick McKinley Jones Route
    Mode: walk
    Script: Use this stop to notice the hidden life of transport. Frederick McKinley Jones made cold-chain movement more reliable, which means his influence reaches into markets, hospitals, and households far beyond any single street. This is Black invention stretched across regional distance.

15. `african-american-museum-drive.mp3`
    Stop: African American Museum
    Mode: drive
    Script: Ahead is the African American Museum, the memory stop in this route. By the time you arrive here, the question is no longer whether Black innovation shaped the modern world. The question is who preserves that truth, who interprets it, and who refuses to let it fade into the background of somebody else's history.

16. `african-american-museum-walk.mp3`
    Stop: African American Museum
    Mode: walk
    Script: Close the route here by treating the museum as part of the invention story. Archives, exhibitions, and interpretation are cultural technologies too. They keep achievement visible, legible, and transferable, which means memory itself becomes a form of infrastructure.

## Recording Notes

- Keep `drive` takes slightly more projected and forward-moving.
- Keep `walk` takes a little slower and more grounded.
- Export as `.mp3`.
- Replace the matching `.placeholder.txt` files with the real `.mp3` files.
- Re-run the upload command, then verify signed URLs through the private content endpoint.
