let totalTime = 0;
let questionTime = 0;
let interval;
let historyLog = [];



if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(registration => {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

function startTimer() {
  interval = setInterval(() => {
    totalTime++;
    questionTime++;
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    document.getElementById('current-question').textContent = `Current Question: ${formatTime(questionTime)}`;
  }, 1000);
}

function formatTime(time) {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor((time % 3600) / 60);
  let seconds = time % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function nextQuestion() {
  clearInterval(interval);
  historyLog.push(`Question: ${formatTime(questionTime)}`);
  questionTime = 0;
  startTimer();
  updateHistory();
}

function startBreak() {
  clearInterval(interval);
  if (questionTime > 0) {
    historyLog.push(`Question: ${formatTime(questionTime)}`);
    questionTime = 0;
  }
  interval = setInterval(() => {
    totalTime++;
    questionTime++;
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    document.getElementById('current-question').textContent = `Break Time: ${formatTime(questionTime)}`;
  }, 1000);
  updateHistory();
}

function startTheory() {
  clearInterval(interval);
  if (questionTime > 0) {
    historyLog.push(`Question: ${formatTime(questionTime)}`);
    questionTime = 0;
  }
  interval = setInterval(() => {
    totalTime++;
    questionTime++;
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    document.getElementById('current-question').textContent = `Theory Time: ${formatTime(questionTime)}`;
  }, 1000);
  updateHistory();
}


function endSession() {
  clearInterval(interval);
  historyLog.push(`End Session: ${formatTime(totalTime)}`);
  updateHistory();
  totalTime = 0;
  questionTime = 0;
  document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
  document.getElementById('current-question').textContent = `Current Question: ${formatTime(questionTime)}`;
}

function updateHistory() {
  const historyElement = document.getElementById('session-history');
  historyElement.innerHTML = ''; // Clear history

  // Create a copy of the historyLog and reverse it for display purposes
  const reversedLog = [...historyLog].reverse();
  
  reversedLog.forEach((log, index) => {
    const logElement = document.createElement('div');
    // The index for the most recent log will be the length of the array minus the current index
    logElement.textContent = `${reversedLog.length - index}. ${log}`;
    // Append the new element at the top
    historyElement.appendChild(logElement);
  });
}


let currentActivity = 'Question'; // Variable to track the current activity type

function startActivity(activityType) {
  clearInterval(interval);
  if (questionTime > 0) {
    // Log the previous activity with its corresponding time
    historyLog.push(`${currentActivity}: ${formatTime(questionTime)}`);
  }
  currentActivity = activityType; // Update the current activity type
  questionTime = 0; // Reset the question time for the new activity
  interval = setInterval(() => {
    totalTime++;
    questionTime++;
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    // Update the label depending on the current activity
    document.getElementById('current-question').textContent = `${currentActivity} Time: ${formatTime(questionTime)}`;
  }, 1000);
  updateHistory();
}

function endCurrentActivity() {
  if (interval) {
    clearInterval(interval);
    if (questionTime > 0) {
      // Log the ending activity with its corresponding time
      historyLog.push(`${currentActivity}: ${formatTime(questionTime)}`);
      questionTime = 0; // Reset the question time
    }
    updateHistory();
  }
  currentActivity = 'Question'; // Reset the current activity type to default
}

// Modify your existing buttons to use the startActivity function
document.getElementById('next-question').addEventListener('click', () => startActivity('Question'));
document.getElementById('break').addEventListener('click', () => startActivity('Break'));
document.getElementById('theory').addEventListener('click', () => startActivity('Theory'));
document.getElementById('end-session').addEventListener('click', endCurrentActivity);





startTimer(); // Start the timer automatically when the page loads
