/*
   1802 Retro Terminal support routines
*/
/*
   COSMAC ELF-ish JavaScript Simulator (SimElf++ / COSMAC Elf^2)

   Enhanced program/system by William Donnelly circa May 2011
   http://www.donnelly-house.net/ -- whd1802 (at) donnelly-house.net
   http://www.donnelly-house.net/programming/cdp1802/
   Changes:
      Brightened switches and Hex LED display images (also made OFF and green LED versions)
      Added "COSMAC ELF" 'logo' text (image -- click for "About...")
      Cleaned up and streamlined JavaScript code and HTML specification
         cosmacelf.html, simelf.js, 1802cpu.js; created 1802programs.js; added 1802disasm.js
         Prefixed and renamed variable names
         Formatted code (whitespace, etc.)
         Changed from HTML Tables to Divs and changed FONT tags to SPAN
         Fixed several bugs and added speed enhancers
      Added memory dump and load form functionality and access via CDP1802 chip click
      Added mnemonic list functionality
      Added debugger window w/single step, breakpoint, etc.
      Offered ZIP archive so user can install and use it locally off-line
      Added "check for more recent update version" functionality

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 3 of the License, or
   (at your option) any later version.

   Based on program/system by Maciej Szyc 2005, cosmac'at'szyc.org
   http://www.cosmac.szyc.org/
   Archived at: http://www.donnelly-house.net/programming/cdp1802/simelf/original/
   (note that this program has severe bugs)

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
*/

var gwinRetroTerm;
var gtaRTScreen;
var gnRetroTermWidth;
var gnRetroTermHeight;
var gnRetroTermLineWidth;
var gnRetroTermLineHeight;

var gsRetroTermScreen;
var gsRetroTermLine24;
var gbRetroTermWrapped = false;
var gnRTLastChar = 0;
var gsRTBlankLine = "                                                                                \n";
var gnRTKeyPressed = 0;

var goBrowser = new Browser();

var xFlag = 0;
// Global object to hold drag information.

var goDragObj = new Object();
goDragObj.zIndex = 0;


function retroTermInit() {
    // called from startSimElf() in simelf.js

    gwinRetroTerm = document.getElementById ("winRetroTerm");
    //gtaRTScreen   = document.getElementById ("taRTScreen"); // Old
    gtaRTScreen   = document.getElementById ("taRetroTermScreen");

    var oText = measureText ('12345678901234567890123456789012345678901234567890123456789012345678901234567890',
			     '13', "font-family: 'Courier New',monospace;")

    gnRetroTermLineWidth  = oText.width;   // 80-char line width
    gnRetroTermLineHeight = oText.height;  // single line height

    gnRetroTermWidth  = gnRetroTermLineWidth;
    gnRetroTermHeight = gnRetroTermLineHeight * 24;

    document.getElementById ("radTermType1").checked = true;    // green phosphor
    document.getElementById ("radEchoType2").checked = true;    // remote echo (computer must send-back)

    retroTermCLS();

    registerCallbackOutput (7, retroTermOutput);    // register Port 7 OUT access
    registerCallbackInput (7, retroTermInput);      // register Port 7 INP access

    retroTermClose();    // retroTermMinimize();

    return;
} // retroTermInit


function measureText (psText, psFontSize, psStyle)
{
   var lDiv = document.createElement('div');

   document.body.appendChild (lDiv);

   if (psStyle != null  &&  psStyle != '')
      lDiv.style = psStyle;

   lDiv.style.fontSize = '' + psFontSize + 'px';
   lDiv.style.position = 'absolute';
   lDiv.style.left = -1000;
   lDiv.style.top = -1000;

   lDiv.innerHTML = psText;

   var oResult = {
      width: lDiv.clientWidth,
      height: lDiv.clientHeight
   };

   document.body.removeChild (lDiv);
   lDiv = null;

   return oResult;
} // measureText - mesaure width and height of a text line


function retroTermFocus(){
    if (isRTMaximized()) {
	/*
	  Uncaught TypeError: Cannot read property 'focus' of null
	  at retroterm.js:130
	*/
	setTimeout (function() {
	    gtaRTScreen.focus();
	}, 1);
    }

    return;
} // retroTermFocus - (re-) set focus (back) to the output screen textarea form element


