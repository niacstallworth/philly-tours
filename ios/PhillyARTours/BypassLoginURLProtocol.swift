// New URLProtocol that injects an "X-Bypass-Login" header for requests to the API host.
// The server can check this header and skip the Cloudflare/Turnstile login flow for
// requests originating from the iOS app. Keep this behavior controlled on the
// server-side to avoid security bypass on the public internet.

import Foundation

final class BypassLoginURLProtocol: URLProtocol {
  private var task: URLSessionDataTask?

  override class func canInit(with request: URLRequest) -> Bool {
    // Disabled: we should not bypass Turnstile/WAF checks from the iOS app.
    // Keep the implementation in the repo for reference, but do not intercept
    // or modify requests in production. Returning false ensures this URL
    // protocol never claims requests.
    return false
  }

  override class func canonicalRequest(for request: URLRequest) -> URLRequest {
    return request
  }

  override func startLoading() {
    // No-op: interception disabled. If this method is ever called (it won't
    // because canInit returns false), fail gracefully.
    client?.urlProtocol(self, didFailWithError: NSError(domain: "BypassLoginURLProtocol", code: -1, userInfo: [NSLocalizedDescriptionKey: "Protocol disabled"]))
  }

  override func stopLoading() {
    task?.cancel()
    task = nil
  }
}
