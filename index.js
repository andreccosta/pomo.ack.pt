//progress bars overlay
const radius = 90,
  padding = 50,
  radians = 2 * Math.PI

const dimension = 2 * radius + 2 * padding,
  points = 50,
  percentage = 0.62

const angle = d3.scale
  .linear()
  .domain([0, points - 1])
  .range([0, radians])

const line = d3.svg.line
  .radial()
  .interpolate('basis')
  .tension(0)
  .radius(radius)
  .angle((d, i) => {
    if (i < points * percentage + 1) {
      return angle(i)
    }
  })

const svg = d3
  .select('.outer-circle')
  .append('svg')
  .attr('width', dimension)
  .attr('height', 200)
  .append('g')

svg
  .append('path')
  .datum(d3.range(points))
  .attr('class', 'line')
  .attr('fill', 'none')
  .attr('stroke-dasharray', '7 3')
  .attr('stroke-width', '25px')
  .attr('stroke', '#1F2025') //#1F2025
  .attr('d', line)
  .attr('transform', 'translate(135,106) rotate(-110)')

//progress bars
let elapsedPercent = 0
const r = 100
const pi = Math.PI
const green1 = '#B8D087'
const green2 = '#00996D'
const data = {
  upper: calcPercent(0),
  lower: calcPercent(elapsedPercent),
}

let progress = 0

function calcPercent(percent) {
  return [percent, 100 - percent]
}

const canvas = d3
  .select('.inner-circle')
  .append('svg')
  .attr('height', r + 100)
  .attr('width', r + 150)

const group = canvas
  .append('g')
  .attr('transform', 'translate(' + 120 + ',' + 110 + ')')

const arc = d3.svg
  .arc()
  .innerRadius(r / 1.2)
  .outerRadius(r)

//returns objects based on data
const pie = d3.layout
  .pie()
  .sort(null)
  .value(data => data)
  .startAngle(-110 * (pi / 180))
  .endAngle(110 * (pi / 180))

const arcs = group
  .selectAll('.arc')
  .data(pie(data.lower))
  .enter()
  .append('g')
  .attr('class', 'arc')

const defs = canvas
  .append('defs')
  .append('linearGradient')
  .attr('id', 'greenGradient')
  .attr('gradientUnits', 'objectBoundingBox')
  .attr('x1', '0')
  .attr('y1', '0')
  .attr('x2', '1')
  .attr('y2', '1')

defs.append('stop').attr('offset', '0%').attr('stop-color', green1)
defs.append('stop').attr('offset', '100%').attr('stop-color', green2)

let path = arcs
  .append('path')
  .attr('class', (data, index) => 'progress-color' + index)
  .attr('d', arc)

/////////timer
const startButton = document.getElementById('start-timer')
const resetButton = document.getElementById('reset-timer')
const timeDisplay = document.getElementById('timer-display-time')
const statusDisplay = document.getElementById('status')
const spinner = document.getElementById('spineroo')
let sessionTimer = parseInt(
  document.getElementById('set-timer-display').innerHTML,
  10
)
let breakTimer = parseInt(
  document.getElementById('set-break-display').innerHTML,
  10
)
elapsedPercent = 0
let seconds = 60
let minutes
let timer
let breakTime = false

//start timer
startButton.addEventListener('click', () => {
  timer = setInterval(timerFn, 1000)
  //console.log("button: " + startButton.innerHTML.trim() + " | session: " + sessionTimer + " | break: " + breakTimer);
  startButton.classList.toggle('hidden')
  resetButton.classList.toggle('hidden')
  spinner.classList.toggle('spinning')
  statusDisplay.innerHTML = 'In session!'
  minutes = sessionTimer - 1

  function timerFn() {
    seconds--
    //console.log("time: " +minutes + ":" + seconds + " | percent: " + elapsedPercent);
    progress()
    if (seconds < 10 && minutes < 10) {
      timeDisplay.innerHTML = '0' + minutes + ':0' + seconds
    } else if (seconds < 10) {
      timeDisplay.innerHTML = minutes + ':0' + seconds
    } else if (minutes < 10) {
      timeDisplay.innerHTML = '0' + minutes + ':' + seconds
    } else {
      timeDisplay.innerHTML = minutes + ':' + seconds
    }
    if (seconds === 0 && minutes === 0) {
      if (breakTime === false) {
        breakTime = true
        minutes = breakTimer - 1
        seconds = 60
        elapsedPercent = 0
        statusDisplay.innerHTML = 'Take a break!'
      } else {
        breakTime = false
        minutes = sessionTimer - 1
        seconds = 60
        elapsedPercent = 0
        statusDisplay.innerHTML = 'In session!'
      }
    }
    if (seconds === 0) {
      document.title = `Pomo (${minutes})`
      minutes--
      seconds = 60
    }
  }
  function progress() {
    let secondsElapsed = minutes * 60 + seconds
    let totalSeconds
    if (breakTime === true) {
      totalSeconds = breakTimer * 60
    } else {
      totalSeconds = sessionTimer * 60
    }
    elapsedPercent = (1 - secondsElapsed / totalSeconds) * 100
    path.data(pie(calcPercent(elapsedPercent))).attr('d', arc)
  }
})

//reset timer
resetButton.addEventListener('click', () => {
  startButton.classList.toggle('hidden')
  resetButton.classList.toggle('hidden')
  spinner.classList.toggle('spinning')
  clearInterval(timer)
  seconds = 60
  minutes = sessionTimer - 1
  elapsedPercent = 0
  timeDisplay.innerHTML = sessionTimer + ':00'
  statusDisplay.innerHTML = 'Reset!'
  path.data(pie(calcPercent(elapsedPercent))).attr('d', arc)
})

//timer settings
const settingOptions = {
  'add-break': () => {
    if (breakTimer < 51) {
      let timer = breakTimer++
      document.getElementById('set-break-display').innerHTML = timer + 1
    }
  },
  'minus-break': () => {
    if (breakTimer > 5) {
      let timer = breakTimer--
      document.getElementById('set-break-display').innerHTML = timer - 1
    }
  },
  'add-timer': () => {
    if (sessionTimer < 99) {
      let timer = sessionTimer++
      document.getElementById('set-timer-display').innerHTML = timer + 1
      document.getElementById('timer-display-time').innerHTML =
        timer + 1 + ':00'
    }
  },
  'minus-timer': () => {
    if (sessionTimer > 25) {
      let timer = sessionTimer--
      document.getElementById('set-timer-display').innerHTML = timer - 1
      document.getElementById('timer-display-time').innerHTML =
        timer - 1 + ':00'
    }
  },
}

const buttonSettings = document.getElementsByClassName('setting-button')

for (let i = 0; i < buttonSettings.length; i++) {
  buttonSettings[i].addEventListener('click', () => {
    let operation = buttonSettings[i].getAttribute('id')
    settingOptions[operation]()
    startButton.classList.remove('hidden')
    resetButton.classList.add('hidden')
    spinner.classList.remove('spinning')
    clearInterval(timer)
    seconds = 60
    minutes = sessionTimer - 1
    elapsedPercent = 0
  })
}
