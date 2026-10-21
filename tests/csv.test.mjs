import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {parseCsv, prepareCsv} from '../src/csv.js';
const header = 'Dấu thời gian,Họ và Tên,Ban,Giới tính\r\n';

test('actual example imports both participants with department and timestamp intact', () => {
  const directory = new URL('../example/', import.meta.url);
  const file = readdirSync(directory).find(name => name.endsWith('.csv'));
  const result = prepareCsv(readFileSync(new URL(file, directory), 'utf8'));
  assert.equal(result.participants.length, 2);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.participants.map(p => p.gender), ['male', 'female']);
  assert.equal(result.participants[0].name, 'Đỗ Văn Hải Phòng');
  assert.equal(result.participants[1].department, 'Ban Thiết kế và lập trình website');
  assert.equal(result.participants[0].registeredAt, '21/10/2026 19:09:06');
});
test('quoted commas, quotes, multiline cells, BOM and reordered headers survive parsing', () => {
  const result = prepareCsv('\ufeffGiới tính,Ban,Họ và Tên,Dấu thời gian\r\nNữ,"Ban A, B\nC","Tên ""An""",now\r\n\r\n');
  assert.equal(result.participants[0].name, 'Tên "An"');
  assert.equal(result.participants[0].department, 'Ban A, B\nC');
  assert.equal(result.participants[0].gender, 'female');
  assert.deepEqual(parseCsv('a,b\n"a,b","x""y"'), [['a','b'], ['a,b','x"y']]);
});
test('repeat imports skip the same attendance record but retain distinct people with the same name', () => {
  const row = 'now,Nguyễn An,Ban A,Nam\n';
  const first = prepareCsv(header + row + row + 'later,Nguyễn An,Ban A,Nam');
  assert.equal(first.participants.length, 2);
  assert.equal(first.duplicates, 1);
  const repeat = prepareCsv(header + row, JSON.parse(JSON.stringify(first.participants)));
  assert.equal(repeat.participants.length, 0);
  assert.equal(repeat.duplicates, 1);
});
test('invalid rows are reported without silently choosing a gender', () => {
  const result = prepareCsv(header + 'now,,Ban A,Nam\nnow,An,Ban A,Khác\nnow,An,Nam');
  assert.equal(result.errors.length, 3);
  assert.equal(result.participants.length, 0);
});
test('empty files, missing or duplicate headers and broken quoting fail clearly', () => {
  for (const text of ['', header, 'name,gender\nA,Nam', header + 'now,"An,Ban,Nam', header + 'now,"An"x,Ban,Nam', 'Họ và Tên,Họ và Tên,Ban,Giới tính,Dấu thời gian\nAn,An,A,Nam,now']) {
    assert.throws(() => prepareCsv(text));
  }
});
test('Vietnamese casing and surrounding whitespace are accepted; distinct departments remain separate', () => {
  const result = prepareCsv(header + 'now, An ,Ban A, nỮ \nnow,An,Ban B,Nữ');
  assert.equal(result.participants.length, 2);
  assert.ok(result.participants.every(p => p.gender === 'female'));
});
