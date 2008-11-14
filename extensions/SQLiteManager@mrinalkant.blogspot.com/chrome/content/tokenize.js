//follow the function SQLITE_API int sqlite3_complete(const char *zSql)
//from sqlite3.c (3.5.9)
const tkSEMI    = 0;
const tkWS      = 1;
const tkOTHER   = 2;
const tkEXPLAIN = 3;
const tkCREATE  = 4;
const tkTEMP    = 5;
const tkTRIGGER = 6;
const tkEND     = 7;

const trans = [
                     /* Token:                                                */
     /* State:       **  SEMI  WS  OTHER EXPLAIN  CREATE  TEMP  TRIGGER  END  */
     /* 0   START: */ [    0,  0,     1,      2,      3,    1,       1,   1,  ],
     /* 1  NORMAL: */ [    0,  1,     1,      1,      1,    1,       1,   1,  ],
     /* 2 EXPLAIN: */ [    0,  2,     1,      1,      3,    1,       1,   1,  ],
     /* 3  CREATE: */ [    0,  3,     1,      1,      1,    3,       4,   1,  ],
     /* 4 TRIGGER: */ [    5,  4,     4,      4,      4,    4,       4,   4,  ],
     /* 5    SEMI: */ [    5,  5,     4,      4,      4,    4,       4,   6,  ],
     /* 6     END: */ [    0,  6,     4,      4,      4,    4,       4,   4,  ]
  ];

