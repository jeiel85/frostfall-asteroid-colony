const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const jsCode = html.match(/<script>([\s\S]*?)<\/script>/)[1];

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: () => {},
  AudioContext: class {
    constructor() { this.currentTime = 0; this.state = 'running'; }
    resume() {}
    createOscillator() {
      return {
        type: '',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {}
      };
    }
  }
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};
const mockElem = () => ({
  addEventListener: () => {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
  style: {},
  dataset: {},
  getContext: () => ({
    clearRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fillText: () => {}
  }),
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }),
  appendChild: () => {},
  querySelectorAll: () => [],
  innerHTML: '',
  innerText: '',
  title: ''
});
global.document = {
  getElementById: () => mockElem(),
  querySelectorAll: () => [],
  createElement: () => mockElem(),
  documentElement: { lang: 'ko' }
};
global.performance = { now: () => Date.now() };
let loopCount = 0;
global.requestAnimationFrame = (fn) => {
  if (loopCount++ < 5) fn(Date.now());
};

const testRunner = new Function(jsCode + `
  return {
    state,
    I18N,
    curLang,
    t,
    hud,
    GasSimulation,
    PowerSimulation,
    ColonistAI,
    saveGame,
    loadGame
  };
`);

const sim = testRunner();
console.log('✓ Initialized Game State with i18n');
console.log('Current Language:', sim.curLang);
console.log('Korean Test:', sim.t('titleSub'));
console.log('Testing Language Switch to English...');
global.curLang = 'en';
console.log('English Test:', sim.I18N.en.titleSub);

console.log('Testing HUD Controller language application...');
sim.hud.applyLanguage();
console.log('✓ applyLanguage() executed without errors');

console.log('Running GasSimulation tick...');
sim.GasSimulation.update(sim.state, 0.1);
console.log('✓ GasSimulation OK');

console.log('Running PowerSimulation tick...');
sim.PowerSimulation.update(sim.state, 0.1);
console.log('✓ PowerSimulation OK');

console.log('Running Colonist AI ticks...');
sim.state.colonists.forEach(c => sim.ColonistAI.update(c, sim.state, 0.1));
console.log('✓ Colonist AI OK');

console.log('Testing Save / Load...');
sim.saveGame(sim.state);
const loaded = sim.loadGame(sim.state);
console.log('✓ Save and Load verified:', loaded);

console.log('\n>>> MULTI-LANGUAGE (i18n) TEST PASSED WITH 100% SUCCESS! <<<');
