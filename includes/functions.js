/*
   Additional Routines needed for SimElf -- must be loaded along with other
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

var gcHEX_CHARS = "0123456789ABCDEF";


function decToHex1 (pnNybble)
{
   var nDigitLo = pnNybble & 0x0f;

   return gcHEX_CHARS[nDigitLo];
} // decToHex1


function decToHex2 (pnByte)
{
   var nDigitLo = pnByte & 0x0f;
   var nDigitHi = (pnByte >> 4) & 0x0f;

   return gcHEX_CHARS[nDigitHi] + gcHEX_CHARS[nDigitLo];
} // decToHex2


function decToHex4 (pnWord)
{
   var nByteLo = pnWord & 0xff;
   var nByteHi = (pnWord >> 8) & 0xff;

   return decToHex2 (nByteHi) + decToHex2 (nByteLo);
} // decToHex4


function hexToDecimal (psHex)
{
   var nDecimal = 0;
   var nLength = psHex.length;
   var bAbort = false;
   psHex = psHex.toUpperCase();

   for (var idx = 0;  idx < nLength;  ++idx) {

      sHexDigit = psHex.substr (idx, 1);

      if (gcHEX_CHARS.indexOf (sHexDigit) == -1)  // stop at non-hex chars
         if (sHexDigit != " " && sHexDigit != "X")   // ignore SPACEs and allow 0xH... formatting, loosely
            bAbort = true;

      if (!bAbort) {
         nHexNybble = sHexDigit.charCodeAt (0) - 48;

         if (nHexNybble > 9)
            nHexNybble -= 7;  // convert A-F => 10-15

         nDecimal = (nDecimal * 16) + nHexNybble;
      }

   } // for

   return nDecimal;
} // hexToDecimal


function decToBinary8 (pnByte)
{
   var sBinary = "";
   var nPow2 = 128;

   for (ii = 1;  ii < 9;  ++ii) {

      sBinary += ((pnByte & nPow2) == 0) ? "0" : "1";
      nPow2 = nPow2 >>> 1;

   }

   return sBinary;
} // decToBinary8


function helpToggle()
{
   var winHelp = document.getElementById ("winHelp");

   if (winHelp.style.display == 'none') {
      winHelp.style.display = 'block';
      window.scroll (0, 550);

   } else {
      winHelp.style.display = 'none';
   }

   return;
} // helpToggle


function jsTrim (psString)
{
	return psString.replace (/^\s\s*/, "").replace (/\s\s*$/, "");
} // jsTrim - trim leading and trailing whitespace


function jsLtrim (psString)
{
	return psString.replace (/^\s\s*/, "");
} // jsLtrim - left trim leading whitespace


function jsRtrim (psString)
{
	return psString.replace (/\s\s*$/, "");
} // jsRtrim - right trim trailing whitespace


function jsCompress (psString)
{
	return psString.replace (/\s+/, "");
} // jsCompress - remove all whitespace
