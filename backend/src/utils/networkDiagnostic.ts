import dns from 'node:dns';
import https from 'node:https';
import net from 'node:net';

// 1. Permanently configure IPv4 prioritization across this Node.js process.
// Resolves the common macOS / cellular dual-stack issue where verbatim IPv6 (AAAA)
// DNS lookups stall or return unroutable IPv6 addresses.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// 2. Resilient Public DNS Fallback Resolvers (Google Public DNS & Cloudflare DNS)
const PUBLIC_DNS_SERVERS = ['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1'];
const fallbackResolver = new dns.promises.Resolver();
fallbackResolver.setServers(PUBLIC_DNS_SERVERS);

interface DnsCacheEntry {
  address: string;
  family: number;
  timestamp: number;
}

const dnsCache = new Map<string, DnsCacheEntry>();
const DNS_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Resilient DNS lookup callback function for https.Agent / http.Agent.
 * 1. Tries OS system lookup (dns.lookup).
 * 2. On ENOTFOUND / EAI_AGAIN / timeout, falls back to public DNS resolver via c-ares (resolve4).
 * 3. Caches resolved entries to survive transient network drops.
 */
export function resilientLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void
): void {
  // If hostname is already an IP address, return immediately
  const ipVersion = net.isIP(hostname);
  if (ipVersion !== 0) {
    if (typeof options === 'object' && options.all) {
      return callback(null, [{ address: hostname, family: ipVersion }]);
    }
    return callback(null, hostname, ipVersion);
  }

  // Check cache first
  const cached = dnsCache.get(hostname);
  const now = Date.now();
  if (cached && now - cached.timestamp < DNS_CACHE_TTL_MS) {
    if (typeof options === 'object' && options.all) {
      return callback(null, [{ address: cached.address, family: cached.family }]);
    }
    return callback(null, cached.address, cached.family);
  }

  // 1. Attempt standard OS DNS lookup
  dns.lookup(hostname, options, async (err, address, family) => {
    if (!err && address) {
      if (typeof address === 'string') {
        dnsCache.set(hostname, { address, family: family || 4, timestamp: now });
      }
      return callback(null, address, family);
    }

    // 2. If OS lookup failed (e.g. ENOTFOUND, EAI_AGAIN, sandbox isolation), attempt fallback
    try {
      const addresses = await fallbackResolver.resolve4(hostname);
      if (addresses && addresses.length > 0) {
        const resolvedIp = addresses[0];
        dnsCache.set(hostname, { address: resolvedIp, family: 4, timestamp: now });
        console.warn(
          `[ResilientDNS] System lookup failed for "${hostname}" (${err?.code || 'ERROR'}). Successfully resolved via fallback public DNS to ${resolvedIp}`
        );

        if (typeof options === 'object' && options.all) {
          return callback(null, [{ address: resolvedIp, family: 4 }]);
        }
        return callback(null, resolvedIp, 4);
      }
    } catch {
      // Both OS and fallback failed
    }

    // If cache has an entry, use it as last resort
    if (cached) {
      console.warn(`[ResilientDNS] Using cached entry for "${hostname}" due to DNS resolution failure`);
      if (typeof options === 'object' && options.all) {
        return callback(null, [{ address: cached.address, family: cached.family }]);
      }
      return callback(null, cached.address, cached.family);
    }

    return callback(err || new Error(`ENOTFOUND ${hostname}`), '', 4);
  });
}

/**
 * Shared Resilient HTTPS Agent configured for outbound API communication.
 */
export const resilientHttpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  lookup: resilientLookup,
  timeout: 10000,
});

export interface DiagnosticResult {
  host: string;
  timestamp: string;
  ipv4Preference: boolean;
  systemDns: { success: boolean; ip?: string; error?: string; latencyMs: number };
  fallbackDns: { success: boolean; ip?: string; error?: string; latencyMs: number };
  httpsReachability: { success: boolean; statusCode?: number; error?: string; latencyMs: number };
  ready: boolean;
}

/**
 * Runs a startup connectivity diagnostic against oauth2.googleapis.com.
 * Logs clear status without crashing the process.
 */
