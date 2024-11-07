document.addEventListener("DOMContentLoaded", () => {
  const tabHourly = document.getElementById("tab-hourly");
  const tabRecurring = document.getElementById("tab-recurring");
  const hourlySettings = document.getElementById("hourly-settings");
  const recurringSettings = document.getElementById("recurring-settings");
  const startButton = document.getElementById("start-timer");
  const statusDiv = document.getElementById("status");
  const hourlyMessageInput = document.getElementById("hourly-message");
  const recurringIntervalSelect = document.getElementById("recurring-interval");
  const recurringMessageInput = document.getElementById("recurring-message");

  // Function to switch to hourly mode
  function activateHourlyTab() {
    // Update tab styles
    tabHourly.classList.add("text-blue-600", "bg-gray-100", "active");
    tabHourly.classList.remove("hover:text-gray-600", "hover:bg-gray-50");
    tabRecurring.classList.remove("text-blue-600", "bg-gray-100", "active");
    tabRecurring.classList.add("hover:text-gray-600", "hover:bg-gray-50");

    // Show/hide settings
    hourlySettings.classList.remove("hidden");
    recurringSettings.classList.add("hidden");
  }

  // Function to switch to recurring mode
  function activateRecurringTab() {
    // Update tab styles
    tabRecurring.classList.add("text-blue-600", "bg-gray-100", "active");
    tabRecurring.classList.remove("hover:text-gray-600", "hover:bg-gray-50");
    tabHourly.classList.remove("text-blue-600", "bg-gray-100", "active");
    tabHourly.classList.add("hover:text-gray-600", "hover:bg-gray-50");

    // Show/hide settings
    recurringSettings.classList.remove("hidden");
    hourlySettings.classList.add("hidden");
  }

  // Event listeners for tab clicks
  tabHourly.addEventListener("click", () => {
    activateHourlyTab();
  });

  tabRecurring.addEventListener("click", () => {
    activateRecurringTab();
  });

  // Function to load settings from storage and update UI
  function loadSettings() {
    chrome.storage.sync.get(
      ["mode", "hour", "interval", "message", "nextAlert"],
      (data) => {
        if (data.mode === "hourly") {
          activateHourlyTab();
          if (data.message) {
            hourlyMessageInput.value = data.message;
          }
        } else if (data.mode === "recurring") {
          activateRecurringTab();
          if (data.interval) {
            recurringIntervalSelect.value = data.interval;
          }
          if (data.message) {
            recurringMessageInput.value = data.message;
          }
        } else {
          // Default to hourly if no mode is set
          activateHourlyTab();
        }

        if (data.nextAlert) {
          const nextAlertDate = new Date(data.nextAlert);
          statusDiv.textContent = `Chuông báo tiếp theo vào lúc: ${nextAlertDate.toLocaleTimeString()}`;
        } else {
          statusDiv.textContent = "";
        }
      }
    );
  }

  // Call loadSettings when popup loads
  loadSettings();

  // Hàm hiển thị trạng thái
  function updateStatus(message, isError = false) {
    statusDiv.classList.toggle("text-blue-600", !isError);
    statusDiv.classList.toggle("text-red-500", isError);
    statusDiv.textContent = message;

    // Thiết lập lại trạng thái "Chuông báo tiếp theo vào lúc..." sau khi ẩn trạng thái thành công
    if (!isError) {
      setTimeout(() => {
        chrome.storage.sync.get("nextAlert", (data) => {
          if (data.nextAlert) {
            const nextAlertDate = new Date(data.nextAlert);
            statusDiv.textContent = `Chuông báo tiếp theo vào lúc: ${nextAlertDate.toLocaleTimeString()}`;
          }
        });
      }, 5000); // Ẩn thông báo sau 5 giây
    }
  }

  // Xử lý nút "Bắt đầu"
  startButton.addEventListener("click", () => {
    const selectedMode = tabHourly.classList.contains("active")
      ? "hourly"
      : "recurring";
    let payload = { action: "start-timer", mode: selectedMode };

    if (selectedMode === "hourly") {
      payload.message = hourlyMessageInput.value.trim();
    } else {
      payload.interval = parseInt(recurringIntervalSelect.value, 10);
      payload.message = recurringMessageInput.value.trim();
    }

    chrome.runtime.sendMessage(payload, (response) => {
      if (response && response.status) {
        updateStatus(response.status);
        chrome.storage.sync.set({
          mode: selectedMode,
          message: payload.message,
          interval: payload.interval,
        });
      } else if (response && response.error) {
        updateStatus(response.error, true);
      }
    });
  });
});
