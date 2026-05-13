/**
 * 心声树洞 AI 倾听引擎
 * 基于关键词和情绪识别的情感回应系统
 */
const moods = [
  { key: 'happy', label: '开心', icon: '😊', color: '#f6c23e' },
  { key: 'sad', label: '难过', icon: '😢', color: '#6c8ebf' },
  { key: 'worried', label: '焦虑', icon: '😰', color: '#e8a87c' },
  { key: 'angry', label: '生气', icon: '😤', color: '#e06c6c' },
  { key: 'calm', label: '平静', icon: '😌', color: '#7ec8a0' },
  { key: 'confused', label: '迷茫', icon: '😶', color: '#b0a8b9' },
  { key: 'grateful', label: '感恩', icon: '🙏', color: '#f2b88c' },
  { key: 'other', label: '其他', icon: '💭', color: '#999' },
];

// Emotion keyword patterns
const emotionPatterns = {
  happy: ['开心', '高兴', '快乐', '幸福', '太好了', '哈哈', '笑', '惊喜', '成功', '通过', '拿到', 'offer', '收获', '满足', '满足感', '兴奋', '庆祝'],
  sad: ['难过', '伤心', '哭', '悲伤', '失落', '低落', '失败', '没考好', '分手', '失去', '遗憾', '痛苦', '难受', '心碎', '糟糕', '绝望', '孤独'],
  worried: ['焦虑', '担心', '紧张', '害怕', '不安', '压力', '失眠', '烦恼', '烦', '怎么办', '不确定', '未来', '迷茫方向'],
  angry: ['生气', '愤怒', '讨厌', '恨', '烦人', '过分', '不公', '凭什么', '受不了', '恶心', '无语', '气死'],
  calm: ['平静', '安静', '放松', '舒服', '治愈', '美好', '星星', '月光', '风', '花', '温暖', '安详', '惬意', '宁静'],
  confused: ['迷茫', '不知道', '困惑', '迷惑', '迷路', '方向', '选择', '怎么办才好', '犹豫', '徘徊'],
  grateful: ['感谢', '谢谢', '感恩', '感激', '珍惜', '有幸', '帮忙', '善良', '好心', '温暖的人', '帮助'],
};

function detectMood(text) {
  let bestMood = 'other';
  let bestScore = 0;
  for (const [mood, keywords] of Object.entries(emotionPatterns)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMood = mood;
    }
  }
  return bestMood;
}

// Response templates by emotion
const responses = {
  happy: [
    '看到你分享的喜悦，我也为你感到开心！✨ 记得把这份快乐保存起来，在低落时拿出来温暖自己。',
    '太棒了！你的努力得到了回报。好好享受这一刻吧，你值得所有的掌声。👏',
    '真为你高兴！每一个小成就都是通往更好自己的阶梯。继续保持这份热情吧～',
    '这份喜悦会是你前行路上的光。记得感谢那个没有放弃的自己。🌟',
  ],
  sad: [
    '你的感受是真实的，也是重要的。难过没关系，允许自己停下来歇一歇。🫂',
    '我听到了你的失落。人生总有高低起伏，此刻的低谷不会定义你是谁。',
    '想哭就哭吧，不用强撑。每一次释放都是在为明天的自己积蓄力量。💙',
    '辛苦了。你比想象中更坚强。如果今天很难，那就先好好休息，明天再说。',
  ],
  worried: [
    '焦虑是大脑在对你说"我在乎"。深呼吸，把注意力拉回到当下这一秒。🌿',
    '很多我们担心的事，回头看时发现并不是那么可怕。试着把焦虑写下来，它就会被看见、被接纳。',
    '压力大的时候，试试"只做下一步"——不用想太远，把眼前的一小步走好就够了。',
  ],
  angry: [
    '愤怒是边界被触动的信号。你的感受是合理的，但别让情绪控制你的行动。',
    '生气的时候，先深呼吸三次，再做决定。你是情绪的主人，不是奴隶。',
  ],
  calm: [
    '好美的画面。这样的时刻值得被记住——生活不只是奔跑，还有停下来感受的能力。🌙',
    '能够感受平静本身就是一种幸福。愿你拥有更多这样的时刻。',
  ],
  confused: [
    '迷茫是成长的开始。不知道方向的时候，先做好手边的小事，答案会在路上出现。',
    '每个人都有自己的节奏。不必和别人比较，你正在以自己的方式前进。',
  ],
  grateful: [
    '被你温暖到了。保持感恩的心，世界也会温柔待你。💝',
    '懂得感恩的人，心里住着太阳。谢谢你愿意分享这份温暖。',
  ],
  other: [
    '谢谢你愿意在这里分享。每一份心声都值得被倾听，每一段故事都有它的意义。💚',
    '我在这里，听你说。不用修饰，不用隐藏，真实的你就是最好的你。',
    '生活有时很复杂，但倾诉能让它变得简单一些。谢谢你的信任。🍃',
    '有些话说出来，本身就很有力量。你的声音，我听到了。',
  ],
};

function respond(text) {
  const mood = detectMood(text);
  const pool = responses[mood] || responses.other;
  const reply = pool[Math.floor(Math.random() * pool.length)];

  return {
    mood,
    reply,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { respond, moods, detectMood };
