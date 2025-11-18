const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const EXCEL_FILE = 'Samaj.xlsx';

app.use(cors());
app.use(express.json());

// Load data from Excel file
function loadData() {
  try {
    if (fs.existsSync(EXCEL_FILE)) {
      const workbook = XLSX.readFile(EXCEL_FILE);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
}

// Save data to Excel file
function saveData(data) {
  try {
    // Check if file exists and read existing structure
    let workbook;
    let sheetName = 'Sheet1';
    
    if (fs.existsSync(EXCEL_FILE)) {
      workbook = XLSX.readFile(EXCEL_FILE);
      sheetName = workbook.SheetNames[0] || 'Sheet1';
    } else {
      workbook = XLSX.utils.book_new();
    }
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { 
      header: ['S. No.', 'Name', 'Address', 'Phone Number(s)'],
      skipHeader: false 
    });
    
    // Set column widths for better formatting
    worksheet['!cols'] = [
      { wch: 10 }, // S. No.
      { wch: 40 }, // Name
      { wch: 60 }, // Address
      { wch: 20 }  // Phone Number(s)
    ];
    
    // Remove old sheet if exists and add new one
    if (workbook.Sheets[sheetName]) {
      delete workbook.Sheets[sheetName];
      const index = workbook.SheetNames.indexOf(sheetName);
      if (index > -1) {
        workbook.SheetNames.splice(index, 1);
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Write file with error handling
    XLSX.writeFile(workbook, EXCEL_FILE, { 
      cellStyles: true,
      bookType: 'xlsx'
    });
    
    console.log('Data saved successfully to', EXCEL_FILE);
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Search endpoint
app.post('/api/search', (req, res) => {
  try {
    const query = (req.body.query || '').trim().toLowerCase();
    
    if (!query) {
      return res.status(400).json({ error: 'Please enter a search term' });
    }

    const data = loadData();
    
    const results = data.filter(person => {
      const name = (person['Name'] || '').toString().toLowerCase();
      const address = (person['Address'] || '').toString().toLowerCase();
      const phone = (person['Phone Number(s)'] || '').toString().toLowerCase();
      
      return name.includes(query) || 
             address.includes(query) || 
             phone.includes(query);
    });

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add person endpoint
app.post('/api/add', (req, res) => {
  try {
    const { name, address, phone } = req.body;
    
    console.log('Received add request:', { name, address, phone });
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if file exists and is accessible
    if (!fs.existsSync(EXCEL_FILE)) {
      console.error('Excel file does not exist:', EXCEL_FILE);
      return res.status(500).json({ error: 'Excel file not found. Please ensure Samaj.xlsx exists in the server directory.' });
    }

    // Check if file is writable
    try {
      fs.accessSync(EXCEL_FILE, fs.constants.W_OK);
    } catch (accessError) {
      console.error('File is not writable:', accessError.message);
      return res.status(500).json({ error: 'Excel file is locked or not writable. Please close the file if it\'s open in Excel.' });
    }

    const data = loadData();
    console.log('Loaded', data.length, 'existing records');
    
    // Get next serial number
    let nextSno = 1;
    if (data.length > 0) {
      const maxSno = Math.max(...data.map(p => {
        const sno = parseInt(p['S. No.'] || 0);
        return isNaN(sno) ? 0 : sno;
      }));
      nextSno = maxSno + 1;
    }

    // Add new person
    const newPerson = {
      'S. No.': nextSno,
      'Name': name.trim(),
      'Address': (address || '').trim(),
      'Phone Number(s)': (phone || '').trim()
    };

    console.log('Adding new person:', newPerson);
    data.push(newPerson);
    
    const saveResult = saveData(data);
    if (saveResult) {
      console.log('Person added successfully');
      res.json({ success: true, message: 'Person added successfully' });
    } else {
      console.error('Failed to save data');
      res.status(500).json({ error: 'Failed to save data to Excel file. Please check server logs for details.' });
    }
  } catch (error) {
    console.error('Add person error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while adding the person.' });
  }
});

// Get all data endpoint (optional, for debugging)
app.get('/api/data', (req, res) => {
  try {
    const data = loadData();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
