/*
   SimElf++ Interface Support Routines
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

gs1802LogDump = "";  // quick and easy log dump of internals when halted with an IDL (00h) opcode

gbDebugTrace = false;
gconDebTraceSize = 500;
gsnDebugTrace = new Array (gconDebTraceSize);
gnDebTraceHead = 0;
gnDebTraceTail = 0;


var gnInData = 0;
var gnDispData = 0;

var gbSwitchFlag = new Array (8);

gbSwitchFlag[0] = false;
gbSwitchFlag[1] = false;
gbSwitchFlag[2] = false;
gbSwitchFlag[3] = false;
gbSwitchFlag[4] = false;
gbSwitchFlag[5] = false;
gbSwitchFlag[6] = false;
gbSwitchFlag[7] = false;

var gbLoadFlag = false;
var gbMPFlag = false;
var gbRunFlag = false;
var gbInFlag = false;

var gimgSwitchUpRed = new Image (55, 30);
gimgSwitchUpRed.src = "images/switch_tog_up_red.png";
var gimgSwitchDownRed = new Image (55, 30);
gimgSwitchDownRed.src = "images/switch_tog_down_red.png";

var gimgSwitchUpWhite = new Image (55, 30);
gimgSwitchUpWhite.src = "images/switch_tog_up_wht.png";
var gimgSwitchDownWhite = new Image (55, 30);
gimgSwitchDownWhite.src = "images/switch_tog_down_wht.png";

// preload the display values
var gimgDispDigit = new Array (15);
gimgDispDigit[0] = new Image (35, 56);
gimgDispDigit[0].src = "images/led_digit_red_0.png";
gimgDispDigit[1] = new Image (35, 56);
gimgDispDigit[1].src = "images/led_digit_red_1.png";
gimgDispDigit[2] = new Image (35, 56);
gimgDispDigit[2].src = "images/led_digit_red_2.png";
gimgDispDigit[3] = new Image (35, 56);
gimgDispDigit[3].src = "images/led_digit_red_3.png";
gimgDispDigit[4] = new Image (35, 56);
gimgDispDigit[4].src = "images/led_digit_red_4.png";
gimgDispDigit[5] = new Image (35, 56);
gimgDispDigit[5].src = "images/led_digit_red_5.png";
gimgDispDigit[6] = new Image (35, 56);
gimgDispDigit[6].src = "images/led_digit_red_6.png";
gimgDispDigit[7] = new Image (35, 56);
gimgDispDigit[7].src = "images/led_digit_red_7.png";
gimgDispDigit[8] = new Image (35, 56);
gimgDispDigit[8].src = "images/led_digit_red_8.png";
gimgDispDigit[9] = new Image (35, 56);
gimgDispDigit[9].src = "images/led_digit_red_9.png";
gimgDispDigit[10] = new Image (35, 56);
gimgDispDigit[10].src = "images/led_digit_red_a.png";
gimgDispDigit[11] = new Image (35, 56);
gimgDispDigit[11].src = "images/led_digit_red_b.png";
gimgDispDigit[12] = new Image (35, 56);
gimgDispDigit[12].src = "images/led_digit_red_c.png";
gimgDispDigit[13] = new Image (35, 56);
gimgDispDigit[13].src = "images/led_digit_red_d.png";
gimgDispDigit[14] = new Image (35, 56);
gimgDispDigit[14].src = "images/led_digit_red_e.png";
gimgDispDigit[15] = new Image (35, 56);
gimgDispDigit[15].src = "images/led_digit_red_f.png";

gimgDispDigitOff = new Image (35, 56);
gimgDispDigitOff.src = "images/led_digit_red_off.png";

var gimgQLEDOn = new Image (10, 10);
gimgQLEDOn.src = "images/led_board_red_on.png";
var gimgQLEDOff = new Image (10, 10);
gimgQLEDOff.src = "images/led_board_red_off.png";


var gc1802_SE_ENTRY_MODE_NONE  = 0;
var gc1802_SE_ENTRY_MODE_AUTO2 = 1;
var gc1802_SE_ENTRY_MODE_ENTER = 2;
var gc1802_SE_ENTRY_MODE_DELIM = 3;

var gbIgnoreKeys = false;     // used to ignore key events temporarily
var gnEntryMode = gc1802_SE_ENTRY_MODE_NONE;
var gsHexKeyEntryValue = "";

window.onkeyup = keyHandler;

var gtaTextBuffer;
var gsUndoBuffer = "";

function keyHandler (eEvent)
{
   eEvent = eEvent || event;    // for IE or other
// window.status = eEvent.keyCode;

   if (eEvent.keyCode == 113) {  // F2 function key
      showHelp();
      return false;
   }

   if (gbIgnoreKeys  ||  gnEntryMode == gc1802_SE_ENTRY_MODE_NONE)
      return;     // gbIgnoreKeys is used to "temporarily" turn off this handler

   if (!gbLoadFlag  ||  gbRunFlag  ||  gbMPFlag) {
      gnEntryMode = gc1802_SE_ENTRY_MODE_NONE;

      alert ("Not in Load Mode, Hex Keyboard Entry Mode turned off!");

      return;
   }

   var nKeyCode = eEvent.keyCode;
   var sChar = "";
   var nHexNybble;
   var sHexHi;
   var sHexLo;

   if (nKeyCode == 8)
      sChar = "BS";

   if (nKeyCode == 13)
      sChar = "ENTER";

   if (nKeyCode == 27)
      sChar = "ESC";

   if (nKeyCode == 32)
      sChar = "SPACE";

   if (nKeyCode > 47  &&  nKeyCode < 58) {
      sChar = String.fromCharCode (nKeyCode);
      nHexNybble = nKeyCode - 48;   // 0-9
   }

   if (nKeyCode > 95  &&  nKeyCode < 106) {
      sChar = String.fromCharCode (nKeyCode - 48);
      nHexNybble = nKeyCode - 96;   // 0-9
   }

   if (nKeyCode > 64  &&  nKeyCode < 71) {
      sChar = String.fromCharCode (nKeyCode);
      nHexNybble = nKeyCode - 55;   // A-F => 10-15
   }

   if (sChar == "")
      return false;

//   window.status = "";

   if (sChar == "ESC") {
      gnEntryMode = gc1802_SE_ENTRY_MODE_NONE;
      document.imgHexDisplayLo.src = gimgDispDigit[0].src;
      document.imgHexDisplayHi.src = gimgDispDigit[0].src;
//      window.status = "Hex Key Entry Mode is OFF";
      return false;
   }

   if (sChar == "BS") {
      document.imgHexDisplayHi.src = gimgDispDigitOff.src;

      if (gsHexKeyEntryValue.length == 2) {
         gsHexKeyEntryValue = gsHexKeyEntryValue.substr (0, 1);
         nHexNybble = gsHexKeyEntryValue.charCodeAt (0) - 48;

         if (nHexNybble > 9)
            nHexNybble -= 7;  // convert A-F => 10-15

         document.imgHexDisplayLo.src = gimgDispDigit[nHexNybble].src;

      } else {
         gsHexKeyEntryValue = "";
         document.imgHexDisplayLo.src = gimgDispDigitOff.src;
      }

      return false;
   }

   if (sChar.length == 1) {
      gsHexKeyEntryValue += sChar;

      if (gsHexKeyEntryValue.length > 2)
         gsHexKeyEntryValue = gsHexKeyEntryValue.substr (1, 2);

      sHexHi = gsHexKeyEntryValue.substr (0, 1);
      sHexLo = gsHexKeyEntryValue.substr (1, 1);

      if (sHexLo == "") {
         sHexLo = sHexHi;
         sHexHi = "";
      }

      if (sHexHi == "") {
         document.imgHexDisplayHi.src = gimgDispDigitOff.src;

      } else {
         nHexNybble = sHexHi.charCodeAt (0) - 48;

         if (nHexNybble > 9)
            nHexNybble -= 7;  // convert A-F => 10-15

         document.imgHexDisplayHi.src = gimgDispDigit[nHexNybble].src;
      }

      nHexNybble = sHexLo.charCodeAt (0) - 48;

      if (nHexNybble > 9)
         nHexNybble -= 7;  // convert A-F => 10-15

      document.imgHexDisplayLo.src = gimgDispDigit[nHexNybble].src;
   } // process hex entry digit

   if (gsHexKeyEntryValue.length == 2) {
      sHexHi = gsHexKeyEntryValue.substr (0, 1);
      sHexLo = gsHexKeyEntryValue.substr (1, 1);

      nHexHi = sHexHi.charCodeAt (0) - 48;

      if (nHexHi > 9)
         nHexHi -= 7;  // convert A-F => 10-15

      nHexLo = sHexLo.charCodeAt (0) - 48;

      if (nHexLo > 9)
         nHexLo -= 7;  // convert A-F => 10-15

      nInData = nHexHi * 16 + nHexLo;
   }

   switch (gnEntryMode) {

   case gc1802_SE_ENTRY_MODE_NONE:

      // never gets here

      break;

   case gc1802_SE_ENTRY_MODE_AUTO2:

      if (gsHexKeyEntryValue.length == 2) {
         window.status = "Address " + decToHex4 (getPC()) + " : " + decToHex2 (nInData);

         memoryStore (nInData, gconMEM_USEPC);
         incPC();

         gsHexKeyEntryValue = "";
      }

      break;

   case gc1802_SE_ENTRY_MODE_ENTER:

      if (sChar == "ENTER") {
         if (gsHexKeyEntryValue.length == 2) {
            window.status = "Address " + decToHex4 (getPC()) + " : " + decToHex2 (nInData);

            memoryStore (nInData, gconMEM_USEPC);
            incPC();

         } else {
            document.imgHexDisplayLo.src = gimgDispDigitOff.src;
            document.imgHexDisplayHi.src = gimgDispDigitOff.src;
         }

         gsHexKeyEntryValue = "";
      }

      break;

   case gc1802_SE_ENTRY_MODE_DELIM:

      if (sChar == "ENTER"  ||  sChar == "SPACE") {
         if (gsHexKeyEntryValue.length == 2) {
            window.status = "Address " + decToHex4 (getPC()) + " : " + decToHex2 (nInData);

            memoryStore (nInData, gconMEM_USEPC);
            incPC();

         } else {
            document.imgHexDisplayLo.src = gimgDispDigitOff.src;
            document.imgHexDisplayHi.src = gimgDispDigitOff.src;
         }

         gsHexKeyEntryValue = "";
      }

      break;

   default:

      // nothing done

   } // switch

// window.status = nKeyCode + " = '" + sChar + "' : " + sChar.length + " (" + gsHexKeyEntryValue + ")";

   return false;
} // keyHandler


function HexKeyboardEntryMode()
{
   if (!gbLoadFlag  ||  gbRunFlag  ||  gbMPFlag) {
      if (gnEntryMode != gc1802_SE_ENTRY_MODE_NONE) {
         gnEntryMode = gc1802_SE_ENTRY_MODE_NONE;

         alert ("Not in Load Mode, Hex Keyboard Entry Mode turned off!");

      } else
         alert ("Not in Load Mode!");

      return;
   }

   ++gnEntryMode;    // each call switches to next method

   switch (gnEntryMode) {

   case gc1802_SE_ENTRY_MODE_NONE:

      // never gets here

      break;

   case gc1802_SE_ENTRY_MODE_AUTO2:

      alert ("Hex entry mode:  Auto-enter after every two hex digits.");

      break;

   case gc1802_SE_ENTRY_MODE_ENTER:

      alert ("Hex entry mode:  Must press ENTER to input hex value.");

      break;

   case gc1802_SE_ENTRY_MODE_DELIM:

      alert ("Hex entry mode:  Must press ENTER or SPACE to input hex value.");

      break;

   default:

      alert ("Hex entry mode is off.");

      gnEntryMode = gc1802_SE_ENTRY_MODE_NONE;

   } // switch

   gsHexKeyEntryValue = "";
   document.imgHexDisplayLo.src = gimgDispDigitOff.src;
   document.imgHexDisplayHi.src = gimgDispDigitOff.src;

   return;
} // HexKeyboardEntryMode


function toggleDataSwitch (pbSwitchNum)
{
   gbSwitchFlag[pbSwitchNum] = !gbSwitchFlag[pbSwitchNum];

   oImage = document.getElementById ("DataSwitch" + pbSwitchNum);

   if (pbSwitchNum == 0  ||  pbSwitchNum == 4)
      oImage.src = (gbSwitchFlag[pbSwitchNum] ? gimgSwitchUpWhite.src : gimgSwitchDownWhite.src);

   else
      oImage.src = (gbSwitchFlag[pbSwitchNum] ? gimgSwitchUpRed.src : gimgSwitchDownRed.src);

   nBitN = 1 << pbSwitchNum;

   if (gbSwitchFlag[pbSwitchNum])
      gnInData |= nBitN;

   else
      gnInData &= (255 - nBitN);

   nDigitLo = gnInData & 0x0F;
   nDigitHi = (gnInData >> 4) & 0x0F;
   hexValue = "0123456789ABCDEF";
   window.status = "Hex = " + hexValue[nDigitHi] + hexValue[nDigitLo];

   return;
} // toggleDataSwitch


function loadProgram()
{
   gbLoadFlag = !gbLoadFlag;
   document.switchLoad.src = (gbLoadFlag ? gimgSwitchUpRed.src : gimgSwitchDownRed.src);

   if (!gbLoadFlag)
      gnEntryMode == gc1802_SE_ENTRY_MODE_NONE;

   mainLoop();    // start up main loop in case it isn't running

   return;
}


function memoryProtect()
{
   gbMPFlag = !gbMPFlag;
   document.switchMP.src = (gbMPFlag ? gimgSwitchUpRed.src : gimgSwitchDownRed.src);

   mainLoop();    // start up main loop in case it isn't running

   return;
}


function runProgram()
{
   gbRunFlag = !gbRunFlag;
   document.switchRun.src = (gbRunFlag ? gimgSwitchUpRed.src : gimgSwitchDownRed.src);

   if (gbRunFlag) {
      gnEntryMode == gc1802_SE_ENTRY_MODE_NONE;

      mainLoop();    // start up main loop in case it isn't running

   } else {
      if (gbDebugTrace)
         signalBreakpoint();

         gbDebugTrace = false;
   }

   return;
}


function hexDisplay (pnDispData8)
{
   if (pnDispData8 != hexDisplay.nLastDispData) {   // only need to update display when changed
      hexDisplay.nLastDispData = pnDispData8;  // used to speed up processing becauase "I/O" is SLOW

      var nDigitLo = pnDispData8 & 0x0F;
      var nDigitHi = (pnDispData8 >> 4) & 0x0F;

      document.imgHexDisplayLo.src = gimgDispDigit[nDigitLo].src;
      document.imgHexDisplayHi.src = gimgDispDigit[nDigitHi].src;
   }

   return;
} // hexDisplay -- Update the two "7-Segment" hex displays, if changed since last update


function QLED()
{
   if (gbQ1bFlag != QLED.bLastFlag) {  // only need to update display when changed
      QLED.bLastFlag = gbQ1bFlag;   // used to speed up processing becauase "I/O" is SLOW

      if (gbQ1bFlag)   // via 1802cpu.js
         document.imgLED.src = gimgQLEDOn.src;

      else
         document.imgLED.src = gimgQLEDOff.src;
   }

   return;
} // QLED -- update the Q LED display, if changed since last update


function inButtonPress()
{
   gbInFlag = true;

   mainLoop();    // start up main loop in case it isn't running

   return;
} // inButtonPress -- this is attached to EF1 single bit input flag


function aboutSimElf()
{
   alert (
      "COSMAC ELF-ish CDP1802 Simulator in JavaScript\n" +
      "               (SimElf++ / COSMAC Elf^2)\n\n" +
      "             Enhanced by William Donnelly\n" +
      "               Based on Maciej Szyc's SimElf\n\n" +
      "                       (under development)\n\n" +
      "      Click the Question Mark below-left for Help");

/*
      "                   (press F2 for Help,\n" +
      "                    or find Easter Egg\n" +
      "               to click on Elf PC board)\n");
*/

   return;
} // aboutSimElf


