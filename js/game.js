// 获取元素
const startpage = document.querySelector('.start_page') // 规则页
const resultpage = document.querySelector('.result') // 分数显示页
const parent = document.querySelector('#box') // 游戏区域
const startbutton = document.querySelector('#start') // 开始按钮
const scoreEl = document.querySelector('.score') // 实时分数界面
const bgm = document.querySelector('#bgm') // 背景音乐元素
const miss_index_color = document.querySelector('#miss_color') // 血条界面
const again = document.querySelector('#start_again') // 重新再来界面
const speedConfig = document.querySelector('.config [name=speed]') // 自定义速度
const chararrConfig = document.querySelector('.config [name=chararr]') // 自定义字符

// 音频资源
const startBgm = new Audio('./media/button_sound.mp3') // 开始按钮
const typeBgm = new Audio('./media/balloonPop.mp3') // 小球正确音
const typeErrorBgm = new Audio('./media/cannonBlast.mp3') // 小球按错音
const missBgm = new Audio('./media/balloonExplode.mp3') // 小球错失音
const gameOverBgm = new Audio('./media/Game_Over.mp3') // 结束音

// 全局变量
// const chararr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ;,./' // 出现的字母和符号
let chararr = localStorage.getItem('chararr') || 'abcdefghijklmnopqrstuvwxyz;,./' // 出现的字母和符号
let speed = +localStorage.getItem('speed') || 1000 // 速度,毫秒
let score = 0 // 实时分数
let alive_char = '' // 存活小球字符串
let red_green_index = 1 // 红绿球出现间隔起始量
let startcreationinterval // 小球出现间隔定时器
let isPause = true // 全局暂停变量,默认 暂停
const max_missedball = 10 // 最大miss小球数量
let missedball = 0 // 实际miss小球数量
let scoreMax = +localStorage.getItem('scoreMax') || 0 // 获取最高分数
let typeRight = 0 // 正确输入数量
let typeError = 0 // 错误输入数量
const errorKeys = {} // 错误输入的键

// 渲染分数界面
scoreEl.innerHTML = `最高分数: ${scoreMax}`
speedConfig.value = speed
chararrConfig.value = chararr

// 根据speed 实时加减分
const scoreCount = () => {
  if (1000 - speed >= 0) {
    return (1000 - speed) / 100
  } else {
    return 1
  }
}

/**
 * 开始游戏
 */
const startGame = () => {
  // 自定义速度
  if (+speedConfig.value != speed) {
    speed = +speedConfig.value // 使用新自定义速度
    localStorage.setItem('speed', speed) // 本地存储速度
  }
  // 自定义字符
  if (chararrConfig.value != chararr) {
    chararr = chararrConfig.value // 使用新自定义字符
    localStorage.setItem('chararr', chararr) // 本地存储字符
  }
  parent.focus() // 自动聚焦
  isPause = false // 游戏开始,取消暂停
  gameOverBgm.pause()
  startBgm.play()
  bgm.play()
  parent.innerHTML = '' // 清空游戏区域
  alive_char = '' // 存活小球字符串
  missedball = 0 // 实时miss小球数量
  score = 0 // 实时分数
  typeRight = 0 // 正确输入数量
  typeError = 0 // 错误输入数量
  scoreEl.innerHTML = `分数: ${score}<br />最高分数: ${scoreMax}` // 实时分数界面
  startpage.style = 'display:none' // 隐藏规则页
  resultpage.style = 'display:none' // 隐藏结果页
  miss_index_color.style.background = '' // 清除血条颜色
  start_interval(speed)
}

// 开始游戏按钮
startbutton.addEventListener('click', startGame)

// 重新再来游戏按钮
again.addEventListener('click', startGame)

/**
 *
 * @returns 返回随机大小写字母
 */
const randChar = () => {
  return chararr[Math.floor(Math.random() * chararr.length)]
}

/**
 * 放大小球
 * @param  ball 需要放大的元素
 */
const enlarge = (ball) => {
  ball.style.transform = 'scale(1.3)'
}

/**
 *
 * @returns 返回下落的偏移量
 */
function rendint() {
  return Math.floor(20 + Math.random() * 850)
}

/**
 * 创建随机小球到画布上
 */
const create = () => {
  let newballchar = randChar() // 创建随机小球(字母)
  alive_char += newballchar // 添加到存活小球字符串中
  // console.log(alive_char)

  // 使用自定义属性
  const fragment = document.createDocumentFragment()
  const newBall = document.createElement('div')
  newBall.dataset.id = newballchar
  // 如果是大写字母,则放大
  if (/^[A-Z]$/.test(newballchar)) {
    enlarge(newBall)
  }
  newBall.classList.add('ball')
  newBall.innerHTML = newballchar
  fragment.append(newBall)
  parent.append(fragment)
  // 如果间隔12或6,出现红绿小球
  if (red_green_index == 12) {
    newBall.style.animation = 'godown 5s linear infinite' // 红球加速移动
    newBall.style.backgroundColor = 'red'
    red_green_index = 1
    create()
  } else if (red_green_index == 6) {
    newBall.style.animation = 'godown 7s linear infinite' // 绿球加速移动
    newBall.style.backgroundColor = 'green'
    red_green_index++
    create()
  } else {
    red_green_index++
  }

  newBall.style.right = rendint() + 'px'
  missball(newBall)
}

