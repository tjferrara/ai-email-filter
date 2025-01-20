
# AI Email Filter

## What Does This Script Do?
1. Looks at the 10 most recent emails that came in.
2. Checks if you have ever emailed this person before. If you have, then stop.
3. Otherwise, check if you have already labeled it as either **"AI Email Spam"** or **"Processed by AI Email Filter"**. If it has been labeled, then stop.
4. Otherwise, send that email to GPT via an API call and ask it if the email is Sales Outreach and to only respond with **"Yes"** or **"No"**.
5. If **Yes**:
   - Add the **"AI Email Spam"** label to the email and archive it.
6. If **No**:
   - Add the **"Processed by AI Email Filter"** label and do nothing.
   - This ensures the email is not repeatedly checked due to step #3.

---

## Steps to Implement

### 1. Create a New OpenAI API Key
1. Go to [OpenAI API](https://platform.openai.com/signup).
2. Create a new secret API key.

---

### 2. Create Gmail Labels
1. Create a new label titled **"Processed by AI Email Filter"**.
2. *(Optional)* Update the settings to hide the label if desired.

---

### 3. Setup Google App Script
1. Create a new project:
   - Go to [Google Apps Script](https://script.google.com/home).
   - Click **New Project**.
2. Paste the provided script code.
3. Update the following variables in the script:
   - `openAIKey`
   - `openAIOrg`
4. Click **Run** to execute the script for the first time.
5. Authenticate the script when prompted.

---

### 4. Add a Trigger
1. Configure the trigger settings:
   - **Function to Run**: `run`
   - **Deployment**: `Head`
   - **Event Source**: `Time-driven`
   - **Type of Time-based Trigger**: `Minutes Timer`
   - **Interval**: `Every Minute`
2. Click **Save**.

---

You are now set up! If you encounter any issues, double-check the steps above.
