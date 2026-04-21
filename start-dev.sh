#!/bin/bash
# Antigravity Dev Server Startup Script
# Uses Node.js v22 (required for Next.js 15 compatibility)

export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

echo "🔷 Node.js version: $(node --version)"
echo "🚀 Starting Antigravity on http://localhost:3000"

npm run dev
