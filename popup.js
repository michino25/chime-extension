document.addEventListener("DOMContentLoaded", () => {
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
    soundToggleButton: document.getElementById("sound-toggle"),
    soundToggleIcon: document.getElementById("sound-toggle-icon"),
  };

  const CLASS_ACTIVE_TAB = ["text-blue-600", "bg-gray-100", "active"];
  const CLASS_INACTIVE_TAB = ["hover:text-gray-600", "hover:bg-gray-50"];

  function activateTab(selectedTab, otherTab, selectedSettings, otherSettings) {
    selectedTab.classList.add(...CLASS_ACTIVE_TAB);
    selectedTab.classList.remove(...CLASS_INACTIVE_TAB);

    otherTab.classList.remove(...CLASS_ACTIVE_TAB);
    otherTab.classList.add(...CLASS_INACTIVE_TAB);

    selectedSettings.classList.remove("hidden");
    otherSettings.classList.add("hidden");
  }

  function activateHourlyTab() {
    activateTab(
      elements.tabHourly,
      elements.tabRecurring,
      elements.hourlySettings,
      elements.recurringSettings
    );
  }

  function activateRecurringTab() {
    activateTab(
      elements.tabRecurring,
      elements.tabHourly,
      elements.recurringSettings,
      elements.hourlySettings
    );
  }

  function loadSettings() {
    chrome.storage.sync.get(
      ["mode", "interval", "message", "soundEnabled"],
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
          activateHourlyTab();
        }

        updateNextAlertStatus();
        updateSoundToggleIcon(data.soundEnabled !== false);
      }
    );
  }

  function updateStatus(message, isError = false) {
    elements.statusDiv.classList.toggle("text-blue-600", !isError);
    elements.statusDiv.classList.toggle("text-red-500", isError);
    elements.statusDiv.textContent = message;

    if (!isError) {
      setTimeout(() => {
        updateNextAlertStatus();
      }, 5000);
    }
  }

  function updateNextAlertStatus() {
    chrome.alarms.getAll((alarms) => {
      if (alarms.length === 0) {
        elements.statusDiv.textContent = "";
        return;
      }
      const nextAlarm = alarms.reduce((earliest, alarm) =>
        alarm.scheduledTime < earliest.scheduledTime ? alarm : earliest
      );
      const nextAlertDate = new Date(nextAlarm.scheduledTime);
      elements.statusDiv.textContent = `Next chime at: ${nextAlertDate.toLocaleTimeString()}`;
    });
  }

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

  function updateSoundToggleIcon(soundEnabled) {
    if (soundEnabled) {
      elements.soundToggleIcon.src = "/assets/noti.png";
      elements.soundToggleIcon.alt = "Sound On";
    } else {
      elements.soundToggleIcon.src = "/assets/mute.png";
      elements.soundToggleIcon.alt = "Sound Off";
    }
  }

  function handleSoundToggleClick() {
    chrome.runtime.sendMessage({ action: "toggle-sound" }, (response) => {
      updateSoundToggleIcon(response.soundEnabled);
    });
  }

  elements.tabHourly.addEventListener("click", activateHourlyTab);
  elements.tabRecurring.addEventListener("click", activateRecurringTab);
  elements.startButton.addEventListener("click", handleStartButtonClick);
  elements.soundToggleButton.addEventListener("click", handleSoundToggleClick);

  loadSettings();
});
