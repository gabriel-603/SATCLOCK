let totalTime = 0;
let questionTime = 0;
let interval;
let historyLog = [];
let currentActivity = 'Question'; // Variable to track the current activity type
let mode = 'math'; // Default mode

// Function to toggle mode
let currentModeForLog = 'MTH'; // Default log mode

function toggleMode() {
  mode = mode === 'math' ? 'rw' : 'math';
  currentModeForLog = mode === 'math' ? 'MTH' : 'RW';


   document.getElementById('current-question').textContent = `${currentActivity} Time: ${formatTime(questionTime)}`;
}
  // Update the text and classes for all relevant elements
 
function logCurrentActivity() {
  if (questionTime > 0) {
    historyLog.push(`${currentActivity}: ${formatTime(questionTime)}`);
    questionTime = 0;
    updateHistory();
  }
}
  

// Ensure this is called to update the display initially
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


function setCurrentActivity(activity) {
  currentActivity = activity; // Set the current activity type
  document.getElementById('current-question').textContent = `${currentActivity} Time: ${formatTime(questionTime)}`;
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
  setCurrentActivity(mode === 'math' ? 'MTH Question' : 'RW Question');
  historyLog.push(`${currentModeForLog} Question: ${formatTime(questionTime)}`);
  questionTime = 0;
  startTimer();
  updateHistory();
}

function startBreak() {
  currentActivity = 'Break'; // Set the current activity to break
  clearInterval(interval);
  logCurrentActivity(); // Log the current activity before starting the break timer
  interval = setInterval(() => {
    totalTime++;
    questionTime++;
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    document.getElementById('current-question').textContent = `Break Time: ${formatTime(questionTime)}`;
  }, 1000);
}

// Function to handle starting theory study
function startTheory() {
  currentActivity = 'Theory'; // Set the current activity to theory
  clearInterval(interval);
  logCurrentActivity(); // Log the current activity before starting the theory timer
  interval = setInterval(() => {
    totalTime++;
    questionTime++;
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    document.getElementById('current-question').textContent = `Theory Time: ${formatTime(questionTime)}`;
  }, 1000);
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
  const reversedLog = [...historyLog].reverse();

  reversedLog.forEach((log, index) => {
    const logElement = document.createElement('div');
    logElement.textContent = `${reversedLog.length - index}. ${log}`;
    historyElement.appendChild(logElement);
  });
}

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
  
  const logEntry = `${currentActivity}: ${formatTime(questionTime)}`;
  const logElement = document.createElement('div');
  logElement.textContent = logEntry;
  // Add mode class to log element
  logElement.classList.add(bodyClassList.contains('math-mode') ? 'math-mode' : 'rw-mode');
  historyElement.insertBefore(logElement, historyElement.firstChild);
}

// Modify your existing buttons to use the startActivity function
document.getElementById('mode-toggle').addEventListener('click', toggleMode);
document.getElementById('next-question').addEventListener('click', nextQuestion);
document.getElementById('break').addEventListener('click', startBreak);
document.getElementById('theory').addEventListener('click', startTheory);
document.getElementById('end-session').addEventListener('click', function() {
  // End the current session
  

  // Prompt the user to ask if they want a report
  const userWantsReport = window.confirm("Do you want to download a report of this session?");
  
  if (userWantsReport) {
    // Call a function to generate and download the CSV
    downloadCSV(historyLog);
  }
  endCurrentActivity();
});

function downloadCSV(logArray) {
  // Define the header for the CSV
  let csvContent = "Index,Type,Mode,Time\n";

  // Iterate over the log array to build the CSV content
  logArray.forEach((entry, index) => {
    // Assuming your log entries are in the format "Type Mode: Time"
    let [typeMode, time] = entry.split(': ');
    let [mode, type] = typeMode.split(' '); // Split the type and mode
    // Add the data to the CSV content
    let content= `${index + 1},${type == undefined ? mode: type},${type == undefined ? "": mode},${time}\n`;
    csvContent += content
  });

  // Convert the CSV string to a Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  // Create a link and set the URL to the blob
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'session_history.csv');

  // Append to the document, trigger the download, then remove the link
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}




document.body.classList.add('math-mode');

window.addEventListener('load', () => {
  startTimer(); // Or any other initialization function you have
  toggleMode(); // This sets the initial mode to Math, toggle to switch to RW
});