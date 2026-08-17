<template>
  <div class="app-container" :class="{ 'screen-shake': isShaking }">
    <!-- 首页 -->
    <div v-if="currentPage === 'home'" class="page active">
      <div class="scenery">
        <div v-for="(star, i) in stars" :key="'h-star-'+i" class="star" :style="star.style">{{ star.text }}</div>
      </div>
      <div class="center-content">
        <h1>🌟 七夕超级玛丽闯关 🌟</h1>
        <p>欢迎来到七夕专属挑战！<br>前方有6道关卡，答错就会被无情大锤砸回起点，全部答对才能看到终点惊喜哦！</p>
        <button class="game-btn" @click="startGame">开始闯关</button>
      </div>
      <div class="runner-container">
        <div class="runner-ground"></div>
        <div class="runner-pig"></div>
        <div class="runner-hurdle"></div>
      </div>
    </div>

    <!-- 游戏页 -->
    <div v-else-if="currentPage === 'game'" class="page active" id="page-game">
      <div class="scenery">
        <div v-for="(star, i) in stars" :key="'g-star-'+i" class="star" :style="star.style">{{ star.text }}</div>
        <div v-for="(block, i) in blocks" :key="'g-block-'+i" class="block" :style="block.style">{{ block.text }}</div>
      </div>
      <div class="header-status">第 {{ currentLevelIndex + 1 }} 关</div>
      
      <div class="question-box">
        <div class="question-text">{{ currentLevel.question }}</div>
        <div class="options-container">
          <label v-for="(optText, index) in currentLevel.options" :key="index" class="option-label">
            <input 
              v-if="currentLevel.type === 'single'" 
              type="radio" 
              name="game-option" 
              :value="index" 
              v-model="singleSelected" 
            />
            <input 
              v-else 
              type="checkbox" 
              name="game-option" 
              :value="index" 
              v-model="multiSelected" 
            />
            {{ optText }}
          </label>
        </div>
        <button class="submit-btn" @click="submitAnswer">提交答案</button>
      </div>

      <div class="runner-container">
        <div class="runner-ground"></div>
        <div class="runner-pig"></div>
        <div class="runner-hurdle"></div>
      </div>
    </div>

    <!-- 失败页 -->
    <div v-else-if="currentPage === 'fail'" class="page active">
      <div class="scenery">
        <div v-for="(star, i) in stars" :key="'f-star-'+i" class="star" :style="star.style">{{ star.text }}</div>
      </div>
      <div class="center-content">
        <h1>💔 闯关失败</h1>
        <p class="fail-msg">{{ failMsg }}</p>
        <button class="game-btn" @click="goHome">返回首页重玩</button>
      </div>
      <div class="runner-container">
        <div class="runner-ground stopped"></div>
        <div class="runner-pig stopped"></div>
        <div class="runner-hurdle stopped"></div>
      </div>
    </div>

    <!-- 通关页 -->
    <div v-else-if="currentPage === 'success'" class="page active" id="page-success">
      <div class="scenery">
        <div v-for="(star, i) in stars" :key="'s-star-'+i" class="star" :style="star.style">{{ star.text }}</div>
      </div>
      <div class="center-content">
        <h1>💖 通关成功！</h1>
        <p style="font-weight: bold; color: #ff8c00;">
          好吧，竟然给你通过了，让我看看你总共尝试了 <span class="attempt-count">{{ totalAttempts }}</span> 次，啧啧，菜，就多练！
        </p>
        
        <div class="medal-pig">
          <div class="medal-icon">🏅</div>
        </div>
        
        <div class="story-text">
          七夕至，鹊桥相会。<br>
          比起神话里遥遥相望，我更珍惜眼前实实在在的你。<br>
          有欢笑，也有磨合，庆幸我们依然愿意走向彼此。<br>
          愿往后四季更迭，烟火寻常，我们陪伴如故。<br>
          不止七夕快乐，愿日日皆欢喜！
        </div>
      </div>
    </div>

    <!-- 锤子特效遮罩 -->
    <div v-if="showHammer" class="hammer-overlay">
      <div class="hammer">🔨</div>
    </div>

    <!-- 预加载图片防止动画闪烁 -->
    <div style="display:none;">
      <img src="https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E7%BB%A7%E7%BB%AD%E8%B7%91-removebg-preview.png" />
      <img src="https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%B3-removebg-preview.png" />
      <img src="https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E7%A9%BA%E4%B8%AD-removebg-preview.png" />
      <img src="https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%90%BD%E5%9C%B0-removebg-preview.png" />
      <img src="https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%91-removebg-preview.png" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

