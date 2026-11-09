export const GAME_CONFIG = {
  width: 800,
  height: 450,
  groundHeight: 40,
  walkSpeed: 180,
  heroX: 280,
  landmarkGap: 420,
  spawnX: 760,
  destroyX: -200,
  maxOnScreen: 4,
};

export const LANDMARKS = [
  { key: 'xing', file: 'xing.png', name: '兴记',   line: '第一次见面',   color: 0x6fa8dc , scale: 0.1 },
  { key: 'park',    name: '公园',   line: '樱花开了。',    color: 0x93c47d },
  { key: 'cafe',    name: '咖啡店', line: '闻到咖啡香了。', color: 0xb07d5a },
  { key: 'station', name: '车站',   line: '人来人往。',    color: 0x8e7cc3 },
  { key: 'river',   name: '河边',   line: '风很舒服。',    color: 0x76a5af },
  { key: 'tower',   name: '钟楼',   line: '刚好整点。',    color: 0xe06666 },
  { key: 'home',    name: '家',     line: '快到了。',      color: 0xf6b26b },
];