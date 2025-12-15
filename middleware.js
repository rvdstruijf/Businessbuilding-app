// middleware.js - Vercel Edge Middleware voor Basic Authentication
// Plaats dit bestand in de ROOT van je project

export const config = {
  matcher: '/:path*', // Beschermt alle pagina's
}

export default function middleware(request) {
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl

  // Check of er een authorization header is
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // Verifieer credentials met environment variables
    const validUser = process.env.AUTH_USER || 'admin'
    const validPassword = process.env.AUTH_PASSWORD || 'changeme'

    if (user === validUser && pwd === validPassword) {
      // Correcte credentials - laat door
      return
    }
  }

  // Geen of incorrecte credentials - vraag om authenticatie
  return new Response('Toegang geweigerd', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="BusinessBuilding App - Beveiligde toegang"',
    },
  })
}