defineWujiPageMeta({
  title: '七夕超级玛丽闯关',
  description: '七夕专属挑战，答对所有问题通关'
});

// ----------------------------------------------------
// 关卡数据配置
// ----------------------------------------------------
const levels = [
  {
    type: 'single',
    question: '第一次亲亲是在哪里？',
    options: ['第一次约会那天', '看电影的时候', '送我回家的时候', '正式在一起那天'],
    correct: [0]
  },
  {
    type: 'single',
    question: '第一次因为我哭哭是什么时候？',
    options: ['看电影的时候', '吵架觉得委屈了', '异地分别的时候', '感动到哭'],
    correct: [1]
  },
  {
    type: 'single',
    question: '第一次线下哭哭呢？',
    options: ['看电影时', '睡觉之前', '餐厅吃饭时', '压马路的时候'],
    correct: [1]
  },
  {
    type: 'multiple',
    question: '你最最记忆深刻的是做什么？',
    options: ['看电影', '出去旅行', '一起打游戏', '一起贴贴'],
    correct: [0, 1, 2, 3],
    failMsgTemplate: '原来你只是因为 {texts} 才跟我在一起的，你完蛋了！'
  },
  {
    type: 'multiple',
    question: '你最最喜欢我哪一点？',
    options: ['开朗大方', '长得好看', '聪明可爱', '对我特别好'],
    correct: [0, 1, 2, 3],
    failMsgTemplate: '原来你只是因为 {texts} 才跟我在一起的，你完蛋了！！！'
  },
  {
    type: 'trap',
    question: '你最最讨厌我哪一点？',
    options: ['太黏人', '脾气大', '老吵架', '爱迟到'],
    correct: [],
    failMsgTemplate: '😭你竟然讨厌我！！！不跟你在一起了！game over'
  }
];

// ----------------------------------------------------
// 全局状态
// ----------------------------------------------------
const currentPage = ref('home');
const totalAttempts = ref(0);
const currentLevelIndex = ref(0);
const failMsg = ref('');

// 表单状态
const singleSelected = ref(null);
const multiSelected = ref([]);

// 动画状态
const showHammer = ref(false);
const isShaking = ref(false);

// 装饰元素
const stars = ref([]);
const blocks = ref([]);

const currentLevel = computed(() => levels[currentLevelIndex.value]);

onMounted(() => {
  initScenery();
});

// 初始化背景装饰
function initScenery() {
  const newStars = [];
  for (let i = 0; i < 15; i++) {
    newStars.push({
      text: i % 2 === 0 ? '☁️' : '⛅',
      style: {
        left: Math.random() * 100 + 'vw',
        top: Math.random() * 40 + 'vh',
        animationDelay: (Math.random() * 2) + 's',
        opacity: Math.random() * 0.5 + 0.5,
        fontSize: (Math.random() * 20 + 20) + 'px'
      }
    });
  }
  stars.value = newStars;

  const newBlocks = [];
  for (let i = 0; i < 3; i++) {
    newBlocks.push({
      text: ['🕊️', '🦅'][Math.floor(Math.random() * 2)],
      style: {
        left: (10 + i * 30) + 'vw',
        top: (10 + Math.random() * 30) + 'vh',
        fontSize: '24px'
      }
    });
  }
  blocks.value = newBlocks;
}

// 开始游戏
function startGame() {
  totalAttempts.value++;
  currentLevelIndex.value = 0;
  resetInputs();
  currentPage.value = 'game';
}

function resetInputs() {
  singleSelected.value = null;
  multiSelected.value = [];
}

