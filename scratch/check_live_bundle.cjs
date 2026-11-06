async function check() {
  const res = await fetch('https://unihopefoundation.org');
  const html = await res.text();
  const scriptMatches = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
  console.log('Found scripts:', scriptMatches.length);
  for (const src of scriptMatches) {
    const sRes = await fetch('https://unihopefoundation.org' + src);
    const code = await sRes.text();
    if (code.includes('convex.cloud')) {
      const match = code.match(/https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.convex\.cloud/);
      console.log('Found Convex URL in bundle', src, ':', match ? match[0] : 'not parsed');
    }
    if (code.includes('brave-firefly-526')) {
      console.log('Found brave-firefly-526 in bundle:', src);
    }
  }
}
check().catch(console.error);