// main function

function startSimElf()
{
   // speedTest();

   gtaTextBuffer = document.getElementById ("taTextBuffer");

   cpuReset();
   regsClear();
   ramClear();

   // load1802Program_Count ("load");

   retroTermInit();

   registerCallbackOutput (6, randomNumberByte);    // register Port 6 OUT access (set RND upper limit)
   registerCallbackInput (6, randomNumberByte);      // register Port 6 INP access (get RND number)

   mainLoop();

   return;
} // startSimElf


function randomNumberByte (pnByte)
{
   if (typeof (randomNumberByte.nMaxNumber) == "undefined")
      randomNumberByte.nMaxNumber = 256;  // 255 + 1 => 0 - 255

   if (typeof (pnByte) == "undefined") {   // called by INP
      return Math.floor (Math.random() * randomNumberByte.nMaxNumber);  // 0 - (nMaxNumber - 1)

      return nnn;  // 0 - (nMaxNumber - 1)

   } else {    // called by OUT
      if (pnByte < 1)
         pnByte = 1;    // zero doesn't make sense

      randomNumberByte.nMaxNumber = (pnByte & 0xFF) + 1;    // store "+ 1" for 0 - n above
   }

   return;
} // randomNumberByte - Random number routine for 1802 access using Port 6


function speedTest()
{
   cpuReset();
   regsClear();
   ramClear();

   gnaMemory[0] = 0x77;
   gnaMemory[1] = 0x30;
   gnaMemory[2] = 0x00;

   today = new Date();
   speed = today.getTime();

   cpuLoop (125000);

   today = new Date();
   speed = today.getTime()-speed;
   speed = 100000 / speed;
   speed = Math.round(speed);
   speed /= 100;

   alert ("Simulator CPU speed: " + speed + " MHz");

   return;
} // speedTest


function mainLoop()
{
   if (mainLoop.bInMainLoop)
      return;

   mainLoop.bInMainLoop = true;
   mainLoop.bStayInLoop = false;    // by default, release main loop

   if (typeof mainLoop.nCounter == "undefined")
      mainLoop.nCounter = 0;

   ++mainLoop.nCounter;

   var nHaltAddress = -1;           // CPU halted with IDL instruction at this address, or < 0 = no halt
   var bHaltConfirmation = false;   // halt confirmation from user

   var nCPUcycles = (gbDebugTrace) ? 2 : 1000;
   var nAddress;

   // memory protection
   if (gbMPFlag)
      gbMemWriteFlag = false;    // via 1802cpu.js

   else
      gbMemWriteFlag = true;     // via 1802cpu.js

   // program loading
   if (gbLoadFlag  &&  !gbRunFlag  &&  !gbMPFlag  &&  gbInFlag) {
      memoryStore (gnInData, gconMEM_USEPC);
      gnDispData = memoryRead (gconMEMRD_DATA);
      window.status = "Address " + decToHex4 (getPC()) + " : " + decToHex2 (gnDispData);
      incPC();
   }

   // program listing
   if (gbLoadFlag  &&  !gbRunFlag  &&  gbMPFlag  &&  gbInFlag) {
      gnDispData = memoryRead (gconMEMRD_DATA);
      incPC();
   }

   // program running
   if (gbRunFlag  &&  !gbLoadFlag) {
      if (gbDebugTrace)
         nAddress = getPC();    // memoryDisAssembleN (gnaMemoryRAM, getPC(), false, false, 1);

      nHaltAddress = cpuLoop (nCPUcycles, -1);     // execute an "arbitrarily large" number of CPU cycles

      if (gbDebugTrace)
         debugTraceMark (nAddress);

      if (gbRunFlag  &&  !gbLoadFlag  &&  nHaltAddress < 0)
         mainLoop.bStayInLoop = true;

      if (nHaltAddress >= 0) {
         bHaltConfirmation = confirm("CPU halted with IDL instruction at " +
            decToHex4 (nHaltAddress - 1) + ".\n\nHalt execution ?");

            // quick and easy log dump of internals stored in gs1802LogDump variable
         logDumpInternals (nHaltAddress - 1, 1);

         if (!bHaltConfirmation) {
            nHaltAddress = -1;      // allow further execution

            if (gbRunFlag  &&  !gbLoadFlag  &&  nHaltAddress < 0)
               mainLoop.bStayInLoop = true;

         } else
               signalBreakpoint();

      } else {
         if (gbDebugTrace  &&  !gbDebugMode)
            window.status = "Opcode: " + gnLastOpCodeAddress;
      }
   }

   // CPU reset -- moved here to reset the CPU when Run Program is toggled off
   if (!gbRunFlag  &&  !gbLoadFlag)   // Load while Running is "pause" (?)
      cpuReset();

   hexDisplay (gnDispData);

   QLED();
   gbDispFlag = false;  // via 1802cpu.js
   gbInFlag = false;

   mainLoop.bInMainLoop = false;

   if (mainLoop.bStayInLoop)
      setTimeout ("mainLoop()", 1);

   return mainLoop.bStayInLoop;
} // mainLoop


function singleStep (pbExecuteOrSetup)
{
   var nHaltAddress = 0;         // CPU halted with IDL instruction at this address, or < 0 = no halt
   var sInstr = "";

   if (gbMPFlag)
      gbMemWriteFlag = false;    // via 1802cpu.js

   else
      gbMemWriteFlag = true;     // via 1802cpu.js

   if (pbExecuteOrSetup) {
      sInstr = memoryDisAssembleN (gnaMemoryRAM, getPC(), false, false, 1);

      nHaltAddress = cpuLoop (2, -1);     // execute 2 (or 3) CPU cycles (one instruction)

      sInstr += memoryDisAssembleN (gnaMemoryRAM, getPC(), false, false, 1);

      gtaTextBuffer.value += "\nSingle Step:\n";

   } else {
      sInstr = memoryDisAssembleN (gnaMemoryRAM, getPC(), false, false, 2);
   }

   logDumpInternals (getPC(), 2);

   gtaTextBuffer.value += "\n" + sInstr + "\n" + gs1802LogDump;

   var nLength = gtaTextBuffer.textLength;

   if (nLength > 9000)
      gtaTextBuffer.value = gtaTextBuffer.value.substr (nLength - 9000);

   gtaTextBuffer.selectionStart = gtaTextBuffer.textLength;
   gtaTextBuffer.selectionEnd = gtaTextBuffer.selectionStart
   gtaTextBuffer.scrollTop = gtaTextBuffer.scrollHeight - gtaTextBuffer.clientHeight;

   hexDisplay (gnDispData);

   QLED();
   gbDispFlag = false;  // via 1802cpu.js
   gbInFlag = false;

   return;
} // singleStep


