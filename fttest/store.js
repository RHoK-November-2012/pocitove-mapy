/**
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
//function readRows() {
//  var sheet = SpreadsheetApp.getActiveSheet();
//  var rows = sheet.getDataRange();
//  var numRows = rows.getNumRows();
//  var values = rows.getValues();
//
//  for (var i = 0; i <= numRows - 1; i++) {
//    var row = values[i];
//    Logger.log(row);
//  }
//};

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
//function onOpen() {
//  var sheet = SpreadsheetApp.getActiveSpreadsheet();
//  var entries = [{
//    name : "Read Data",
//    functionName : "readRows"
//  }];
//  sheet.addMenu("Script Center Menu", entries);
//};


////////////////////////////////////////////////////////////////
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: "Update Fusion Table", functionName: "updateFT"} ];
  ss.addMenu("Fusion Tables", menuEntries);
}

function updateFT() {
  var tableID = '1pWb0_r7jtnDBqThy7O2Hx_rXV47jaC--ZUFZxZo' // Add the table ID of the fusion table here
  var email = UserProperties.getProperty('email');
  var password = UserProperties.getProperty('password');

  if (email === null || password === null) {
    email = Browser.inputBox('Enter email');
    password = Browser.inputBox('Enter password');
    UserProperties.setProperty('email',email);
    UserProperties.setProperty('password', password);
  } else {
    email = UserProperties.getProperty('email');
    password = UserProperties.getProperty('password');
  }
  var authToken = getGAauthenticationToken(email,password);
  deleteData(authToken, tableID);
  var updateMsg = updateData(authToken, tableID);
  var updatedRowsCount = updateMsg.split(/\n/).length - 2;
  Browser.msgBox("Fusion Tables Update", "Updated " + updatedRowsCount + " rows in the Fusion Table", Browser.Buttons.OK);  
}


function getGAauthenticationToken(email, password) {
  password = encodeURIComponent(password);
  var response = UrlFetchApp.fetch("https://www.google.com/accounts/ClientLogin", {
    method: "post",
    payload: "accountType=GOOGLE&Email=" + email + "&Passwd=" + password + "&service=fusiontables&Source=testing"
  });
  var responseStr = response.getContentText();
  responseStr = responseStr.slice(responseStr.search("Auth=") + 5, responseStr.length);
  responseStr = responseStr.replace(/\n/g, "");
  return responseStr;
}

function queryFusionTables(authToken, query) {
  var URL = "http://www.google.com/fusiontables/api/query";
  var response = UrlFetchApp.fetch(URL, {
    method: "post",
    headers: {
      "Authorization": "GoogleLogin auth=" + authToken,
    },
    payload: "sql=" + query
  });
  return response.getContentText();
}

function deleteData(authToken, tableID) {
  var query = encodeURIComponent("DELETE FROM " + tableID);
  return queryFusionTables(authToken, query);
}

function updateData(authToken, tableID) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var blockDataRange = ss.getRangeByName('namedRange');
  var query = constructQuery(ss, blockDataRange, tableID);
  //  Browser.msgBox(query);
  return queryFusionTables(authToken, query);
}

function constructQuery(ss, range, tableID, columnHeadersRowIndex) {
  var sheet = ss.getSheets()[0];
  var columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  var data = range.getValues();
  var queryPrepend = "INSERT INTO " + tableID + " ("+headers.join(",") + ") VALUES ('";
  var query = "";

  for (var i = 0; i < data.length; ++i) {
    var hasData = false;
    if (isCellEmpty(data[i][0])) {
      continue;
    }
    query += queryPrepend + data[i].join("','") + "'); ";
  }
  return encodeURIComponent(query);
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}


function constructQueryCustom(suradnice, tableID) {
  var sArr = ('' + suradnice).split('|')
  var query = ' '
  for (var i in sArr) {
    var data = ' '
    data = data + "('', 'obcan', '" + sArr[i] + "', '23.11.2012') "
    query = query + "INSERT INTO " + tableID + " (Text, Skupina, Location, Date) VALUES " + data + "; "
  }
  data = data.substring(0, data.length - 2)
  
  
  Logger.log('qq: ' + query)
  return encodeURIComponent(query);
}


function doGet(request) {
  var suradnice = request.parameters.suradnice;
  Logger.log('suradnice: ' + suradnice);
  var tableID = '1pWb0_r7jtnDBqThy7O2Hx_rXV47jaC--ZUFZxZo' // Add the table ID of the fusion table here
  var email = UserProperties.getProperty('email');
  var password = UserProperties.getProperty('password');
  var query = constructQueryCustom(suradnice, tableID);
  Logger.log('query: ' + query);
  
  var authToken = getGAauthenticationToken(email,password);
  var updateMsg = queryFusionTables(authToken, query);
  
  return ContentService.createTextOutput('Děkujeme za Váš názor ' + updateMsg + ' ' + suradnice)
}