function sql_tokenizer(input) {
  var re_comment_oneline = /--[^\n]*/
  var re_comment_multiline = /\/\*(?:.|[\n\r])*?\*\//

  var re_ident = /[a-zA-Z_][\w]*/

  var re_integer = /[+-]?\d+/
  var re_float = /[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?/

  var re_doublequote = /["][^"]*["]/
  var re_singlequote = /['][^']*[']/
  var re_backquote = /[`][^`]*[`]/
  var re_msstyleidentifier = /[\[][^\]]*[\]]/

  var re_spaces = /[\s]+/
  var re_symbol = /\S/

  var re_token = /--[^\n]*|\/\*(?:.|\n|\r)*?\*\/|["][^"]*["]|['][^']*[']|[`][^`]*[`]|[\[][^\]]*[\]]|[a-zA-Z_][\w]*|[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?|[+-]?\d+|[\s]+|./g
  var a = input.match(re_token);

  var token, type, tk, stmt = "", state = 0;
  var s = [], allSt = [];
//bOnlyWhitespace: false if a non-whitespace token is found within a statement.
//this is used to add the last statement if (it contains any token except tkWS
//and it is not terminated by semicolon)
  var bOnlyWhitespace = true;
  for (var i = 0; i < a.length; i++) {
    type = "symbol";
    tk = tkOTHER;
    token = a[i];
    if (token == ";") {
      tk = tkSEMI;
    }
    else if (token.match(re_comment_oneline)) {
      tk = tkWS;
      type = "linecomment";
    }
    else if (token.match(re_comment_multiline)) {
      tk = tkWS;
      type = "fullcomment";
    }
    else if (token.match(re_spaces)) {
      tk = tkWS;
      type = "ws";
    }
    else if (token.match(re_ident)) {
      type = "ident";
      var tt = token.toLowerCase();
      if (tt == "create")
        tk = tkCREATE;
      else if (tt == "temp" || tt == "temporary")
        tk = tkTEMP;
      else if (tt == "trigger")
        tk = tkTRIGGER;
      else if (tt == "explain")
        tk = tkEXPLAIN;
      else if (tt == "end")
        tk = tkEND;
    }
    state = trans[state][tk];
    stmt += token;
    if (tk != tkWS) bOnlyWhitespace = false;
    if (state == 0 && tk == tkSEMI) {
      allSt.push(stmt);
      stmt = "";
      bOnlyWhitespace = true;
    }
    
  }
//  if (stmt != "" && /\s*/.exec(stmt)[0].length != stmt.length)
  if (stmt != "" && !bOnlyWhitespace)
    allSt.push(stmt);

  return allSt;
}

function csv_tokenizer(input, separator) {
  var re_linebreak = /[\n\r]+/

//  var re_token = /[\"][^\"]*[\"](?!\")|[,]|[\n\r]|[^,]*|./g
  var re_token = /[\"]([^\"]|(\"\"))*[\"]|[,]|[\n\r]|[^,\n\r]*|./g
  if (separator == ";")
    re_token = /[\"]([^\"]|(\"\"))*[\"]|[;]|[\n\r]|[^;\n\r]*|./g
  if (separator == "|")
    re_token = /[\"]([^\"]|(\"\"))*[\"]|[|]|[\n\r]|[^|\n\r]*|./g
  if (separator == "\t")
    re_token = /[\"]([^\"]|(\"\"))*[\"]|[\t]|[\n\r]|[^\t\n\r]*|./g

  var a = input.match(re_token);

  var token;
  var line = [], allLines = [];
  var tkSEPARATOR = 0, tkNEWLINE = 1, tkNORMAL = 2;
  var tk = tkNEWLINE, tkp = tkNEWLINE;

  for (var i = 0; i < a.length; i++) {
    tkp = tk;

    token = a[i];
    
    if (token == separator) {
      tk = tkSEPARATOR;
      //this separator is the first char in line or follows another separator
      if (line.length == 0
          || tkp == tkSEPARATOR) {
        line.push("");
      }
//      alert("sep=" + token);
    }
    else if (token == "\n" || token == "\r") {
      tk = tkNEWLINE;
      if (line.length > 0) {
        allLines.push(line);
        line = [];
      }
//      alert("line=" + token);
    }
    else { //field value
      tk = tkNORMAL;
      if (tkp != tkSEPARATOR) {
        if (line.length > 0) {
          allLines.push(line);
          line = [];
        }
      }
      line.push(token);
//      alert("normal=" + token);
    }

  }
  //for lines not terminated with \r or \n
  if (line.length > 0) {
//    allLines.push(line);
  }

  return allLines;
}

// for create statements in sqlite master
function replaceObjectNameInSql(sOriginalSql, sNewObjName) {
  var re_ident = /[a-zA-Z_][\w]*/

  var re_doublequote = /["][^"]*["]/
  var re_singlequote = /['][^']*[']/
  var re_backquote = /[`][^`]*[`]/
  var re_msstyleidentifier = /[\[][^\]]*[\]]/

  var re_token = /--[^\n]*|\/\*(?:.|\n|\r)*?\*\/|["][^"]*["]|['][^']*[']|[`][^`]*[`]|[\[][^\]]*[\]]|[a-zA-Z_][\w]*|[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?|[+-]?\d+|[\s]+|./g

  var a = sOriginalSql.match(re_token);

  var token, type, tk, stmt = "", state = 0;
  var s = [], allSt = [];
  var tempTokens = [];

  for (var i = 0; i < a.length; i++) {
    token = a[i];
    if (token.match(re_ident)
      || token.match(re_doublequote)
      || token.match(re_singlequote)
      || token.match(re_backquote)
      || token.match(re_msstyleidentifier)) {
      var tt = token.toLowerCase();
      if (tempTokens.length < 3)
        tempTokens.push([i,tt]);
      else
        break;
    }
  }
  var aTypes = ["table", "index", "view", "trigger"];
  if (tempTokens.length >= 3) {
    if (tempTokens[0][1] == "create" && aTypes.indexOf(tempTokens[1][1]) >= 0) {
      var iObjNamePosition = tempTokens[2][0]; //position of original name
      a[iObjNamePosition] = sNewObjName; //change name
      return a.join(""); //new statement with objname replaced
    }  
  }
  //otherwise return empty string
  return "";
}

function getViewSchemaSelectStmt(sOriginalSql) {
  var re_ident = /[a-zA-Z_][\w]*/

  var re_doublequote = /["][^"]*["]/
  var re_singlequote = /['][^']*[']/
  var re_backquote = /[`][^`]*[`]/
  var re_msstyleidentifier = /[\[][^\]]*[\]]/

  var re_token = /--[^\n]*|\/\*(?:.|\n|\r)*?\*\/|["][^"]*["]|['][^']*[']|[`][^`]*[`]|[\[][^\]]*[\]]|[a-zA-Z_][\w]*|[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?|[+-]?\d+|[\s]+|./g

  var a = sOriginalSql.match(re_token);

  var token, type, tk, stmt = "", state = 0;
  var s = [], allSt = [];
  var tempTokens = [];

  for (var i = 0; i < a.length; i++) {
    token = a[i];
    if (token.match(re_ident)
      || token.match(re_doublequote)
      || token.match(re_singlequote)
      || token.match(re_backquote)
      || token.match(re_msstyleidentifier)) {
      var tt = token.toLowerCase();
      if (tempTokens.length < 4)
        tempTokens.push([i,tt]);
      else
        break;
    }
  }
  var aTypes = ["table", "index", "view", "trigger"];
  if (tempTokens.length >= 4) {
    if (tempTokens[0][1] == "create" && aTypes.indexOf(tempTokens[1][1]) >= 0) {
      var iObjNamePosition = tempTokens[2][0]; //position of original name
      iObjNamePosition = tempTokens[3][0]; //position of "AS" in view stmt
      a.splice(0, iObjNamePosition + 1); //remove tokens upyo name
      return a.join(""); //string after removing "create objtype objname"
    }  
  }
  //otherwise return empty string
  return "";
}