export async function diagnoseGoogleOAuthConnectivity(
  targetHost: string = 'oauth2.googleapis.com'
): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    host: targetHost,
    timestamp: new Date().toISOString(),
    ipv4Preference: typeof dns.getDefaultResultOrder === 'function' ? dns.getDefaultResultOrder() === 'ipv4first' : false,
    systemDns: { success: false, latencyMs: 0 },
    fallbackDns: { success: false, latencyMs: 0 },
    httpsReachability: { success: false, latencyMs: 0 },
    ready: false,
  };

  // 1. Test System DNS Lookup
  const sysStart = Date.now();
  try {
    const sysLookup = await new Promise<{ address: string; family: number }>((resolve, reject) => {
      dns.lookup(targetHost, { family: 4 }, (err, address, family) => {
        if (err) reject(err);
        else resolve({ address, family });
      });
    });
    result.systemDns = {
      success: true,
      ip: sysLookup.address,
      latencyMs: Date.now() - sysStart,
    };
  } catch (err: any) {
    result.systemDns = {
      success: false,
      error: err.code || err.message,
      latencyMs: Date.now() - sysStart,
    };
  }

  // 2. Test Fallback Public DNS Resolution
  const fbStart = Date.now();
  try {
    const fbIps = await fallbackResolver.resolve4(targetHost);
    result.fallbackDns = {
      success: true,
      ip: fbIps[0],
      latencyMs: Date.now() - fbStart,
    };
  } catch (err: any) {
    result.fallbackDns = {
      success: false,
      error: err.code || err.message,
      latencyMs: Date.now() - fbStart,
    };
  }

  // 3. Test HTTPS Reachability (TLS Handshake & HTTP Connection)
  const httpsStart = Date.now();
  try {
    const statusCode = await new Promise<number>((resolve, reject) => {
      const req = https.request(
        `https://${targetHost}`,
        {
          method: 'HEAD',
          agent: resilientHttpsAgent,
          timeout: 5000,
        },
        (res) => {
          resolve(res.statusCode || 200);
          res.resume();
        }
      );

      req.on('timeout', () => {
        req.destroy(new Error('HTTPS connection timed out after 5000ms'));
      });
      req.on('error', (err) => reject(err));
      req.end();
    });

    result.httpsReachability = {
      success: true,
      statusCode,
      latencyMs: Date.now() - httpsStart,
    };
  } catch (err: any) {
    result.httpsReachability = {
      success: false,
      error: err.code || err.message,
      latencyMs: Date.now() - httpsStart,
    };
  }

  result.ready = (result.systemDns.success || result.fallbackDns.success) && result.httpsReachability.success;

  // Print Clear Structured Log
  console.log('\n[CONNECTIVITY DIAGNOSTIC] ========================================');
  console.log(`[CONNECTIVITY DIAGNOSTIC] Target: https://${targetHost}`);
  console.log(`[CONNECTIVITY DIAGNOSTIC] DNS Mode: ipv4first (active)`);

  if (result.systemDns.success) {
    console.log(`[CONNECTIVITY DIAGNOSTIC] ✓ System DNS: resolved -> ${result.systemDns.ip} (${result.systemDns.latencyMs}ms)`);
  } else {
    console.warn(`[CONNECTIVITY DIAGNOSTIC] ⚠ System DNS: failed (${result.systemDns.error})`);
  }

  if (result.fallbackDns.success) {
    console.log(`[CONNECTIVITY DIAGNOSTIC] ✓ Fallback Public DNS (8.8.8.8, 1.1.1.1): resolved -> ${result.fallbackDns.ip} (${result.fallbackDns.latencyMs}ms)`);
  } else {
    console.warn(`[CONNECTIVITY DIAGNOSTIC] ⚠ Fallback DNS: failed (${result.fallbackDns.error})`);
  }

  if (result.httpsReachability.success) {
    console.log(`[CONNECTIVITY DIAGNOSTIC] ✓ HTTPS Reachability: connected (Status ${result.httpsReachability.statusCode}, TLS handshake ok in ${result.httpsReachability.latencyMs}ms)`);
  } else {
    console.error(`[CONNECTIVITY DIAGNOSTIC] ✗ HTTPS Reachability: failed (${result.httpsReachability.error})`);
  }

  if (result.ready) {
    console.log(`[CONNECTIVITY DIAGNOSTIC] ✓ Google OAuth endpoint is operational and reachable.`);
  } else {
    console.warn(`[CONNECTIVITY DIAGNOSTIC] ⚠ Outbound connectivity degraded. OAuth token exchanges may fail until internet connectivity is restored.`);
    console.warn(`[CONNECTIVITY DIAGNOSTIC] ℹ Note: Local email/password login (admin@zimor.com) remains operational.`);
  }
  console.log('[CONNECTIVITY DIAGNOSTIC] ========================================\n');

  return result;
}

// If invoked directly from CLI (e.g. tsx src/utils/networkDiagnostic.ts)
if (process.argv[1]?.endsWith('networkDiagnostic.ts') || process.argv[1]?.endsWith('networkDiagnostic.js')) {
  diagnoseGoogleOAuthConnectivity().then((res) => {
    process.exit(res.ready ? 0 : 1);
  });
}
