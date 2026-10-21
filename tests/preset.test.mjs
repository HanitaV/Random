import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveEventPair, commit, recoverSpin} from '../src/engine.js';

const fixture = mode => ({participants: [
  {id: 'm1', gender: 'male', isPreview: true}, {id: 'm2', gender: 'male', isPreview: true},
  {id: 'f1', gender: 'female', isPreview: true}, {id: 'f2', gender: 'female', isPreview: true}
], results: [], forcedPairs: {m1: 'f2'}, settings: {mode}, pendingSpin: null});

test('public Preset draws only configured valid pairs, retaining exact assignment', () => {
  const data = fixture('preset');
  for (let i = 0; i < 30; i++) {
    const pair = resolveEventPair(data);
    assert.equal(pair.male.id, 'm1');
    assert.equal(pair.winner.id, 'f2');
    assert.equal(pair.mode, 'preset');
  }
});
test('Mixed completes assigned and unassigned pairs without stealing a reserved female', () => {
  for (let i = 0; i < 30; i++) {
    let data = fixture('mixed');
    const found = {};
    for (let j = 0; j < 2; j++) {
      const pair = resolveEventPair(data);
      found[pair.male.id] = pair.winner.id;
      data = commit(data, {spinId: `${i}-${j}`, maleId: pair.male.id, selectedFemaleId: pair.winner.id, mode: pair.mode});
    }
    assert.deepEqual(found, {m1: 'f2', m2: 'f1'});
    assert.throws(() => resolveEventPair(data));
  }
});
test('Preset fails clearly with no assignments or an exhausted assigned partner', () => {
  const data = fixture('preset');
  data.forcedPairs = {};
  assert.throws(() => resolveEventPair(data), /Không còn cặp thiết lập sẵn/);
  data.forcedPairs = {m1: 'f2'};
  data.results = [{maleId: 'm2', femaleId: 'f2'}];
  assert.throws(() => resolveEventPair(data), /Không còn cặp thiết lập sẵn/);
});
test('Random and explicit Preview remain random when assignments exist', () => {
  for (const [mode, options] of [['random', {}], ['preset', {previewOnly: true}]]) {
    const data = fixture(mode);
    for (let i = 0; i < 20; i++) assert.equal(resolveEventPair(data, options).mode, 'random');
  }
});
test('Preset pending spin survives setting changes and refresh with its original pair', () => {
  const data = fixture('preset');
  const pair = resolveEventPair(data);
  data.pendingSpin = {spinId: 'preset-pending', maleId: pair.male.id, selectedFemaleId: pair.winner.id, mode: pair.mode, status: 'awaiting-female'};
  data.settings.mode = 'random';
  data.forcedPairs = {m1: 'f1'};
  const waiting = recoverSpin(JSON.parse(JSON.stringify(data)));
  assert.equal(waiting.results.length, 0);
  assert.equal(waiting.pendingSpin.selectedFemaleId, 'f2');
  const complete = recoverSpin({...waiting, pendingSpin: {...waiting.pendingSpin, status: 'choosing-female'}});
  assert.equal(complete.results[0].femaleId, 'f2');
  assert.equal(complete.results[0].mode, 'preset');
});