function runToBreakpoint()
{
   runProgram();     // turn ON Run mode

   return;
} // runToBreakpoint


function signalBreakpoint()
{
   if (gbDebugTrace) {
      debugTraceEnd();

   } else {
      runProgram();     // turn OFF Run mode

      gtaTextBuffer.value += "\nRun To Breakpoint:\n";

      var sInstr = memoryDisAssembleN (gnaMemoryRAM, getPC() - 1, false, false, 2);

      logDumpInternals (getPC() - 1, 2);

      gtaTextBuffer.value += "\n" + sInstr + "\n" + gs1802LogDump;

      var nLength = gtaTextBuffer.textLength;

      if (nLength > 9000)
         gtaTextBuffer.value = gtaTextBuffer.value.substr (nLength - 9000);

      gtaTextBuffer.selectionStart = gtaTextBuffer.textLength;
      gtaTextBuffer.selectionEnd = gtaTextBuffer.selectionStart
      gtaTextBuffer.scrollTop = gtaTextBuffer.scrollHeight - gtaTextBuffer.clientHeight;
   }

   return;
} // signalBreakpoint


function debugTraceStart()
{
   gtaTextBuffer.value += "\nBreakpoint Trace:\n";

   gbDebugTrace = true;

   runProgram();     // turn ON Run mode

   gnDebTraceHead = -1;
   gnDebTraceTail = -1;

   return;
} // debugTraceStart


function debugTraceMark (pnAddress)
{
   ++gnDebTraceHead;

   if (gnDebTraceHead >= gconDebTraceSize)
      gnDebTraceHead = 0;

   if (gnDebTraceHead == gnDebTraceTail  ||  gnDebTraceTail < 0)
      ++gnDebTraceTail;

   if (gnDebTraceTail >= gconDebTraceSize)
      gnDebTraceTail = 0;

   gsnDebugTrace[gnDebTraceHead] = pnAddress;

   return;
} // debugTraceMark


function debugTraceEnd()
{
   var nAddress;

   gbDebugTrace = false;

   if (gbRunFlag)
      runProgram();     // turn OFF Run mode

   var nTrace = gnDebTraceTail;

   while (nTrace != gnDebTraceHead) {

      nAddress = gsnDebugTrace[nTrace];

      if (nAddress >= 0)   // to get past a bug I'm too lazy to find (?)
         gtaTextBuffer.value += memoryDisAssembleN (gnaMemoryRAM, nAddress, false, false, 1);

      // gtaTextBuffer.value += gsnDebugTrace[nTrace] + "\n";

      ++nTrace;

      window.status = "Dumping Debug Trace Data: " + nTrace;

      if (nTrace >= gconDebTraceSize)
         nTrace = 0;

   if ((nTrace & 0xFF) == 0  &&  nLength > 20000)
      gtaTextBuffer.value = gtaTextBuffer.value.substr (nLength - 15000);

   } // while

   logDumpInternals (getPC(), 1);

   gtaTextBuffer.value += "\n" + gs1802LogDump;

   var nLength = gtaTextBuffer.textLength;

   if (nLength > 20000)
      gtaTextBuffer.value = gtaTextBuffer.value.substr (nLength - 20000);

   gtaTextBuffer.selectionStart = gtaTextBuffer.textLength;
   gtaTextBuffer.selectionEnd = gtaTextBuffer.selectionStart
   gtaTextBuffer.scrollTop = gtaTextBuffer.scrollHeight - gtaTextBuffer.clientHeight;

   return;
} // debugTraceEnd


