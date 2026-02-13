# Static-Http-Server


Build a Static HTTP Server using Node.js that serves static files, handles directory requests, supports keep-alive connections, and implements path traversal protection.

Steps:
1. Initial Setup:

Set up a basic server using net and fs modules to handle TCP connections and serve files from the htdocs directory.

2. Directory Index Handling:

Modified the code to check if the requested path is a directory. If it is, append index.html to the path and serve the file.

3. Path Traversal Protection:

Implemented protection to prevent path traversal attacks (e.g., ../../../etc/passwd). Ensured that the requested file is inside the htdocs directory.

4. Keep-Alive Support:

Added support for persistent connections. The server keeps the connection open for multiple requests unless Connection: close is specified.

5. 404 Error Handling:

Created a custom 404 error page that is returned when a file or directory is not found.

6. Configuration via Environment Variables:

Made the server configurable using a .env file. The server reads settings like PORT, HOST, DOCUMENT_ROOT, and DEBUG from the .env file using the dotenv package.

7. Testing:

Tested the server with curl:

Basic request: curl -v http://localhost:8080/

Keep-alive: curl -v -H "Connection: keep-alive" http://localhost:8080/

Path traversal: curl http://localhost:8080/../../../etc/passwd

404 error: curl http://localhost:8080/404.html

Conclusion:

The server now supports:

Static file serving with directory index handling.

Security (path traversal protection and 404 handling).

Keep-alive connections for performance.

Configuration via environment variables.
