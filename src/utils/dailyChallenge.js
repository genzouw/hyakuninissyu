/**
 * デイリーチャレンジのユーティリティ関数
 */

/**
 * Dateオブジェクトを YYYY-MM-DD 形式の文字列に変換
 * @param {Date} date - 変換する日付オブジェクト
 * @returns {string} YYYY-MM-DD形式の日付文字列
 */
function dateToYMD (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 今日の日付文字列を取得（YYYY-MM-DD形式）
 * @returns {string} 今日の日付
 */
export function getTodayDateString () {
  return dateToYMD(new Date())
}

/**
 * 日付文字列からシード値を生成
 * @param {string} dateString - YYYY-MM-DD形式の日付文字列
 * @returns {number} シード値
 */
export function generateSeedFromDate (dateString) {
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * シード値を使った疑似乱数生成器
 * @param {number} seed - シード値
 * @returns {Function} 0以上1未満の乱数を返す関数
 */
export function createSeededRandom (seed) {
  let state = seed
  return function () {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

/**
 * 今日のデイリーチャレンジ用の5首を選出
 * @param {Array} allPoems - 全100首の歌配列
 * @returns {Array} 選出された5首の配列
 */
export function getTodaysChallengePoems (allPoems) {
  const todayString = getTodayDateString()
  const seed = generateSeedFromDate(todayString)
  const random = createSeededRandom(seed)

  // Fisher-Yates シャッフルで5首を選出
  const poemsCopy = [...allPoems]
  const selectedPoems = []

  for (let i = 0; i < 5 && poemsCopy.length > 0; i++) {
    const randomIndex = Math.floor(random() * poemsCopy.length)
    selectedPoems.push(poemsCopy[randomIndex])
    poemsCopy.splice(randomIndex, 1)
  }

  return selectedPoems
}

/**
 * 今日のチャレンジが完了しているかチェック
 * @returns {boolean} 完了していればtrue
 */
export function isTodaysChallengeCompleted () {
  const todayString = getTodayDateString()
  const lastCompletedDate = localStorage.getItem('dailyChallengeLastCompleted')
  return lastCompletedDate === todayString
}

/**
 * 今日のチャレンジ完了をマーク
 */
export function markTodaysChallengeCompleted () {
  const todayString = getTodayDateString()
  localStorage.setItem('dailyChallengeLastCompleted', todayString)
}

/**
 * 現在のストリークを取得
 * @returns {number} ストリーク日数
 */
export function getCurrentStreak () {
  const streak = localStorage.getItem('dailyChallengeStreak')
  return streak ? parseInt(streak, 10) : 0
}

/**
 * ストリークを更新
 * @param {boolean} isSuccess - 今日のチャレンジが成功したか
 */
export function updateStreak (isSuccess) {
  const todayString = getTodayDateString()
  const lastCompletedDate = localStorage.getItem('dailyChallengeLastCompleted')
  const currentStreak = getCurrentStreak()

  if (!isSuccess) {
    // 失敗したらストリークリセット
    localStorage.setItem('dailyChallengeStreak', '0')
    return
  }

  // 昨日の日付を計算
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayString = dateToYMD(yesterday)

  if (lastCompletedDate === yesterdayString) {
    // 連続達成
    localStorage.setItem('dailyChallengeStreak', String(currentStreak + 1))
  } else if (lastCompletedDate === todayString) {
    // 今日既に完了済み（ストリークは変更なし）
  } else {
    // 連続ではない（新規スタート）
    localStorage.setItem('dailyChallengeStreak', '1')
  }
}

/**
 * 次のチャレンジまでの残り時間を取得
 * @returns {Object} { hours, minutes, seconds }
 */
export function getTimeUntilNextChallenge () {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { hours, minutes, seconds }
}
