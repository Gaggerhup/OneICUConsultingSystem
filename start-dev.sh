#!/bin/bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
echo "🔷 Node.js version: $(node -v)"
echo "🚀 Starting Antigravity on http://localhost:3005"
npm run dev -- -p 3005
