const tour = {
  title: "Historic Philadelphia AR Walk",
  rating: 4.8,
  durationMin: 90,
  distanceMiles: 2.1,
  stops: [
    { title: "Liberty Bell", lat: 39.9496, lng: -75.1503, radius: 40 },
    { title: "Independence Hall", lat: 39.9489, lng: -75.15, radius: 40 },
    { title: "Betsy Ross House", lat: 39.9522, lng: -75.1446, radius: 40 }
  ]
};

const app = document.getElementById("app");
const tabs = document.querySelectorAll("#tabs button");

function renderHome() {
  app.innerHTML = `
    <section class="card">
      <div class="badge">Featured Tour</div>
      <h2>${tour.title}</h2>
      <p class="muted">Rating ${tour.rating} | ${tour.durationMin} min | ${tour.distanceMiles} mi</p>
    </section>
    ${tour.stops
      .map(
        (s, i) => `<article class="card"><strong>Stop ${i + 1}: ${s.title}</strong><p class="muted">AR + narration stop</p></article>`
      )
      .join("")}
  `;
}

function renderMap() {
  app.innerHTML = tour.stops
    .map(
      (s) => `<article class="card"><h3>${s.title}</h3><p class="muted">${s.lat}, ${s.lng}</p><p class="muted">Trigger radius: ${s.radius}m</p></article>`
    )
    .join("");
}

function renderAR() {
  app.innerHTML = `
    <section class="card">
      <h2>AR Loader</h2>
      <p class="muted">Connect this screen to WebXR + Three.js scene loader.</p>
      <p class="muted">Model queue size: ${tour.stops.length}</p>
    </section>
  `;
}

function renderProgress() {
  app.innerHTML = `
    <section class="card">
      <h2>Progress</h2>
      <p class="muted">1 / ${tour.stops.length} complete</p>
    </section>
  `;
}

function renderProfile() {
  app.innerHTML = `
    <section class="card">
      <h2>Profile</h2>
      <p class="muted">Founder Demo</p>
      <p class="muted">Badges: 0</p>
    </section>
  `;
}

const renderByTab = {
  home: renderHome,
  map: renderMap,
  ar: renderAR,
  progress: renderProgress,
  profile: renderProfile
};

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderByTab[btn.dataset.tab]();
  });
});

renderHome();