function retroTermKeyCodeHandler (peEvent)
{
   var nKeyCode = window.event ? peEvent.keyCode : peEvent.which;

//window.status = nKeyCode + ", " + peEvent.charCode + ", " + peEvent.ctrlKey + ", " + peEvent.shiftKey + ", " + peEvent.altKey + " : " + "retroTermKeyCodeHandler";

   if (nKeyCode == 13 || nKeyCode == 8 || nKeyCode == 9)
      nKeyCode = -1;    // allow Ctrl-M but stop ENTER key (and BS & TAB for Opera), otherwise duplicates occur with onkeypress

   if (peEvent.shiftKey || peEvent.altKey)
      nKeyCode = -1;    // if Shift or Alt key modifiers are pressed, "bad character"

   if (peEvent.ctrlKey) {
      if (nKeyCode > 64 && nKeyCode < 91)    // A-Z
         nKeyCode -= 64;   // convert to Ctrl-A thru Ctrl-Z (no Ctrl-@ NUL ASCII 0)

      else
         nKeyCode = -1;    // disallow others or error
   }

   switch (nKeyCode) {

   case 8:     // Ctrl-H (BS -- Backspace key is taken care of in onkeypress)
   case 9:     // Ctrl-I (TAB -- including TAB key)
   case 10:    // Ctrl-J (LF)
   case 12:    // Ctrl-L (FF)
   case 13:    // Ctrl-M (CR)
   case 24:    // Ctrl-X (CANcel)
   case 26:    // Ctrl-Z (EOF)
   case 27:    // ESCape

      retroTermKeypress (nKeyCode);   // pass to key input handler routine

      break;

   } // switch

   return false;
} // retroTermKeyCodeHandler - onkeydown handler (handles codes onkeypress doesn't pass)


function retroTermKeyPressHandler (peEvent)
{
   var nKeyCode = window.event ? peEvent.keyCode : peEvent.which;
	var sKeyChar = String.fromCharCode (nKeyCode);

window.status = nKeyCode + " : (" + sKeyChar + "), " + peEvent.charCode + ", " + peEvent.ctrlKey + ", " + peEvent.shiftKey + ", " + peEvent.altKey + " : " + "retroTermKeyPressHandler";

   if (peEvent.ctrlKey || peEvent.altKey)
      nKeyCode = -1;    // if Control or Alt key modifiers are pressed, ignore character

   if (nKeyCode > 0)
      retroTermKeypress (nKeyCode);    // pass to key input handler routine

   return false;
} // retroTermKeyPressHandler - onkeypress handler


function retroTermOutput (pnChar)
{
   var nLine24Length = gsRetroTermLine24.length;
   var nTemp;
   var bRefresh = false;

   if (pnChar < 32 || (pnChar >= 127 && pnChar < 160)) {    // control codes, DEL, & 'high' ctrl codes
      switch (pnChar) {

      case 8:     // BS    -- go back one column if not at beginning of line, erase character

         if (nLine24Length > 0) {
            if (nLine24Length == 1)
               gsRetroTermLine24 = "";

            else
               gsRetroTermLine24 = gsRetroTermLine24.substr (0, nLine24Length - 1);
         }

         gbRetroTermWrapped = false;
         bRefresh = true;

         break;

      case 9:     // TAB   --  to next 10th column position

         if (nLine24Length >= 70) {    // at this column or greater, wrap to next line
            gsRetroTermLine24 += gsRTBlankLine.substr (nLine24Length);
            gsRetroTermScreen = gsRetroTermScreen.substr (81) + gsRetroTermLine24;
            gsRetroTermLine24 = "";
            gbRetroTermWrapped = true;

         } else {
            nTemp = nLine24Length % 10;
            gsRetroTermLine24 += gsRTBlankLine.substr (0, 10 - nTemp);
            gbRetroTermWrapped = false;
         }

         bRefresh = true;
         retroTermFocus();    // refocus because tab was hit

         break;

      case 10:    // LF    -- CR & LF & CR/LF are all treated as EOL/NEWLINE codes
      case 13:    // CR

         if (!gbRetroTermWrapped &&
               ((pnChar == 13 && gnRTLastChar != 10) || (pnChar == 10 && gnRTLastChar != 13))) {
            gsRetroTermLine24 += gsRTBlankLine.substr (nLine24Length);
            gsRetroTermScreen = gsRetroTermScreen.substr (81) + gsRetroTermLine24;
            gsRetroTermLine24 = "";
         }

         bRefresh = true;
         gbRetroTermWrapped = false;

         break;

      case 12:    // FF    -- Clear screen (CLS)

         retroTermCLS();   // "refresh" is taken care of in this routine

         break;

      default:    // otherwise ignore other control codes

         gbRetroTermWrapped = false;

         break;

      } // switch

   } else {    // "printable" chars
      gsRetroTermLine24 += String.fromCharCode (pnChar);

      if (nLine24Length == 79) {
         gbRetroTermWrapped = true;
         gsRetroTermLine24 += "\n";
         gsRetroTermScreen = gsRetroTermScreen.substr (81) + gsRetroTermLine24;
         gsRetroTermLine24 = "";
      }

      bRefresh = true;
   }

   gnRTLastChar = pnChar;    // remember so can ignore CR/LF or who knows what other cases

   if (bRefresh)
      gtaRTScreen.value = gsRetroTermScreen + gsRetroTermLine24 + "_";  // add cursor

   return;
} // retroTermOutput - 1802 OUT 8 callback routine


