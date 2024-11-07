# Chime - Chrome Extension

**Chime** is a Chrome extension that provides time-based notifications with sound alerts. You can set up hourly chimes or recurring reminders at custom intervals.

## Features

- **Hourly Chimes**: Set up hourly notifications with customizable messages.
- **Recurring Reminders**: Receive notifications at intervals of 15, 30, 45, or 60 minutes.
- **Sound Alerts**: Each notification includes a sound alert to grab your attention.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/chime-extension.git
   ```

2. **Load the extension into Chrome**:
   - Open Chrome and navigate to `chrome://extensions`.
   - Enable "Developer mode" (toggle switch in the upper-right corner).
   - Click "Load unpacked" and select the cloned `chime-extension` directory.

## Usage

1. Click the Chime icon in the Chrome toolbar to open the extension's popup.
2. Choose between **Hourly** and **Recurring** tabs to set up your notifications:
   - **Hourly**: Set a custom message and receive notifications every hour.
   - **Recurring**: Choose an interval (15, 30, 45, or 60 minutes) and set a custom message.
3. Click "Start" to activate the timer. The next notification time will be displayed in the popup.
4. Notifications will appear at the chosen intervals with a sound alert.

## Development

To contribute or modify the extension, follow these steps:

1. **Fork the repository** and clone it locally.
2. **Make your changes** to the codebase.
3. **Test the extension**:
   - Reload the extension in Chrome by going to `chrome://extensions` and clicking the refresh icon.
4. **Submit a pull request** with a clear description of your changes.

## File Structure

- **manifest.json**: Configuration for the extension, including permissions and background scripts.
- **popup.html**: The HTML for the extension's popup interface.
- **popup.js**: JavaScript for handling user interactions in the popup.
- **background.js**: Background script that manages alarms, notifications, and sound playback.
- **offscreen.html / offscreen.js**: Offscreen document to handle audio playback (required by Chrome’s Manifest V3).
- **notification.mp3**: Sound file for the notification alert.

## Troubleshooting

If you encounter issues with the extension:

1. **Check Chrome Console Logs**:
   - Open `chrome://extensions`.
   - Locate Chime and click "service worker" under the extension to view logs.
2. **Common Issues**:
   - **No Sound**: Ensure that `notification.mp3` is accessible under `web_accessible_resources` in `manifest.json`.
   - **Permissions Error**: Double-check that the necessary permissions (`notifications`, `storage`, `alarms`, `offscreen`) are present in `manifest.json`.

## Contributing

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for using **Chime**! If you encounter any issues, feel free to open an issue or contact us.