function memoryTraceSnap (pnaMemory, pnStartAddr)
{
   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ("memoryTraceSnap:: Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var   nAddress = pnStartAddr,
         sData,
         nOpCode,
         nData1,
         nData2;

   nOpCode = pnaMemory[nAddress] || 0;
   nData1 = pnaMemory[nAddress + 1] || 0;
   nData2 = pnaMemory[nAddress + 2] || 0;

   sData = nAddress.toString() + ";" + nOpCode.toString() + ";" + nData1.toString() + ";" + nData2.toString();

   return sData;
} // memoryTraceSnap -- gather instruction data for later disAssembly


function debugMode()
{
   gbDebugMode = !gbDebugMode;

   alert ("Debug mode is " + (gbDebugMode ? "On" : "Off"));

   gtaTextBuffer.value += "\n\n========== Debug Mode is " + (gbDebugMode ? "On" : "Off") + " ==========\n\n";

   document.getElementById ("btnDebugToggle").value = "Debug " + (gbDebugMode ? "Off" : "On");

   if (gbDebugMode)
      singleStep (false);

   return;
} // debugMode


function memoryDumpHex (pnaMemory, pnStartAddr, pnByteCount, pbNoAddress, pb2ByteAddr, pbCompress, pbASCII)
{
   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ("Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var sMemDump = "* = " + decToHex4 (pnStartAddr);
   var nLastAddr = pnStartAddr + pnByteCount - 1;
   var sASCII = "  ; ";
   var nByte = 0;
   var nStartAddr;

   if (nLastAddr >= gnMemoryMaxRAM) {
      sMemDump = "   (truncated to top of RAM)\n" + sMemDump;
      nLastAddr = gnMemoryMaxRAM - 1;
   }

   if ((pnStartAddr & 0x0F) != 0) {
      nStartAddr = pnStartAddr & 0xFFF0;

      if (pbNoAddress)
         sMemDump += "\n";

      else {
         if (pb2ByteAddr)
            sMemDump += "\n" + decToHex2 (nStartAddr) + ":";

         else
            sMemDump += "\n" + decToHex4 (nStartAddr) + ":";
      }


      while (nStartAddr < pnStartAddr) {

         if (!pbCompress) {
            sMemDump += "   ";

            if ((nStartAddr & 0x07) == 0  &&  (nStartAddr & 0x0F) != 0)
               sMemDump += " ";     // separate into two halves with an extra SPACE

         } else if (pbASCII) {   // pad ASCII left for proper formatting alignment
            sASCII = "  " + sASCII;    // two SPACEs because of compress

            if ((nStartAddr & 0x07) == 0  &&  (nStartAddr & 0x0F) != 0)
               sASCII = " " + sASCII;     // separate into two halves with an extra SPACE
         }

         ++nStartAddr;
         sASCII += ".";    // pad right for proper formatting (no character)

      } // while
   }

   for (var nAddress = pnStartAddr;  nAddress <= nLastAddr;  ++nAddress) {

      if ((nAddress & 0x0F) == 0) {
         if (pbNoAddress) {
            if (pbASCII)
               sMemDump += sASCII + " \n";

            else
               sMemDump += "\n";

         } else {
            if (pbASCII)
               sMemDump += sASCII + " \n" + decToHex4 (nAddress) + ":";

            else
               sMemDump += "\n" + decToHex4 (nAddress) + ":";
         }

         sASCII = "  ; ";    // reset for next
      }

      if (!pbCompress) {
         sMemDump += " ";

         if ((nAddress & 0x07) == 0  &&  (nAddress & 0x0F) != 0)
            sMemDump += " ";     // separate into two halves with an extra SPACE
      }

      nByte = pnaMemory[nAddress];
      sMemDump += decToHex2 (nByte);

      nByte = nByte & 0x7F;   // 'normalize' in case stored with high bit (7) set

      if (nByte > 31  &&  nByte < 127)
         sChar = String.fromCharCode (nByte);

      else
         sChar = ".";

      sASCII += sChar;

   } // for

   if (!pbASCII) {
      sASCII = "";

   } else {
      while ((nAddress & 0x0F) != 0) {

         if (!pbCompress)
            sMemDump += "   ";

         else
            sMemDump += "  ";

         if ((nAddress & 0x07) == 0  &&  (nAddress & 0x0F) != 0)
            sMemDump += " ";     // separate into two halves with an extra SPACE

         ++nAddress;
         sASCII += ".";    // pad right to fill out to length

      } // while
   }

   sMemDump += sASCII + "\n";

   return sMemDump;
} // memoryDumpHex


function memoryDumpIntelHex (pnaMemory, pnStartAddr, pnByteCount)
{
// partially supported Intel Hex memory dump (only Record Type 0 and 1)

   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ("Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var sMemDump = "";
   var sIntelHex = "";
   var nCheckSum;
   var nByteCount = 0;
   var nData8;

   var nLastAddr = pnStartAddr + pnByteCount - 1;

   if (nLastAddr >= gnMemoryMaxRAM) {
      sMemDump = "   (truncated to top of RAM)\n" + sMemDump;
      nLastAddr = gnMemoryMaxRAM - 1;
   }

   for (var nAddress = pnStartAddr;  nAddress <= nLastAddr;  ++nAddress) {

      if (nByteCount == 0) {
         if (sIntelHex != "") {
            nCheckSum = (256 - (nCheckSum & 0xFF)) & 0xFF;
            sMemDump += sIntelHex + decToHex2 (nCheckSum) + "\n";
         }

         nByteCount = Math.min (nLastAddr - nAddress + 1, 16);
         sIntelHex = ":" + decToHex2 (nByteCount) + decToHex4 (nAddress) + "00";
         nCheckSum = nByteCount + (nAddress >> 8) + (nAddress & 0xFF);
      }

      nData8 = pnaMemory[nAddress];
      nCheckSum += nData8;
      sIntelHex += decToHex2 (nData8);
      nByteCount--;

   } // for

   if (sIntelHex != "") {
      nCheckSum = (256 - (nCheckSum & 0xFF)) & 0xFF;
      sMemDump += sIntelHex + decToHex2 (nCheckSum) + "\n";
   }

   sMemDump += ":00000001FF\n";  // append End of File record

   return sMemDump;
} // memoryDumpIntelHex


function memoryDumpBinary (pnaMemory, pnStartAddr, pnByteCount, pbNoAddress, pbCompress, pbASCII)
{
   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ("Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var sMemDump = "* = " + decToHex4 (pnStartAddr) + "\n";
   var nLastAddr = pnStartAddr + pnByteCount - 1;
   var nByte = 0;
   var nStartAddr;

   if (nLastAddr >= gnMemoryMaxRAM) {
      sMemDump = "   (truncated to top of RAM)\n" + sMemDump;
      nLastAddr = gnMemoryMaxRAM - 1;
   }

   for (var nAddress = pnStartAddr;  nAddress <= nLastAddr;  ++nAddress) {

      if (!pbNoAddress)
            sMemDump += decToHex4 (nAddress) + ": ";

      nByte = pnaMemory[nAddress];

      if (pbCompress)
         sMemDump += decToBinary8 (nByte);

      else {
         sBinary = decToBinary8 (nByte);
         sMemDump += sBinary.substr (0, 4) + " " + sBinary.substr (4);
      }

      if (pbASCII)
         sMemDump += "  " + decToHex2 (nByte);

      sMemDump += "\n";

   } // for

   sMemDump += "\n";

   return sMemDump;
} // memoryDumpBinary


function showMemDumpProgLoad()
{
// display "window"

   gbIgnoreKeys = true;   // turn off temporarily while this "window" is showing

   var txtStartAddr = document.getElementById ("txtStartAddress");
   var txtEndAddr = document.getElementById ("txtEndAddress");
   var txtByteCount = document.getElementById ("txtByteCount")

   var nDefaultStartAddr = 0;
   var nDefaultEndAddr = 255;    // gnMemoryMaxRAM - 1;    // via 1802cpu.js
   var nDefaultByteCount = nDefaultEndAddr - nDefaultStartAddr + 1;

   if (txtStartAddr.value == ""  ||  txtEndAddr.value == ""  ||  txtByteCount.value == "") {
      txtStartAddr.value = decToHex4 (nDefaultStartAddr);
      txtEndAddr.value = decToHex4 (nDefaultEndAddr);
      txtByteCount.value = nDefaultByteCount;
   }

   document.getElementById ("divMemDumpProgLoad").style.display = "block";   // make "window" visible

   return;
} // showMemDumpProgLoad


function dumpMemory()
{
   var txtStartAddr = document.getElementById ("txtStartAddress");
   var txtByteCount = document.getElementById ("txtByteCount");

   var nStartAddr = hexToDecimal (txtStartAddr.value);
   var nByteCount = parseInt (txtByteCount.value);

   var bNoAddress = document.getElementById ("cbNoAddress").checked;
   var bCompress = document.getElementById ("cbCompress").checked;
   var bASCII = document.getElementById ("cbASCII").checked;
   var b2ByteAddr = document.getElementById ("cb2ByteAddr").checked;

   if (nStartAddr >= gnMemoryMaxRAM) {
      alert ("Start address exceeds end of memory: "
         + decToHex4 (nStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return;
   }

   var sFormat = "";

   if (document.getElementById ("rbFormatHex").checked)
      sFormat = "Hex";

   if (document.getElementById ("rbFormatIntel").checked)
      sFormat = "Intel";

   if (document.getElementById ("rbFormatDec").checked)
      sFormat = "Dec";

   if (document.getElementById ("rbFormatLP").checked)
      sFormat = "LP";

   if (document.getElementById ("cbBinary").checked)     // overrides other modes
      sFormat = "Binary";

   gsUndoBuffer = gtaTextBuffer.value;

   switch (sFormat) {

   case "Hex":

      var txtStartAddr = document.getElementById ("txtStartAddress");
      var nStartAddr = hexToDecimal (txtStartAddr.value);

      gtaTextBuffer.value = memoryDumpHex (gnaMemoryRAM, nStartAddr, nByteCount, bNoAddress, b2ByteAddr, bCompress, bASCII);

      break;

   case "Intel":

      gtaTextBuffer.value = memoryDumpIntelHex (gnaMemoryRAM, nStartAddr, nByteCount);

      break;

   case "Dec":

      gtaTextBuffer.value = memoryDumpDec (gnaMemoryRAM, nStartAddr, nByteCount);

      break;

   case "LP":

      gtaTextBuffer.value = dumpLoadProgram (gnaMemoryRAM, nStartAddr, nByteCount);

      break;

   case "Binary":

      gtaTextBuffer.value = memoryDumpBinary (gnaMemoryRAM, nStartAddr, nByteCount, bNoAddress, bCompress, bASCII);

      break;

   } // switch

   return;
} // dumpMemory


function disAssembleList()
{
   var txtStartAddr = document.getElementById ("txtStartAddress");
   var txtByteCount = document.getElementById ("txtByteCount")

   var nStartAddr = hexToDecimal (txtStartAddr.value);
   var nByteCount = Math.floor (txtByteCount.value);

   var b2ByteAddr = document.getElementById ("cb2ByteAddr").checked;
   var bNoAddress = document.getElementById ("cbNoAddress").checked;

   gsUndoBuffer = gtaTextBuffer.value;
   gtaTextBuffer.value = memoryDisAssemble (gnaMemoryRAM, nStartAddr, nByteCount, b2ByteAddr, bNoAddress);

   return;
} // disAssembleList


function loadMemoryFromTextBuffer()
{
   var sFormat = "";

   if (document.getElementById ("rbFormatHex").checked)
      sFormat = "Hex";

   if (document.getElementById ("rbFormatIntel").checked)
      sFormat = "Intel";

   if (document.getElementById ("rbFormatDec").checked)
      sFormat = "Dec";

   if (document.getElementById ("rbFormatLP").checked)
      sFormat = "LP";

   switch (sFormat) {

   case "Hex":

      var txtStartAddr = document.getElementById ("txtStartAddress");
      var nStartAddr = hexToDecimal (txtStartAddr.value);

      loadMemoryFromHex (gnaMemoryRAM, gtaTextBuffer.value, nStartAddr);

      break;

   case "Intel":

      loadMemoryFromIntelHex (gnaMemoryRAM, gtaTextBuffer.value);

      break;

   case "Dec":

      var txtStartAddr = document.getElementById ("txtStartAddress");
      var nStartAddr = hexToDecimal (txtStartAddr.value);

      loadMemoryFromDec (gnaMemoryRAM, gtaTextBuffer.value, nStartAddr);

      break;

   case "LP":

      alert ("Use the Load Selected Program button to load programs\n" +
         "using this format, as stored in the includes/1802programs.js file.")

      break;

   } // switch

   return;
} // loadMemoryFromTextBuffer


function loadSelectedProgram()
{
   var nBytesLoaded;

   if (gbRunFlag  ||  gbMPFlag) {
      alert ("Can't load programs while in Run Mode or Memory Protect Mode!");

      return;
   }

   cpuReset();    // via 1802cpu.js
   regsClear();   // via 1802cpu.js

   var sProgramToLoad = document.forms["formMDPL"]["selProgramToLoad"].value;

   eval ("nBytesLoaded =" + sProgramToLoad + "('load')");

   if (nBytesLoaded > 0) {    // loader returns 0 if loadMemoryFromHex() used
      document.getElementById ("txtStartAddress").value = decToHex4 (0);
      document.getElementById ("txtEndAddress").value = decToHex4 (nBytesLoaded - 1);
      document.getElementById ("txtByteCount").value = nBytesLoaded;

      dumpMemory();

      alert ("Loaded " + nBytesLoaded + " program bytes.");
   }

   return;
} // loadSelectedProgram


function memoryDisAssemble (pnaMemory, pnStartAddr, pnByteCount, pb2ByteAddr, pbNoAddress)
{
   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ('Start address exceeds end of memory: '
         + decToHex4 (pnStartAddr) + ' / ' + decToHex4 (gnMemoryMaxRAM));

      return '';
   }

   var nAddress = pnStartAddr;
   var nLastAddr = pnStartAddr + pnByteCount - 1;

   var   aDisAsm,
         sDisAsm,
         nBytes,
         nOpCode,
         nData1,
         nData2,
         sLineDisAsm,
         nLineLength;

   if (pnStartAddr >= gnMemoryMaxRAM)
      return '';

   var sMemDisAss = '* = ' + decToHex4 (nAddress) + "\n\n";

   if (nLastAddr >= gnMemoryMaxRAM) {
      sMemDisAss = "   (truncated to top of RAM)\n" + sMemDisAss;
      nLastAddr = gnMemoryMaxRAM - 1;
   }


   nLineLength = 26;    // largest example::  0089:  CB 03 A7  LBNF 03A7

   if (pbNoAddress) {
         nLineLength -= 7;    // - "hhhh:  "

   } else {
      if (pb2ByteAddr)
         nLineLength -= 2;    // 2 chars per line address (but long branches still have 4)
   }


   while (nAddress <= nLastAddr) {

      nOpCode = pnaMemory[nAddress] || 0;
      nData1 = pnaMemory[nAddress + 1] || 0;
      nData2 = pnaMemory[nAddress + 2] || 0;

      aDisAsm = disAssemble (nOpCode, nData1, nData2, nAddress, pb2ByteAddr);

      sLineDisAsm = '';
      sDisAsm = aDisAsm[0];
      nBytes = aDisAsm[1];

      if (!pbNoAddress) {
         if (pb2ByteAddr)
            sLineDisAsm += decToHex2 (nAddress) + ':  ';

         else
            sLineDisAsm += decToHex4 (nAddress) + ':  ';
      }

      sLineDisAsm += decToHex2 (nOpCode) + ' ';

      if (nBytes > 1)
         sLineDisAsm += decToHex2 (nData1) + ' ';

      else
         sLineDisAsm += '   ';

      if (nBytes > 2)
         sLineDisAsm += decToHex2 (nData2) + ' ';

      else
         sLineDisAsm += '   ';

      sLineDisAsm += ' ' + sDisAsm + '                              ';     // pad to 30+ spaces
      sLineDisAsm = sLineDisAsm.substr (0, nLineLength) + '  ; ';    // add comments

      sMemDisAss += sLineDisAsm + "\n";

      nAddress += nBytes;

   } // while

   return sMemDisAss;
} // memoryDisAssemble


function memoryDisAssembleN (pnaMemory, pnStartAddr, pb2ByteAddr, pbNoAddress, pnInstructions)
{
   if (pnStartAddr < 0  ||  pnStartAddr >= gnMemoryMaxRAM) {
      alert ("memoryDisAssembleN:: Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var   nAddress = pnStartAddr,
         aDisAsm,
         sDisAsm,
         nBytes,
         nOpCode,
         nData1,
         nData2,
         sMemDisAss = "",
         nCount = 0;

   while (nCount < pnInstructions) {

      nOpCode = pnaMemory[nAddress] || 0;
      nData1 = pnaMemory[nAddress + 1] || 0;
      nData2 = pnaMemory[nAddress + 2] || 0;

      aDisAsm = disAssemble (nOpCode, nData1, nData2, nAddress, pb2ByteAddr);

      sDisAsm = aDisAsm[0];
      nBytes = aDisAsm[1];

      if (!pbNoAddress) {
         if (pb2ByteAddr)
            sMemDisAss += decToHex2 (nAddress) + ":  ";

         else
            sMemDisAss += decToHex4 (nAddress) + ":  ";
      }

      sMemDisAss += decToHex2 (nOpCode) + " ";

      if (nBytes > 1)
         sMemDisAss += decToHex2 (nData1) + " ";

      else
         sMemDisAss += "   ";

      if (nBytes > 2)
         sMemDisAss += decToHex2 (nData2) + " ";

      else
         sMemDisAss += "   ";

      sMemDisAss += " " + sDisAsm + "     (" + nBytes + " bytes)\n";

      nAddress += nBytes;
      ++nCount;

   } // while

   return sMemDisAss;
} // memoryDisAssembleN -- DisAssemble N instructions


function loadMemoryFromHex (pnaMemory, psHexText, pnStartAddr)
{
/*
For example:
   * = 0000
   0000: E4 F8 0A A4 67 04 3A 04 30 08
   "HELLO WORLD!\n" 00
; is a comment character and all text to the end of the line will be ignored
*/

   var nAddress = pnStartAddr || 0;
   var bStartOfLine = true;
   var bEndOfLine = false;
   var sToken = "";        // built value from chars
   var sChar = "";         // original character
   var sUpperChar = "";    // uppercase character
   var sNextChar = "";
   var nIdx = 0;
   var nLength = psHexText.length;
   var nAddrMode = 0;
   var bError = false;
   var nBytes = 0;
   var nLine = 1;
   var nLineChar = 1;
   var sMsg = "";
   var sBreakChar = "";
   var bIsHex = false;
   var nFirstAddress = -1;
   var nLastAddress = -1;
   var sStorageNote = "sequential";    // data store sequentially, or not
   var nQuotesMode = 0;       // single (1) or double (2) quoted text
   var bEscapeMode = false;   // special chars escaped with a slash (\0, \n, \\, etc.)
   var sEval;
   var sASCII;
   var bComment = false;      // ; is a comment character and all text to the end of the line will be ignored

   if (pnStartAddr >= gnMemoryMaxRAM) {
      bError = true;
      sMsg = "Start address is larger than RAM memory size (nothing done): " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM);
   }

   while (nIdx < nLength  &&  !bError) {

      bEndOfLine = false;
      sChar = psHexText.substr (nIdx, 1);
      sUpperChar = sChar.toUpperCase();
      ++nIdx;
      ++nLineChar;

      if (sChar == "\n"  ||  sChar == "\r") {
         bEndOfLine = true;
         bComment = false;    // comments ignore all chars to EoL
         sNextChar = psHexText.substr (nIdx, 1);

         if (sChar == "\n"  &&  sNextChar == "\r")
            ++nIdx;  // correct /n/r

         if (sChar == "\r"  &&  sNextChar == "\n")
            ++nIdx;  // correct /r/n
      }

      if (nQuotesMode > 0) {
         if (bEscapeMode) {   // standard JS escape mode with forward slash escape char
            sASCII = eval ("\"\\" + sChar + "\"");    // easiest to let JS do it for us
            bEscapeMode = false;

         } else {
            if (nQuotesMode == 1  &&  sChar == "'")
               nQuotesMode = 0;

            if (nQuotesMode == 2  &&  sChar == '"')
               nQuotesMode = 0;

            if (nQuotesMode > 0)
               sASCII = sChar;

            if (sChar == "\\")
               bEscapeMode = true;
         }

         if (nQuotesMode > 0  &&  !bEscapeMode) {    // if quotes mode wasn't ended above
            if (nAddress >= gnMemoryMaxRAM) {
               bError = true;
               sMsg = "Address is larger than RAM memory size (memory access overflow): " +
                  decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM);

            } else {
               if (nFirstAddress < 0)
                  nFirstAddress = nAddress;

               if (nAddress > nLastAddress)
                  nLastAddress = nAddress;

               pnaMemory[nAddress] = sASCII.charCodeAt (0) & 0xFF;
               ++nAddress;
               ++nBytes;
               bStartOfLine = false;
            }
         }

      } else {    // not quotes mode, so normal mode
         if (!bComment  &&  (sChar == "'"  ||  sChar =='"')) {
            if (sToken != ""  ||  nAddrMode > 0) {
               bError = true;
               sMsg = "Data format error (unexpected quote [" + sChar + "])";

            } else {
               if (sChar == "'")
                  nQuotesMode = 1;     // single quotes mode

               if (sChar =='"')
                  nQuotesMode = 2;     // double quotes mode
            }

            sChar = "";    // fall through to switch into quotes mode
         }

         if (!bComment  &&  sChar == ";") {
            if ((sToken != ""  &&  nAddrMode == 0)  ||  (nAddrMode > 0  &&  nAddrMode != 2)) {
               bError = true;                      // allow comments after start address specs
               sMsg = "Data format error (unexpected comment start [;])";

            } else {
               bComment = true;  // ignore everything to the end of the line
            }
         }

         if (!bComment  &&  !bError  &&  sChar != ""  &&  sChar != " "  &&
               sChar != "\t"  &&  sChar != "\r"  &&  sChar != "\n") {
            if (gcHEX_CHARS.indexOf (sUpperChar) != -1) {  // hex char if 0-9 or A-F
               bIsHex = (bIsHex  ||  (sToken == ""));   // either still hex or newly hex
               sToken += sUpperChar;

            } else {
               if (sChar == ":") {  // colon special for address prefixing at start of line
                  sBreakChar = ":";

               } else {
                  sToken += sUpperChar;
                  bIsHex = false;
               }
            }
         }

         if (sToken == "*") {    // found starting address initiator character
            if (nAddrMode < 2) {    // < 2 because spaces are processed
               nAddrMode = 1;    // state 1 is look for "=" (spaces allowed)

            } else {
               bError = true;
               sMsg = "Start addressing format error (unexpected '*')";
            }
         }

         if (sToken == "*=") {
            if (nAddrMode == 1) {
               sToken = "";
               nAddrMode = 2;    // found initiator, now get address

            } else {
               bError = true;
               sMsg = "Start addressing format error (unexpected ('*=')";
            }
         }

         if (bEndOfLine  &&  !bError) {
            if (nAddrMode > 0) {    // if we are trying to get a starting address (*=hhhh)
               if (nAddrMode == 2) {   // state 2 = final throws of address get
                  if (bIsHex) {
                     nAddress = hexToDecimal (sToken) & 0xFFFF;

                     if (nAddress >= gnMemoryMaxRAM) {
                        bError = true;
                        sMsg = "Address is larger than RAM memory size (*= starting address): " +
                           decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM);

                     } else {
                        if (nFirstAddress < 0)
                           nFirstAddress = nAddress;

                        else
                           sStorageNote = "non-sequential";
                     }

                  } else {
                     bError = true;
                     sMsg = "Addressing error (*= starting address is not Hex)";
                  }

               } else {
                  nAddress = 0;     // default to zero if not specified

                  if (nFirstAddress < 0)
                     nFirstAddress = nAddress;

                  else
                     sStorageNote = "non-sequential";
               }
            }

            bStartOfLine = true;    // actually, start of line-ish before data
            sToken = "";
            nAddrMode = 0;    // reset address mode
         }

         if (sBreakChar == ":"  &&  !bError) {
            if (!bStartOfLine  ||  !bIsHex) {
               bError = true;
               sMsg = "Addressing format error at start of line (unexpected ':')";

            } else {
               nAddress = hexToDecimal (sToken) & 0xFFFF;
               sToken = "";
               bStartOfLine = false;

               if (nAddress >= gnMemoryMaxRAM) {
                  bError = true;
                  sMsg = "Address is larger than RAM memory size (starting address before ':'): " +
                     decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM);
               }

               if (nFirstAddress < 0)
                  nFirstAddress = nAddress;
            }
         }

            // data = every 2 hex chars except for addressing
         if (!bError  &&  sToken.length == 2  &&  bIsHex  &&  !bError  &&  nAddrMode <= 0) {
            if (bStartOfLine) {
               if (psHexText.substr (nIdx, 1) != ":"  &&  psHexText.substr (nIdx + 1, 1) != ":" &&
                     psHexText.substr (nIdx + 2, 1) != ":") {           // support 3- & 4-char addresses
                  if (nAddress >= gnMemoryMaxRAM) {   // store next byte
                     bError = true;
                     sMsg = "Address is larger than RAM memory size (memory access overflow): " +
                        decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM);

                  } else {
                     // window.status = "M(" + nAddress + ") = " + sToken;
                     if (nFirstAddress < 0)
                        nFirstAddress = nAddress;

                     if (nAddress > nLastAddress)
                        nLastAddress = nAddress;

                     pnaMemory[nAddress] = hexToDecimal (sToken);
                     ++nAddress;
                     ++nBytes;
                     sToken = "";
                     bStartOfLine = false;
                  }
               }

            } else {    // store next byte
               if (nAddress >= gnMemoryMaxRAM) {
                  bError = true;
                  sMsg = "Address is larger than RAM memory size (memory access overflow): " +
                     decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM);

               } else {
                  // window.status = "M(" + nAddress + ") = " + sToken;
                  if (nFirstAddress < 0)
                     nFirstAddress = nAddress;

                  if (nAddress > nLastAddress)
                     nLastAddress = nAddress;

                  pnaMemory[nAddress] = hexToDecimal (sToken);
                  ++nAddress;
                  ++nBytes;
                  sToken = "";
                  bStartOfLine = false;
               }
            }
         }

         if (!bError  &&  sToken.length > 4) {   // no "tokens" should be longer than 4 chars
            bError = true;
            sMsg = "Formatting error, unrecognizable or unparsable data (" + sToken + ")";
         }

         sBreakChar = "";
      } // if-else - quote mode or other

      if (!bError  &&  bEndOfLine) {
         ++nLine;
         nLineChar = 1;
         nAddrMode = 0;
      }

   } // while

   if (bError) {
      alert ("Error at Line " + nLine + ", near character " + nLineChar + ":\n" +
         psHexText.substr (nIdx - 1, 10) + "...\n     " + sMsg + "\n" +
         "Hex load aborted, " + nBytes + " bytes stored.");

   } else {
      if (nFirstAddress >= 0) {
         document.getElementById ("txtStartAddress").value = decToHex4 (nFirstAddress);
         rangeCheck ('start');
         document.getElementById ("txtEndAddress").value = decToHex4 (nLastAddress);
         rangeCheck ('end');
         dumpMemory();
      }

      alert (nBytes + " " + sStorageNote + " bytes stored in RAM memory.");
   }

   return;
} // loadMemoryFromHex


function loadMemoryFromIntelHex (pnaMemory, psIntelHexText)
{
// Partially supported Intel Hex memory load (only Record Types 0 and 1).
// 'Loose formatting' (non-strict) a la whitespace is accepted for easier programming.
// Data record line format = :bbAAAArrDDddDDddDDddDDddDDddDDddDDddDDddCC
// where:
//    colon character is the required prefix start of line character
//    bb is the Byte Count in hex (usually 10 = 16 decimal for a full line)
//    AAAA is the Address in hex for the first byte of data
//    rr is the Record Type = 00 (01 for the End of File record line)
//    DD and dd are the Data bytes in hex
//    CC is the Checksum byte
// The End of File line is checked for ":00000001FF" (w/o quotes). (or other valid EOF)
// Any extraneous characters after the EOF are ignored.

   var bEndOfLine = false;
   var sHex = "";
   var sChar = "";
   var sNextChar = "";
   var nIdx = 0;
   var nLength = psIntelHexText.length;
   var bError = false;
   var nLine = 1;
   var nLineChar = 1;
   var sMsg = "";
   var nState = 0;
   var nByteCount = 0;
   var nAddress = 0;
   var nRecordType = 0;
   var nBytesLoaded = 0;
   var nData8 = 0;
   var nChecksum = 0;
   var nTestChecksum  = 0;
   var nFirstAddress = -1;
   var nLastAddress = -1;

   while (nIdx < nLength  &&  !bError) {

      bEndOfLine = false;
      sChar = psIntelHexText.substr (nIdx, 1).toUpperCase();
      ++nIdx;
      ++nLineChar;

      if (sChar == "\n"  ||  sChar == "\r") {
         bEndOfLine = true;
         sNextChar = psIntelHexText.substr (nIdx, 1);

         if (sChar == "\n"  &&  sNextChar == "\r")
            ++nIdx;  // correct /n/r

         if (sChar == "\r"  &&  sNextChar == "\n")
            ++nIdx;  // correct /r/n
      }

      if (bEndOfLine  &&  nState > 0) {
         bError = true;
         sMsg = "Format error: Unexpected end of line found.";
      }

      if (sChar != "\n"  &&  sChar != "\r"  &&  sChar != " "  &&  sChar != "\t"  &&  !bError) {    // ignore whitespace
         switch (nState) {    // state mode driven

         case 0:  // start of line; expects a colon character

            sHex = "";

            if (sChar == ":") {
               ++nState;      // switch to next state

            } else {
               bError = true;
               sMsg = "Format error: Expected colon (':') as start of record text line.";
            }

            break;

         case 1:  // Byte Count = HH

            if (gcHEX_CHARS.indexOf (sChar) != -1) {  // hex char if 0-9 or A-F
               sHex += sChar;

               if (sHex.length == 2) {
                  nByteCount = hexToDecimal (sHex);
                  nCheckSum = nByteCount;
                  sHex = "";
                  ++nState;      // switch to next state
               }

            } else {
               bError = true;
               sMsg = "Format error: expected hex digit for Byte Count field.";
            }

            break;

         case 2: // Address = HHHH

            if (gcHEX_CHARS.indexOf (sChar) != -1) {  // hex char if 0-9 or A-F
               sHex += sChar;

               if (sHex.length == 4) {
                  nAddress = hexToDecimal (sHex);
                  nCheckSum += (nAddress >> 8) + (nAddress & 0xFF);
                  sHex = "";
                  ++nState;      // switch to next state

                  if (nFirstAddress < 0)
                     nFirstAddress = nAddress;

                  if (nAddress > nLastAddress)
                     nLastAddress = nAddress;
               }

            } else {
               bError = true;
               sMsg = "Format error: Expected hex digit for Address field.";
            }

            break;

         case 3: // Record Type = HH (00 or 01)

            if (gcHEX_CHARS.indexOf (sChar) != -1) {  // hex char if 0-9 or A-F
               sHex += sChar;

               if (sHex.length == 2) {
                  nRecordType = hexToDecimal (sHex);
                  nCheckSum += nRecordType;
                  sHex = "";
                  ++nState;      // switch to next state

                  if (nRecordType != 0  &&  nRecordType != 1) {
                     bError = true;
                     sMsg = "Format error: Expected Record Type 00 or 01.";
                  }

                  if (nRecordType == 1)
                     ++nState;   // skip data bytes state (4) and look for checksum (5)
               }

            } else {
               bError = true;
               sMsg = "Format error: Expected hex digit for Record Type field.";
            }

            break;

         case 4: // Data bytes = HH x Byte Count

            if (gcHEX_CHARS.indexOf (sChar) != -1) {  // hex char if 0-9 or A-F
               sHex += sChar;

               if (sHex.length == 2) {
                  nData8 = hexToDecimal (sHex);
                  nCheckSum += nData8;
                  sHex = "";

                  if (nAddress >= gnMemoryMaxRAM) {   // store next byte
                     bError = true;
                     sMsg = "Address is larger than RAM memory size: " +
                        decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM - 1);

                  } else {
                     if (nAddress > nLastAddress)
                        nLastAddress = nAddress;

                     pnaMemory[nAddress] = nData8;
                     ++nAddress;
                     ++nBytesLoaded;
                     --nByteCount;

                     if (nByteCount == 0)
                        ++nState;      // switch to next state
                  }
               }

            } else {
               bError = true;
               sMsg = "Format error: Expected hex digit for Data field.";
            }

            break;

         case 5: // Checksum = HH

            if (gcHEX_CHARS.indexOf (sChar) != -1) {  // hex char if 0-9 or A-F
               sHex += sChar;

               if (sHex.length == 2) {
                  nTestCheckSum = hexToDecimal (sHex);
                  nCheckSum = (256 - (nCheckSum & 0xFF)) & 0xFF;

                  if (nCheckSum != nTestCheckSum) {
                     bError = true;
                     sMsg = "Checksum is invalid! (found " + sHex + ", expected " +
                        decToHex2 (nCheckSum) + ")";

                  } else {
                     nState = 0;    // reset for next data line or EOF

                     if (nRecordType == 1)
                        nIdx = nLength;   // EOF, stop processing
                  }
               }

            } else {
               bError = true;
               sMsg = "Format error: Expected hex digit for Checksum field.";
            }

            break;

         } //switch state
      } // if not whitespace

      if (!bError  &&  bEndOfLine) {
         ++nLine;
         nLineChar = 1;
      }

   } // while

   if (bError) {
      alert ("Error at Line " + nLine + ", near character " + nLineChar + ":\n" +
         psIntelHexText.substr (nIdx - 1, 10) + "...\n     " + sMsg + "\n" +
         "Intel hex load aborted, " + nBytesLoaded + " bytes stored.");

   } else {
      if (nFirstAddress >= 0) {
         document.getElementById ("txtStartAddress").value = decToHex4 (nFirstAddress);
         rangeCheck ('start');
         document.getElementById ("txtEndAddress").value = decToHex4 (nLastAddress);
         rangeCheck ('end');
         dumpMemory();
      }

      alert (nBytesLoaded + " bytes stored in RAM memory.");
   }

   return;
} // loadMemoryFromIntelHex


