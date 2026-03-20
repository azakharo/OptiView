#!/bin/bash
# Generate self-signed SSL certificates for development/testing
# Usage: ./scripts/generate-dev-certs.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$PROJECT_ROOT/nginx/ssl"

CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"

echo "=== Generating self-signed SSL certificates for development ==="
echo ""

# Create SSL directory if it doesn't exist
if [ ! -d "$SSL_DIR" ]; then
    echo "Creating SSL directory: $SSL_DIR"
    mkdir -p "$SSL_DIR"
fi

# Check if certificates already exist
if [ -f "$CERT_FILE" ] || [ -f "$KEY_FILE" ]; then
    echo "Warning: SSL certificates already exist in $SSL_DIR"
    read -p "Do you want to overwrite them? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Existing certificates preserved."
        exit 0
    fi
    echo "Backing up existing certificates..."
    [ -f "$CERT_FILE" ] && mv "$CERT_FILE" "$CERT_FILE.bak"
    [ -f "$KEY_FILE" ] && mv "$KEY_FILE" "$KEY_FILE.bak"
fi

# Generate self-signed certificate
echo "Generating new self-signed certificate (valid for 365 days)..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=US/ST=State/L=City/O=OptiView/OU=Development/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

# Set appropriate permissions
chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

echo ""
echo "=== SSL certificates generated successfully! ==="
echo "Certificate: $CERT_FILE"
echo "Private key: $KEY_FILE"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "For production, use Let's Encrypt certificates instead."
