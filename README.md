# @sekrd/mcp-server

MCP server for [Sekrd](https://sekrd.com) — deep security audit for AI-built apps. Run security scans directly from Cursor, Claude Code, and other AI IDEs.

## Install

```bash
npx -y @sekrd/mcp-server
```

The server reads one environment variable, `SEKRD_API_KEY`. It is optional: leave it unset for the free monthly allowance, or set it for paid plans (unlimited scans). The process starts either way.

```bash
SEKRD_API_KEY=your_key npx -y @sekrd/mcp-server
```

## Setup

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sekrd": {
      "command": "npx",
      "args": ["-y", "@sekrd/mcp-server"],
      "env": {
        "SEKRD_API_KEY": "your_key_here"
      }
    }
  }
}
```

Omit the `env` block to use the free monthly allowance.

### Claude Code

```bash
claude mcp add sekrd -e SEKRD_API_KEY=your_key -- npx -y @sekrd/mcp-server
```

Without a key:

```bash
claude mcp add sekrd -- npx -y @sekrd/mcp-server
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sekrd": {
      "command": "npx",
      "args": ["-y", "@sekrd/mcp-server"],
      "env": {
        "SEKRD_API_KEY": "your_key_here"
      }
    }
  }
}
```

## Install from source

Use this when you want to run a local checkout instead of the published package.

```bash
git clone https://github.com/sekrdcom/sekrd-mcp-ts.git
cd sekrd-mcp-ts
npm install
npm run build
```

`npm run build` compiles `src/index.ts` to `dist/index.js`. Point your MCP client at that file with Node, and pass `SEKRD_API_KEY` the same way as above. Replace `/absolute/path/to/sekrd-mcp-ts` with the directory you cloned.

```bash
claude mcp add sekrd -e SEKRD_API_KEY=your_key -- node /absolute/path/to/sekrd-mcp-ts/dist/index.js
```

```json
{
  "mcpServers": {
    "sekrd": {
      "command": "node",
      "args": ["/absolute/path/to/sekrd-mcp-ts/dist/index.js"],
      "env": {
        "SEKRD_API_KEY": "your_key_here"
      }
    }
  }
}
```

## API Key

- **Without key**: 10 free scans per month (IP rate limit)
- **With key**: Unlimited scans on Pre-Launch Audit ($39 one-time) or Continuous Pro ($24-$29/mo) plans

Get your key at [sekrd.com/dashboard/settings](https://sekrd.com/dashboard/settings).

## Tools

| Tool | Description |
|------|-------------|
| `scan_url(url)` | Full security scan. Returns score, verdict (SHIP/BLOCK), findings + fix prompts. |
| `get_scan(scan_id)` | Get results of a previous scan. |
| `list_findings(scan_id)` | Get only findings with fix prompts for your IDE. |

## Example

```
You: Scan https://my-app.vercel.app for security issues

Sekrd: Score 34/100 — BLOCK
3 critical, 5 high, 2 medium findings

1. [CRITICAL] Stripe live secret key exposed in client bundle
   Fix: Move 'sk_live_...' to .env file and use NEXT_PUBLIC_ prefix only for public keys

2. [CRITICAL] Supabase RLS policy USING(true) on users table  
   Fix: Replace with USING(auth.uid() = user_id)
```

## License

MIT
