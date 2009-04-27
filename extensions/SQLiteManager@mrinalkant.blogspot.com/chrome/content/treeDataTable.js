// ****** table event handling and display ******
function TreeDataTable(sTreeId) {
  this.mTreeId = sTreeId;
  this.treeTable = null; // Tree containing listing of current table
}

TreeDataTable.prototype = {
  // Last row/col that was clicked on (may be inaccurate if scrolling happened)
  lastRow: null,
  lastCol: null,

  // Initialize: Set up the treeview which will display the table contents
  init: function() {        
    this.treeTable = document.getElementById(this.mTreeId);
  },

  // ShowTable: Show/hide any currently displayed table data
  ShowTable: function(bShow) {
    if (this.treeTable == null) 
      return;

    this.treeTable.childNodes[0].hidden = !bShow;
    this.treeTable.childNodes[1].hidden = !bShow;

    if (!bShow) {
      // remove all of the child rows/columns
      ClearElement(this.treeTable.childNodes[0]);
      ClearElement(this.treeTable.childNodes[1]);
    } 
  },

  // UserCopyCell: Handle user choosing to copy the cell contents
  UserCopyCell: function() {
    if (this.lastRow && this.lastCol) {
      var sCell= this.treeTable.view.getCellText(this.lastRow, this.lastCol);
      if (sCell)
        SQLiteManager.clipService.copyString(sCell);
    }
  },
  
  // UserCopyRows: Handle user choosing to copy all currently highlighted rows
  // sFormat: csv, sql
  UserCopyRows: function(sFormat) {
    var sel = this.treeTable.view.selection;
    var start = new Object();
    var end = new Object();
    var iRangeCount = sel.getRangeCount();
    var sData = "";
    for (var iRange = 0; iRange < iRangeCount; iRange++) {
      sel.getRangeAt(iRange,start,end);
      for (var iRow = start.value; iRow <= end.value; iRow++) {            
        if (sData.length > 0)
          sData = sData + "\n";
        sData = sData + this.GetRowData(iRow, sFormat);
      }
    }
    if (sData)
      SQLiteManager.clipService.copyString(sData);
  },

  // GetRowData: Get the contents of an entire numbered row, using the specified format
  GetRowData: function(iRow, sFormat) {
    var result = [], oCol, txt;
    var sExtraColId = "";
    var allCols = this.treeTable.getElementsByTagName("treecol");
    for (var i = 0; i < allCols.length; i++) {
      if (allCols.item(i).hasAttribute("extraRowId"))
        sExtraColId = allCols.item(i).id;
    }

    for (var i = 0; i < this.treeTable.columns.length; i++) {
      oCol = this.treeTable.columns.getColumnAt(i);
      if (sExtraColId == oCol.id) {//Issue #151
        continue;
      }

      txt = this.treeTable.view.getCellText(iRow, oCol);
      txt = txt.replace("\"", "\"\"", "g");				
      txt = '"' + txt + '"';
      result.push(txt);
    }

    if (sFormat=="csv")
      return result.toString();
    if (sFormat=="sql") //do we need column names too?
      return "INSERT INTO \"someTable\" VALUES (" + result.toString() + ");";

    return "";
  },

  // UserTreeClick: Handle the user clicking on the tree
  UserTreeClick: function(ev) {
  // This event happens AFTER the window has scrolled (if necessary). This means
  //that if the user clicked on an element that is partially off screen, and the
  //screen scrolls to fully display it, then the mouse may no longer be over the 
  //correct element.
  //if (ev.button==2) // Right-click
      this.StoreClickLocation(ev);
  },

  AddTreecol: function(treecols, sId, col, sColType, iWidth, bLast, bExtraRowId, sClickFn, sBgColor) {
    //bExtraRowId = true for rowid column which is not one of the tables'columns
    var treecol = document.createElement("treecol");
    treecol.setAttribute("label", col);
    treecol.setAttribute("sDataType", sColType);
//    treecol.setAttribute("smSortDir", "none");
    if (bExtraRowId)
      treecol.setAttribute("extraRowId", true);
    treecol.setAttribute("id", sId);
		treecol.setAttribute("width",iWidth);
		treecol.setAttribute("minwidth",10);
		if (sClickFn != null)
		  treecol.setAttribute("onclick", sClickFn);
		if (sBgColor != null)
		  treecol.setAttribute("style","color:"+sBgColor);

    if (sColType != null)
      treecol.setAttribute("tooltiptext", col + " (" + sColType + ")");

    if (bLast) {
      //want to do anything special for the last column? do it here.
    }
    treecols.appendChild(treecol);

    //add a splitter after every column
    var splitter = document.createElement("splitter");
    splitter.setAttribute("id", "splitter" + col);
    splitter.setAttribute("class", "tree-splitter");        
    splitter.setAttribute("resizebefore", "closest");
    splitter.setAttribute("resizeafter", "grow");
    treecols.appendChild(splitter); 
  },

  // StoreClickLocation: Store the row/column that the click occurred; used later when copying cell text
  StoreClickLocation: function(ev) {
    // http://www.xulplanet.com/references/elemref/ref_tree.html
    if (ev && this.treeTable && ev.type == "click") {
      var row = {}, col = {}, obj = {};
      this.treeTable.treeBoxObject.getCellAt(ev.clientX, ev.clientY, row, col, obj);            
      if (row && row.value && col && col.value!=null) // Clicked on a cell
      {
        this.lastRow= row.value;
        this.lastCol= col.value;
      } else
      {
        this.lastRow= null;
        this.lastCol= null;
      }
    }
  },

  // iExtraColForRowId: indicates column number for the column which is a rowid
  //           0 means no extra rowid, column numbering begins with 1
  //     use this while copying Issue #151
  createColumns: function(aColumns, iExtraColForRowId, aSortInfo, sClickFn) {
    var treecols = this.treeTable.firstChild;
    ClearElement(treecols);

    var iColumnCount = 0;
    var iRow;
    var iWidth, iTotalWidth, iMaxWidth;
    var sColType;
    var allCols = [];
    for (var col in aColumns) {
      iColumnCount = iColumnCount + 1;
      var aTemp = [aColumns[col][0], aColumns[col][1]];
      allCols.push(aTemp);
		}

    var iTreeWidth = this.treeTable.boxObject.width;
    for (var iColumn = 0; iColumn < iColumnCount; iColumn++) {
      iTotalWidth = 0;
      iMaxWidth = 0;
      iTotalWidth = iTreeWidth/iColumnCount;
      if (iTotalWidth < 50) iTotalWidth = 50;

      sColType = GetColumnTypeString(allCols[iColumn][1]);

      var sBgColor = null;
      for(var i = 0; i < aSortInfo.length; i++) {
        if (aSortInfo[i][0] == allCols[iColumn][0]) {
          switch (aSortInfo[i][1]) {
            case "asc":
              sBgColor = "green";
              break;
            case "desc":
              sBgColor = "red";
              break;
          }
        }
      }

      var bExtraColForRowId = (iColumn==iExtraColForRowId-1) ? true : false;
      this.AddTreecol(treecols, iColumn, allCols[iColumn][0], sColType, iTotalWidth, (iColumn==iColumnCount-1?true:false), bExtraColForRowId, sClickFn, sBgColor);
    }
  },

  // PopulateTableData: Assign our custom treeview
  PopulateTableData: function(aTableData, aColumns) {   
    this.treeTable.view = new this.DatabaseTreeView(aTableData,aColumns);
    this.ShowTable(true);
  },

  // DatabaseTreeView: Create a custom nsITreeView
  DatabaseTreeView: function(aTableData, aColumns) {
    // http://kb.mozillazine.org/Sorting_Trees
    // 2 dimensional array containing table contents
    this.aTableData = aTableData;
    // Column information
  	this.aColumns = aColumns;
  	this.aOrder = [];
  	for (var i=0; i < this.aColumns.length; i++)
  	 this.aOrder.push(-1);//0=asc; 1=desc

  	// Number of rows in the table
    this.rowCount = aTableData.length;

    this.getCellText = function(row,column) {
      var sResult;
      try { sResult= this.aTableData[row][column.id]; }
      catch (e) { return "<" + row + "," + column.id + ">"; }
      return sResult;
    };

    this.setTree             = function(treebox){ this.treebox=treebox; };
    this.isContainer         = function(row){ return false; };
    this.isSeparator         = function(row){ return false; };
    this.isSorted            = function(row){ return false; };
    this.cycleHeader         = function(col){ this.SortColumn(col); }
    this.getLevel            = function(row){ return 0; };
    this.getImageSrc         = function(row,col){ return null; };
    this.getRowProperties    = function(row,props){};
    this.getCellProperties   = function(row,col,props){};
    this.getColumnProperties = function(colid,col,props){};

    this.SortColumn = function(col) {
      var index  = col.id; 
      var name = this.aColumns[index][0];
      var type = this.aColumns[index][1];
      var isnum = ((this.aColumns[index][2]==1)?1:0);
      this.aOrder[index] = (this.aOrder[index]==0)?1:0;
      var order = this.aOrder[index];
//alert(order+"="+name);
      
      this.SortTable(this.aTableData,index,order,isnum);  // sort the table
      this.rowCount= this.aTableData.length; // Not the right place for this but...
      this.treeTable.view = new treeView(this.aTableData, this.aColumns, this.rowCount);       
    };

  // This is the actual sorting method, extending the array.sort() method
    this.SortTable = function(table,col,order,isnum) {
      if(isnum){ // use numeric comparison 
          if(order==0){ // ascending 
              this.columnSort= function (a,b){ return (a[col]-b[col]); };
          }
          else{ // descending 
              this.columnSort= function (a,b){ return (b[col]-a[col]); };
          }
      }
      else{ // use string comparison 
          if(order==0){ // ascending 
              this.columnSort= function(a,b){
                  return (a[col]<b[col])?-1:(a[col]>b[col])?1:0; };
          }
          else{ // descending 
              this.columnSort= function(a,b){
                  return (a[col]>b[col])?-1:(a[col]<b[col])?1:0; };
          }
      }
      // use array.sort(comparer) method
      table.sort(this.columnSort);
    };
  }
};
