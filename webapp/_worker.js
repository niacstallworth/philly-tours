export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.toLowerCase() === "www.philly-tours.com") {
      url.hostname = "philly-tours.com";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  }
};
