var x=0;
var y=0;

var listObserver = { 
  onDragStart: function (evt,transferData,action){
    var txt=evt.target.getAttribute("elem");
    // dump("*start:" + evt.target.nodeName);
    transferData.data=new TransferData();
    transferData.data.addDataForFlavour("text/unicode",txt);
    transferData.data.addDataForFlavour("image/png","ok.png");
    x = evt.pageX - evt.target.boxObject.x;
    y = evt.pageY - evt.target.boxObject.y;
    // dump("**x:" + x + ",y:" + y + ",pageX:" + evt.pageX + ",pageY:" + evt.pageY + "**");
  }
};

var boardObserver = {
  getSupportedFlavours : function () {
    var flavours = new FlavourSet();
    flavours.appendFlavour("text/unicode");
    flavours.appendFlavour("image/png");
    return flavours;
  },
  onDragOver: function (evt,flavour,session){
      // dump("**:" + evt.nodeName + ":**");
      var elem=session.sourceNode;
        elem.setAttribute("left",""+(evt.pageX - x));
        elem.setAttribute("top",""+(evt.pageY - y));
  },
  onDrop: function (evt,dropdata,session){
      // alert(session.sourceNode.id);
    if (dropdata.data!=""){
//        dump("*drop:" + evt.target.id);
//        dump("*createElement:" + dropdata.data);
//        if (dropdata.data != "buttonxx") {

    if (session.sourceNode.parentNode != evt.target) {
        if (session.sourceNode.tagName == "image") {
            var elem=document.createElement("image");
            var imgsrc = session.sourceNode.getAttribute("src");
            elem.setAttribute("src",imgsrc);

        } else if (session.sourceNode.tagName == "button") {
            var elem=document.createElement("button");
            elem.setAttribute("label",dropdata.data);
        } else {
            var elem=document.createElement(dropdata.data);
        }
        evt.target.appendChild(elem);
        elem.setAttribute("left",""+(evt.pageX - x));
          elem.setAttribute("top",""+(evt.pageY - y));
          elem.setAttribute("elem",dropdata.data);
          elem.setAttribute("id",dropdata.data);
          elem.setAttribute("ondraggesture", "nsDragAndDrop.startDrag(event,listObserver)");
          elem.setAttribute("ondragdrop", "nsDragAndDrop.drop(event,boardObserver)");
    } else {
        var elem=session.sourceNode;
        elem.setAttribute("left",""+(evt.pageX - x));
        elem.setAttribute("top",""+(evt.pageY - y));

    }
      
    }
  },
  onDrop2: function (evt,dropdata,session){
      // alert(session.sourceNode.id);
    if (dropdata.data!=""){
//        dump("*drop:" + evt.target.id);
//        dump("*createElement:" + dropdata.data);
//        if (dropdata.data != "buttonxx") {
      var imgsrc = session.sourceNode.getAttribute("src");

      var elem=document.createElement(dropdata.data);
      evt.target.appendChild(elem);
      elem.setAttribute("left",""+evt.pageX);
      elem.setAttribute("top",""+evt.pageY);
      elem.setAttribute("label",dropdata.data + "xx");
      elem.setAttribute("elem",dropdata.data + "xx");
      elem.setAttribute("id",dropdata.data + "xx");
      elem.setAttribute("src",imgsrc);
      elem.setAttribute("ondraggesture", "nsDragAndDrop.startDrag(event,listObserver)");
/*
        } else {
      var elem = document.getElementById(dropdata.data);
      elem.setAttribute("left",""+evt.pageX);
      elem.setAttribute("top",""+evt.pageY);
        }
*/

      // elem.addEventListener("draggesture", "nsDragAndDrop.startDrag(event,listObserver)", false);

    }
  },
  onClick: function (evt) {
      alert(evt.pageX + evt.pageY);
  }
};

var textObserver = {
  onDragStart: function (event, transferData, action) {
    var htmlText  = "<strong>Cabbage</strong>";
    var plainText = "Cabbage";
    transferData.data = new TransferData();
    transferData.data.addDataForFlavour("text/html",htmlText);
    transferData.data.addDataForFlavour("text/unicode",plainText);
  }
};

