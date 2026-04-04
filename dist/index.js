#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const API_BASE = "https://api.sekrd.com/api/v1";
const POLL_INTERVAL = 3000;
const MAX_POLLS = 40;
function headers() {
    const h = { "Content-Type": "application/json" };
    const key = process.env.SEKRD_API_KEY;
    if (key)
        h["Authorization"] = `Bearer ${key}`;
    return h;
}
async function scanUrl(url) {
    const res = await fetch(`${API_BASE}/scan/url`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ url }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        return { error: err.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    const scanId = data.scan_id;
    for (let i = 0; i < MAX_POLLS; i++) {
        const poll = await fetch(`${API_BASE}/scans/${scanId}`, { headers: headers() });
        if (!poll.ok)
            return { error: `Poll failed: HTTP ${poll.status}` };
        const scan = await poll.json();
        if (["complete", "failed", "error"].includes(scan.status))
            return scan;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    }
    return { error: "Scan timed out", scan_id: scanId };
}
async function getScan(scanId) {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, { headers: headers() });
    if (!res.ok)
        return { error: `HTTP ${res.status}` };
    return res.json();
}
async function listFindings(scanId) {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, { headers: headers() });
    if (!res.ok)
        return { error: `HTTP ${res.status}` };
    const scan = await res.json();
    const findings = (scan.findings || []).filter((f) => f.fix_prompts && Object.keys(f.fix_prompts).length > 0);
    return findings;
}
const server = new Server({ name: "sekrd", version: "0.1.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "scan_url",
            description: "Run a full security scan on a URL. Returns score, verdict (SHIP/BLOCK), findings, and fix prompts. Takes 10-30 seconds.",
            inputSchema: {
                type: "object",
                properties: {
                    url: { type: "string", description: "URL to scan (e.g. https://myapp.vercel.app)" },
                },
                required: ["url"],
            },
        },
        {
            name: "get_scan",
            description: "Get results of a previous scan by its ID.",
            inputSchema: {
                type: "object",
                properties: {
                    scan_id: { type: "string", description: "Scan ID returned by scan_url" },
                },
                required: ["scan_id"],
            },
        },
        {
            name: "list_findings",
            description: "List findings with copy-paste fix prompts for Cursor, Lovable, and Claude Code.",
            inputSchema: {
                type: "object",
                properties: {
                    scan_id: { type: "string", description: "Scan ID" },
                },
                required: ["scan_id"],
            },
        },
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        switch (name) {
            case "scan_url":
                result = await scanUrl(args.url);
                break;
            case "get_scan":
                result = await getScan(args.scan_id);
                break;
            case "list_findings":
                result = await listFindings(args.scan_id);
                break;
            default:
                return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
