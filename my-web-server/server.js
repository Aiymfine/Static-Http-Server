const net = require('net');
const fs = require('fs');
const path = require('path');
const DOCUMENT_ROOT = './htdocs';  // Root directory for serving files

// MIME Type lookup object
const mimeTypes = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip'
};

// Function to get the MIME type for a file
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase(); // Extract the file extension
  return mimeTypes[ext] || 'application/octet-stream'; // Return the MIME type or default to 'application/octet-stream'
}

// Function to send 404 response
function send404(socket) {
  const body = '<html><body><h1>404 Not Found</h1><p>The page you\'re looking for doesn\'t exist.</p></body></html>';
  socket.write('HTTP/1.1 404 Not Found\r\n');
  socket.write('Content-Type: text/html\r\n');
  socket.write(`Content-Length: ${Buffer.byteLength(body)}\r\n`);
  socket.write('\r\n');  // This separates headers from body
  socket.write(body);
  socket.end();
}

// Function to check if a path is a directory and append index.html if necessary
function getIndexFilePath(requestPath) {
  const resolvedPath = path.resolve(DOCUMENT_ROOT, requestPath.replace(/^\/+/, ''));

  // Check if it's a directory
  if (fs.statSync(resolvedPath).isDirectory()) {
    return path.join(resolvedPath, 'index.html');  // Append index.html if it's a directory
  }

  return resolvedPath;
}

const server = net.createServer((socket) => {
  console.log('Client connected');
  
  socket.on('data', (data) => {
    const request = data.toString();
    const lines = request.split('\r\n');
    
    // Parse the request line
    const [method, requestPath, version] = lines[0].split(' ');

    console.log(`Requested Path: ${requestPath}`);  // Debugging line

    // Step 1: Handle requests for favicon.ico (ignore if not found)
    if (requestPath === '/favicon.ico') {
      console.log('Ignoring request for favicon.ico');
      return send404(socket);  // Return 404 for favicon if you don’t have one
    }

    // Step 2: Handle requests for /.well-known paths
    if (requestPath.startsWith('/.well-known')) {
      console.log('Ignoring request for .well-known path');
      return send404(socket);  // Send 404 response for .well-known
    }

    // Step 3: Resolve the file path relative to the DOCUMENT_ROOT
    let resolvedPath = getIndexFilePath(requestPath);  // Check if it's a directory and append index.html if necessary

    console.log('Resolved Path:', resolvedPath);  // Check resolved path

    // Step 4: Path Traversal Protection
    if (!resolvedPath.startsWith(path.resolve(DOCUMENT_ROOT))) {
      // Path traversal attempt detected
      console.log('Path traversal attempt detected!');
      return send404(socket); // Send 404 response
    }

    // Step 5: Read the requested file
    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        // If the file isn't found, send 404 Not Found
        console.log('File not found:', err);
        return send404(socket);
      }

      // Log the file content (only if the file is found)
      console.log('File Content:', data.toString());

      // Step 6: Get MIME Type based on the file extension
      const contentType = getMimeType(resolvedPath);  // Get the correct MIME type

      // Step 7: Send the headers first, then the file content
      socket.write('HTTP/1.1 200 OK\r\n');
      socket.write(`Content-Type: ${contentType}\r\n`);  // Send correct Content-Type header
      socket.write(`Content-Length: ${data.length}\r\n`);
      socket.write('\r\n');  // Empty line separates headers from body
      socket.write(data);   // Send the file contents as the response body
      socket.end();  // End the response
    });
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Server listening on 127.0.0.1:8080');
});