// 提交答案判定
function submitAnswer() {
  const config = currentLevel.value;
  
  let selectedIndexes = [];
  if (config.type === 'single') {
    if (singleSelected.value !== null) {
      selectedIndexes = [singleSelected.value];
    }
  } else {
    selectedIndexes = [...multiSelected.value];
  }

  if (config.type !== 'trap' && selectedIndexes.length === 0) {
    alert("喂喂喂，请至少做出一个选择呀！");
    return;
  }

  let isCorrect = false;

  if (config.type === 'single') {
    isCorrect = (selectedIndexes.length === 1 && selectedIndexes[0] === config.correct[0]);
  } else if (config.type === 'multiple') {
    isCorrect = (selectedIndexes.length === config.correct.length && 
                 config.correct.every(val => selectedIndexes.includes(val)));
  } else if (config.type === 'trap') {
    isCorrect = (selectedIndexes.length === 0);
  }

  if (isCorrect) {
    currentLevelIndex.value++;
    if (currentLevelIndex.value >= levels.length) {
      showSuccess();
    } else {
      resetInputs();
    }
  } else {
    handleFail(config, selectedIndexes);
  }
}

// 处理失败逻辑
function handleFail(config, selectedIndexes) {
  if (config.type === 'single') {
    showHammer.value = true;
    isShaking.value = true;
    
    setTimeout(() => {
      showHammer.value = false;
      isShaking.value = false;
      showFailPage("答错了哦！接受无情大锤的制裁吧！");
    }, 600);

  } else if (config.type === 'multiple') {
    let selectedTexts = selectedIndexes.map(idx => config.options[idx]);
    let formattedTexts = selectedTexts.map(t => `"${t}"`).join(',');
    if (selectedTexts.length === 0) formattedTexts = "什么都不选";
    
    let msg = (config.failMsgTemplate || '').replace('{texts}', formattedTexts);
    showFailPage(msg);

  } else if (config.type === 'trap') {
    showFailPage(config.failMsgTemplate || '😭你竟然讨厌我！！！不跟你在一起了！game over');
  }
}

function showFailPage(msg) {
  failMsg.value = msg;
  currentPage.value = 'fail';
}

function showSuccess() {
  currentPage.value = 'success';
}

function goHome() {
  currentPage.value = 'home';
}
</script>

<style scoped>
/* Reset and Base Styles mapped to scoped component */
.app-container {
  font-family: "Microsoft YaHei", -apple-system, sans-serif;
  background-color: #000;
  color: #fff;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  position: relative;
}

.page {
  display: flex;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(to bottom, #7fc0ff, #c3e2ff, #e6f3ff);
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  z-index: 10;
  color: #333;
}

.center-content {
  margin: auto;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.85);
  border: 3px solid #fff;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  z-index: 20;
}

h1 {
  font-size: 28px;
  margin-bottom: 15px;
  color: #ff8c00;
  text-shadow: 1px 1px 0 #fff;
}

p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #555;
}

.game-btn {
  padding: 12px 30px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: #ff8c00;
  border: 3px solid #fff;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 0 #d2691e;
  transition: transform 0.1s;
}

.game-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #d2691e;
}

/* 游戏界面 */
#page-game {
  justify-content: flex-start;
  padding-top: 40px;
}

.header-status {
  font-size: 24px;
  font-weight: bold;
  color: #ff8c00;
  text-shadow: 1px 1px 0 #fff;
  margin-bottom: 15px;
  z-index: 20;
}

.question-box {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  border: 4px solid #333;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
  z-index: 20;
}

.question-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  line-height: 1.4;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #ccc;
  font-size: 16px;
  transition: background 0.2s;
}

.option-label:hover {
  background: #e0e0e0;
}

.option-label input {
  margin-right: 12px;
  transform: scale(1.4);
}

.submit-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background: #5cb85c;
  border: 3px solid #333;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 0 #3b8c3b;
}

.submit-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #3b8c3b;
}

