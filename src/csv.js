const normalize = value => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');

// Read quoted commas, escaped quotes, multiline cells and both common line endings.
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false, closed = false;
  text = text.replace(/^\uFEFF/, '');
  const pushRow = () => { row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = ''; closed = false; };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = false; closed = true; }
      } else cell += char;
    } else if (char === ',') { row.push(cell); cell = ''; closed = false; }
    else if (char === '\n' || char === '\r') { if (char === '\r' && text[i + 1] === '\n') i++; pushRow(); }
    else if (char === '"' && !cell && !closed) quoted = true;
    else if (closed || char === '"') throw Error('CSV sai định dạng dấu ngoặc kép. Hãy xuất lại dưới dạng CSV UTF-8.');
    else cell += char;
  }
  if (quoted) throw Error('CSV có ô chưa đóng dấu ngoặc kép.');
  pushRow();
  return rows;
}

export function prepareCsv(text, existing = []) {
  const [header, ...rows] = parseCsv(text);
  if (!header) throw Error('File CSV trống.');
  const columns = ['Dấu thời gian', 'Họ và Tên', 'Ban', 'Giới tính'].map(label => {
    const matches = header.map((value, index) => normalize(value) === normalize(label) ? index : -1).filter(index => index >= 0);
    if (matches.length !== 1) throw Error('CSV cần đúng một cột “' + label + '”.');
    return matches[0];
  });
  if (!rows.length) throw Error('CSV chưa có người tham gia.');
  const seen = new Set(existing.map(person => person.csvKey).filter(Boolean));
  const participants = [], errors = [];
  let duplicates = 0;
  rows.forEach((row, index) => {
    if (row.length !== header.length) { errors.push(`Bản ghi ${index + 1}: số cột không khớp tiêu đề.`); return; }
    const [registeredAt, name, department, rawGender] = columns.map(column => row[column].trim().normalize('NFC'));
    const gender = normalize(rawGender) === 'nam' ? 'male' : normalize(rawGender) === 'nữ' ? 'female' : null;
    if (!name || !gender) { errors.push(`Bản ghi ${index + 1}: ${!name ? 'thiếu họ tên' : 'giới tính phải là Nam hoặc Nữ'}.`); return; }
    const csvKey = JSON.stringify([registeredAt, normalize(name), normalize(department), gender]);
    if (seen.has(csvKey)) { duplicates++; return; }
    seen.add(csvKey);
    participants.push({ name, gender, department, registeredAt, csvKey });
  });
  return { participants, errors, duplicates, total: rows.length };
}
