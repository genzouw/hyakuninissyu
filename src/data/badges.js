// バッジデータ
export const badges = [
  {
    id: 'beginner',
    name: '初心者',
    description: '5首の歌をおぼえた',
    icon: '🌱',
    condition: { type: 'collection', count: 5 },
    rarity: 'common'
  },
  {
    id: 'learner',
    name: '学習者',
    description: '10首の歌をおぼえた',
    icon: '📖',
    condition: { type: 'collection', count: 10 },
    rarity: 'common'
  },
  {
    id: 'enthusiast',
    name: '百人一首ファン',
    description: '25首の歌をおぼえた',
    icon: '⭐',
    condition: { type: 'collection', count: 25 },
    rarity: 'uncommon'
  },
  {
    id: 'apprentice',
    name: '歌人見習い',
    description: '50首の歌をおぼえた',
    icon: '🎭',
    condition: { type: 'collection', count: 50 },
    rarity: 'rare'
  },
  {
    id: 'poet',
    name: '歌人',
    description: '75首の歌をおぼえた',
    icon: '🎨',
    condition: { type: 'collection', count: 75 },
    rarity: 'rare'
  },
  {
    id: 'master',
    name: '百人一首マスター',
    description: '100首すべての歌をおぼえた！',
    icon: '👑',
    condition: { type: 'collection', count: 100 },
    rarity: 'legendary'
  },
  {
    id: 'perfectionist',
    name: '完璧主義者',
    description: '一度も間違えずに10問クリア',
    icon: '💯',
    condition: { type: 'perfect_score', count: 10 },
    rarity: 'rare'
  },
  {
    id: 'speed_demon',
    name: 'スピードデーモン',
    description: 'タイムアタックで100秒以内にクリア',
    icon: '⚡',
    condition: { type: 'time_attack', time: 100000 },
    rarity: 'rare'
  },
  {
    id: 'ai_slayer',
    name: 'AI討伐者',
    description: 'AIバトルで初勝利',
    icon: '🤖',
    condition: { type: 'ai_battle_win', count: 1 },
    rarity: 'uncommon'
  },
  {
    id: 'ai_master',
    name: 'AI完全制覇',
    description: 'AIバトルで10回勝利',
    icon: '🏆',
    condition: { type: 'ai_battle_win', count: 10 },
    rarity: 'legendary'
  },
  {
    id: 'early_bird',
    name: '早起き鳥',
    description: '朝6時前にプレイ',
    icon: '🌅',
    condition: { type: 'time_of_day', hour: 6 },
    rarity: 'uncommon'
  },
  {
    id: 'night_owl',
    name: '夜ふかし猫',
    description: '深夜0時以降にプレイ',
    icon: '🌙',
    condition: { type: 'time_of_day', hour: 0 },
    rarity: 'uncommon'
  },
  {
    id: 'daily_player',
    name: '毎日の習慣',
    description: '7日連続でプレイ',
    icon: '📅',
    condition: { type: 'daily_streak', count: 7 },
    rarity: 'rare'
  },
  {
    id: 'collector',
    name: 'コレクター',
    description: 'バッジを10個獲得',
    icon: '🎖️',
    condition: { type: 'badge_count', count: 10 },
    rarity: 'legendary'
  }
]

export const rarityColors = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  legendary: '#F59E0B'
}

export const rarityLabels = {
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
  legendary: 'レジェンダリー'
}
