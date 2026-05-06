<template>
  <div class="badges-container">
    <div class="row">
      <div class="col-12">
        <h2 class="text-center mb-4">🎖️ バッジコレクション</h2>
      </div>
    </div>

    <!-- 獲得状況サマリー -->
    <div class="row justify-content-center mb-4">
      <div class="col-md-6">
        <div class="card bg-gradient-primary text-white">
          <div class="card-body text-center">
            <h3 class="display-4 mb-2">{{ unlockedCount }} / {{ totalBadges }}</h3>
            <p class="mb-2">バッジを獲得しました</p>
            <b-progress :value="badgeRate" :max="100" height="2rem" variant="warning">
              <b-progress-bar :value="badgeRate">
                <strong>{{ badgeRate }}%</strong>
              </b-progress-bar>
            </b-progress>
          </div>
        </div>
      </div>
    </div>

    <!-- レアリティフィルター -->
    <div class="row justify-content-center mb-3">
      <div class="col-auto">
        <b-button-group>
          <b-button
            :variant="rarityFilter === 'all' ? 'primary' : 'outline-primary'"
            @click="rarityFilter = 'all'"
          >
            すべて
          </b-button>
          <b-button
            :variant="rarityFilter === 'common' ? 'secondary' : 'outline-secondary'"
            @click="rarityFilter = 'common'"
          >
            コモン
          </b-button>
          <b-button
            :variant="rarityFilter === 'uncommon' ? 'success' : 'outline-success'"
            @click="rarityFilter = 'uncommon'"
          >
            アンコモン
          </b-button>
          <b-button
            :variant="rarityFilter === 'rare' ? 'info' : 'outline-info'"
            @click="rarityFilter = 'rare'"
          >
            レア
          </b-button>
          <b-button
            :variant="rarityFilter === 'legendary' ? 'warning' : 'outline-warning'"
            @click="rarityFilter = 'legendary'"
          >
            レジェンダリー
          </b-button>
        </b-button-group>
      </div>
    </div>

    <!-- バッジグリッド -->
    <div class="row">
      <div
        v-for="badge in filteredBadges"
        :key="badge.id"
        class="col-6 col-md-4 col-lg-3 mb-4"
      >
        <div
          class="badge-card card h-100"
          :class="{
            'unlocked': isUnlocked(badge.id),
            'locked': !isUnlocked(badge.id)
          }"
          @click="showBadgeDetail(badge)"
        >
          <div class="card-body text-center">
            <div
              class="badge-icon mb-2"
              :class="{ 'grayscale': !isUnlocked(badge.id) }"
            >
              {{ badge.icon }}
            </div>
            <div
              class="badge-rarity mb-2"
              :style="{ color: rarityColors[badge.rarity] }"
            >
              {{ rarityLabels[badge.rarity] }}
            </div>
            <h5 class="badge-name">{{ badge.name }}</h5>
            <p
              class="badge-description text-muted small"
              :class="{ 'blurred': !isUnlocked(badge.id) }"
            >
              {{ badge.description }}
            </p>
            <div v-if="!isUnlocked(badge.id)" class="badge-lock">
              🔒
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- バッジ詳細モーダル -->
    <b-modal
      v-model="showModal"
      :title="selectedBadge ? selectedBadge.name : ''"
      hide-footer
      centered
    >
      <div v-if="selectedBadge" class="text-center">
        <div class="modal-badge-icon mb-3">
          {{ selectedBadge.icon }}
        </div>
        <div
          class="modal-badge-rarity mb-3"
          :style="{ color: rarityColors[selectedBadge.rarity] }"
        >
          {{ rarityLabels[selectedBadge.rarity] }}
        </div>
        <p class="modal-badge-description">
          {{ selectedBadge.description }}
        </p>
        <div v-if="isUnlocked(selectedBadge.id)" class="alert alert-success">
          ✅ 獲得済み
        </div>
        <div v-else class="alert alert-secondary">
          🔒 未獲得
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { badges, rarityColors, rarityLabels } from '@/data/badges'

export default {
  name: 'Badges',
  data () {
    return {
      badges: badges,
      rarityColors: rarityColors,
      rarityLabels: rarityLabels,
      unlockedBadgeIds: [],
      rarityFilter: 'all',
      showModal: false,
      selectedBadge: null
    }
  },
  computed: {
    totalBadges () {
      return this.badges.length
    },
    unlockedCount () {
      return this.unlockedBadgeIds.length
    },
    badgeRate () {
      if (this.totalBadges === 0) return 0
      return Math.round((this.unlockedCount / this.totalBadges) * 100)
    },
    filteredBadges () {
      if (this.rarityFilter === 'all') {
        return this.badges
      }
      return this.badges.filter(b => b.rarity === this.rarityFilter)
    }
  },
  methods: {
    isUnlocked (badgeId) {
      return this.unlockedBadgeIds.includes(badgeId)
    },
    showBadgeDetail (badge) {
      this.selectedBadge = badge
      this.showModal = true
    },
    loadUnlockedBadges () {
      const saved = localStorage.getItem('unlockedBadgeIds')
      if (saved) {
        try {
          this.unlockedBadgeIds = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse unlockedBadgeIds from localStorage:', e)
          // エラー発生時はデータをクリアして初期化
          this.unlockedBadgeIds = []
          localStorage.removeItem('unlockedBadgeIds')
        }
      }
    },
    // コレクション系バッジのみをチェック・解除するメソッド
    // NOTE: time_attack, ai_battle_win などの他のバッジタイプは未実装です
    // 今後、各ゲームモードの終了時に適切なバッジチェックを実装する予定です
    checkAndUnlockCollectionBadges () {
      // コレクション数は collection ストアから取得（localStorage 直参照は廃止）
      const collectionCount = this.$store.getters['collection/collectedCount']

      // コレクション系バッジのみをチェック
      this.badges.forEach(badge => {
        if (badge.condition.type === 'collection') {
          if (collectionCount >= badge.condition.count) {
            if (!this.isUnlocked(badge.id)) {
              this.unlockBadge(badge.id)
            }
          }
        }
      })
    },
    unlockBadge (badgeId) {
      if (!this.unlockedBadgeIds.includes(badgeId)) {
        this.unlockedBadgeIds.push(badgeId)
        localStorage.setItem('unlockedBadgeIds', JSON.stringify(this.unlockedBadgeIds))
      }
    }
  },
  mounted () {
    this.loadUnlockedBadges()
    this.checkAndUnlockCollectionBadges()
  }
}
</script>

<style scoped>
.badges-container {
  padding: 20px;
}

.badge-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.badge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.badge-card.unlocked {
  border-color: #28a745;
  background: linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%);
}

.badge-card.locked {
  border-color: #dee2e6;
  background: #f8f9fa;
  opacity: 0.7;
}

.badge-icon {
  font-size: 4rem;
  transition: filter 0.3s;
}

.badge-icon.grayscale {
  filter: grayscale(100%);
}

.badge-rarity {
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.badge-name {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.badge-description {
  font-size: 0.85rem;
  min-height: 2.5rem;
}

.badge-description.blurred {
  filter: blur(4px);
  user-select: none;
}

.badge-lock {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
}

.modal-badge-icon {
  font-size: 6rem;
}

.modal-badge-rarity {
  font-weight: bold;
  font-size: 1.2rem;
  text-transform: uppercase;
}

.modal-badge-description {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
