# Update Google Apps Script for Edit and Delete

## Overview
The inventory page now supports editing and deleting items. Your Google Apps Script needs to be updated to handle these operations.

## Updated Script

Replace your `doPost` function with this updated version:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Get action (add, update, or delete)
    const action = e.parameter.action || 'add';
    
    // Handle delete action
    if (action === 'delete') {
      const itemId = e.parameter['Item ID'] || '';
      if (!itemId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Item ID is required for deletion'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Find row by Item ID
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const itemIdCol = headers.indexOf('Item ID');
      
      if (itemIdCol === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Item ID column not found'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Find and delete row
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][itemIdCol] === itemId) {
          sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Item deleted successfully'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Item not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get data from form parameters OR JSON
    let data;
    if (e.parameter.jsonData) {
      data = JSON.parse(e.parameter.jsonData);
    } else {
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
        'Currently Used In': e.parameter['Currently Used In'] || '',
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
    
    // Handle update action
    if (action === 'update') {
      const originalItemId = e.parameter.originalItemId || data['Item ID'];
      
      if (!originalItemId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Original Item ID is required for update'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Find row by original Item ID
      const sheetData = sheet.getDataRange().getValues();
      const itemIdCol = headerRow.indexOf('Item ID');
      
      if (itemIdCol === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Item ID column not found'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Find and update row
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][itemIdCol] === originalItemId) {
          // Update the row
          const range = sheet.getRange(i + 1, 1, 1, row.length);
          range.setValues([row]);
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Item updated successfully'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Item not found for update'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle add action (default)
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

## How It Works

### Add (action: 'add' or no action)
- Appends a new row to the sheet

### Update (action: 'update')
- Uses `originalItemId` to find the existing row
- Updates all fields in that row
- If Item ID changes, the old ID is used to find the row, but new ID is saved

### Delete (action: 'delete')
- Uses Item ID to find the row
- Deletes the entire row
- Searches from bottom to top for efficiency

## Important Notes

1. **Item ID is the key**: The script uses Item ID to identify rows for update/delete
2. **Column order matters**: The script matches data to columns by header name
3. **Case-sensitive headers**: Column headers must match exactly (e.g., "Item ID", "Item Name")
4. **Currently Used In column**: Make sure this column exists in your sheet

## Testing

After updating:
1. Try editing an item - should update the existing row
2. Try deleting an item - should remove the row completely
3. Try adding a new item - should add a new row as before

