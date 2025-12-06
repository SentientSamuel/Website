# Update Your Google Apps Script for Form Submission

## The Problem
CORS (Cross-Origin Resource Sharing) blocks direct fetch requests from your website to Google Apps Script. We've switched to form-based submission to avoid CORS issues.

## Solution: Update Your Google Apps Script

Your Google Apps Script needs to handle form data instead of JSON. Here's the updated script:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Get data from form parameters OR JSON
    let data;
    if (e.parameter.jsonData) {
      // If JSON data is provided, parse it
      data = JSON.parse(e.parameter.jsonData);
    } else {
      // Otherwise, use form parameters directly
      data = {
        'Item ID': e.parameter['Item ID'] || '',
        'Item Name': e.parameter['Item Name'] || '',
        'Category': e.parameter['Category'] || '',
        'Model / Version': e.parameter['Model / Version'] || '',
        'Status': e.parameter['Status'] || 'Available',
        'Quantity Owned': e.parameter['Quantity Owned'] || '1',
        'Quantity In Use': e.parameter['Quantity In Use'] || '0',
        'Quantity Available': e.parameter['Quantity Available'] || e.parameter['Quantity Owned'] || '1',
        'Location': e.parameter['Location'] || '',
        'Use Cases': e.parameter['Use Cases'] || '',
        'AI Tags': e.parameter['AI Tags'] || ''
      };
    }
    
    // Validate required fields
    if (!data['Item Name']) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Item Name is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get headers to determine column order
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Create row array matching header order
    const row = headerRow.map(header => {
      return data[header] || '';
    });
    
    // Add new row
    sheet.appendRow(row);
    
    // Return success response (will be shown in iframe)
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

// Optional: Test function
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return ContentService.createTextOutput(JSON.stringify({
    headers: headers,
    message: 'Web App is working'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## Steps to Update

1. **Open your Google Sheet**
2. **Go to Extensions → Apps Script**
3. **Replace the existing `doPost` function** with the code above
4. **Save the script** (Ctrl+S or Cmd+S)
5. **Redeploy the Web App:**
   - Click **Deploy → Manage deployments**
   - Click the **pencil icon** (edit) next to your deployment
   - Click **New version**
   - Click **Deploy**
6. **Test it** - The form submission should now work without CORS errors!

## How It Works

- The form submits data as form parameters (avoiding CORS)
- The script can read data from `e.parameter['Item Name']`, etc.
- The script also checks for `jsonData` parameter as a fallback
- Response is returned as JSON (displayed in hidden iframe)

## Testing

After updating, try adding an item from the inventory page. It should work without CORS errors!