function loadMemoryFromDec (pnaMemory, psDecText, pnStartAddr)
{
/*
Load Memory from "Decimal" is an EXTENDED format supporting various numeric bases and text
NOTE: A spaced colon (  : ) means "where:" in the description text below
Default format decimal values MUST be in the ranges of:
   signed -128 to +127  or  unsigned 0 to 255   (plus signs are optional for positive values)
One or more values per line separated by whitespace  :
   whitespace = SPACE, TAB, EOL
Values may also be: (intermixed)
   signed or unsigned decimal values in the format of Nd  or Xn  :
      N and X are decimal values in the ranges of:
         signed -32768 to +32767  or  unsigned 0 to 65535  for 16-bit words  or
         signed -2,147,483,648 to +2,147,483,647  or
            unsigned 0 to 4,294,967,295  for 32-bit long words
               (commas may be used, but they are ignored / stripped)
      (suffix 'd' may be 'D'  and  suffix 'n' may be 'N' ==> use Xn to force 32-bit values)
   unsigned hexadecimal in the format of 0xHH  or  HHh  :
      H is a hexadecimal digit, 0-9 and a-f or A-F  and  00 <= HH <= FF  and
         (suffix 'x' may be 'X'  and  suffix 'h' may be 'H')  and
      larger values up to N hex digits are allowed (1 - N digits; generally 4 to 8 max)
   unsigned 8-bit (!) binary in the format of BBBBBBBBb  :
      B is a binary digit (0, 1); leading zeros are not required  (suffix 'b' may be 'B')
         (16-bit values may be designated with a "bb" suffix; overflow digits are ignored)
   text string characters enclosed in single or double quotes  :
      all ASCII characters in the code range 0 to 255 are valid  and
      certain characters can be escaped with a backslash for control codes, as in
               (specials use LOWERCASE alpha only! (here and with \o and \x below))
            \b    Backspace  (ASCII 8d = Ctrl-H)
            \f    Form feed  (ASCII 12d = Ctrl-L)
            \n    New line  (LF or NL -- ASCII 10d = Ctrl-J)
            \r    Carriage return  (CR -- ASCII 13d = Ctrl-M or ENTER)
            \t    Tab  (ASCII 9d = Ctrl-I or TAB)
            \'    Single quote or apostrophe (')
            \"    Double quote (")
            \\    Backslash (\)
         and  \A where A is an alpha character A-Z (UPPERCASE alpha only!), or
               @ (NUL), [ (ESC), | (FS), ] (GS), ^ (RS), _ (US),  (= 0 - 31)
            for "control codes" and
         \DDD where DDD is a decimal ASCII code (0 - 255) : (0 <= d <= 9)  and
         \oNNN where NNN is an octal ASCII code (0 - 377) : (0 <= N <= 7)  and
         \xHH where HH is a hex ASCII code (0 - FF) : (0 <= H <= F)  and
         \{SPACE} where {SPACE} is " " (without quotes) and specifies a NIL character value
            that generates no character output; used as a delimiter for special
            cases to delimit \ddd, \oNNN and \xHH where the succeeding character after
            the desired code could be interpreted as part of the code value, as in:
            "Example\332" wanted "Example!2", so needs to be: "Example\33\ 2"  and
         the "ASCII code" values are greedy up to the maximum # of digits (3 or 2) found,
            without much error checking for correct values (they are masked to an 8-bit byte)
      text can span lines and EOL's are ignored -- use \r, \n, or both, to insert EOL
   NOTE: escaped characters (only!) do not have to be quoted and can be intermixed with
      numeric values as long as they are individually delimited with whitespace!!
All values are truncated to 8-bit bytes
   (except where noted above for 16-bit and 32-bit values and extended hex digitry)
Warning: VERY little error checking is performed on values
*/

   var nAddress = pnStartAddr || 0;
   var bEndOfLine = false;
   var bEndOfToken = false;
   var sToken = "";        // built value from chars
   var sChar = "";         // original character
   var sUpperChar = "";    // uppercase character
   var sNextChar = "";
   var bGetChar = true;
   var nIdx = 0;
   var nLength = psDecText.length;
   var bError = false;
   var nBytes = 0;
   var nLine = 1;
   var nLineChar = 1;
   var sMsg = "";
   var nQuotesMode = 0;       // single (1) or double (2) quoted text
   var bEscapeMode = false;   // special chars escaped with a slash (\0, \n, \\, etc.)
   var nByte;
   var nWord;
   var nLong;
   var sHex;
   var sBit;
   var nDigitCount;
   var nState = 0;
   var nNextState = -1;    // no "next state" initially
   var sEscapeState = "";  // special state signifier
   var nFirstAddress = -1;
   var nLastAddress = -1;

   if (pnStartAddr >= gnMemoryMaxRAM) {
      bError = true;
      sMsg = "Start address is larger than RAM memory size (nothing done): " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM);
   }


   function storeMemoryByte (pnByte)
   {                                // NOTE: this LOCAL function references parent values
      if (nAddress >= gnMemoryMaxRAM) {
         bError = true;
         sMsg = "Address is larger than RAM memory size (memory access overflow): " +
            decToHex4 (nAddress) + " / " + decToHex4 (gnMemoryMaxRAM);

      } else {
         if (nFirstAddress < 0)
            nFirstAddress = nAddress;

         if (nAddress > nLastAddress)
            nLastAddress = nAddress;

         pnaMemory[nAddress] = pnByte & 0xFF;
         ++nAddress;
         ++nBytes;
      }

      return;
   } // storeMemoryByte -- store passed byte into memory at address nAddress & inc., etc.


   while (nIdx < nLength  &&  !bError) {

      if (bGetChar) {
         bEndOfLine = false;
         bEndOfToken = false;
         sChar = psDecText.substr (nIdx, 1);
         sUpperChar = sChar.toUpperCase();
         ++nIdx;
         ++nLineChar;
      }

      bGetChar = true;     // next time revert to default processing mode

      if (nState == 0  &&  nNextState >= 0) {   // can only switch to special "next state" from State 0
         nState = nNextState;
         nNextState = -1;     // reset
      }

      if (sChar == "\n"  ||  sChar == "\r") {
         bEndOfLine = true;
         bEndOfToken = true;

         sNextChar = psDecText.substr (nIdx, 1);

         if (sChar == "\n"  &&  sNextChar == "\r")
            ++nIdx;  // correct \n\r

         if (sChar == "\r"  &&  sNextChar == "\n")
            ++nIdx;  // correct \r\n
      }

      if (sChar == " "  ||  sChar == "\t") {
         bEndOfToken = true;
      }

      if (!bError) {
         switch (nState) {    // state mode driven

         case 0:     // aggregate numeric tokens (of various formats)

            if (sToken != ""  ||  bEscapeMode) {
               if (bEndOfLine  ||  bEndOfToken) {
                  if (bEscapeMode)
                     nState = 2;    // process escaped token value

                  else
                     ++nState;      // switch to next state (parse numeric token and store value)

                  bGetChar = false;    // fall through and process

               } else {
                  sToken += sUpperChar;   // build numeric token (uppercase)
               }

            } else {    // first character of token
               switch (sChar) {

               case "'":      // single quoted text

                  nQuotesMode = 1;     // single quotes mode
                  nState = 3;          // process quoted text

                  break;

               case '"':      // double quoted text

                  nQuotesMode = 2;     // double quotes mode
                  nState = 3;          // process quoted text

                  break;

               case "\\":     // escaped character mode

                  bEscapeMode = true;     // continue building token (whitespace delimited)

                  break;

               default:       // otherwise build token

                  if (!bEndOfLine  &&  !bEndOfToken)
                     sToken += sUpperChar;   // start building numeric token (uppercase)

                  break;

               } // switch
            }

            break;   // state 0

         case 1:     // parse numeric token and store value

            if (sToken.substr (0, 1) == "+")
               sToken = sToken.substr (1);   // ignore leading plus signs

            sToken = sToken.replace (/,/g, "");     // strip out ALL commas

            if (sToken.substr (0, 2) == "0X")
               sToken = sToken.substr (2) + "H";   // make prefix into suffix

            sSuffix = sToken.substr (sToken.length - 1);    // get suffix (if present)
            nAndMask = 0xFF;     // mask out bytes unless otherwise needed

            switch (sSuffix) {

            case "D":      // 16-bit word decimal (signed or unsigned)

               sToken = sToken.substr (0, sToken.length - 1);     // remove suffix char
               nAndMask = 0xFFFF;     // mask out words (16-bit)

               nWord = parseInt (sToken) | 0;   // prevent NAN errors

               if (nWord < 0)
                  nWord += 65536;   // signed into unsigned

               if (nWord < 0)
                  nWord = 65535;    // no error checking; just 'assume' "-1"

               nWord &= nAndMask;

               nByte = Math.floor (nWord / 256);   // get hi byte
               storeMemoryByte (nByte);
               nByte = nWord & 0xFF;               // get lo byte
               storeMemoryByte (nByte);

               break;

            case "N":      // 32-bit long word decimal (signed or unsigned)

               sToken = sToken.substr (0, sToken.length - 1);     // remove suffix char
               nAndMask = 0xFFFFFFFF;     // mask out long words (32-bit)

               nLong = parseInt (sToken) | 0;   // prevent NAN errors

               if (nLong < 0)
                  nLong += 4294967296;   // signed into unsigned

               if (nLong < 0)
                  nLong = 4294967295;    // no error checking; just 'assume' "-1"

               nLong &= nAndMask;

               nByte = Math.floor (nLong / 16777216);       // get hi byte
               storeMemoryByte (nByte);
               nByte = Math.floor (nLong / 65536) & 0xFF;   // get next byte
               storeMemoryByte (nByte);
               nByte = Math.floor (nLong / 256) & 0xFF;     // get next byte
               storeMemoryByte (nByte);
               nByte = nLong & 0xFF;                        // get lo byte
               storeMemoryByte (nByte);

               break;

            case "H":      // hexadecimal numerics (1 - N digits in length)

               sToken = sToken.substr (0, sToken.length - 1);     // remove suffix char

               if ((sToken.length & 0x1) == 1)
                  sToken = "0" + sToken;     // left pad with a zero (n HH couplets)

               while (sToken != ""  &&  !bError) {

                  sHex = sToken.substr (0, 2);
                  sToken = sToken.substr (2);

                  if (gcHEX_CHARS.indexOf (sHex.substr (0, 1)) < 0  ||
                        gcHEX_CHARS.indexOf (sHex.substr (1, 1)) < 0) {
                     bError = true;
                     sMsg = "Illegal hexadecimal value (" + sHex + ")";

                  } else {
                     nByte = hexToDecimal (sHex) & nAndMask;
                     storeMemoryByte (nByte);
                  }

               } // while

               break;

            case "B":      // binary numerics (8-bit byte or 16-bit word)

               sToken = sToken.substr (0, sToken.length - 1);     // remove suffix char
               sSuffix = sToken.substr (sToken.length - 1);       // check for "BB" (16-bit)

               if (sSuffix == "B") {
                  sSuffix = "BB";   // 'flag' to store 2 bytes instead of one
                  sToken = sToken.substr (0, sToken.length - 1);     // remove suffix char
                  nAndMask = 0xFFFF;     // mask out words (16-bit)
               }

               nWord = 0;     // use word in case 16-bit

               for (var bb = 0;  bb < sToken.length  &&  !bError;  ++bb) {

                  sBit = sToken.substr (bb, 1);   // get a bit

                  if (sBit != "0"  &&  sBit != "1") {
                     bError = true;
                     sMsg = "Illegal binary value (" + sToken + ")";

                  } else {
                     nWord = (nWord * 2) + parseInt (sBit);
                  }

               } // for

               if (!bError) {
                  nWord &= nAndMask;

                  if (sSuffix == "BB") {
                     nByte = Math.floor (nWord / 256);   // get hi byte
                     storeMemoryByte (nByte);
                  }

                  nByte = nWord & 0xFF;               // get lo byte
                  storeMemoryByte (nByte);
               }

               break;

            default:       // default 8-bit byte decimal numeric (no suffix)

               nByte = parseInt (sToken) | 0;   // prevent NAN errors

               if (nByte < 0)
                  nByte += 256;  // signed into unsigned

               if (nByte < 0)
                  nByte = 255;   // no error checking; just 'assume' "-1"

               nByte &= nAndMask;
               storeMemoryByte (nByte);

               break;

            } // switch

            nState = 0;    // reset for next data item
            sToken = "";

            break;   // state 1

         case 2:     // process escaped token value (\...)

               // sChar = sToken.substr (0, 1).toUpperCase();  // uppercase just in case

            sChar = sToken.substr (0, 1)     // case is important!
            nByte = -1;    // 'flag' for no value

            if (sChar >= "0"  &&  sChar <= "9")
               sChar = "9";   // temp code for numeric decimal

            switch (sChar) {

            case "":       // SPACE or TAB or EOL

               // NIL = nothing done -- no value created

               break;

            case "b":      // Backspace  (ASCII 8d = Ctrl-H)

               nByte = 8;

               break;

            case "f":      // Form feed  (ASCII 12d = Ctrl-L)

               nByte = 12;

               break;

            case "n":      // New line  (LF or NL -- ASCII 10d = Ctrl-J)

               nByte = 10;

               break;

            case "r":      // Carriage return  (CR -- ASCII 13d = Ctrl-M or ENTER)

               nByte = 13;

               break;

            case "t":      // Tab  (ASCII 9d = Ctrl-I or TAB)

               nByte = 9;

               break;

            case "'":      // Single quote or apostrophe (')

               nByte = sChar.charCodeAt (0);

               break;

            case "\"":     // Double quote (")

               nByte = sChar.charCodeAt (0);

               break;

            case "\\":     // Backslash (\)

               nByte = sChar.charCodeAt (0);

               break;

            case "o":      // Octal character code = 0 - 377   (lowercase 'o' only!)

               sToken = sToken.substr (1);   // skip "o"
               sToken = "" + Math.abs (parseInt (sToken) | 0);    // quick get rid of non-numerics
               sToken = "000" + sToken.substr (0, 3);             // left pad to insure 3 digits
               sToken = sToken.substr (sToken.length - 3);        // get last 3 chars

               if (sToken.indexOf ("8") >= 0  ||  sToken.indexOf ("9") >= 0) {
                  bError = true;
                  sMsg = "Illegal octal value for control code (" + sToken + ")";

               } else {
                  nByte = (parseInt (sToken.substr (0, 1)) * 64) +
                     (parseInt (sToken.substr (1, 1)) * 8) +
                     parseInt (sToken.substr (2, 1));
                  nByte &= 0xFF;
               }

               break;

            case "x":      // Hex character code = 00 - FF     (lowercase 'x' only!)

               sHex = sToken.substr (1, 2);     // skip "X"

               if (sHex.length == 1)
                  sHex = "0" + sHex;      // left pad with a zero

               if (gcHEX_CHARS.indexOf (sHex.substr (0, 1)) < 0  ||
                     gcHEX_CHARS.indexOf (sHex.substr (1, 1)) < 0) {
                  bError = true;
                  sMsg = "Illegal hexadecimal value for control code (" + sHex + ")";

               } else {
                  nByte = hexToDecimal (sHex) & 0xFF;
               }

               break;

            case "9":      // Decimal character code = 0 - 255

               nByte = Math.abs (parseInt (sToken) | 0) & 0xFF;

               break;

            default:       // alpha control = \@, \A, ... \Z, \[, \|, \], \^, \_    (uppercase alpha only!)

               nByte = -1;    // assume error state with bad escape sequence character

               if ((sChar >= '@'  &&  sChar <= '_')  ||  sChar == '|') {
                  nByte = sChar.charCodeAt (0) - 64;     // subtract "@" for 0 - 31

                  if (nByte == 60)
                     nByte -= 32;   // special case for \| instead of \\ as control code
               }

               if (nByte < 0  ||  nByte > 31) {
                  bError = true;
                  sMsg = "Illegal control character (\\" + sChar + ")";
               }

               break;

            } // switch

            if (nByte >= 0  &&  !bError) {
               storeMemoryByte (nByte & 0xFF);
            }

            nState = 0;    // reset for next data item
            sToken = "";
            bEscapeMode = false;    // reset escape mode

            break;   // state 2

         case 3:     // process quoted text

            if (!bEndOfLine) {
               switch (sChar) {

               case "'":      // single quote

                  if (nQuotesMode == 1) {
                     nQuotesMode = 0;     // turn off quotes mode
                     nState = 0;          // reset for next data item

                  } else {    // store single quote value
                     nByte = sChar.charCodeAt (0);
                     storeMemoryByte (nByte & 0xFF);
                  }

                  break;

               case '"':      // double quote

                  if (nQuotesMode == 2) {
                     nQuotesMode = 0;     // turn off quotes mode
                     nState = 0;          // reset for next data item

                  } else {    // store double quote value
                     nByte = sChar.charCodeAt (0);
                     storeMemoryByte (nByte & 0xFF);
                  }

                  break;

               case "\\":     // escaped character mode

                  bEscapeMode = true;     // turn on escape mode
                  nState = 4;             // process quoted escaped sequence

                  break;

               default:       // store the character as its byte value

                  nByte = sChar.charCodeAt (0);
                  storeMemoryByte (nByte & 0xFF);

                  break;

               } // switch
            } // if not EOL

            break;   // state 3

         case 4:     // process quoted escaped sequence

            if (sEscapeState != "") {     // if building a token
               if ( (sEscapeState == "O"  &&  sChar >= "0"  &&  sChar <= "7")       ||
                     (sEscapeState == "9"  &&  sChar >= "0"  &&  sChar <= "9")      ||
                     (sEscapeState == "X"  &&  ( (sChar >= "0"  &&  sChar <= "9")  ||
                        (sUpperChar >= "A"  &&  sUpperChar <= "F") )) ) {
                  sToken += sUpperChar;
                  ++nDigitCount;

                  if ( ((sEscapeState == "O"  ||  sEscapeState == "9")  &&  nDigitCount == 3)  ||
                        (sEscapeState == "X"  &&  nDigitCount == 2) )
                     sChar = "";    // stop when max chars found

               } else {    // invalid character found for base N
                  if (!bEndOfLine) {
                     --nIdx;        // restore last character
                     --nLineChar;
                  }

                  sChar = "";    // stop when invalid char found
               }

               if (sChar == "") {      // temp flag
                  if (sEscapeState != "9")   // decimal is a special case with temp flagging
                     sToken = sEscapeState + sToken;     // create full token value
                  sEscapeState = "";   // reset
                  nState = 2;          // process escaped token value (\...)
                  nNextState = 3;      // go back to processing quoted text
                  bGetChar = false;    // fall through and process
               }

            } else {    // first time after backslash
               nByte = -1;    // 'flag' for no value

               if (sUpperChar >= "0"  &&  sUpperChar <= "9")
                  sUpperChar = "9";    // temp code for numeric decimal

               switch (sUpperChar) {

               case "":       // this probably won't happen
               case " ":      // SPACE
               case "\t":     // TAB
               case "\r":     // EOL
               case "\n":     // EOL

                  // NIL = nothing done -- no value created

                  bEscapeMode = false;    // reset escape mode
                  nState = 3;    // go back to processing quoted text

                  break;

               case "B":      // Backspace  (ASCII 8d = Ctrl-H)
               case "F":      // Form feed  (ASCII 12d = Ctrl-L)
               case "N":      // New line  (LF or NL -- ASCII 10d = Ctrl-J)
               case "R":      // Carriage return  (CR -- ASCII 13d = Ctrl-M or ENTER)
               case "T":      // Tab  (ASCII 9d = Ctrl-I or TAB)
               case "'":      // Single quote or apostrophe (')
               case "\"":     // Double quote (")
               case "\\":     // Backslash (\)

                  sToken = sUpperChar;
                  nState = 2;          // process escaped token value (\...)
                  nNextState = 3;      // go back to processing quoted text
                  bGetChar = false;    // fall through and process

                  break;

               case "O":      // Octal character code = 0 - 377
               case "X":      // Hex character code = 00 - FF
               case "9":      // Decimal character code = 0 - 255

                  sEscapeState = sUpperChar;
                  nDigitCount = 0;
                  sToken = "";

                  if (sEscapeState == "9")
                     sToken = sChar;   // for special decimal case, save first digit

                  break;

               default:       // alpha control = \@, \A, ... \Z, \[, \|, \], \^, \_

                  sToken = sUpperChar;
                  nState = 2;          // process escaped token value (\...)
                  nNextState = 3;      // go back to processing quoted text
                  bGetChar = false;    // fall through and process

                  break;

               } // switch
            } // if-else first time

            break;   // state 4

         } // switch state
      } // if not error

      if (!bError  &&  bEndOfLine  &&  bGetChar) {    // don't inc when "falling through"
         ++nLine;
         nLineChar = 1;
      }

   } // while

   if (bError) {
      alert ("Error at Line " + nLine + ", near character " + nLineChar + ":\n" +
         psDecText.substr (nIdx - 1, 10) + "...\n     " + sMsg + "\n" +
         "Decimal load aborted, " + nBytes + " bytes stored.");

   } else {
      if (nFirstAddress >= 0) {
         document.getElementById ("txtStartAddress").value = decToHex4 (nFirstAddress);
         rangeCheck ('start');
         document.getElementById ("txtEndAddress").value = decToHex4 (nLastAddress);
         rangeCheck ('end');
         dumpMemory();
      }

      alert (nBytes + " bytes stored in RAM memory.");
   }

   return;
} // loadMemoryFromDec


