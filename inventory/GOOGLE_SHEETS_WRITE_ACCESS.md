# Adding Items to Google Sheets - Next Steps

## Overview
Currently, your inventory page has **read-only** access to Google Sheets via CSV export. To enable adding/editing items directly from the web page, you'll need to set up write access to your Google Sheet.

## Option 1: Google Apps Script Web App (Recommended - Easiest)

This is the simplest approach that doesn't require a backend server.

### Steps:

1. **Open your Google Sheet**
   - Go to your Google Sheets document
   - Click `Extensions` → `Apps Script`

2. **Create a Web App Script**
   - Delete the default code and paste this template:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data['Item Name']) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Item Name is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add new row
    const row = [
      data['Item ID'] || '',
      data['Item Name'] || '',
      data['Category'] || '',
      data['Model / Version'] || '',
      data['Status'] || 'Available',
      data['Quantity Owned'] || '1',
      data['Quantity In Use'] || '0',
      data['Quantity Available'] || data['Quantity Owned'] || '1',
      data['Location'] || '',
      data['Use Cases'] || '',
      data['AI Tags'] || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Item added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // For testing - returns sheet headers
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return ContentService.createTextOutput(JSON.stringify({
    headers: headers
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. **Deploy as Web App**
   - Click `Deploy` → `New deployment`
   - Choose type: `Web app`
   - Description: "Inventory API"
   - Execute as: `Me`
   - Who has access: `Anyone` (or `Anyone with Google account` for more security)
   - Click `Deploy`
   - Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/.../exec`)

4. **Update Your HTML**
   - Add a form/modal for adding items
   - Use `fetch()` to POST data to your Web App URL
   - Handle authentication if needed

### Security Note:
- For production, consider adding a simple API key check in the Apps Script
- Or restrict access to specific Google accounts

---

## Option 2: Google Sheets API with OAuth (More Complex)

This requires a backend server for secure OAuth handling.

### Steps:

1. **Enable Google Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google Sheets API"
   - Create OAuth 2.0 credentials

2. **Backend Server Required**
   - You'll need a server (Node.js, Python, etc.) to:
     - Handle OAuth flow securely
     - Store refresh tokens
     - Make API calls to Google Sheets
   - Client-side JavaScript cannot securely store OAuth tokens

3. **Implementation**
   - Backend endpoint: `POST /api/inventory/add`
   - Frontend sends data to your backend
   - Backend authenticates and writes to Google Sheets

### Example Backend (Node.js):
```javascript
const { google } = require('googleapis');
const express = require('express');
const app = express();

app.post('/api/inventory/add', async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  // Add row logic here
});
```

---

## Option 3: Service Account (For Server-to-Server)

Best for automated systems, not user-facing web apps.

### Steps:

1. Create Service Account in Google Cloud Console
2. Share your Google Sheet with the service account email
3. Use service account credentials in backend
4. No user interaction needed

---

## Recommended Approach for Your Use Case

**Use Option 1 (Google Apps Script Web App)** because:
- ✅ No backend server needed
- ✅ Free and easy to set up
- ✅ Works directly with your existing Google Sheet
- ✅ Can be secured with API keys or Google account restrictions
- ✅ Fast to implement

### Next Implementation Steps:

1. Set up the Apps Script (follow Option 1 above)
2. Add a form/modal to the inventory page for adding items
3. Create JavaScript function to submit data to your Web App URL
4. Add validation and error handling
5. Refresh the inventory table after successful addition

### Example Frontend Code (to add after Apps Script is set up):

```javascript
const WEB_APP_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

async function addItem(itemData) {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData)
    });
    
    const result = await response.json();
    if (result.success) {
      // Reload inventory
      await loadInventory();
      return true;
    } else {
      alert('Error: ' + result.error);
      return false;
    }
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Failed to add item. Please try again.');
    return false;
  }
}
```

---

## Security Considerations

1. **API Key Protection**: Add a simple API key check in Apps Script
2. **Input Validation**: Validate all fields before writing
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Access Control**: Restrict Web App access to specific Google accounts if needed

---

## Testing

1. Test the Apps Script Web App URL with a tool like Postman
2. Verify data appears correctly in your Google Sheet
3. Test error handling (missing fields, invalid data)
4. Test from the web page once integrated

