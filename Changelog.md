
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-07-02

### Added
- **New Fun Commands**:
  - Added `messi` command for Messi-related content
  - Added `gun` command for gun-related imagery 🔫
  - Added `www` command for fun interactions 😴🥵
  - Added `loli`, `qr-code`, and `squidwardgrave` commands for image generation
  - Added `chill-guy` command to generate Chill Guy meme images
  - Added special character-themed commands with fun animations 🐦‍🔥
  - Added `bonk` and `luffy` commands for fun image generation
  - Added `gay2` command to apply pride overlay to images with fun messages
  - Added `CVO` meme generation command
  
- **Gaming Features**:
  - Added `RPS` (Rock, Paper, Scissors) game command with betting functionality
  
- **Utility Commands**:
  - Added `whois` command for user information lookup
  - Added `confess` command to send romantic anime images with messages
  - Added `pinterest` command - one of the most requested features 🚨
  - Added `dream` command for AI image generation
  - Added `art` command for generating AI art based on user prompts
  - Added `NGL` command for sending messages to usernames
  
- **Administrative Features**:
  - Added VIP management command and updated configuration
  - Added owner command functionality
  - Added event handler improvements

### Changed
- **Command Improvements**:
  - Updated command versions for better stability
  - Enhanced error handling in `rank`, `sing`, and `ytdl` commands
  - Refactored YouTube download command to use primary and fallback APIs
  - Added progress messaging for better user feedback
  
- **System Updates**:
  - Added HTML implementation for Uptime Robot integration
  - Enhanced uptime command with custom card display
  - Fixed index errors and improved overall stability

### Removed
- Removed unused dashboard styles
- Removed dashboard folder for streamlined codebase


  

## [2.1.0] - 2025-04-24

  

### Added

-  **Enhanced Error Handling in Bot Restart**:

- Added detailed logging in the `/api/restart` endpoint to track the restart process step-by-step.

- Improved `stopBot()` function with proper cleanup of Express server and database connections.

- Added checks to ensure `serverInstance` and `db` exist before attempting to close them.

-  **Retry Mechanism for Sending Messages**:

- Added a retry mechanism in the frontend (`index.html`) for the "Send Message" feature, which attempts to restart the bot if the API instance is not initialized.

- Logs detailed responses in the browser console for easier debugging.

-  **Session Timeout for Security**:

- Added a session timeout feature in the dashboard that logs out users after 30 minutes of inactivity.

-  **Bot Status Monitoring**:

- Added a periodic check (`checkBotStatus`) in the dashboard to monitor bot responsiveness every 30 seconds, logging warnings if the bot appears disconnected.

-  **Restart Confirmation**:

- Added a confirmation dialog in the dashboard to prevent accidental bot restarts.

  

### Changed

-  **Dashboard Updates**:

- Improved the dashboard UI with better error feedback:

- Added console logging for all API responses (restart, send message, update config) to help debug issues.

- Added a preloader during restart and config updates to improve user experience.

- Ensured the settings UI reloads the config after saving to reflect the latest changes.

- Updated the sidebar to be more responsive, automatically expanding on larger screens and collapsing on mobile unless manually expanded.

- Modified the "Send Message" feature to handle API instance issues gracefully with retries.

- Updated the "Settings" section to force a UI refresh after saving, ensuring the displayed values match the updated `config.json`.

-  **Logging Improvements**:

- Enhanced logging in `index.js` to provide more context during bot startup, shutdown, and API interactions.

- Added intermediate logs in the restart process to track progress and failures.

  

### Fixed

-  **Failed to Restart Bot**:

- Resolved issues with the bot restart process by improving error handling in `stopBot()` and `startBot()`.

- Fixed potential issues with database connection closure and Express server shutdown.

-  **Failed to Send Message**:

- Fixed the "API instance not initialized" error by adding a retry mechanism that triggers a bot restart if needed.

- Improved error logging to identify specific FCA API issues (e.g., invalid thread IDs, authentication failures).

-  **Settings Not Updating**:

- Ensured the `/api/update-config` endpoint writes to `config.json` reliably with proper error handling.

- Fixed UI issues by reloading the config after saving, ensuring the dashboard reflects the updated settings.

- Added a restart trigger after config updates to apply the new settings immediately.

  

### Screenshots

Below is a screenshot of the updated dashboard (version 2.1.0):

  

![Screenshot 2025-04-24 152231](https://github.com/user-attachments/assets/9260dce7-ace7-4109-895c-fdc82ab9a454)

![Screenshot 2025-04-24 152247](https://github.com/user-attachments/assets/cc7cf0f8-f2ec-44d1-8108-b116851096b6)

![Screenshot 2025-04-24 152317](https://github.com/user-attachments/assets/1ef3f929-dbfe-49f3-a896-ec1301b33273)

![Screenshot 2025-04-24 152338](https://github.com/user-attachments/assets/36236847-2bef-4977-975a-2a6534013742)

  
  

*Note*: The screenshot shows the updated dashboard with improved error feedback, a preloader during actions, and a more responsive sidebar.

  

---

  

## [2.0.0] - 2025-03-15

*Previous version details omitted for brevity.*