let recurringTimers = {};

// Phát âm thanh thông báo
function playSound() {
  const audio = new Audio(chrome.runtime.getURL("notification.mp3"));
  audio.play().catch((error) => console.error("Lỗi khi phát âm thanh:", error));
}

// Tạo thông báo
function sendNotification(title, message) {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "empty.png",
      title: title,
      message: message,
      priority: 2,
    },
    (notificationId) =>
      console.log("Thông báo đã được tạo với ID:", notificationId)
  );
}

// Hàm chuông báo theo giờ
function setupHourlyAlert(message) {
  const now = new Date();
  let nextAlert = new Date(now.getTime());
  nextAlert.setMinutes(0, 0, 0); // Thiết lập thời điểm đầu giờ
  if (nextAlert <= now) {
    nextAlert.setHours(nextAlert.getHours() + 1);
  }

  const delay = nextAlert.getTime() - now.getTime();

  setTimeout(() => {
    sendNotification(
      "Thông báo Timer",
      `Đã đến giờ: ${nextAlert.getHours()}h\n${message}`
    );
    playSound();

    // Cập nhật thời gian báo tiếp theo vào storage
    chrome.storage.sync.set({ nextAlert: nextAlert.getTime() }, () =>
      console.log("Next alert time đã được cập nhật.")
    );

    // Thiết lập chuông báo giờ tiếp theo
    setupHourlyAlert(message);
  }, delay);

  // Cập nhật trạng thái chuông báo giờ tiếp theo
  chrome.storage.sync.set({ nextAlert: nextAlert.getTime() });
}

// Hàm chuông báo lặp lại
function setupRecurringAlert(intervalMinutes, message) {
  const timerId = setInterval(() => {
    const now = new Date();
    sendNotification(
      "Thông báo Timer",
      `Đã hết ${intervalMinutes} phút tại ${now.toLocaleTimeString()}\n${message}`
    );
    playSound();

    const nextAlert = new Date(now.getTime() + intervalMinutes * 60 * 1000);
    chrome.storage.sync.set({ nextAlert: nextAlert.getTime() });
  }, intervalMinutes * 60 * 1000);

  recurringTimers[intervalMinutes] = timerId;

  // Cập nhật nextAlert lần đầu tiên ngay khi thiết lập
  const now = new Date();
  const nextAlert = new Date(now.getTime() + intervalMinutes * 60 * 1000);
  chrome.storage.sync.set({ nextAlert: nextAlert.getTime() });
}

// Hủy bỏ tất cả các timers
function clearAllTimers() {
  for (const interval in recurringTimers) {
    clearInterval(recurringTimers[interval]);
    console.log(`Đã hủy bỏ timer cho khoảng thời gian: ${interval} phút`);
  }
  recurringTimers = {};
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start-timer") {
    clearAllTimers();

    if (message.mode === "hourly") {
      setupHourlyAlert(message.message);
      sendResponse({ status: "Chuông báo theo giờ đã được thiết lập." });
    } else if (message.mode === "recurring") {
      if (![15, 30, 45, 60].includes(message.interval)) {
        sendResponse({
          error:
            "Khoảng thời gian không hợp lệ. Vui lòng chọn 15, 30, 45 hoặc 60 phút.",
        });
        return;
      }
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
