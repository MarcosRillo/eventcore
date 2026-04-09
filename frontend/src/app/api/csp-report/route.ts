/**
 * CSP Violation Reporting Endpoint
 *
 * Receives Content-Security-Policy violation reports from the browser.
 * Logs them server-side for security observability.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()

    const report = body['csp-report'] || body

    // eslint-disable-next-line no-console -- Security telemetry requires server-side logging
    console.warn('[CSP Violation]', JSON.stringify({
      'blocked-uri': report['blocked-uri'],
      'violated-directive': report['violated-directive'],
      'document-uri': report['document-uri'],
      'source-file': report['source-file'],
      'line-number': report['line-number'],
    }))
  } catch {
    // Malformed report — ignore silently
  }

  return new Response(null, { status: 204 })
}