function retroTermInput()
{
   var nChar = false;   // no character input "flag"

   if (gnRTKeyPressed > 0) {
      if (gnRTKeyPressed < 128)
         nChar = gnRTKeyPressed | 0x80;   // set the high bit to signal input ready

      gnRTKeyPressed = 0;  // reset input "buffer" (single character, overwritten if not processed timely)
   }

   return nChar;
} // retroTermInput - 1802 INP 8 callback routine


function retroTermKeypress (pnKeyCode)
{
   gnRTKeyPressed = pnKeyCode;

   if (document.getElementById ("radEchoType1").checked && isRTMaximized())
      retroTermOutput (pnKeyCode);     // terminal local echo

   return;
} // retroTermKeypress - key input handler routine


function retroTermClose()
{
   retroTermCLS();

   gwinRetroTerm.className = "winRetroTerm winRetroTermMinimize";

   gwinRetroTerm.style.top = "10px";
   gwinRetroTerm.style.left = "525px";

   return;
} // retroTermClose


function retroTermMinimize()
{
   gwinRetroTerm.className = "winRetroTerm winRetroTermMinimize";

   return;
} // retroTermMinimize


function retroTermMaximize()
{
   gwinRetroTerm.className = "winRetroTerm";

   gtaRTScreen.style.width = gnRetroTermWidth + 'px';
   gtaRTScreen.style.height = gnRetroTermHeight + 'px';

   gwinRetroTerm.style.width = (gnRetroTermWidth + 8) + 'px';
   gwinRetroTerm.style.height = (gnRetroTermHeight + 25) + 'px';

   retroTermFocus();

   return;
} // retroTermMaximize


function isRTMaximized()
{
   return (gwinRetroTerm.className == "winRetroTerm");
} // isRTMaximized


function retroTermCLS()
{
   var nLine;

   gsRetroTermScreen = "";

   for (nLine = 1;  nLine < 24;  ++nLine) {

      gsRetroTermScreen += gsRTBlankLine;

   } // for

   gsRetroTermLine24 = "";
   gbRetroTermWrapped = false;

    if(1) {
	/*
	  Uncaught TypeError: Cannot set property 'value' of null
	  at retroTermCLS (retroterm.js:388)
	  at retroTermInit (retroterm.js:88)
	  at startSimElf (simelf.js:560)
	  at onload (index.html:84)
	*/
	gtaRTScreen.value = gsRetroTermScreen + "_";    // add cursor
    } else {
	try {
	    gtaRTScreen.value = gsRetroTermScreen + "_";    // add cursor
	} catch(e) {
	    xFlag++;
	    console.log("RetroScreen: " + xFlag);
	}
    }

} // retroTermCLS


function Browser()
{
   var sUserAgent, sBrowser, nIdx;

   this.isIE    = false;
   this.isNS    = false;
   this.version = null;

   sUserAgent = navigator.userAgent;

   sBrowser = "MSIE";
   if ((nIdx = sUserAgent.indexOf (sBrowser)) >= 0) {
      this.isIE = true;
      this.version = parseFloat (sUserAgent.substr (nIdx + sBrowser.length));
      return;
   }

   sBrowser = "Netscape6/";
   if ((nIdx = sUserAgent.indexOf (sBrowser)) >= 0) {
      this.isNS = true;
      this.version = parseFloat (sUserAgent.substr (nIdx + sBrowser.length));
      return;
   }

// Treat any other "Gecko" browser as NS 6.1.

   sBrowser = "Gecko";
   if ((nIdx = sUserAgent.indexOf (sBrowser)) >= 0) {
      this.isNS = true;
      this.version = 6.1;
      return;
   }

   return;
}

