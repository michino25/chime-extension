// Timer IDs to manage timers
let hourlyTimerId = null;
let recurringTimerId = null;

// Play notification sound
function playSound() {
  const audio = new Audio(chrome.runtime.getURL("notification.mp3"));
  audio.play().catch((error) => console.error("Error playing sound:", error));
}

// Create a notification
function sendNotification(title, message) {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: title,
      message: message,
      priority: 2,
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("Notification error:", chrome.runtime.lastError);
      } else {
        console.log("Notification created with ID:", notificationId);
      }
    }
  );
}

// Set up hourly alert
function setupHourlyAlert(message) {
  const now = new Date();
  const nextAlert = new Date();
  nextAlert.setHours(now.getHours() + 1, 0, 0, 0);

  const delay = nextAlert.getTime() - now.getTime();

  hourlyTimerId = setTimeout(() => {
    sendNotification(
      "Thông báo Timer",
      `Đã đến giờ: ${nextAlert.getHours()}h\n${message}`
    );
    playSound();

    // Set up next hourly alert
    setupHourlyAlert(message);
  }, delay);

  // Update next alert time in storage
  chrome.storage.sync.set({ nextAlert: nextAlert.getTime() });
}

// Set up recurring alert
function setupRecurringAlert(intervalMinutes, message) {
  const now = new Date();
  const nextAlert = new Date(now.getTime() + intervalMinutes * 60 * 1000);

  recurringTimerId = setInterval(() => {
    const currentTime = new Date();
    sendNotification(
      "Thông báo Timer",
      `Đã hết ${intervalMinutes} phút tại ${currentTime.toLocaleTimeString()}\n${message}`
    );
    playSound();

    // Update next alert time in storage
    const nextAlertTime = new Date(
      currentTime.getTime() + intervalMinutes * 60 * 1000
    );
    chrome.storage.sync.set({ nextAlert: nextAlertTime.getTime() });
  }, intervalMinutes * 60 * 1000);

  // Update next alert time in storage
  chrome.storage.sync.set({ nextAlert: nextAlert.getTime() });
}

// Clear all timers
function clearAllTimers() {
  if (hourlyTimerId !== null) {
    clearTimeout(hourlyTimerId);
    hourlyTimerId = null;
    console.log("Hourly timer cleared.");
  }
  if (recurringTimerId !== null) {
    clearInterval(recurringTimerId);
    recurringTimerId = null;
    console.log("Recurring timer cleared.");
  }
}

// Handle incoming messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start-timer") {
    clearAllTimers();

    if (message.mode === "hourly") {
      setupHourlyAlert(message.message);
      sendResponse({ status: "Chuông báo theo giờ đã được thiết lập." });
    } else if (message.mode === "recurring") {
      setupRecurringAlert(message.interval, message.message);
      sendResponse({
        status: `Chuông báo lặp lại mỗi ${message.interval} phút đã được thiết lập.`,
      });
    } else {
      sendResponse({ error: "Chế độ không hợp lệ." });
    }
  }
  return true;
});
