document.addEventListener("DOMContentLoaded", () => {
  // Element selectors
  const elements = {
    tabHourly: document.getElementById("tab-hourly"),
    tabRecurring: document.getElementById("tab-recurring"),
    hourlySettings: document.getElementById("hourly-settings"),
    recurringSettings: document.getElementById("recurring-settings"),
    startButton: document.getElementById("start-timer"),
    statusDiv: document.getElementById("status"),
    hourlyMessageInput: document.getElementById("hourly-message"),
    recurringIntervalInput: document.getElementById("recurring-interval"),
    recurringMessageInput: document.getElementById("recurring-message"),
  };

  const CLASS_ACTIVE_TAB = ["text-blue-600", "bg-gray-100", "active"];
  const CLASS_INACTIVE_TAB = ["hover:text-gray-600", "hover:bg-gray-50"];

  // Handle tab activation
  function activateTab(selectedTab, otherTab, selectedSettings, otherSettings) {
    selectedTab.classList.add(...CLASS_ACTIVE_TAB);
    selectedTab.classList.remove(...CLASS_INACTIVE_TAB);

    otherTab.classList.remove(...CLASS_ACTIVE_TAB);
    otherTab.classList.add(...CLASS_INACTIVE_TAB);

    selectedSettings.classList.remove("hidden");
    otherSettings.classList.add("hidden");
  }

  // Activate Hourly Tab
  function activateHourlyTab() {
    activateTab(
      elements.tabHourly,
      elements.tabRecurring,
      elements.hourlySettings,
      elements.recurringSettings
    );
  }

  // Activate Recurring Tab
  function activateRecurringTab() {
    activateTab(
      elements.tabRecurring,
      elements.tabHourly,
      elements.recurringSettings,
      elements.hourlySettings
    );
  }

  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(
      ["mode", "interval", "message", "nextAlert"],
      (data) => {
        if (data.mode === "hourly") {
          activateHourlyTab();
          if (data.message) {
            elements.hourlyMessageInput.value = data.message;
          }
        } else if (data.mode === "recurring") {
          activateRecurringTab();
          if (data.interval) {
            elements.recurringIntervalInput.value = data.interval;
          }
          if (data.message) {
            elements.recurringMessageInput.value = data.message;
          }
        } else {
          // Default to hourly mode
          activateHourlyTab();
        }

        updateNextAlertStatus(data.nextAlert);
      }
    );
  }

  // Update status message
  function updateStatus(message, isError = false) {
    elements.statusDiv.classList.toggle("text-blue-600", !isError);
    elements.statusDiv.classList.toggle("text-red-500", isError);
    elements.statusDiv.textContent = message;

    if (!isError) {
      setTimeout(() => {
        chrome.storage.sync.get("nextAlert", (data) => {
          updateNextAlertStatus(data.nextAlert);
        });
      }, 5000); // Hide message after 5 seconds
    }
  }

  // Update next alert status
  function updateNextAlertStatus(nextAlert) {
    if (nextAlert) {
      const nextAlertDate = new Date(nextAlert);
      elements.statusDiv.textContent = `Chuông báo tiếp theo vào lúc: ${nextAlertDate.toLocaleTimeString()}`;
    } else {
      elements.statusDiv.textContent = "";
    }
  }

  // Handle "Start" button click
  function handleStartButtonClick() {
    const selectedMode = elements.tabHourly.classList.contains("active")
      ? "hourly"
      : "recurring";

    const payload = {
      action: "start-timer",
      mode: selectedMode,
      message: "",
    };

    if (selectedMode === "hourly") {
      payload.message = elements.hourlyMessageInput.value.trim();
    } else {
      payload.interval = parseInt(elements.recurringIntervalInput.value, 10);
      payload.message = elements.recurringMessageInput.value.trim();
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
  }

  // Event listeners
  elements.tabHourly.addEventListener("click", activateHourlyTab);
  elements.tabRecurring.addEventListener("click", activateRecurringTab);
  elements.startButton.addEventListener("click", handleStartButtonClick);

  // Initialize the popup
  loadSettings();
});
