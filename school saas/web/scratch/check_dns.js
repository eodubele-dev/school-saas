
const dns = require('dns').promises;

/**
 * Platinum DNS Diagnostic Script
 * Compares authoritative nameservers with current resolution.
 */
async function diagnoseDNS(domain = 'eduflow.ng') {
    console.log(`\n🔍 Starting Platinum DNS Diagnostic for: ${domain}\n`);

    try {
        // 1. Get Authoritative Nameservers
        console.log(`[1/4] Checking Authoritative Nameservers...`);
        const ns = await dns.resolveNs(domain);
        console.log(`✅ Nameservers Found:`);
        ns.forEach(s => console.log(`   - ${s}`));

        // 2. Get Root IP
        console.log(`\n[2/4] Checking Root Domain (@) Resolution...`);
        const rootIps = await dns.resolve4(domain);
        console.log(`✅ Root Resolves to: ${rootIps.join(', ')}`);

        // 3. Check Wildcard / Subdomain
        const testSubdomain = `ristmas.${domain}`;
        console.log(`\n[3/4] Checking Subdomain Resolution: ${testSubdomain}...`);
        try {
            const subIps = await dns.resolve4(testSubdomain);
            console.log(`✅ Subdomain Resolves to: ${subIps.join(', ')}`);
        } catch (e) {
            console.error(`❌ FAILED: Subdomain ${testSubdomain} does not resolve.`);
            console.log(`   Possible Reason: Wildcard record *.${domain} is missing or has not propagated.`);
        }

        // 4. Verification Check
        console.log(`\n[4/4] Cross-Verification...`);
        if (ns.some(s => s.includes('awsdns'))) {
            console.log(`✅ Authoritative DNS is held by AWS Route 53.`);
            console.log(`👉 IMPORTANT: Ensure the wildcard record is added to the SAME Route 53 Hosted Zone that owns these nameservers:`);
            console.log(`   Nameserver set: ${ns[0].split('.').slice(-2).join('.')}`);
        } else {
            console.log(`⚠️  WARNING: Authoritative DNS is NOT held by AWS.`);
            console.log(`   If you added records in AWS Route 53, they will NOT work unless you update your registrar nameservers.`);
        }

    } catch (error) {
        console.error(`\n❌ Diagnostic Error:`, error.message);
    }

    console.log(`\n🔚 Diagnostic Complete.\n`);
}

// Allow passing domain as argument
const targetDomain = process.argv[2] || 'eduflow.ng';
diagnoseDNS(targetDomain);
