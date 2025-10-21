# Publishing the API via Cloudflare Tunnel

This guide explains how to expose the Express service over HTTPS using Cloudflare Tunnel without opening the Firebird port (3050) or the Express port to the public internet.

## Prerequisites
- A Cloudflare account with Zero Trust enabled (free plan works).
- Your domain (e.g., `livetextweb.example`) managed by Cloudflare DNS.
- Access to the server that hosts the API. In the example below the service listens on `http://127.0.0.1:44933`.

## Steps

1. **Install `cloudflared`:**
   - **Windows:** Download the installer from <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/> and install it. Verify with `cloudflared --version` in PowerShell.
   - **Linux (Debian/Ubuntu):**
     ```bash
     curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
     sudo dpkg -i cloudflared.deb
     cloudflared --version
     ```

2. **Authenticate `cloudflared`:**
   ```bash
   cloudflared tunnel login
   ```
   The command prints a URL. Open it in a browser logged into Cloudflare, choose the domain, and approve the certificate download.

3. **Create the tunnel:**
   ```bash
   cloudflared tunnel create livetextweb-tunnel
   ```
   Note the UUID that Cloudflare assigns and the credentials file path (e.g., `~/.cloudflared/<UUID>.json`).

4. **Write the configuration file** at `~/.cloudflared/config.yml` (Linux) or `%USERPROFILE%\.cloudflared\config.yml` (Windows):
   ```yaml
   tunnel: <UUID-from-step-3>
   credentials-file: C:\\Users\\<YourUser>\\.cloudflared\\<UUID>.json

   ingress:
     - hostname: livetextweb.example
       service: http://127.0.0.1:44933
     - service: http_status:404
   ```
   Replace the hostname and credentials path with your actual values. On Linux use the Unix-style path `/root/.cloudflared/<UUID>.json`.

5. **Create the DNS record** automatically:
   ```bash
   cloudflared tunnel route dns livetextweb-tunnel livetextweb.example
   ```
   Cloudflare adds a CNAME that maps your hostname to the tunnel.

6. **Test the tunnel in the foreground:**
   ```bash
   cloudflared tunnel run livetextweb-tunnel
   ```
   Visit `https://livetextweb.example` and confirm the API responds. Stop the process with `Ctrl+C` when finished.

7. **Install the tunnel as a service:**
   - **Windows:**
     ```powershell
     cloudflared service install <UUID>
     ```
     If you see `cloudflared service is already installed`, either reuse the existing service by updating `%USERPROFILE%\.cloudflared\config.yml`, or remove it first with `cloudflared service uninstall` and rerun the install command.
   - **Linux (systemd):**
     ```bash
     sudo cloudflared service install
     sudo systemctl enable --now cloudflared
     ```

8. **Verify the service status:**
   - **Windows:** `Get-Service cloudflared` in PowerShell.
   - **Linux:** `systemctl status cloudflared` or `journalctl -u cloudflared`.

## Troubleshooting Tips
- Ensure the local service is reachable on `http://127.0.0.1:44933` before testing the tunnel.
- If the domain does not resolve, confirm the DNS record exists in the Cloudflare dashboard and that your registrar uses Cloudflare nameservers.
- Use `cloudflared tunnel list` to confirm the tunnel UUID and its status.
- Logs are stored under `%USERPROFILE%\.cloudflared\logs\` on Windows and `/var/log/cloudflared.log` on Linux when running as a service.

With these steps your Express API stays private while Cloudflare Tunnel provides public HTTPS access.