function rangeCheck (psItem)
{
// check values and calculate other values appropriately

   var txtStartAddr = document.getElementById ("txtStartAddress");
   var txtEndAddr = document.getElementById ("txtEndAddress");
   var txtByteCount = document.getElementById ("txtByteCount");

   var nStartAddr = hexToDecimal (txtStartAddr.value);
   var nEndAddr = hexToDecimal (txtEndAddr.value);
   var nByteCount = Math.floor (txtByteCount.value);

   switch (psItem) {

   case "start":

      txtStartAddr.value = decToHex4 (nStartAddr);

      if (nEndAddr < nStartAddr) {
         nEndAddr = nStartAddr;
         txtEndAddr.value = decToHex4 (nEndAddr);
      }

      txtByteCount.value = nEndAddr - nStartAddr + 1;

      break;

   case "end":

      txtEndAddr.value = decToHex4 (nEndAddr);

      if (nStartAddr > nEndAddr) {
         nStartAddr = nEndAddr;
         txtStartAddr.value = decToHex4 (nStartAddr);
      }

      txtByteCount.value = nEndAddr - nStartAddr + 1;

      break;

   case "bytes":

      nEndAddr = nStartAddr + nByteCount - 1;
      txtEndAddr.value = decToHex4 (nEndAddr);
      txtByteCount.value = nByteCount;

      break;

   } // switch
} // rangeCheck


