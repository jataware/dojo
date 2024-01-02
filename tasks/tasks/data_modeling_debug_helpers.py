import os
import matplotlib.pyplot as plt
import http.server
import socketserver
import threading

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/shutdown':
            print("Shutdown request received. Server is shutting down...")
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(bytes("Server is shutting down...", "utf-8"))
            threading.Thread(target=httpd.shutdown).start()  # Shutdown in a new thread
        else:
            super().do_GET()

def plot_to_web(filename='plot.png', port=1234):
    # Save current matplotlib figure
    plt.savefig(filename)
    plt.close()
    print(f"Plot saved as {filename}")

    # Define handler and server for HTTP Server
    global httpd
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("", port), CustomHandler)

    print(f"Serving at port {port}. You can view the plot at http://localhost:{port}/{filename}")
    print(f"To shut down the server, open http://localhost:{port}/shutdown")

    # Start the server
    try:
        httpd.serve_forever()
    except Exception as e:
        print(f"Server encountered an error: {e}")
    finally:
        # Optionally remove the plot file and clean up
        os.remove(filename)
        print(f"Plot file {filename} removed")
        httpd.server_close()
        print("Server closed")

# replace plt.show with plot_to_web
plt.show = plot_to_web