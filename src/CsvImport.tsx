import {useRef, useState} from 'react';
import {Upload, Check, FileText} from 'lucide-react';
import {avatar, Data, Person} from './data';
import {prepareCsv} from './csv.js';

type Props = {data: Data; save: (data: Data) => void; notify: (message: string) => void};
export default function CsvImport({data, save, notify}: Props) {
  const [source, setSource] = useState<{name: string; text: string} | null>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const readVersion = useRef(0);
  let preview: ReturnType<typeof prepareCsv> | null = null;
  if (source) {
    try { preview = prepareCsv(source.text, data.participants); } catch { /* File errors are shown while reading. */ }
  }
  async function read(file: File) {
    const version = ++readVersion.current;
    setSource(null); setError(''); setReading(true);
    try {
      if (!file.name.toLowerCase().endsWith('.csv')) throw Error('Vui lòng chọn file .csv.');
      if (file.size > 5 * 1024 * 1024) throw Error('File CSV tối đa 5 MB.');
      const text = new TextDecoder('utf-8', {fatal: true}).decode(await file.arrayBuffer());
      prepareCsv(text, data.participants);
      if (version === readVersion.current) setSource({name: file.name, text});
    } catch (e) { if (version === readVersion.current) setError(e instanceof TypeError ? 'Không đọc được UTF-8. Hãy xuất lại file CSV UTF-8.' : (e as Error).message); }
    finally { if (version === readVersion.current) setReading(false); }
  }
  function add() {
    if (!source || data.pendingSpin) return;
    try {
      const next = prepareCsv(source.text, data.participants);
      if (next.errors.length || !next.participants.length) return;
      const added: Person[] = next.participants.map((p, i) => ({...p, gender: p.gender as Person['gender'], id: crypto.randomUUID(), image: avatar(i % 10, p.gender === 'female'), isPreview: false}));
      save({...data, participants: [...data.participants, ...added]});
      setSource(null);
      notify(`Đã nhập ${added.length} người tham gia${next.duplicates ? `, bỏ qua ${next.duplicates} bản ghi trùng` : ''}.`);
    } catch (e) { setError((e as Error).message); }
  }
  return <div className="csv-import">
    <p className="csv-intro">Nhập danh sách điểm danh từ Google Forms. Xem trước và kiểm tra thông tin trước khi thêm vào vòng quay.</p>
    <label className="csv-upload">
      <Upload size={28}/><strong>{reading ? 'Đang đọc file…' : 'Chọn file CSV điểm danh'}</strong>
      <span>CSV UTF-8, tối đa 5 MB</span>
      <input aria-label="Chọn file CSV điểm danh" type="file" accept=".csv,text/csv" disabled={reading} onChange={e => {const file = e.target.files?.[0]; if (file) void read(file); e.target.value = '';}}/>
    </label>
    <p className="fine">Các cột: Dấu thời gian, Họ và Tên, Ban, Giới tính. Giới tính nhận giá trị Nam hoặc Nữ. Ảnh đại diện được tạo tự động và có thể sửa sau.</p>
    {error && <p className="csv-error" role="alert">{error}</p>}
    {preview && source && <>
      <div className="csv-summary" aria-live="polite"><FileText size={20}/><b>{source.name}</b><span>{preview.total} bản ghi · {preview.participants.filter(p => p.gender === 'male').length} nam · {preview.participants.filter(p => p.gender === 'female').length} nữ · {preview.duplicates} trùng · {preview.errors.length} lỗi</span></div>
      {preview.errors.length > 0 && <div className="csv-error" role="alert"><b>Hãy sửa các bản ghi sau rồi chọn lại file:</b><ul>{preview.errors.map((message, i) => <li key={i}>{message}</li>)}</ul></div>}
      {preview.participants.length > 0 && <div className="csv-table-wrap"><table className="csv-table"><caption>Người tham gia mới ({preview.participants.length})</caption><thead><tr><th>Họ và tên</th><th>Ban</th><th>Giới tính</th><th>Dấu thời gian</th></tr></thead><tbody>{preview.participants.map((p, i) => <tr key={i}><td>{p.name}</td><td>{p.department || '—'}</td><td>{p.gender === 'male' ? 'Nam' : 'Nữ'}</td><td>{p.registeredAt || '—'}</td></tr>)}</tbody></table></div>}
      {!preview.participants.length && !preview.errors.length && <p role="status">Tất cả bản ghi trong file đã được nhập. Không có người mới để thêm.</p>}
      <p className="fine">Danh sách mới sẽ được thêm vào dữ liệu hiện có. Các bản ghi có cùng thời gian, họ tên, ban và giới tính chỉ được nhập một lần.</p>
      {data.pendingSpin && <p className="csv-error">Hãy hoàn tất lượt quay đang chờ trước khi nhập danh sách.</p>}
      <button className="primary" disabled={!preview.participants.length || !!preview.errors.length || !!data.pendingSpin} onClick={add}><Check size={18}/>Thêm {preview.participants.length} người tham gia</button>
    </>}
  </div>;
}