function createProgsSelectList()
{
   var aaPrograms = new Array();
   var sElementName;
   var sFunctionName;
   var sDescription;

   for (var eElement in window) {

      sElementName = eElement.toString();

      if (sElementName.substr (0, 16) == "load1802Program_") {
         sFunctionName = sElementName.substr (16);
         sDescription = eval (sElementName + "('desc')");

         var saProgram = new Array (2);
         saProgram[0] = sElementName;
         saProgram[1] = sFunctionName + ' - ' + sDescription;
         aaPrograms.push (saProgram);
      }

   } // for-in

   aaPrograms.sort (ProgsArraySort);   // sort on select tag option choice text ([1])

   for (var nIdx = 0;  nIdx < aaPrograms.length;  ++nIdx) {

      sElementName = aaPrograms[nIdx][0];
      sDescription = aaPrograms[nIdx][1];

      document.writeln ('<option value="' + sElementName + '">' + sDescription + ' &nbsp;</option>');

   } // for-in

   return;
} // createProgsSelectList


function ProgsArraySort (pbA, pbB)
{
// Return value:
// * Less than 0:       <0    Sort "a" to be a lower index than "b".
// * Zero:              =0    "a" and "b" should be considered equal, and no sorting performed.
// * Greater than 0:    >0    Sort "b" to be a lower index than "a".

   if (pbA[1] < pbB[1])
      return -1;

   if (pbA[1] > pbB[1])
      return 1;

   return 0;   // otherwise equal
} // ProgsArraySort


