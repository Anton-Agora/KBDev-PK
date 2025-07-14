# Player Kill 1v1 (Agora React Demo)

A simple TikTok-style 1v1 streaming app using Agora RTC and RTM, built with React.

## ⚠️ Required Setup Before Use

### 1. **Change the Agora App ID**
- Open `src/App.jsx`
- Replace the value of `AGORA_APP_ID` with your Agora App ID:
  ```js
  const AGORA_APP_ID = "YOUR_AGORA_APP_ID"; // <-- Replace this!
  ```

### 2. **Use an Agora Project with NO Certificate**
- In the [Agora Console](https://console.agora.io/):
  - Create a new project **without enabling App Certificate**.
  - This allows you to use the static App ID for local testing (no token required).
  - If you enable App Certificate, you must implement a token server (not covered in this demo).

### 3. **Enable Co-Host Authentication**
- In your Agora project settings, **enable Co-Host authentication**.
- This is required for both players to join and stream in the same channel.

---

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the app:**
   - Go to [http://localhost:5173/](http://localhost:5173/) in your browser.

4. **Test the app:**
   - Open two tabs/windows, select "Player 1" in one and "Player 2" in the other.
   - Open more tabs as "Viewer" to send reactions.
   - The player with the most reactions wins.

---

## 📝 Notes

- **If you see errors about tokens or authentication:**  
  Double-check that your Agora project has **no certificate enabled** and you are using a valid App ID.
- **For production:**  
  You must use a token server if your project has a certificate enabled. See [Agora Token Docs](https://docs.agora.io/en/Video/token?platform=Web).

---

## 📁 Project Structure

- `src/App.jsx` — Main app logic (role selection, video, reactions)
- `src/main.jsx` — React entry point
- `index.html` — App root
- `package.json` — Project dependencies and scripts

---

## 🏆 Credits

- Built with [Agora RTC SDK](https://www.agora.io/en/products/rtc/) and [Agora RTM SDK](https://www.agora.io/en/products/rtm/)
- Inspired by TikTok 1v1 streaming
