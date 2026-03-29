// utils/export.js — Export notes as PDF or Markdown
import { format } from 'date-fns';

/**
 * Export a note as a PDF using jsPDF + html2canvas
 */
export async function exportNoteAsPDF(note) {
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    // Build a temporary div with the note content
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed; left: -9999px; top: 0;
      width: 800px; padding: 60px;
      background: white; color: #1a1714;
      font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.7;
    `;

    container.innerHTML = `
      <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;font-family:'Fraunces',serif;">${note.title || 'Untitled Note'}</h1>
      <p style="color:#a09b96;font-size:12px;margin-bottom:24px;">
        ${format(note.updatedAt, 'MMMM d, yyyy')}
        ${note.tags?.length ? ' · ' + note.tags.map(t => '#' + t).join(' ') : ''}
      </p>
      <hr style="border:none;border-top:1px solid #e8e4df;margin-bottom:24px;" />
      <div>${note.content || ''}</div>
    `;

    // Add images
    if (note.images?.length) {
      const imgSection = document.createElement('div');
      imgSection.style.marginTop = '24px';
      note.images.forEach(img => {
        const el = document.createElement('img');
        el.src = img.src;
        el.style.cssText = 'max-width:100%;margin-bottom:12px;border-radius:6px;';
        imgSection.appendChild(el);
      });
      container.appendChild(imgSection);
    }

    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgH  = pageW / ratio;

    let posY = 0;
    if (imgH <= pageH) {
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
    } else {
      // Multi-page
      let remaining = imgH;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, posY, pageW, imgH);
        remaining -= pageH;
        posY -= pageH;
        if (remaining > 0) pdf.addPage();
      }
    }

    const filename = (note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Check console for details.');
  }
}

/**
 * Export a note as Markdown
 */
export function exportNoteAsMarkdown(note) {
  // Convert basic HTML to markdown
  function htmlToMd(html) {
    return (html || '')
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const lines = [
    `# ${note.title || 'Untitled Note'}`,
    '',
    `> Created: ${format(note.createdAt, 'yyyy-MM-dd')} | Updated: ${format(note.updatedAt, 'yyyy-MM-dd')}`,
    note.tags?.length ? `> Tags: ${note.tags.map(t => '#' + t).join(', ')}` : '',
    '',
    '---',
    '',
    htmlToMd(note.content),
  ].filter(l => l !== null);

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${(note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
