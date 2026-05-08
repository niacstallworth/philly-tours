# Black Inventors Tour Coordinate Fill Checklist

Use this checklist to finish the navigable version of `black-inventors-tour`
inside [private-content/black-inventors-tour.catalog.json](/Users/nia/Documents/GitHub/philly-tours/private-content/black-inventors-tour.catalog.json).

Current status:

- all 8 inventor-tour stops exist in `private_content`
- route order is scaffolded
- narration placeholders are in place
- `lat` and `lng` still need real values for several stops

## Fill Steps

For each stop:

1. confirm the real historical destination
2. choose the exact visitor-facing pin
3. update `lat` and `lng` in `private-content/black-inventors-tour.catalog.json`
4. upgrade `coordQuality` from `approximate` to `verified` when confirmed
5. change `pinStatus` from `needs_verification` to `verified`
6. replace `narrationStatus` and `mediaStatus` as you finish those areas
5. re-import with:

```bash
npm run content:import:private -- --file private-content/black-inventors-tour.catalog.json
```

## Stop List

1. `black-inventors-tour-dr-charles-drew-blood-bank`
   Title: Dr. Charles Drew Blood Bank
   Address scaffold: `800 Spruce St, Pennsylvania Hospital, PA`
   Current role: medical innovation / care infrastructure

2. `black-inventors-tour-garrett-morgan-traffic-signal`
   Title: Garrett Morgan Traffic Signal
   Address scaffold: `13th & Market St, Philadelphia, PA`
   Current role: signaling / safety / public movement

3. `black-inventors-tour-lewis-latimer-light-bulb-exhibit`
   Title: Lewis Latimer Light Bulb Exhibit
   Address scaffold: `15 S 7th St, Philadelphia History Museum, PA`
   Current role: light / patents / invention visibility

4. `black-inventors-tour-norbert-rillieux-way`
   Title: Norbert Rillieux Way
   Address scaffold: `33rd & Walnut St, Penn Campus, PA`
   Current role: engineering / refinement / hidden systems

5. `black-inventors-tour-granville-t-woods-railway-site`
   Title: Granville T. Woods Railway Site
   Address scaffold: `Broad & Girard Ave, Philadelphia, PA`
   Current role: rail communication / transit infrastructure

6. `black-inventors-tour-sarah-e-goode-house`
   Title: Sarah E. Goode House
   Address scaffold: `1724 South St, Philadelphia, PA`
   Current role: domestic design / everyday invention

7. `black-inventors-tour-frederick-mckinley-jones-route`
   Title: Frederick McKinley Jones Route
   Address scaffold: `3400 block E. Ontario St, Port Richmond, PA`
   Current role: refrigeration / logistics / regional movement

8. `black-inventors-tour-african-american-museum`
   Title: African American Museum
   Address scaffold: `701 Arch St, Philadelphia, PA`
   Current role: archive / interpretation / public memory

## Suggested Completion Order

1. Lewis Latimer Light Bulb Exhibit
2. Garrett Morgan Traffic Signal
3. Dr. Charles Drew Blood Bank
4. African American Museum
5. Norbert Rillieux Way
6. Sarah E. Goode House
7. Granville T. Woods Railway Site
8. Frederick McKinley Jones Route

This order starts with the 3 strongest AR-backed stops, then anchors the museum
memory stop, then finishes the broader inventor-route scaffolds.