// This was an error, objRetroTermDragStart should be objDragStart
function objFreqCntrDragStart(peEvent, psId) {
    console.log("objFreqCntrDragStart Not Implemented");
    //return objDragStart (peEvent, psId);
}

function objLEDDispDragStart(peEvent, psId) {
    console.log("objLEDDispDragStart Not Implemented");
    //return objDragStart (peEvent, psId);
}

function objRetroTermDragStart(peEvent, psId) {
    return objDragStart (peEvent, psId);
}

function objDragStart (peEvent, psId)
{
   var nX, nY;

   // If an element id was given, find it. Otherwise use the element being clicked on.

   if (psId)
      goDragObj.elNode = document.getElementById (psId);

   else {
      if (goBrowser.isIE)
         goDragObj.elNode = window.peEvent.srcElement;

      if (goBrowser.isNS)
         goDragObj.elNode = peEvent.target;

      // If this is a text node, use its parent element.

      if (goDragObj.elNode.nodeType == 3)
         goDragObj.elNode = goDragObj.elNode.parentNode;
   }

   // Get cursor position with respect to the page.

   if (goBrowser.isIE) {
      nX = window.peEvent.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
      nY = window.peEvent.clientY + document.documentElement.scrollTop + document.body.scrollTop;
   }

   if (goBrowser.isNS) {
      nX = peEvent.clientX + window.scrollX;
      nY = peEvent.clientY + window.scrollY;
   }

   // Save starting positions of cursor and element.

   goDragObj.cursorStartX = nX;
   goDragObj.cursorStartY = nY;
   goDragObj.elStartLeft  = parseInt (goDragObj.elNode.style.left, 10);
   goDragObj.elStartTop   = parseInt (goDragObj.elNode.style.top,  10);

   if (isNaN (goDragObj.elStartLeft))
      goDragObj.elStartLeft = nX;

   if (isNaN (goDragObj.elStartTop))
      goDragObj.elStartTop  = nY;

   // Update element's z-index.

   goDragObj.elNode.style.zIndex = ++goDragObj.zIndex;

   // Capture mousemove and mouseup events on the page.

   if (goBrowser.isIE) {
      document.attachEvent ("onmousemove", objDragGo);
      document.attachEvent ("onmouseup",   objDragStop);
      window.peEvent.cancelBubble = true;
      window.peEvent.returnValue = false;
   }

   if (goBrowser.isNS) {
      document.addEventListener ("mousemove", objDragGo,   true);
      document.addEventListener ("mouseup",   objDragStop, true);
      peEvent.preventDefault();
   }

   return;
} // objDragStart


function objDragGo (peEvent)
{
   var nX, nY;

   // Get cursor position with respect to the page.

   if (goBrowser.isIE) {
      nX = window.peEvent.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
      nY = window.peEvent.clientY + document.documentElement.scrollTop + document.body.scrollTop;
   }

   if (goBrowser.isNS) {
      nX = peEvent.clientX + window.scrollX;
      nY = peEvent.clientY + window.scrollY;
   }

   // Move drag element by the same amount the cursor has moved.

   goDragObj.elNode.style.left = (goDragObj.elStartLeft + nX - goDragObj.cursorStartX) + "px";
   goDragObj.elNode.style.top  = (goDragObj.elStartTop  + nY - goDragObj.cursorStartY) + "px";

   if (goBrowser.isIE) {
      window.peEvent.cancelBubble = true;
      window.peEvent.returnValue = false;
   }

   if (goBrowser.isNS)
      peEvent.preventDefault();

   return;
} // objDragGo


function objDragStop (peEvent) {
    // Stop capturing mousemove and mouseup events.

   if (goBrowser.isIE) {
      document.detachEvent("onmousemove", objDragGo);
      document.detachEvent("onmouseup",   objDragStop);
   }

   if (goBrowser.isNS) {
      document.removeEventListener("mousemove", objDragGo,   true);
      document.removeEventListener("mouseup",   objDragStop, true);
   }

   return;
} // objDragStop