/**
 * 开启定时器,创建画面
 */
const start_interval = (speed) => {
  create()
  startcreationinterval = setInterval(create, speed)
}

// 游戏开始,按键检测
parent.addEventListener('keydown', (e) => {
  const alive_index = alive_char.indexOf(e.key)
  console.log('e.key: ', e.key)
  console.log(`e.code: ${e.code}`)

  // indexOf() 方法返回字符第一次出现的位置索引；如果不存在，则返回 -1
  if (alive_index == -1) {
    // 检查按下的键是否既不是 Shift也不是 空格键
    if (e.key != ' ' && e.key != 'Shift' && e.key != 'ShiftLeft') {
      score <= 0 ? (score = 0) : (score -= scoreCount()) // 防止分数负数
      typeError++ // 错误输入数量增加
      scoreEl.innerHTML = `分数: ${score}<br />最高分数: ${scoreMax}<br/>正确: ${typeRight}  错误: ${typeError}`
      typeErrorBgm.play()
      // 统计错误的键
      errorKeys[e.key] = (errorKeys[e.key] || 0) + 1
    } else if (e.key != 'Shift' && e.key != 'ShiftLeft') {
      // 这里空格不做处理
    }
  } else {
    // 按键正确逻辑
    score += scoreCount() // 正确输入,分数增加
    typeRight++ // 正确输入数量增加
    scoreEl.innerHTML = `分数: ${score}<br />最高分数: ${scoreMax}<br/>正确: ${typeRight}  错误: ${typeError}`
    alive_char = alive_char.replace(e.key, '')
    const target = document.querySelector(`[data-id="${e.key}"]`)
    if (target) {
      // 停止godown动画，固定当前位置
      const currentTop = target.offsetTop
      target.style.top = currentTop + 'px'
      target.style.animation = 'none'
      target.style.animation = 'pop 0.1s ease-in-out'
      const animationEndHandler = () => {
        target.removeEventListener('animationend', animationEndHandler)
        target.remove()
      }
      target.addEventListener('animationend', animationEndHandler)
      // target.remove()
      typeBgm.play()
    }
  }
})

/**
 *  失败判定
 * @param newball miss的小球元素
 */
const missball = (newball) => {
  newball.addEventListener('animationiteration', function () {
    const target = newball
    missBgm.play()
    target.remove()
    alive_char = alive_char.replace(newball.innerText, '')
    missedball++
    miss_color_change(missedball)
    // console.log(missedball)
    // 失误小球大于5,相当于有6次机会
    if (missedball >= max_missedball) {
      // console.log('Game Over')
      gameOverBgm.play()
      pause_game()
      // 格式化错误键显示，按出现次数从大到小排序
      const errorKeysFormatted = Object.entries(errorKeys)
        .sort((a, b) => b[1] - a[1]) // 按value值从大到小排序
        .map(([key, count]) => `${key}(${count}次)`)
        .join(' ')

      document.querySelector('#score').innerHTML = `
      <h1>score: ${score}</h1>
      <h3>正确输入: ${typeRight}  错误输入: ${typeError}</h3>
      <h3>错误的键:<br/> ${errorKeysFormatted || '无'}</h3>
      `
      resultpage.style = 'display:grid;'
      // 分数大于最高分数,写入浏览器
      if (score > scoreMax) {
        scoreMax = score
        localStorage.setItem('scoreMax', scoreMax)
      }
    }
  })
}

/**
 * 暂停游戏
 */
const pause_game = () => {
  clearInterval(startcreationinterval) //清除定时器
  isPause = true
  bgm.pause()
  startBgm.play()
  const elements = document.getElementsByClassName('ball')
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.animationPlayState = 'paused' ///important line this is
  }
}

/**
 * 暂停后继续游戏
 */
const run_game = () => {
  clearInterval(startcreationinterval) //清除定时器
  start_interval(speed)
  isPause = false
  bgm.play()
  startBgm.play()
  const elements = document.getElementsByClassName('ball')
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.animationPlayState = 'running' ///important line this is
  }
}

/**血条控制 */
const miss_color_change = (i) => {
  miss_index_color.style.background = `linear-gradient( to right,red ${i * (100 / max_missedball)}% ,#28ff28 0%)`
}

// 窗口失焦暂停游戏
window.addEventListener('blur', pause_game)
window.addEventListener('keyup', (e) => {
  console.log(e.key)

  if (e.key == ' ') {
    if (isPause) {
      // 判断是否显示了结果页
      if (resultpage.style.display != 'none') {
        startGame()
        return
      }
      run_game()
      startpage.style = 'display:none'
    } else {
      pause_game()
    }
  }
})
