# Story Logistics

Story Logistics is the Founders route logic for Philly Tours.

It means a tour is not ordered by distance alone, popularity alone, category alone, or a static spreadsheet. Each stop is placed so the route feels coherent on the map and in the body.

```txt
next stop = closest meaningful stop that keeps the story moving forward
```

In simple program language:

```ts
orderedStops = sortStopsByPath({
  start: foundersCompass,
  stops,
  rule: "next closest sensible stop in the outward story direction"
});
```

Expanded:

```ts
currentStop = startStop;
orderedStops = [currentStop];

while (stopsLeft.length > 0) {
  nextStop = bestStop({
    from: currentStop,
    candidates: stopsLeft,
    nearEnough: true,
    keepsMomentum: true,
    avoidsBacktracking: true,
    fitsStoryArc: true,
    respectsNorthStar: true
  });

  orderedStops.push(nextStop);
  currentStop = nextStop;
}
```

The marketing language:

**Routes shaped by story, geography, and momentum.**

The product promise:

Philly Tours does not just drop pins on a map. It arranges cultural stops so the city opens naturally, with fewer awkward jumps, clearer neighborhood flow, and a stronger narrative arc from the Founders Compass outward.

