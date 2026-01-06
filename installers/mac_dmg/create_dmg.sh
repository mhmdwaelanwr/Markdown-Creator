#!/bin/sh

# Exit on error
set -e

# Check if appdmg is installed
if ! command -v appdmg &> /dev/null; then
    echo "appdmg is not installed. Installing via npm..."
    npm install -g appdmg
fi

# Build flutter macos
echo "Building Flutter app for macOS..."
flutter build macos --release

# Create DMG
echo "Creating DMG..."

# Remove old dmg if exists
rm -f "installers/mac_dmg/Readme Creator.dmg"

# Run appdmg
# Note: appdmg.json paths are relative to the json file location
appdmg "installers/mac_dmg/appdmg.json" "installers/mac_dmg/Readme Creator.dmg"

echo "DMG created at installers/mac_dmg/Readme Creator.dmg"

