# 🚀 Deploying your Exam Planner to Render

Follow these steps to get your app live on the web!

## 1. Prepare your GitHub Repository
- Make sure all your changes are committed and pushed to your GitHub repository.
- Ensure `exams.json` is included (it will be the initial data).

## 2. Create a New Web Service on Render
1.  Go to [Render](https://dashboard.render.com/) and log in.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub/GitLab account and select the **examplanner** repository.

## 3. Configure the Build and Start Settings
Render will ask for the following details:
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`

## 4. Set Environment Variables
Your app currently has the username/password hardcoded in `server.js` (`ananya` / `ts123`) for convenience, but Render allows you to change them easily.
1.  Scroll down to the **Environment** section.
2.  (Optional) You can add custom environment variables if you ever want to change the credentials without editing the code.

## 5. Deploy!
- Click **Create Web Service**.
- Render will start building your app. It will take a few minutes.
- Once finished, you'll see a URL (e.g., `https://exam-planner-xxx.onrender.com`).

---

### ⚠️ Important Note on Data Persistence
Render's free tier uses an **ephemeral disk**. 
- Whenever you redeploy or the server restarts, `exams.json` will reset to its original state in your GitHub repo.
- **Solution**: For a personal app, this might be fine if you update it via GitHub. For permanent storage, you would typically use a Database (like MongoDB Atlas), which I can help you set up next if you'd like!
