export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    return;
  }

  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')]
    .concat(
      rows.map((row) => keys.map((k) => {
        const val = row[k] == null ? '' : String(row[k]);
        // escape double quotes
        return `"${val.replace(/"/g, '""')}"`;
      }).join(','))
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default exportToCsv;
