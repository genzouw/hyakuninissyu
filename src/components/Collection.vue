<template>
  <div class="collection-container">
    <div class="row mb-3">
      <div class="col">
        <h2>📚 百人一首コレクション図鑑</h2>
        <p class="text-muted">おぼえた歌を集めよう！</p>
      </div>
    </div>

    <!-- 進捗表示 -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">コレクション達成度</h5>
            <h2 class="display-4">{{ collectedCount }} / {{ totalCount }}</h2>
            <b-progress :value="collectionRate" :max="100" class="mt-2" height="2rem">
              <b-progress-bar :value="collectionRate">
                <strong>{{ collectionRate }}%</strong>
              </b-progress-bar>
            </b-progress>
          </div>
        </div>
      </div>
    </div>

    <!-- フィルター -->
    <div class="row mb-3">
      <div class="col">
        <b-button-group>
          <b-button :variant="filter === 'all' ? 'primary' : 'outline-primary'" @click="filter = 'all'">
            すべて
          </b-button>
          <b-button :variant="filter === 'collected' ? 'success' : 'outline-success'" @click="filter = 'collected'">
            おぼえた歌
          </b-button>
          <b-button :variant="filter === 'uncollected' ? 'secondary' : 'outline-secondary'" @click="filter = 'uncollected'">
            まだおぼえていない歌
          </b-button>
        </b-button-group>
      </div>
    </div>

    <!-- 歌のグリッド表示 -->
    <div class="row">
      <div
        v-for="poem in filteredPoems"
        :key="poem.id"
        class="col-6 col-md-4 col-lg-3 mb-4"
      >
        <div
          class="poem-card"
          :class="{ 'collected': isCollected(poem.id), 'uncollected': !isCollected(poem.id) }"
          @click="showPoemDetail(poem)"
        >
          <div class="card h-100 text-center">
            <div class="card-body">
              <h5 class="card-title">{{ poem.id }}</h5>
              <p class="poem-text" :class="{ 'blurred': !isCollected(poem.id) }">
                {{ poem.question }}<br>
                {{ poem.answer }}
              </p>
              <p class="card-text">
                <small class="text-muted" v-if="isCollected(poem.id)">{{ poem.author }}</small>
                <small class="text-muted" v-else>？？？</small>
              </p>
              <span v-if="isCollected(poem.id)" class="badge badge-success">習得済み</span>
              <span v-else class="badge badge-secondary">未習得</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細モーダル -->
    <b-modal v-model="showModal" :title="selectedPoem ? `第${selectedPoem.id}首` : ''" size="lg" hide-footer>
      <div v-if="selectedPoem" class="poem-detail">
        <h4>{{ selectedPoem.question }}</h4>
        <h4>{{ selectedPoem.answer }}</h4>
        <hr>
        <p><strong>作者:</strong> {{ selectedPoem.author }}</p>
        <div v-if="isCollected(selectedPoem.id)" class="mt-3">
          <b-badge variant="success" class="mr-2">習得済み</b-badge>
        </div>
        <div v-else class="mt-3">
          <b-alert show variant="info">
            この歌を習得するには、ゲームで正解してください！
          </b-alert>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import poems from '@/data/poems'

// フィルター種類の定数
const FILTERS = {
  ALL: 'all',
  COLLECTED: 'collected',
  UNCOLLECTED: 'uncollected'
}

export default {
  name: 'Collection',
  data () {
    return {
      poems: poems,
      filter: FILTERS.ALL,
      showModal: false,
      selectedPoem: null
    }
  },
  computed: {
    ...mapGetters('collection', ['collectedCount', 'isCollected']),
    totalCount () {
      return this.poems.length
    },
    collectionRate () {
      if (this.totalCount === 0) return 0
      return Math.round((this.collectedCount / this.totalCount) * 100)
    },
    filteredPoems () {
      if (this.filter === FILTERS.COLLECTED) {
        return this.poems.filter(p => this.isCollected(p.id))
      } else if (this.filter === FILTERS.UNCOLLECTED) {
        return this.poems.filter(p => !this.isCollected(p.id))
      }
      return this.poems
    }
  },
  methods: {
    showPoemDetail (poem) {
      this.selectedPoem = poem
      this.showModal = true
    }
  }
}
</script>

<style scoped>
.collection-container {
  padding: 20px;
}

.poem-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.poem-card:hover {
  transform: scale(1.05);
}

.poem-card.collected .card {
  border: 3px solid #28a745;
  background-color: #f0fff4;
}

.poem-card.uncollected .card {
  border: 2px dashed #6c757d;
  background-color: #f8f9fa;
  opacity: 0.7;
}

.poem-text {
  font-size: 0.9rem;
  line-height: 1.4;
  min-height: 80px;
}

.poem-text.blurred {
  filter: blur(4px);
  user-select: none;
}

.poem-detail h4 {
  margin-bottom: 10px;
  color: #333;
}
</style>