function dumpLoadProgram (pnaMemory, pnStartAddr, pnByteCount)
{
   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ("Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var sLoadProgDump = "";

   var nLastAddr = pnStartAddr + pnByteCount - 1;

   if (nLastAddr >= gnMemoryMaxRAM)
      nLastAddr = gnMemoryMaxRAM - 1;

   for (var nAddress = pnStartAddr;  nAddress <= nLastAddr;  ++nAddress) {

      sLoadProgDump += "gnaMemoryRAM[pc++] = 0x" + decToHex2 (pnaMemory[nAddress]) + ";\n";

   } // for

   return sLoadProgDump;
} // dumpLoadProgram


function memoryDumpDec (pnaMemory, pnStartAddr, pnByteCount)
{
   if (pnStartAddr >= gnMemoryMaxRAM) {
      alert ("Start address exceeds end of memory: " +
         decToHex4 (pnStartAddr) + " / " + decToHex4 (gnMemoryMaxRAM));

      return "";
   }

   var sMemDump = "";

   var nLastAddr = pnStartAddr + pnByteCount - 1;

   if (nLastAddr >= gnMemoryMaxRAM)
      nLastAddr = gnMemoryMaxRAM - 1;

   for (var nAddress = pnStartAddr;  nAddress <= nLastAddr;  ++nAddress) {

      sMemDump += pnaMemory[nAddress] + "\n";

   } // for

   return sMemDump;
} // memoryDumpDec -- dump memory in decimal bytes, one per line


function logDumpInternals (pnHaltAddress, pnRegsPerLine)
{
// quick and easy log dump of internals stored in gs1802LogDump global variable (temporary stop-gap routine)
// gs1802LogDump value can be displayed with JavaScript Shell or other JS debugger
// http://www.squarefree.com/shell/

   gs1802LogDump = "Halt Address = " + decToHex4 (pnHaltAddress) + "h (" + pnHaltAddress + ")\n" +
      "D = " + decToHex2 (gnD8bAccum) + "h (" + gnD8bAccum + ", " +
      ((gnD8bAccum > 127) ? (gnD8bAccum - 256) : gnD8bAccum) + ")\n" +
      "DF/Carry = " + (gbDataFlag1bCarry ? 1 : 0) + " (" + (gbDataFlag1bCarry ? "true" : "false") + ")\n" +
      "RP = R" + decToHex1 (gnP4bRegIdx) + " (" + gnP4bRegIdx + ") = " +
         decToHex4 (gnaRegister16b[gnP4bRegIdx]) + "h (" + gnaRegister16b[gnP4bRegIdx] + ")\n" +
      "RX = R" + decToHex1 (gnX4bRegIdx) + " (" + gnX4bRegIdx + ") = " +
         decToHex4 (gnaRegister16b[gnX4bRegIdx]) + "h (" + gnaRegister16b[gnX4bRegIdx] + ")\n" +
      "Q Flag = " + (gbQ1bFlag ? 1 : 0) + " (" + (gbQ1bFlag ? "true" : "false") + ")\n";

   for (var nRegN = 0;  nRegN < (pnRegsPerLine == 1 ? 16 : 8);  ++nRegN) {

      gs1802LogDump += "R" + decToHex1 (nRegN) + " = " + decToHex4 (gnaRegister16b[nRegN]) +
         "h (" + gnaRegister16b[nRegN] + ", " + ((gnaRegister16b[nRegN] > 32767) ?
            (gnaRegister16b[nRegN] - 65536) : gnaRegister16b[nRegN]) + ")";

      if (pnRegsPerLine == 2)
         gs1802LogDump += "          R" + decToHex1 (nRegN + 8) + " = " +
            decToHex4 (gnaRegister16b[nRegN + 8]) + "h (" +
            gnaRegister16b[nRegN + 8] + ", " + ((gnaRegister16b[nRegN + 8] > 32767) ?
            (gnaRegister16b[nRegN + 8] - 65536) : gnaRegister16b[nRegN + 8]) + ")";

      gs1802LogDump += "\n";

   } // for

   return;
} // logDumpInternals
