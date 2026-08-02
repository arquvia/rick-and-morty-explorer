import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const port = Number(process.env.PORT || 8080)
const publicDirectory = join(process.cwd(), 'dist')
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
  const requestedPath = normalize(join(publicDirectory, pathname))
  const safePath = requestedPath.startsWith(publicDirectory) ? requestedPath : publicDirectory
  const filePath = existsSync(safePath) && statSync(safePath).isFile()
    ? safePath
    : join(publicDirectory, 'index.html')

  response.setHeader('Content-Type', contentTypes[extname(filePath)] || 'application/octet-stream')
  createReadStream(filePath).on('error', () => {
    response.statusCode = 500
    response.end('No se pudo cargar la aplicación.')
  }).pipe(response)
}).listen(port, '0.0.0.0', () => {
  console.log(`Multiverse Explorer escuchando en el puerto ${port}`)
})
