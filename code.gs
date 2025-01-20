// Add your OpenAI Key & Org here
var openAIKey = 'SK-';
var openAIOrg = 'ORG-';

// Modify system & prompt message to meet your email filtering needs
// Here I specifically did it to filter out sales outreach emails
var systemMessage = 'You are a highly intelligent AI trained to identify sales outreach emails. You only respond with Yes or No';
var promptMessage = 'Is this email a sales outreach? Only respond with Yes or No';

// GPT model
var model = 'gpt-4o-mini';


function run() {
  // Get the 10 latest Gmail threads that are unread
  var threads = GmailApp.getInboxThreads(0, 10);

  // Get each label
  var aiEmailSpamLabel = GmailApp.getUserLabelByName("AI Email Spam");
  var processedByAIEmailFilterLabel = GmailApp.getUserLabelByName("Processed by AI Email Filter");
  

  // Iterate over all of the threads
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];

    // If the email thread is already read - do nothing
    if (!thread.isUnread()) {
      continue;
    }

    // If we already checked this, then do nothing
    if (hasLabel(thread, "Processed by AI Email Filter")) {
      continue;
    }

    // Automatically archive if it already has the AI Email Spam label
    if (hasLabel(thread, "AI Email Spam")) {
      thread.moveToArchive();
      continue;
    }



    // Get all messages in the thread
    var messages = thread.getMessages();

    // Get the last message (most recent)
    var lastMessage = messages[messages.length - 1];

    // Get the sender's email address
    var fromAddress = lastMessage.getFrom();

    // Check if I have emailed this email before
    if (!haveIEmailedThisAddress(fromAddress)) {
      var emailBody = lastMessage.getPlainBody()

      var isSalesOutreachEmail = classifyEmailWithChatGPT(emailBody)
      if (isSalesOutreachEmail) {
        // Add "AI Email Spam" Label
        thread.addLabel(aiEmailSpamLabel);

        // Archive
        thread.moveToArchive();
      } else {
        // Add the "Processed by AI Email Filter" label
        thread.addLabel(processedByAIEmailFilterLabel);
      }
    }
  }
}

function hasLabel(thread, labelName) {
  // Get all labels attached to the thread
  var labels = thread.getLabels();

  // Check if any of the labels match the labelName
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].getName() === labelName) {
      return true; // Label found
    }
  }
  return false; // Label not found
}

function extractContentBetweenAngleBrackets(str) {
    const regex = /<([^>]*)>/;
    const match = str.match(regex);
    return match ? match[1] : str;
}

function haveIEmailedThisAddress(emailAddress) {
  // Search for emails in the 'Sent' folder that were sent to the specific address
  var query = 'to:' + extractContentBetweenAngleBrackets(emailAddress) + ' in:sent';
  var threads = GmailApp.search(query);

  // If one or more threads are found, it means you've emailed this address
  return threads.length > 0;
}


function classifyEmailWithChatGPT(body) {
  var apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  var prompt = `Body: ${body}\n\n${promptMessage}`;

  var payload = {
    model: model,
    messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
    ]
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'headers': {
      'Authorization': `Bearer ${openAIKey}`,
      'OpenAI-Organization': openAIOrg
    }
  };

  var response = UrlFetchApp.fetch(apiEndpoint, options);
  var jsonResponse = JSON.parse(response.getContentText());

  // Parse the response to determine if it's a sales outreach
  var latestResponse = jsonResponse.choices[0].message.content.trim();
  Logger.log(latestResponse);
  return latestResponse.toLowerCase().includes("yes"); // Assumes the AI responds with a simple yes or no
}
