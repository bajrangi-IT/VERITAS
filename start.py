"""
VERITAS AI - Universal 1-Click Launch & Deployment Runner
Executes local initialization, verifies frontend bundle, starts FastAPI, and launches browser.
Usage: python start.py
"""

import sys
import os
import subprocess
import webbrowser
import time

def main():
    print("=" * 70)
    print("  VERITAS AI — Autonomous Multi-Agent Research Platform")
    print("  PromptWars PS03 | 1-Click Execution Runner")
    print("=" * 70)

    # 1. Ensure working directory is repo root
    repo_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(repo_root)

    # 2. Check frontend build
    frontend_dist = os.path.join(repo_root, "frontend", "dist")
    if not os.path.exists(frontend_dist) or not os.path.exists(os.path.join(frontend_dist, "index.html")):
        print("\n[+] Production frontend build not found. Building UI assets...")
        try:
            subprocess.run(["npm", "--prefix", "frontend", "run", "build"], check=True)
            print("[✓] Frontend compiled successfully.")
        except Exception as e:
            print(f"[!] Warning: Frontend compilation skipped ({str(e)}). Running in API-only mode.")

    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    url = f"http://{host}:{port}"

    print(f"\n[+] Starting VERITAS AI service on {url}...")
    print(f"[+] Health Endpoint: {url}/api/health")
    print(f"[+] API Documentation: {url}/docs")
    print(f"[+] User Interface: {url}/\n")

    # Open browser automatically after slight delay
    def open_browser():
        time.sleep(1.5)
        webbrowser.open(url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    # Launch uvicorn
    try:
        import uvicorn
        uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
    except KeyboardInterrupt:
        print("\n[✓] VERITAS AI platform stopped cleanly.")
    except Exception as e:
        print(f"\n[!] Failed to start Uvicorn: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
