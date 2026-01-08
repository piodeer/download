export const config = { 
  runtime: 'edge'
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const file = (url.searchParams.get('file') || '').trim();
  const debug = url.searchParams.get('debug') === 'true';
  
  // Clean up filename
  const cleanFileName = file.replace(/^\/+/, '');
  const baseFileName = cleanFileName ? cleanFileName.split('/').pop() || cleanFileName : '';
  const baseWithoutExt = baseFileName.replace(/\.[^/.]+$/, '');
  
  // Determine image URL based on file parameter
  let imageUrl = 'https://raw.githubusercontent.com/piodeer/LinkTree/main/media/logo.jpg'; // Default fallback
  
  if (file && baseWithoutExt) {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      // Full URL provided
      imageUrl = file.replace(/\.[^/.]+$/, '.jpg');
    } else {
      // Local file - use GitHub media folder
      imageUrl = `https://raw.githubusercontent.com/piodeer/LinkTree/main/media/${baseWithoutExt}.jpg`;
    }
  }
  
  const title = baseFileName ? `${baseFileName} - Download` : '3D Model Download - piodeer';
  const description = baseFileName ? `Download ${baseFileName} - 3D Model` : 'Preview and download your 3D model.';
  const currentUrl = url.toString();

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="icon" type="image/png" href="https://raw.githubusercontent.com/piodeer/LinkTree/392c8bf5eb91d04289f23203c18cde1a75bd345f/media/logo.png">
<!-- Open Graph Meta Tags - Set server-side for Instagram -->
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">
<meta property="og:url" content="${escapeHtml(currentUrl)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">
</head>
<body>
${debug ? `
<div style="padding: 20px; font-family: Arial; background: #f0f0f0;">
  <h2>Debug Mode - Meta Tags Preview</h2>
  <p><strong>File:</strong> ${escapeHtml(file || 'none')}</p>
  <p><strong>Image URL:</strong> ${escapeHtml(imageUrl)}</p>
  <p><strong>Title:</strong> ${escapeHtml(title)}</p>
  <hr>
  <p><a href="/index.html${file ? '?file=' + encodeURIComponent(file) : ''}">Go to main page</a></p>
</div>
` : `
<script>
// Small delay to ensure meta tags are read by crawlers
setTimeout(function() {
  const file = ${JSON.stringify(file)};
  if (file) {
    window.location.href = '/index.html?file=' + encodeURIComponent(file);
  } else {
    window.location.href = '/index.html';
  }
}, 100);
</script>
<noscript>
<p>Redirecting...</p>
<p>If you are not redirected, <a href="/index.html${file ? '?file=' + encodeURIComponent(file) : ''}">click here</a>.</p>
</noscript>
`}
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300'
    }
  });
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

