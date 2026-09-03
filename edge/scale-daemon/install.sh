#!/bin/bash
# install.sh
# Generates a systemd unit file for the scale-daemon and enables it.

set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

DAEMON_DIR="$(pwd)"
UNIT_FILE_PATH="/etc/systemd/system/scale-daemon.service"
USER_NAME="$(logname)"

# Ensure we're in the right directory
if [ ! -f "$DAEMON_DIR/package.json" ]; then
    echo "Error: package.json not found. Please run this script from the scale-daemon directory."
    exit 1
fi

# Build project if not built
echo "Building project..."
sudo -u "$USER_NAME" npm install
sudo -u "$USER_NAME" npm run build

echo "Creating systemd unit file at $UNIT_FILE_PATH..."

cat <<EOF > "$UNIT_FILE_PATH"
[Unit]
Description=Scale Daemon for Nexora ScanGo
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$DAEMON_DIR
ExecStart=/usr/bin/node $DAEMON_DIR/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd daemon..."
systemctl daemon-reload

echo "Enabling scale-daemon.service..."
systemctl enable scale-daemon.service

echo "Starting scale-daemon.service..."
systemctl start scale-daemon.service

echo "Installation complete. You can check the status with:"
echo "systemctl status scale-daemon.service"
