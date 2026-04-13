# @sekrd/mcp-server

MCP server for [Sekrd](https://sekrd.com) — deep security audit for AI-built apps. Run security scans directly from Cursor, Claude Code, and other AI IDEs.

## Quick Start

```bash
npx -y @sekrd/mcp-server
```

## Setup

### Claude Code

```bash
claude mcp add sekrd -- npx -y @sekrd/mcp-server
```

With API key (paid plans, unlimited scans):

```bash
claude mcp add sekrd -e SEKRD_API_KEY=your_key -- npx -y @sekrd/mcp-server
```

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

## API Key

- **Without key**: 10 free scans per month (IP rate limit)
- **With key**: Unlimited scans on Scan ($9 one-time) or Pro ($29/mo) plans

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
