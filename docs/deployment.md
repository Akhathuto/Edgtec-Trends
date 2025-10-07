# Deploying on Vercel: A Step-by-Step Guide

This guide will walk you through the process of deploying your `utrend` application to Vercel, a cloud platform for frontend developers that makes deployment simple and fast.

## Prerequisites

Before you begin, ensure you have the following:

1.  **A Vercel Account:** If you don't have one, sign up for free at [vercel.com](https://vercel.com/). It's recommended to sign up using your GitHub, GitLab, or Bitbucket account.
2.  **A Git Provider Account:** Your project code needs to be in a Git repository (e.g., on GitHub).
3.  **Project Code Pushed to Git:** Make sure your latest code is pushed to your remote repository.

---

## Step 1: Push Your Project to a Git Repository

Vercel deploys directly from your Git repository. If you haven't already, push your project to a provider like GitHub.

1.  **Initialize a Git repository** (if you haven't already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create a new repository** on GitHub (or your preferred provider).

3.  **Link your local repository to the remote one and push your code:**
    ```bash
    # Link your project to the remote repository
    git remote add origin https://github.com/Akhathuto/Edgtec-Trends.git
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Import Your Project on Vercel

1.  **Log in to your Vercel dashboard.**
2.  Click the **"Add New..."** button and select **"Project"**.
3.  The "Import Git Repository" screen will appear. Find your project's repository in the list and click the **"Import"** button next to it.
    *   If you don't see your repository, you may need to configure your Vercel account to have access to it. Follow the on-screen prompts to adjust permissions.

---

## Step 3: Configure Your Project

This is the most important step. Vercel is smart and will likely auto-detect that you are using **Vite**, but you must configure your environment variable.

1.  **Framework Preset:** Vercel should automatically detect **Vite** as the framework. If it doesn't, select it from the dropdown menu.

2.  **Build and Output Settings:** Vercel's default settings for Vite are usually correct. You shouldn't need to change them, but you can verify they are:
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
    *   **Install Command:** `npm install`

3.  **Environment Variables (CRITICAL):** Your application requires the Google Gemini API key to function.
    *   Expand the **"Environment Variables"** section.
    *   Enter `API_KEY` in the **"Name"** field.
    *   Paste your actual Google Gemini API key into the **"Value"** field.
    *   Click the **"Add"** button.

    > **⚠️ Important:** The name must be exactly `API_KEY`. Do not use any other name, as the application code specifically looks for this variable.



---

## Step 4: Deploy

Once you have configured the environment variable, simply click the **"Deploy"** button.

Vercel will now start the build process. It will install your dependencies, run the `npm run build` command, and deploy the contents of the `dist` directory. You can watch the build logs in real-time.

---

## Step 5: All Done!

After a few moments, the deployment will complete, and you'll see a congratulations screen with a screenshot of your live application.

-   Click **"Continue to Dashboard"** or directly on the screenshot to visit your newly deployed `utrend` application.
-   Your app is now live and accessible via the URL provided by Vercel!

### Future Deployments

From now on, every time you push a new commit to your `main` branch, Vercel will automatically trigger a new deployment, keeping your live application up-to-date with your latest changes.