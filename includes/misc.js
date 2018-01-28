/*
   Miscellaneous Routines needed for SimElf -- must be loaded along with other
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

function safeMail (psTLD, psDomain, psName, psSubject)
{
   var sMailLink = "mailto:" + psName + "@" + psDomain + psTLD;

   if (psSubject != ""  &&  typeof (psSubject) != "undefined")
      sMailLink += "?subject=" + psSubject;

   document.location = sMailLink;

   return false;
} // safeMail
