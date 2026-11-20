# @sekrd/mcp-server

Sekrd is an MCP server that runs a security scan on a URL from Cursor, Claude Desktop, Claude Code, and other AI IDEs. It returns a score, a SHIP or BLOCK verdict, findings, and copy-paste fix prompts. The project homepage is [https://sekrd.com](https://sekrd.com).

## Install

```bash
npx -y @sekrd/mcp-server
```

## Environment variables

| Variable | Required | Secret | Description |
| --- | --- | --- | --- |
| `SEKRD_API_KEY` | No | Yes | Bearer token sent as `Authorization`. Leave it unset for the free monthly allowance (10 scans, limited by IP). Set it for Pre-Launch Audit ($39 one-time) or Continuous Pro ($24–$29/mo). Get a key at [sekrd.com/dashboard/settings](https://sekrd.com/dashboard/settings). |
| `SEKRD_API_BASE` | No | No | API base URL. Defaults to `https://api.sekrd.com/api/v1`. Set this only to point the server at another Sekrd API. |

```bash
SEKRD_API_KEY=your_key npx -y @sekrd/mcp-server
```

## Setup

### Cursor

Add to `.cursor/mcp.json` (or use the repo-root [`.mcp.json`](.mcp.json), which is the same command):

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

### Claude Code

```bash
claude mcp add sekrd -e SEKRD_API_KEY=your_key -- npx -y @sekrd/mcp-server
```

Without a key:

```bash
claude mcp add sekrd -- npx -y @sekrd/mcp-server
```

## Tools

| Tool | Description |
| --- | --- |
| `scan_url` | Run a full security scan on a URL. Returns score, verdict (SHIP/BLOCK), findings, and fix prompts. Takes 10–30 seconds. Argument: `url` (string, required). |
| `get_scan` | Get results of a previous scan by its ID. Argument: `scan_id` (string, required). |
| `list_findings` | List findings that include copy-paste fix prompts for Cursor, Lovable, and Claude Code. Argument: `scan_id` (string, required). |

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

## License

MIT. See [LICENSE](LICENSE).