/* 场景装饰 */
.scenery {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  font-size: 18px;
  animation: twinkle 1.5s infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.2; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

.block {
  position: absolute;
  font-size: 32px;
  filter: drop-shadow(2px 2px 0 #000);
}

/* 透明背景小猪 - 真实跨栏动画 */
.runner-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 260px;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

.runner-ground {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 40px;
  background: linear-gradient(to bottom, #7ed957, #32cd32);
  border-top: 4px dashed #fff;
  animation: groundScroll 1.5s infinite linear;
}

.runner-pig {
  position: absolute;
  bottom: 30px; /* sit on grass */
  left: 20%;
  width: 100px;
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;
  animation: pigJump 2.5s infinite linear, pigFrame 2.5s infinite linear;
  filter: drop-shadow(0px 8px 4px rgba(0,0,0,0.2));
  z-index: 10;
}

.runner-hurdle {
  position: absolute;
  bottom: 40px; /* sit exactly on the white dashed line */
  left: 100%;
  width: 30px;
  height: 45px;
  border: 4px solid #fff;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: transparent;
  animation: hurdleScroll 2.5s infinite linear;
  filter: drop-shadow(2px 4px 2px rgba(0,0,0,0.2));
  z-index: 9;
}

.runner-hurdle::after {
  content: '';
  position: absolute;
  top: 10px;
  left: -4px;
  width: 30px;
  height: 4px;
  background: #fff;
}

.runner-pig.stopped {
  animation: none;
  background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%91-removebg-preview.png');
  filter: grayscale(100%) drop-shadow(0px 8px 4px rgba(0,0,0,0.2));
}

.runner-ground.stopped,
.runner-hurdle.stopped {
  animation-play-state: paused;
  filter: grayscale(100%);
}

@keyframes groundScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes hurdleScroll {
  0% { left: 100%; }
  100% { left: -20%; }
}

@keyframes pigJump {
  0%, 46% { transform: translateY(0); }
  58% { transform: translateY(-90px); }
  78%, 100% { transform: translateY(0); }
}

@keyframes pigFrame {
  /* 0-46: run */
  0%, 15.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E7%BB%A7%E7%BB%AD%E8%B7%91-removebg-preview.png'); }
  16%, 30.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%91-removebg-preview.png'); }
  31%, 45.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E7%BB%A7%E7%BB%AD%E8%B7%91-removebg-preview.png'); }
  
  /* 46-56: jump up */
  46%, 55.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%B3-removebg-preview.png'); }
  
  /* 56-74: mid air (滞空更久) */
  56%, 73.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E7%A9%BA%E4%B8%AD-removebg-preview.png'); }
  
  /* 74-78: land */
  74%, 77.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%90%BD%E5%9C%B0-removebg-preview.png'); }
  
  /* 78-100: run */
  78%, 88.9% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E7%BB%A7%E7%BB%AD%E8%B7%91-removebg-preview.png'); }
  89%, 100% { background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%91-removebg-preview.png'); }
}

.medal-pig {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 10px auto;
  background-image: url('https://mario_qixi_quest_august.wuji.gtimg.cn/%E6%96%B0%E7%89%88%E5%B0%8F%E7%8C%AA%E8%B5%B7%E8%B7%91-removebg-preview.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.2));
}

.medal-icon {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 50px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

/* 锤子动画 */
.hammer-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(255,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  pointer-events: none;
}

.hammer {
  font-size: 120px;
  animation: smash 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  transform-origin: bottom right;
}

@keyframes smash {
  0% { transform: rotate(0deg) scale(1) translateY(-300px); }
  50% { transform: rotate(-45deg) scale(2) translateY(-100px); }
  80% { transform: rotate(-90deg) scale(3) translateY(0); }
  100% { transform: rotate(-90deg) scale(3) translateY(0); opacity: 0; }
}

.screen-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-10px, 0, 0); }
  20%, 80% { transform: translate3d(10px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-15px, 0, 0); }
  40%, 60% { transform: translate3d(15px, 0, 0); }
}

/* 结局页面排版 */
#page-success .center-content {
  background: rgba(255, 255, 255, 0.95);
  border-color: #ff8c00;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
}

.story-text {
  text-align: left;
  margin: 15px 0;
  font-size: 16px;
  line-height: 1.8;
  color: #ff8c00;
  font-weight: bold;
}

.bridge-icon {
  font-size: 40px;
  margin: 10px 0;
  letter-spacing: 10px;
}

.fail-msg {
  font-size: 18px;
  color: #ff9999;
  font-weight: bold;
}
.attempt-count {
  font-size: 24px;
  color: #ff4500;
}
</style>
