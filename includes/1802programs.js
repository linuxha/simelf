/*
   1802 Programs Examples Loaders
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

function load1802Program_Count (psMode)
{
/*
This program counts up in hexadecimal from 00 to FF
with infinite loop wrap-around and alternates the
Q LED on and off for each count. (flashes the Q LED)
*/

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Counts up in Hex from 00 to FF");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xE1;    // 0000: SEX R1   ; Will point to data byte for Counter
      gnaMemoryRAM[pc++] = 0xF8;    // 0001: LDI 00
      gnaMemoryRAM[pc++] = 0x00;    // 0002:
      gnaMemoryRAM[pc++] = 0xB1;    // 0003: PHI R1
      gnaMemoryRAM[pc++] = 0xF8;    // 0004: LDI 20
      gnaMemoryRAM[pc++] = 0x20;    // 0005:
      gnaMemoryRAM[pc++] = 0xA1;    // 0006: PLO R1   ; R1 = 0020 -- data byte location for Counter
      gnaMemoryRAM[pc++] = 0x64;    // 0007: OUT 4    ; Output to Port 4 the byte via Reg X (R1) & Inc Reg X
      gnaMemoryRAM[pc++] = 0x21;    // 0008: DEC R1   ; Fix Reg X (back to 0020)
      gnaMemoryRAM[pc++] = 0xF0;    // 0009: LDX      ; Load byte via Reg X (R1)
      gnaMemoryRAM[pc++] = 0xFC;    // 000A: ADI 01   ; Add 1 (Increment)
      gnaMemoryRAM[pc++] = 0x01;    // 000B:
      gnaMemoryRAM[pc++] = 0x51;    // 000C: STR R1   ; Store new value at location via R1 (Reg X)
      gnaMemoryRAM[pc++] = 0x31;    // 000D: BQ 0012  ; Branch if Q Flag is set
      gnaMemoryRAM[pc++] = 0x12;    // 000E:
      gnaMemoryRAM[pc++] = 0x7B;    // 000F: SEQ      ; Set Q Flag (turn Q LED On)
      gnaMemoryRAM[pc++] = 0x30;    // 0010: BR 0007  ; Loop
      gnaMemoryRAM[pc++] = 0x07;    // 0011:
      gnaMemoryRAM[pc++] = 0x7A;    // 0012: REQ      ; Reset Q Flag (turn Q LED Off)
      gnaMemoryRAM[pc++] = 0x30;    // 0013: BR 0007  ; Loop
      gnaMemoryRAM[pc++] = 0x07;    // 0014:

      return pc;
   } // load program

/*
0000:  E1        SEX R1
0001:  F8 00     LDI 00
0003:  B1        PHI R1
0004:  F8 20     LDI 20
0006:  A1        PLO R1
0007:  64        OUT 4
0008:  21        DEC R1
0009:  F0        LDX
000A:  FC 01     ADI 01
000C:  51        STR R1
000D:  31 12     BQ 0012
000F:  7B        SEQ
0010:  30 07     BR 0007
0012:  7A        REQ
0013:  30 07     BR 0007
*/

   return;
} // load1802Program_Count


function load1802Program_CountBCD (psMode)
{
/*
by William Donnelly - May 2011

This program counts up in Binary Coded Decimal (BCD)
from 00 to 99 with infinite loop wrap-around and
alternates the Q LED on and off for each count,
plus it flashes the Q LED for each increment.
*/

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Counts up in BCD from 00 to 99");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xE1;    // 0000: SEX R1   ; Will point to data byte for BCD Counter
      gnaMemoryRAM[pc++] = 0xF8;    // 0001: LDI 00
      gnaMemoryRAM[pc++] = 0x00;    // 0002:
      gnaMemoryRAM[pc++] = 0xB1;    // 0003: PHI R1   ; Zero Hi byte of R1 (Reg X)
      gnaMemoryRAM[pc++] = 0xB4;    // 0004: PHI R4   ; Zero Hi byte of R4 (once) used below
      gnaMemoryRAM[pc++] = 0xF8;    // 0005: LDI 40   ; Memory location of data byte for counter
      gnaMemoryRAM[pc++] = 0x40;    // 0006:
      gnaMemoryRAM[pc++] = 0xA1;    // 0007: PLO R1   ; R1 = 0040 -- data byte location for Counter
      gnaMemoryRAM[pc++] = 0x64;    // 0008: OUT 4    ; Output to Port 4 the byte via Reg X (R1) & Inc Reg X
      gnaMemoryRAM[pc++] = 0x21;    // 0009: DEC R1   ; Fix Reg X (back to 0030)
      gnaMemoryRAM[pc++] = 0xF0;    // 000A: LDX      ; Load byte via Reg X (R1)
      gnaMemoryRAM[pc++] = 0xFC;    // 000B: ADI 01   ; Add 1 (Increment)
      gnaMemoryRAM[pc++] = 0x01;    // 000C:
      gnaMemoryRAM[pc++] = 0xA3;    // 000D: PLO R3   ; Temp save of new value
      gnaMemoryRAM[pc++] = 0xFA;    // 000E: ANI 0F   ; Get lower BCD digit
      gnaMemoryRAM[pc++] = 0x0F;    // 000F:
      gnaMemoryRAM[pc++] = 0xFF;    // 0010: SMI 0A   ; Compare lower BCD digit to a decimal 10
      gnaMemoryRAM[pc++] = 0x0A;    // 0011:
      gnaMemoryRAM[pc++] = 0x3A;    // 0012: BNZ 0021 ; Skip if still in BCD range (0-9)
      gnaMemoryRAM[pc++] = 0x21;    // 0013:
      gnaMemoryRAM[pc++] = 0x83;    // 0014: GLO R3   ; Get Temp save of new value
      gnaMemoryRAM[pc++] = 0xFA;    // 0015: ANI F0   ; Set lower BCD digit to zero
      gnaMemoryRAM[pc++] = 0xF0;    // 0016:
      gnaMemoryRAM[pc++] = 0xFC;    // 0017: ADI 10   ; Increment upper BCD digit
      gnaMemoryRAM[pc++] = 0x10;    // 0018:
      gnaMemoryRAM[pc++] = 0xA3;    // 0019: PLO R3   ; Re-save new value to Temp
      gnaMemoryRAM[pc++] = 0xFF;    // 001A: SMI A0   ; Compare upper BCD digit to a decimal 10
      gnaMemoryRAM[pc++] = 0xA0;    // 001B:
      gnaMemoryRAM[pc++] = 0x3A;    // 001C: BNZ 0021 ; Skip if still in BCD range (0-9)
      gnaMemoryRAM[pc++] = 0x21;    // 001D:
      gnaMemoryRAM[pc++] = 0xF8;    // 001E: LDI 00   ; Reset new value to zero
      gnaMemoryRAM[pc++] = 0x00;    // 001F:
      gnaMemoryRAM[pc++] = 0xA3;    // 0020: PLO R3   ; Re-save new new value to Temp
      gnaMemoryRAM[pc++] = 0x83;    // 0021: GLO R3   ; Get Temp save of new value
      gnaMemoryRAM[pc++] = 0x51;    // 0022: STR R1   ; Store new value at location via R1 (Reg X)
      gnaMemoryRAM[pc++] = 0xF8;    // 0023: LDI 21   ; Get Q LED flicker count (MUST be ODD number)
      gnaMemoryRAM[pc++] = 0x21;    // 0024:
      gnaMemoryRAM[pc++] = 0xA4;    // 0025: PLO R4   ; R4 = 0021 -- Load Flicker Counter (33 dec)
      gnaMemoryRAM[pc++] = 0x31;    // 0026: BQ 002B  ; Branch if Q Flag is set
      gnaMemoryRAM[pc++] = 0x2B;    // 0027:
      gnaMemoryRAM[pc++] = 0x7B;    // 0028: SEQ      ; Set Q Flag (turn Q LED On)
      gnaMemoryRAM[pc++] = 0x30;    // 0029: BR 002C  ; Start flicker loop
      gnaMemoryRAM[pc++] = 0x2C;    // 002A:
      gnaMemoryRAM[pc++] = 0x7A;    // 002B: REQ      ; Reset Q Flag (turn Q LED Off)
      gnaMemoryRAM[pc++] = 0x24;    // 002C: DEC R4
      gnaMemoryRAM[pc++] = 0x84;    // 002D: GLO R4   ; Get flicker counter value
      gnaMemoryRAM[pc++] = 0x3A;    // 002E: BNZ 0026 ; Q LED flicker loop
      gnaMemoryRAM[pc++] = 0x26;    // 002F:
      gnaMemoryRAM[pc++] = 0xF8;    // 0030: LDI FF   ; Get Pause Count
      gnaMemoryRAM[pc++] = 0xFF;    // 0031:
      gnaMemoryRAM[pc++] = 0xB4;    // 0032: PHI R4   ; R4 = FF00 -- Load Pause Counter Hi
      gnaMemoryRAM[pc++] = 0xA4;    // 0033: PLO R4   ; R4 = FFFF -- Load Pause Counter Lo (65535 dec)
      gnaMemoryRAM[pc++] = 0x24;    // 0034: DEC R4
      gnaMemoryRAM[pc++] = 0x84;    // 0035: GLO R4   ; Get pause counter value Lo
      gnaMemoryRAM[pc++] = 0x3A;    // 0036: BNZ 0034 ; Pause loop
      gnaMemoryRAM[pc++] = 0x34;    // 0037:
      gnaMemoryRAM[pc++] = 0x94;    // 0038: GHI R4   ; Get pause counter value Hi
      gnaMemoryRAM[pc++] = 0x3A;    // 0039: BNZ 0034 ; Pause loop
      gnaMemoryRAM[pc++] = 0x34;    // 003A:
      gnaMemoryRAM[pc++] = 0x30;    // 003B: BR 0008  ; Counter Loop
      gnaMemoryRAM[pc++] = 0x08;    // 003C:

      return pc;
   } // load program

/*
0000:  E1        SEX R1
0001:  F8 00     LDI 00
0003:  B1        PHI R1
0004:  B4        PHI R4
0005:  F8 40     LDI 40
0007:  A1        PLO R1
0008:  64        OUT 4
0009:  21        DEC R1
000A:  F0        LDX
000B:  FC 01     ADI 01
000D:  A3        PLO R3
000E:  FA 0F     ANI 0F
0010:  FF 0A     SMI 0A
0012:  3A 21     BNZ 0021
0014:  83        GLO R3
0015:  FA F0     ANI F0
0017:  FC 10     ADI 10
0019:  A3        PLO R3
001A:  FF A0     SMI A0
001C:  3A 21     BNZ 0021
001E:  F8 00     LDI 00
0020:  A3        PLO R3
0021:  83        GLO R3
0022:  51        STR R1
0023:  F8 21     LDI 21
0025:  A4        PLO R4
0026:  31 2B     BQ 002B
0028:  7B        SEQ
0029:  30 2C     BR 002C
002B:  7A        REQ
002C:  24        DEC R4
002D:  84        GLO R4
002E:  3A 26     BNZ 0026
0030:  F8 FF     LDI FF
0032:  B4        PHI R4
0033:  A4        PLO R4
0034:  24        DEC R4
0035:  84        GLO R4
0036:  3A 34     BNZ 0034
0038:  94        GHI R4
0039:  3A 34     BNZ 0034
003B:  30 08     BR 0008
*/

   return;
} // load1802Program_CountBCD


function load1802Program_Guess (psMode)
{
   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("load1802Program_Guess");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0x8A;
      gnaMemoryRAM[pc++] = 0xAB;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0xAA;
      gnaMemoryRAM[pc++] = 0xA3;
      gnaMemoryRAM[pc++] = 0x53;
      gnaMemoryRAM[pc++] = 0xE3;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x07;
      gnaMemoryRAM[pc++] = 0xA4;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x23;
      gnaMemoryRAM[pc++] = 0x2A;
      gnaMemoryRAM[pc++] = 0x3F;
      gnaMemoryRAM[pc++] = 0x0C;
      gnaMemoryRAM[pc++] = 0x37;
      gnaMemoryRAM[pc++] = 0x0F;
      gnaMemoryRAM[pc++] = 0x6C;
      gnaMemoryRAM[pc++] = 0x8B;
      gnaMemoryRAM[pc++] = 0xF5;
      gnaMemoryRAM[pc++] = 0x33;
      gnaMemoryRAM[pc++] = 0x1A;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x01;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x22;
      gnaMemoryRAM[pc++] = 0x3A;
      gnaMemoryRAM[pc++] = 0x20;
      gnaMemoryRAM[pc++] = 0x53;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x1E;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x10;
      gnaMemoryRAM[pc++] = 0x53;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x23;
      gnaMemoryRAM[pc++] = 0x24;
      gnaMemoryRAM[pc++] = 0x84;
      gnaMemoryRAM[pc++] = 0x3A;
      gnaMemoryRAM[pc++] = 0x0C;
      gnaMemoryRAM[pc++] = 0x8B;
      gnaMemoryRAM[pc++] = 0x7B;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x1C;

      return pc;
   } // load program

/*
0000:  8A        GLO RA    ;
0001:  AB        PLO RB    ;
0002:  F8 AA     LDI AA    ;
0004:  A3        PLO R3    ;
0005:  53        STR R3    ;
0006:  E3        SEX R3    ;
0007:  F8 07     LDI 07    ;
0009:  A4        PLO R4    ;
000A:  64        OUT 4     ;
000B:  23        DEC R3    ;
000C:  2A        DEC RA    ;
000D:  3F 0C     BN4 000C  ;
000F:  37 0F     B4 000F   ;
0011:  6C        INP C     ;
0012:  8B        GLO RB    ;
0013:  F5        SD        ;
0014:  33 1A     BDF 001A  ;
0016:  F8 01     LDI 01    ;
0018:  30 22     BR 0022   ;
001A:  3A 20     BNZ 0020  ;
001C:  53        STR R3    ;
001D:  64        OUT 4     ;
001E:  30 1E     BR 001E   ;
0020:  F8 10     LDI 10    ;
0022:  53        STR R3    ;
0023:  64        OUT 4     ;
0024:  23        DEC R3    ;
0025:  24        DEC R4    ;
0026:  84        GLO R4    ;
0027:  3A 0C     BNZ 000C  ;
0029:  8B        GLO RB    ;
002A:  7B        SEQ       ;
002B:  30 1C     BR 001C   ;
*/

   return;
} // load1802Program_Guess


function load1802Program_ButtonUp (psMode)
{
// by William Donnelly - May 2011 (based on other program)

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Count Up via Button Press");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xE4;    // 0000: SEX R4
      gnaMemoryRAM[pc++] = 0xF8;    // 0001: LDI 77
      gnaMemoryRAM[pc++] = 0x77;    // 0002:
      gnaMemoryRAM[pc++] = 0xA4;    // 0003: PLO R4
      gnaMemoryRAM[pc++] = 0xF8;    // 0004: LDI 00
      gnaMemoryRAM[pc++] = 0x00;    // 0005:
      gnaMemoryRAM[pc++] = 0x54;    // 0006: STR R4
      gnaMemoryRAM[pc++] = 0xF8;    // 0007: LDI 76
      gnaMemoryRAM[pc++] = 0x76;    // 0008:
      gnaMemoryRAM[pc++] = 0xA5;    // 0009: PLO R5
      gnaMemoryRAM[pc++] = 0xF8;    // 000A: LDI 01
      gnaMemoryRAM[pc++] = 0x01;    // 000B:
      gnaMemoryRAM[pc++] = 0x55;    // 000C: STR R5
      gnaMemoryRAM[pc++] = 0x64;    // 000D: OUT 4
      gnaMemoryRAM[pc++] = 0x24;    // 000E: DEC R4
      gnaMemoryRAM[pc++] = 0x3F;    // 000F: BN4 000F
      gnaMemoryRAM[pc++] = 0x0F;    // 0010:
      gnaMemoryRAM[pc++] = 0x37;    // 0011: B4 0011
      gnaMemoryRAM[pc++] = 0x11;    // 0012:
      gnaMemoryRAM[pc++] = 0x05;    // 0013: LDN R5
      gnaMemoryRAM[pc++] = 0xF4;    // 0014: ADD
      gnaMemoryRAM[pc++] = 0x54;    // 0015: STR R4
      gnaMemoryRAM[pc++] = 0x30;    // 0016: BR 0007
      gnaMemoryRAM[pc++] = 0x07;    // 0017:

      return pc;
   } // load program

/*
0000:  E4        SEX R4
0001:  F8 77     LDI 77
0003:  A4        PLO R4
0004:  F8 00     LDI 00
0006:  54        STR R4
0007:  F8 76     LDI 76
0009:  A5        PLO R5
000A:  F8 01     LDI 01
000C:  55        STR R5
000D:  64        OUT 4
000E:  24        DEC R4
000F:  3F 0F     BN4 000F
0011:  37 11     B4 0011
0013:  05        LDN R5
0014:  F4        ADD
0015:  54        STR R4
0016:  30 07     BR 0007
*/

   return;
} // load1802Program_ButtonUp


function load1802Program_SmallCount (psMode)
{
// via Dave Ruske http://www.retrotechnology.com/memship/memship.html#soft

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Smallest Counter Program");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xEF;
      gnaMemoryRAM[pc++] = 0x80;
      gnaMemoryRAM[pc++] = 0xBF;
      gnaMemoryRAM[pc++] = 0xAF;
      gnaMemoryRAM[pc++] = 0x9E;
      gnaMemoryRAM[pc++] = 0x5F;
      gnaMemoryRAM[pc++] = 0x1E;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x01;

      return pc;
   } // load program

/*
0000:  EF        SEX RF
0001:  80        GLO R0
0002:  BF        PHI RF
0003:  AF        PLO RF
0004:  9E        GHI RE
0005:  5F        STR RF
0006:  1E        INC RE
0007:  64        OUT 4
0008:  30 01     BR 0001

Change 0004: 9E to 8E GLO for faster count.
*/

   return;
} // load1802Program_SmallCount


function load1802Program_SwitchHex (psMode)
{
// by William Donnelly - May 2011 (probably based on found program)

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Output switches to hex display");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xE1;
      gnaMemoryRAM[pc++] = 0x90;
      gnaMemoryRAM[pc++] = 0xB1;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x0A;
      gnaMemoryRAM[pc++] = 0xA1;
      gnaMemoryRAM[pc++] = 0x6C;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x03;

      return pc;
   } // load program

/*
0000:  E1        SEX R1
0001:  90        GHI R0
0002:  B1        PHI R1
0003:  F8 0A     LDI 0A
0005:  A1        PLO R1
0006:  6C        INP 4
0007:  64        OUT 4
0008:  30 03     BR 0003
*/

   return;
} // load1802Program_SwitchHex


function load1802Program_SwitchHexIN (psMode)
{
// by William Donnelly - May 2011

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Output switches to hex display on IN");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xE1;
      gnaMemoryRAM[pc++] = 0x90;
      gnaMemoryRAM[pc++] = 0xB1;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x10;
      gnaMemoryRAM[pc++] = 0xA1;
      gnaMemoryRAM[pc++] = 0x3F;
      gnaMemoryRAM[pc++] = 0x06;
      gnaMemoryRAM[pc++] = 0x37;
      gnaMemoryRAM[pc++] = 0x08;
      gnaMemoryRAM[pc++] = 0x6C;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x03;

      return pc;
   } // load program

/*
0000:  E1        SEX R1
0001:  90        GHI R0
0002:  B1        PHI R1
0003:  F8 10     LDI 10
0005:  A1        PLO R1
0006:  3F 06     BN4 0006
0008:  37 08     B4 0008
000A:  6C        INP 4
000B:  64        OUT 4
000C:  30 03     BR 0003
*/

   return;
} // load1802Program_SwitchHexIN


function load1802Program_DiceRoll (psMode)
{
// via http://whats.all.this.brouhaha.com/2010/07/30/new-demo-for-fpga-elf-dice/
// doesn't seem to work for some reason -- right digit is not updated correctly

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Displays 6-sided Dice Roll");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x00;
      gnaMemoryRAM[pc++] = 0xB1;
      gnaMemoryRAM[pc++] = 0xB2;
      gnaMemoryRAM[pc++] = 0xB3;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x80;
      gnaMemoryRAM[pc++] = 0xA1;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x81;
      gnaMemoryRAM[pc++] = 0xA2;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x82;
      gnaMemoryRAM[pc++] = 0xA3;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x60;
      gnaMemoryRAM[pc++] = 0x52;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x06;
      gnaMemoryRAM[pc++] = 0x53;
      gnaMemoryRAM[pc++] = 0x3F;
      gnaMemoryRAM[pc++] = 0x14;
      gnaMemoryRAM[pc++] = 0x37;
      gnaMemoryRAM[pc++] = 0x16;
      gnaMemoryRAM[pc++] = 0x02;
      gnaMemoryRAM[pc++] = 0xFC;
      gnaMemoryRAM[pc++] = 0xF0;
      gnaMemoryRAM[pc++] = 0x52;
      gnaMemoryRAM[pc++] = 0x3A;
      gnaMemoryRAM[pc++] = 0x2A;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x60;
      gnaMemoryRAM[pc++] = 0x52;
      gnaMemoryRAM[pc++] = 0x03;
      gnaMemoryRAM[pc++] = 0xFC;
      gnaMemoryRAM[pc++] = 0xFF;
      gnaMemoryRAM[pc++] = 0x53;
      gnaMemoryRAM[pc++] = 0x3A;
      gnaMemoryRAM[pc++] = 0x2A;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x06;
      gnaMemoryRAM[pc++] = 0x53;
      gnaMemoryRAM[pc++] = 0x02;
      gnaMemoryRAM[pc++] = 0xE3;
      gnaMemoryRAM[pc++] = 0xF1;
      gnaMemoryRAM[pc++] = 0xE1;
      gnaMemoryRAM[pc++] = 0x51;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x21;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x14;

      return pc;
   } // load program

/*
   F8 00 B1 B2 B3 F8 80 A1
   F8 81 A2 F8 82 A3 F8 60
   52 F8 06 53 3F 14 02 FC
   F0 52 3A 28 F8 60 52 03
   FC FF 53 3A 28 F8 06 53
   02 E3 F1 E1 51 64 21 30
   14

   0000:  F8 00     LDI 00
   0002:  B1        PHI R1
   0003:  B2        PHI R2
   0004:  B3        PHI R3
   0005:  F8 80     LDI 80
   0007:  A1        PLO R1
   0008:  F8 81     LDI 81
   000A:  A2        PLO R2
   000B:  F8 82     LDI 82
   000D:  A3        PLO R3
   000E:  F8 60     LDI 60
   0010:  52        STR R2
   0011:  F8 06     LDI 06
   0013:  53        STR R3
   0014:  3F 14     BN4 0014
   0016:  02        LDN R2
   0017:  FC F0     ADI F0
   0019:  52        STR R2
   001A:  3A 28     BNZ 0028
   001C:  F8 60     LDI 60
   001E:  52        STR R2
   001F:  03        LDN R3
   0020:  FC FF     ADI FF
   0022:  53        STR R3
   0023:  3A 28     BNZ 0028
   0025:  F8 06     LDI 06
   0027:  53        STR R3
   0028:  02        LDN R2
   0029:  E3        SEX R3
   002A:  F1        OR
   002B:  E1        SEX R1
   002C:  51        STR R1
   002D:  64        OUT 4
   002E:  21        DEC R1
   002F:  30 14     BR 0014

Modifed:
0000:  F8 00     LDI 00
0002:  B1        PHI R1
0003:  B2        PHI R2
0004:  B3        PHI R3
0005:  F8 80     LDI 80
0007:  A1        PLO R1    ; R1 = 0080
0008:  F8 81     LDI 81
000A:  A2        PLO R2    ; R2 = 0081 (left dice roll)
000B:  F8 82     LDI 82
000D:  A3        PLO R3    ; R3 = 0082 (right dice roll)
000E:  F8 60     LDI 60
0010:  52        STR R2    ; store 60 at 0081 (left dice roll)
0011:  F8 06     LDI 06
0013:  53        STR R3    ; store 06 at 0082 (right dice roll)

0014:  3F 14     BN4 0014  ; wait for IN button press
0016:  37 16     B4 0016   ; Added this test to work here

0018:  02        LDN R2    ; get left dice roll
0019:  FC F0     ADI F0
001B:  52        STR R2    ; save new value
001C:  3A 2A     BNZ 002A  ; insertion of test branch above moved this address up +2
001E:  F8 60     LDI 60
0020:  52        STR R2    ; if zero, set to 6
0021:  03        LDN R3    ; get right dice roll
0022:  FC FF     ADI FF
0024:  53        STR R3    ; save new value
0025:  3A 2A     BNZ 002A  ; insertion of test branch above moved this address up +2
0027:  F8 06     LDI 06
0029:  53        STR R3    ; if zero, set to 6

002A:  02        LDN R2    ; get left dice roll
002B:  E3        SEX R3
002C:  F1        OR        ; merge in right dice roll
002D:  E1        SEX R1
002E:  51        STR R1    ; store dice roll at 0080
002F:  64        OUT 4     ; output dice roll to display
0030:  21        DEC R1    ; fix back to address 0080
0031:  30 14     BR 0014   ; loop
*/

   return;
} // load1802Program_DiceRoll


function load1802Program_TestALUOps (psMode)
{
// Test ALU Ops diagnostic routine

   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Test ALU Ops");
   }

   if (psMode == "load") {
      var pc = 0;

      gnaMemoryRAM[pc++] = 0x90;
      gnaMemoryRAM[pc++] = 0xB6;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x29;
      gnaMemoryRAM[pc++] = 0xA6;
      gnaMemoryRAM[pc++] = 0xE0;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x00;
      gnaMemoryRAM[pc++] = 0xE6;
      gnaMemoryRAM[pc++] = 0x3F;
      gnaMemoryRAM[pc++] = 0x09;
      gnaMemoryRAM[pc++] = 0x6C;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x37;
      gnaMemoryRAM[pc++] = 0x0D;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x60;
      gnaMemoryRAM[pc++] = 0xA6;
      gnaMemoryRAM[pc++] = 0xE0;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x01;
      gnaMemoryRAM[pc++] = 0x3F;
      gnaMemoryRAM[pc++] = 0x15;
      gnaMemoryRAM[pc++] = 0xE6;
      gnaMemoryRAM[pc++] = 0x6C;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x37;
      gnaMemoryRAM[pc++] = 0x1A;
      gnaMemoryRAM[pc++] = 0xE0;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x02;
      gnaMemoryRAM[pc++] = 0xE6;
      gnaMemoryRAM[pc++] = 0x3F;
      gnaMemoryRAM[pc++] = 0x20;
      gnaMemoryRAM[pc++] = 0x6C;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x37;
      gnaMemoryRAM[pc++] = 0x24;
      gnaMemoryRAM[pc++] = 0x26;
      gnaMemoryRAM[pc++] = 0x26;
      gnaMemoryRAM[pc++] = 0x46;
      gnaMemoryRAM[pc++] = 0xC4;
      gnaMemoryRAM[pc++] = 0xC4;
      gnaMemoryRAM[pc++] = 0x26;
      gnaMemoryRAM[pc++] = 0x56;
      gnaMemoryRAM[pc++] = 0x64;
      gnaMemoryRAM[pc++] = 0x7A;
      gnaMemoryRAM[pc++] = 0xCA;
      gnaMemoryRAM[pc++] = 0x00;
      gnaMemoryRAM[pc++] = 0x20;
      gnaMemoryRAM[pc++] = 0x7B;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x20;

      return pc;
   } // load program

/*
via: http://en.wikipedia.org/wiki/RCA_1802

..  TEST ALU OPS
0000 90         GHI 0     .. SET UP R6
0001 B6         PHI 6
0002 F829       LDI DOIT  .. FOR INPUT OF OPCODE
0004 A6         PLO 6
0005 E0         SEX 0     .. (X=0 ALREADY)
0006 6400       OUT 4,00  .. ANNOUNCE US READY
0008 E6         SEX 6     .. NOW X=6
0009 3F09       BN4 *     .. WAIT FOR IT
000B 6C         INP 4     .. OK, GET IT
000C 64         OUT 4     .. AND ECHO TO DISPLAY
000D 370D       B4 *      .. WAIT FOR RELEASE
000F F860       LDI #60   .. NOW GET READY FOR
0011 A6         PLO 6     .. FIRST OPERAND
0012 E0         SEX 0     .. SAY SO
0013 6401       OUT 4,01
0015 3F15       BN4 *
0017 E6         SEX 6     .. TAKE IT IN AND ECHO
0018 6C         INP 4     .. (TO 0060)
0019 64         OUT 4     .. (ALSO INCREMENT R6)
001A 371A       B4 *
001C E0         SEX 0     .. DITTO SECOND OPERAND
001D 6402       OUT 4,02
001F E6         SEX 6
0020 3F20 LOOP: BN4 *     .. WAIT FOR IT
0022 6C         INP 4     .. GET IT (NOTE: X=6)
0023 64         OUT 4     .. ECHO IT
0024 3724       B4 *      .. WAIT FOR RELEASE
0026 26         DEC 6     .. BACK UP R6 TO 0060
0027 26         DEC 6
0028 46         LDA 6     .. GET 1ST OPERAND TO D
0029 C4   DOIT: NOP       .. DO OPERATION
002A C4         NOP       .. (SPARE)
002B 26         DEC 6     .. BACK TO 0060
002C 56         STR 6     .. OUTPUT RESULT
002D 64         OUT 4     .. (X=6 STILL)
002E 7A         REQ       .. TURN OFF Q
002F CA0020     LBNZ LOOP .. THEN IF ZERO,
0032 7B         SEQ       .. TURN IT ON AGAIN
0033 3020       BR LOOP   .. REPEAT IN ANY CASE


0000: 90 B6 F8 29 A6 E0 64 00 E6 3F 09 6C 64 37 0D F8
0010: 60 A6 E0 64 01 3F 15 E6 6C 64 37 1A E0 64 02 E6
0020: 3F 20 6C 64 37 24 26 26 46 C4 C4 26 56 64 7A CA
0030: 00 20 7B 30 20


0000:  90        GHI R0    ; get 00 (if run from < 100h address)
0001:  B6        PHI R6    ;
0002:  F8 29     LDI 29    ;
0004:  A6        PLO R6    ; R6 = 0029
0005:  E0        SEX R0    ; RX = PC
0006:  64        OUT 4     ; output 00 to hex display (Output Immediate Byte)
0007:  00        IDL       ; skipped by OUT instruction
0008:  E6        SEX R6    ;

0009:  3F 09     BN4 0009  ; wait for button press
000B:  6C        INP 4     ; get toggle switches value
000C:  64        OUT 4     ; output value to hex display

000D:  37 0D     B4 000D   ; wait for button release
000F:  F8 60     LDI 60    ;
0011:  A6        PLO R6    ; R6 = 0060
0012:  E0        SEX R0    ; RX = PC
0013:  64        OUT 4     ; output 01 to hex display (Output Immediate Byte)
0014:  01        LDN R1    ; skipped by OUT instruction

0015:  3F 15     BN4 0015  ; wait for button press
0017:  E6        SEX R6    ;
0018:  6C        INP 4     ; get toggle switches value
0019:  64        OUT 4     ; output value to hex display

001A:  37 1A     B4 001A   ; wait for button release
001C:  E0        SEX R0    ; RX = PC
001D:  64        OUT 4     ; output 01 to hex display (Output Immediate Byte)
001E:  02        LDN R2    ; skipped by OUT instruction
001F:  E6        SEX R6    ;

0020:  3F 20     BN4 0020  ; wait for button press

0022:  6C        INP 4     ; get toggle switches value
0023:  64        OUT 4     ; output value to hex display

0024:  37 24     B4 0024   ; wait for button release
0026:  26        DEC R6    ;
0027:  26        DEC R6    ; R6 = 0060
0028:  46        LDA R6    ; get

0029:  C4        NOP       ;
002A:  C4        NOP       ;
002B:  26        DEC R6    ;
002C:  56        STR R6    ;
002D:  64        OUT 4     ;
002E:  7A        REQ       ; turn Q LED off
002F:  CA 00 20  LBNZ 0020 ;
0032:  7B        SEQ       ; turn Q LED on
0033:  30 20     BR 0020   ;
*/

   return;
} // load1802Program_TestALUOps


function load1802Program_HelloWorld (psMode)
{
   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Display 'HELLO WORLD!' on Terminal");
   }

   if (psMode == "load") {
      var sProgram = "* = 0000\n" +
         "0000: E4 F8 0A A4 67 04 3A 04 30 08\n" +
         '"HELLO WORLD!\\n" 00\n';

      loadMemoryFromHex (gnaMemoryRAM, sProgram, 0);     // via simself.js

      return 0;   // 0 means we used loadMemoryFromHex()

/*
      gnaMemoryRAM[pc++] = 0xE4;
      gnaMemoryRAM[pc++] = 0xF8;
      gnaMemoryRAM[pc++] = 0x0A;
      gnaMemoryRAM[pc++] = 0xA4;
      gnaMemoryRAM[pc++] = 0x67;
      gnaMemoryRAM[pc++] = 0x04;
      gnaMemoryRAM[pc++] = 0x3A;
      gnaMemoryRAM[pc++] = 0x04;
      gnaMemoryRAM[pc++] = 0x30;
      gnaMemoryRAM[pc++] = 0x08;
      gnaMemoryRAM[pc++] = 0x48;
      gnaMemoryRAM[pc++] = 0x45;
      gnaMemoryRAM[pc++] = 0x4C;
      gnaMemoryRAM[pc++] = 0x4C;
      gnaMemoryRAM[pc++] = 0x4F;
      gnaMemoryRAM[pc++] = 0x20;
      gnaMemoryRAM[pc++] = 0x57;
      gnaMemoryRAM[pc++] = 0x4F;
      gnaMemoryRAM[pc++] = 0x52;
      gnaMemoryRAM[pc++] = 0x4C;
      gnaMemoryRAM[pc++] = 0x44;
      gnaMemoryRAM[pc++] = 0x21;
      gnaMemoryRAM[pc++] = 0x00;
*/
   } // load program

/*
* = 0000
0000: E4 F8 0A A4 67 04 3A 04 30 08
"HELLO WORLD!\n" 00

* = 0000
0000: E4 F8 0A A4 67 04 3A 04 30 08 48 45 4C 4C 4F 20
0010: 57 4F 52 4C 44 21 00

0000:  E4        SEX R4
0001:  F8 0A     LDI 0A
0003:  A4        PLO R4
0004:  67        OUT 7
0005:  04        LDN R4
0006:  3A 04     BNZ 0004
0008:  30 08     BR 0008
000A:  48 45 4C 4C 4F 20 57 4F 52 4C 44 21 00  ; HELLO WORLD!
*/

   return;
} // load1802Program_HelloWorld


function load1802Program_TermInpOut (psMode)
{
   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Echo Keypresses on Terminal");
   }

   if (psMode == "load") {
      var sProgram = "* = 0000\n" +
         "0000: E4 F8 10 A4 6F FE 3B 04 F6 73 14 67 24 30 04\n";
         // "0000: E4 F8 10 A4 6F FE 3B 04 F6 73 14 67 24 30 04\n";

      loadMemoryFromHex (gnaMemoryRAM, sProgram, 0);     // via simself.js

      return 0;   // 0 means we used loadMemoryFromHex()
   }

/*
0000:  E4        SEX R4    ; set RX to R4
0001:  F8 10     LDI 10    ; get 10 hex for character storage address
0003:  A4        PLO R4    ; R4 = RX = 0010
0004:  6F        INP 7     ; look for a keyboard input
0005:  FE        SHL       ; move high-order bit into DF (data/carry flag)
0006:  3B 04     BNF 0004  ; check for keypress again if no input
0008:  F6        SHR       ; correct key code (ASCII < 128)
0009:  73        STXD      ; store char in single-byte buffer
000A:  14        INC R4    ; fix R4 to point back to buffer
000B:  67        OUT 7     ; output char to terminal
000C:  24        DEC R4    ; fix R4 to point back to buffer
000D:  30 04     BR 0004   ; look for more input
*/

   return;
} // load1802Program_TermInpOut


function load1802Program_TinyBASIC (psMode)
{
   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("(not working) Tiny BASIC");
   }

   if (psMode == "load") {
      var sProgram =
         ":100000007100E4C000B0C00C30C00C40C00C5008FF" +
         ":100010001882802097BA48D558D50679110000106B" +
         ":10002000C0066FC00BFEC00651D3BFE28673967345" +
         ":1000300083A693B646B346A39F3029D3BFE296B3B7" +
         ":1000400086A31242B602A69F303BD343ADF810BD43" +
         ":100050004DED304A019801A0021F01DD01F001D4ED" +
         ":100060000481024900ED044E010405A201D301D32D" +
         ":1000700004AA01D301D302C502D5030302790318F0" +
         ":10008000053C01D30429036C03CB03A70398039B0E" +
         ":10009000040E0460046D058101B602670348034B3A" +
         ":1000A00001D301D301C901C5024E0244024101D36B" +
         ":1000B000F8B3A3F800B3D3BAF81CAA4AB24AA24ACA" +
         ":1000C000BDF800AD0DBFE212F0AFFBFF52F3EDC67D" +
         ":1000D0009FF3FCFF8F523BC6220ABDF823AD82730B" +
         ":1000E00092732A2A0A738DFB123AE3F6C8FF00F8CE" +
         ":1000F000F2A3F800B3D3B4B5B7F82AA4F83CA5F836" +
         ":100100004BA7331AD720BB4DAB975B1B5BD7168B26" +
         ":10011000F4BFD7249F739B7C0073D722B24DA2D724" +
         ":100120002682739273D402CCD71EB94DA9E249FF3F" +
         ":1001300030334BFDD73385FEFCB0A6F82D22227359" +
         ":10014000937397B6465246A6F0B6D5FF103B6AA603" +
         ":10015000FA1F325C5289F473997C0038737386F607" +
         ":10016000F6F6F6FAFEFC54A63042FC08FA07B64949" +
         ":10017000A6337A89739973D40237D71E86F4A99669" +
         ":100180002D74B9302DFD0752D71AADE2F4A69DB6F5" +
         ":100190000D52065D0256302D86FF20A6967F003850" +
         ":1001A00096C2027FB986A9302D1B0BFF2032A9FF12" +
         ":1001B00010C7FD090BD5D401C54DAD9A5D1D8A5DF3" +
         ":1001C00030C9D401C5D401C9BAD71A2DFC015DAD1F" +
         ":1001D0002D4DAAD5D401AAFB0D322D30A0D401AAF1" +
         ":1001E000FF413BA0FF1A33A01B9FFED40259302DC4" +
         ":1001F000D401AA3BA097BAAAD402544BFA0FAA97EB" +
         ":10020000BAF80AAFED1D8AF4AA9A2D74BA2F8F3A64" +
         ":10021000059A5D1D8A73D401AAC301FBC0012D9B01" +
         ":10022000BA8BAAD401AA1B5249F33223FB80321C99" +
         ":100230009ABB8AABC001A0D72482F52D9275337F7B" +
         ":10024000D549305949BA493055D405253055D401DE" +
         ":10025000C5D402548AD402599A52D719F7337FF879" +
         ":1002600001F55DAD025DD5D401C9AD4DBA4D305536" +
         ":10027000FB2F3266FB22D402F44BFB0D3A7029D7D8" +
         ":1002800018B8D402CCF821D402F4D71E89F7AA9961" +
         ":100290002D77BAD403159832A9F8BDA993B9D40221" +
         ":1002A000C5D728BA4DAAD40315F807D41009D4022B" +
         ":1002B000D5D71A975DD726B24DA2C0012820415448" +
         ":1002C00020A3D402F249FC803BC230F2D719F88057" +
         ":1002D00073977373C8D71BFE3366D715AAF80DD46E" +
         ":1002E0001009D71A8AFE32EF2A97C7F8FF30DF735A" +
         ":1002F000F88AFF80BFD71B2DFC81FC803B665D9F89" +
         ":10030000C01009D71BFA07FD08AA8A3297F820D433" +
         ":1003100002F42A300AD40254D71AADD404133B2570" +
         ":10032000F82DD402F49773BAF80AD402551DD403F9" +
         ":10033000E38AF6F930731D4DEDF12D2D3A2E1202A0" +
         ":10034000C201C2D402F4303ED72E389BFB103A5E75" +
         ":100350008B52F0FF80335ED72E8B739B5DD5D72EEB" +
         ":10036000B80DA88B739B5D98BB88ABD5D401C59A9B" +
         ":10037000FB80738A73D401C9AFD401C5128AF7AA6E" +
         ":10038000129AFB8077523B928AF1328F8FF6388F28" +
         ":10039000F6388FF6C7C419D5D4040ED401C5ED1DA7" +
         ":1003A0008AF4739A745DD5D401C5F810AF4DB80DB9" +
         ":1003B000A80DFE5D2D0D7E5DD404223BC5ED1D888C" +
         ":1003C000F47398745D2F8F1D3AB1D5D401C59A523C" +
         ":1003D0008AF1C2027F0DF373D404132D2DD40413BC" +
         ":1003E0001D97C89773AABAF811AFED8AF7522D9AE4" +
         ":1003F000773BF6BA02AA1D1D1DF07E73F07E738A4C" +
         ":100400007ED404242F8FCA03EA1202FE3B21D71A9E" +
         ":10041000AD3018EDF0FE3B211D97F77397775DFF28" +
         ":1004200000D58AFEAA9A7EBAD5D718C202B14BFB74" +
         ":100430000D3A2ED40598324BD4000C3346D71CB954" +
         ":100440004DA9D7175DD5D71EB94DA9C0027FD720BA" +
         ":10045000BB4DABD40598324BD71C8973995D3042A4" +
         ":10046000D404FE3238D7288A739A5D304BD4048B7B" +
         ":1004700042BA02AAD72682739273D405013A653034" +
         ":1004800088D4048B42B902A9C0012DD7221212824E" +
         ":10049000FC02F32D3A9C927C00F3324B12D5D71616" +
         ":1004A0003897FED71A97765D30B2F830ABD4025445" +
         ":1004B0009DBBD41006FA7F32B252FB7F32B2FB757D" +
         ":1004C000329EFB1932A1D71302F332D72D02F33A31" +
         ":1004D000DD2B8BFF3033B2F830ABF80D38025BD731" +
         ":1004E000198BF73BECF807D402F40B384BFB0D3AB1" +
         ":1004F000B2D402D5D7188B5DF830ABC001C5D4019A" +
         ":10050000C58A529AF1C2027FD720BB4DABD4059861" +
         ":10051000C68DD5ED8AF5529A2D75E2F133124BFB5B" +
         ":100520000D3A1E300DD40528D401C54DB84DA84D47" +
         ":10053000B64DA68D52D719025DAD8AD5D72C8B73D7" +
         ":100540009B5DD404FED72A8B739B73D404FE2B2BA4" +
         ":10055000D72A8BF72D9B77337B4BBA4BAA3A629AFB" +
         ":10056000327BD40315F82DFB0DD402F4D4000C33E8" +
         ":100570007B4BFB0D3A67D402D53050D72CBB4DAB2B" +
         ":10058000D5D7268273925DD7182DCED728AA4D12C3" +
         ":1005900012E2738A73C0012DD7274B5D1D4B73F197" +
         ":1005A0001DD5D4035ED404FEFCFF97AF33BA9BBDC8" +
         ":1005B0008BAD2F2F2F4DFB0D3AB42B2BD4035ED7D1" +
         ":1005C000280BFB0D735D32D99A5D1D8A5D9BBA8B3A" +
         ":1005D000AA1F1F1F4AFB0D3AD3D72EBA4DAAD72404" +
         ":1005E0008AF7AA2D9A77BA1D8FF4BF8FFA80CEF8BA" +
         ":1005F000FF2D74E273B89F735282F598529275C3BF" +
         ":10060000027E8F323052FE3B1ED72EBF4DAFE2F737" +
         ":10061000A89F7C00B8485F1F1A9A3A1530309FAFE8" +
         ":1006200098BFD724B84DA82AEF0828731A9A3A29F8" +
         ":10063000D724124273025DD72EBA4DAAD728AFF144" +
         ":10064000324E8F5A1A4D5A1A4B5AFB0D3A47C00276" +
         ":10065000B5735297BA2D43D55D2D88FA0FF9605DB9" +
         ":10066000FA08CEC412DDFC00376EFF003F6CD55295" +
         ":10067000F8C5A1F808B102D1D5243A912710E15963" +
         ":10068000C32A562C8A474F54CF30D01011EB6C8CB4" +
         ":10069000474F5355C230D01011E014168B4C45D43F" +
         ":1006A000A080BD30D0E0131D8C50D283494ED4E1E0" +
         ":1006B0006285BA3853385583A2216330D02083AC89" +
         ":1006C000226284BBE1674A83DE2493E0231D9149C3" +
         ":1006D000C630D0311F30D084544845CE1C1D380B55" +
         ":1006E0009B49CE835055D4A010E7243F209127E1A9" +
         ":1006F0005981AC30D0131182AC4DE01D8A5245D4E3" +
         ":10070000835552CEE0151D85454EC4E02D875255C8" +
         ":10071000CE1011380A844E45D72B9F4C4953D4E74D" +
         ":100720000A00010A7FFF6530D030CBE024000000D2" +
         ":100730000000000A801F2493231D845245CD1DA074" +
         ":1007400080BD382A82AC620B2F85AD30E6176481FC" +
         ":10075000AB30E685AB30E6185A93AD30E61954302D" +
         ":10076000F585AA30F51A5A85AF30F51B542F8852FB" +
         ":100770004E44A8311539448E555352A830D030CB51" +
         ":1007800030CB311C2E2FA2122FC12F80A86530D064" +
         ":100790000B80AC30D080A92F84BD09022F833CBED2" +
         ":1007A00074853CBD09032F84BC09012F853EBD091A" +
         ":1007B000062F853EBC09052F80BE09042F19170A94" +
         ":1007C00000011809800980120A09291A0A1A8518D5" +
         ":1007D0000813098012030102316A31751B1A19319D" +
         ":1007E00075182F0B010501040B010701062F0B09DA" +
         ":1007F000060A00001C172F00000000000000000087" +
         ":10080000F810B4F8DFA48F739F738E739E738D738B" +
         ":100810009D738C739C738B739B738A739A738973A8" +
         ":1008200099738873987387739773867396738573B8" +
         ":1008300095737373837393738273927381739173DC" +
         ":1008400080739073F800B33F4BF9043E4FF9307357" +
         ":10085000933D55F9023C59F9107393C5F90173F8AA" +
         ":1008600001CCF8007393737C00737824F8CFA193C4" +
         ":1008700054F80EA3A403732383FB053A75A1F80C67" +
         ":10088000FC01B101A3F8FF5101FC01835191C209A0" +
         ":10089000F8338014F8D054141414F8D554F8B0A3D5" +
         ":1008A000D3F852D5F855D5F84ED523F8C0531313C5" +
         ":1008B0001353F820A39153138153F826BE90BCF82C" +
         ":1008C000EFACF80DD5E2227394738452E4300094B7" +
         ":1008D00073F8C9A442734273F8BBA44254F8C5A488" +
         ":1008E00082739273F8C554F80AB5F834A5D5D39E2F" +
         ":1008F000F6AE2E43FF013AF48E32EE2330F293BC73" +
         ":10090000F8EFACF800AEAF37073F09F803FF013A44" +
         ":100910000D8F3A1737191F371E1EF807300D2E2E70" +
         ":100920008EF901BEDC0C3F2C9EFAFEBEDC26D5FC07" +
         ":10093000073337FC0A3388FC009FD5F8803883C81A" +
         ":10094000F800AFF880BFE38FC667803F4B374DDCC0" +
         ":1009500002374D8FC66740E2E29EF6336237617B15" +
         ":10096000C87AC4C7E2E2E2C4C4DC071E9FF6BF3304" +
         ":1009700078F9803F57BF30597A32438FFE3B399F19" +
         ":10098000FF413B2FFF063337FEFEFEFEFC08FEAEA6" +
         ":100990008D7EAD9D7EBD8EFE3A8F30399EAE38D5B0" +
         ":1009A000453846389FADFB0A3ABEF85B30C09FF62B" +
         ":1009B000F6F6F6FCF6C7FC07FFC6ADF81BC8F80B49" +
         ":1009C000AF8ECEDC177BDC07C4C4C4C4C4C42FF50F" +
         ":1009D0008D76ADCF7BC87AC48FFA0F3AC68FFCFBF9" +
         ":1009E000AF3B9FFF1B329FF80033F59FFA0FFCF6D9" +
         ":1009F000C7FC07FFC6AD30C1F8FFA5F809B5D5FFA4" +
         ":100A000001B3E56701F8FEA3D3F89CA3D30DD30A85" +
         ":100A1000D34ED345D357D33FD320F83BA3F84CFC58" +
         ":100A20000DA4D3FF0D3A1F84FF59C200B0FC0B3A4E" +
         ":100A300009C000EDF809B3F89CA3D30DD30AD32A5B" +
         ":100A4000F800BDADF83BA3D3FB2432F2FB05A8CEE2" +
         ":100A5000FB1E3A40D3FB523A65F8B8AAF810BAF830" +
         ":100A600028ADD33081FB1F3A40D33B69D3336CFBB5" +
         ":100A7000203AE79DBA8DAA8832D1F800ADBDD333B4" +
         ":100A80007E8DA89DB89FFB21C20BB0FB013A92D38B" +
         ":100A90003086FB2D3AE7F89CA3D30A3FE79ABFF8CC" +
         ":100AA000AEA3D38ABFF8AEA3D3D3204ABFF8AEA378" +
         ":100AB000D328883AB89832348AFA0F3AC3D33BD352" +
         ":100AC0000D3099F633AB30A9D33BC8D33BE78D5AF1" +
         ":100AD0001AD333CBFB0D3234FB2132C8FB173AD18A" +
         ":100AE000D3FB0D3AE03069F89CA3D30DD30AD33F72" +
         ":100AF0003034D3FB52A8CEFB023A40D333FBFB0D7C" +
         ":100B0000CA0AE79DB08DA0F89CA3D30A883219F8D1" +
         ":100B1000C5A195FF03B1E57000F810B2B3F8BFA20C" +
         ":100B2000E280ADFA0FFEFCC1A30373F89D532303CB" +
         ":100B3000739553F0CE7B387AF8C073F0BD22727390" +
         ":100B4000F8F873F0F6F8A273F8C5A30373F8F87316" +
         ":100B5000F8C0A2F0B09D5212F0A08D521272B17284" +
         ":100B6000A1606072B372A372B472A4606072B67254" +
         ":100B7000A672B772A772B872A872B972A972BA7265" +
         ":100B8000AA72BB72AB72BC72AC72BD72AD72BE7235" +
         ":100B9000AE72BFF0AFF8C0A272CE70387115C83017" +
         ":100BA000A8F8CAA242B502A5F8C4A202B2C010B801" +
         ":100BB000D3FB4D3ABABDADD333B7FB0DCA0AE79AA2" +
         ":100BC000B38AA39DBF8DAF933ACB8332E2239F3A82" +
         ":100BD000D28F2F3AC7983AD988C20A344A5D1D2865" +
         ":100BE00030D598B388A3C81A1D23933AE7833AE710" +
         ":100BF000ED983AF588C20A340A732A2830F1C20CFB" +
         ":100C000006F6C67B387A88C63920FF01C63C20FF2D" +
         ":100C100001C63D20FF01C63E20FF01C63F20F8016E" +
         ":100C2000D5000000000000000000000000000000EF" +
         ":100C3000EE93BEF83FAE6FFE3B36F6BFD500000028" +
         ":100C4000EE93BEF84FAE9FFA7F731E67D50000008B" +
         ":100C5000E393BEF857AE6F00FE3B63F6FF033A63C3" +
         ":060C6000FF00C8FC00D5F6" +
         ":00000001FF";
         // ":09100600C00C30C00C40C00C50BD" +   // manual copy of 0006-000E => 1006-100E

/*
Changes required to make Tiny BASIC work here:

   0A02  E5       SEX R5
   0A03  67       OUT 7       ; TURN I/O DEVICE ON
   0A04  01       DB 1

0A02  C4       NOP         ; no need to turn I/O device on
0A03  C4       NOP
0A04  C4       NOP


      TIMALC:
   08FE  93       GHI R3      ; > ENTRY:

08FE  C4       NOP         ; get us into page 09
08FF  C4       NOP         ; get us into page 09
0900  D4       SEP R4      ; get input char from terminal
0901  0C 30    DW 0C30h    ; call NEW_TTYRED
0903  FB 0D    XRI 0Dh     ; check for CR
0905  32 0E    BZ 0E       ; if CR, set RE.1 bit 0 to 0
0907  9F       GHI RF      ; get input char again
0908  FB 0B    XRI 0Bh     ; check for LF
090A  3A 00    BNZ 00      ; not CR or LF, get another input
090C  FC 01    LDI 01h     ; if LF, set RE.1 bit 0 to 1
090E  BE       PHI RE      ; clear baud rate and set remote or local echo
090F  D5       SEP R5      ; return


   0946  E3       SEX R3

0946  30 57    BR 57       ; skip unneeded operations

      NOBIT:
   0957  E2       SEX R2      ; EQUALIZE DELAYS

0957  D4       SEP R4      ; get input char from terminal
0901  0C 30    DW 0C30h    ; call NEW_TTYRED

30 7B


      BEGIN:
   09C1  8E       GLO BAUD    ; IF DELAY FLAG > 0,

09C1  8D       GLO RD      ; get char
09C2  BF       PHI RF      ; char to output
               GHI RE
               PLO RF
09C3  D4       SEP R4      ; output char to terminal
09C4  0C 40    DW 0C40h    ; call NEW_TYPE
09C6  8F       GLO RF      ; get code
09C7  FA F0    ANI F0h     ; zero low nybble (bit count)
09C9  AF       PLO RF      ; save new value
09CA  30 DD    BR DD       ; do NXCHAR or return


   09E9  33 F5    BDF HX22    ; THEN GET NULL & GO TYPE IT

09E9  33 9F    BDF 9F      ; no nulls needed, so TYPEXIT



; SimElf++ / COSMAC Elf^2 I/O and Break Test routines

; NEW_TTYRED:
; Waits for a character. When found, it returns it in registers RF.1 and D.
; Enter NEW_TTYRED with R3 as its program counter.
; It alters D, DF, RE, and RF. It returns with SEP R5.

0C30:  EE        SEX RE    ; RX = RE
0C31:  93        GHI R3    ; R3 = 0C
0C32:  BE        PHI RE    ; RE = 0Cxx
0C33:  F8 3F     LDI 3F    ; get single byte buffer location
0C35:  AE        PLO RE    ; RE = 0C37
0C36:  6F        INP 7     ; look for a keyboard input (RX = RP = "INP Immediate")
0C37:  FE        SHL       ; move high-order bit into DF (Data Flag/Carry)
0C38:  3B 36     BNF 0C36  ; check for keypress again if no input
0C3A:  F6        SHR       ; correct key code (ASCII < 128)
0C3B:  BF        PHI RF    ; store char in spec-requested location (and in D reg/accum)
0C3C:  D5        SEP R5    ; return

0C3F:  00        db 00     ; use this location as the single byte input buffer

; EE 93 BE F8 3F AE 6F FE 3B 36 F6 BF D5

;; old buggy version:
         0C30:  E3        SEX R3    ; RX = R3 = RP (PC)
         0C31:  93        GHI R3    ; R3 = 0C
         0C32:  BE        PHI RE    ; RE = 0Cxx
         0C33:  F8 37     LDI 37    ; get single byte buffer location
         0C35:  AE        PLO RE    ; RE = 0C37
         0C36:  6F        INP 7     ; look for a keyboard input (RX = RP = "INP Immediate")
         0C37:  00        db 00     ; use this location as the single byte input buffer
         0C38   FE        SHL       ; move high-order bit into DF (Data Flag/Carry)
         0C39:  3B 36     BNF 0C36  ; check for keypress again if no input
         0C3B:  F6        SHR       ; correct key code (ASCII < 128)
         0C3C:  BF        PHI RF    ; store char in single-byte buffer
         0C3D:  D5        SEP R5    ; return

         ; E3 93 BE F8 37 AE 6F 00 FE 3B 04 F6 BF D5

; NEW_TYPE:
; Types the byte in register RF.1 (high byte of RF).
; Enter NEW_TYPE with R3 as its program counter.
; It alters D, DF, X, and RE. It returns with SEP R5.

0C40:  EE        SEX RE    ; RX = RE
0C41:  93        GHI R3    ; R3 = 0C
0C42:  BE        PHI RE    ; RE = 0Cxx
0C43:  F8 4F     LDI 4F    ; get single byte buffer location
0C45:  AE        PLO RE    ; RE = 0C4F
0C46:  9F        GHI RF    ; get character to output
0C47:  FA 7F     ANI 7F    ; remove high-order bit just in case
0C49:  73        STXD      ; store char in single-byte buffer
0C4A:  1E        INC RE    ; fix R4 to point back to buffer
0C4B:  67        OUT 7     ; output char to terminal
0C4C:  D5        SEP R5    ; return

; EE 93 BE F8 4F AE 9F FA 7F 73 1E 67 D5

; NEW_TBRK:
; Returns DF=0 if no break, or DF=1 if Ctrl-C is pressed.
; Used to abort a long listing to get back to BASIC's command mode.
; Enter NEW_TBRK with R3 as the program counter.
; It alters D, DF, and RE. It returns with SEP R5.

0C50:  E3        SEX R3    ; RX = R3 = RP (PC)
0C51:  93        GHI R3    ; R3 = 0C
0C52:  BE        PHI RE    ; RE = 0Cxx
0C53:  F8 57     LDI 57    ; get single byte buffer location
0C55:  AE        PLO RE    ; RE = 0C37
0C56:  6F        INP 7     ; look for a keyboard input (RX = RP = "INP Immediate")
0C57:  00        db 00     ; use this location as the single byte input buffer
0C58   FE        SHL       ; move high-order bit into DF (Data Flag/Carry)
0C59:  38 63     BNF 0C63  ; if no key pressed, clear DF and return
0C5B:  F6        SHR       ; correct key code (ASCII < 128)
0C5C:  FF 03     SMI 03    ; compare to a Ctrl-C
0C5E:  3A 63     BNZ 0C63    ; compare to a Ctrl-C
0C60:  FF 00     SMI 00       ; set DF/Carry (no Borrow = DF/Carry = 1 / true)
0C62:  C8        NLBR
0C63:  FC 00     ADI 00
0C65:  D5        SEP R5     ; return

; E3 93 BE F8 57 AE 6F 00 FE 3B 63 F6 FF 03 3A 63 FF 00 C8 FC 00 D5
*/

/*
original code
         ":200000007100E4C00800C00940C009A4C00666081882802097BA48D558D5067911000010A4" +
         ":20002000C0066FC00BFEC00651D3BFE28673967383A693B646B346A39F3029D3BFE296B32C" +
         ":2000400086A31242B602A69F303BD343ADF810BD4DED304A019801A0021F01DD01F001D480" +
         ":200060000481024900ED044E010405A201D301D304AA01D301D302C502D50303027903188D" +
         ":20008000053C01D30429036C03CB03A70398039B040E0460046D058101B602670348034BD8" +
         ":2000A00001D301D301C901C5024E0244024101D3F8B3A3F800B3D3BAF81CAA4AB24AA24AE5" +
         ":2000C000BDF800AD0DBFE212F0AFFBFF52F3EDC69FF3FCFF8F523BC6220ABDF823AD827358" +
         ":2000E00092732A2A0A738DFB123AE3F6C8FF00F8F2A3F800B3D3B4B5B7F82AA4F83CA5F8F4" +
         ":200100004BA7331AD720BB4DAB975B1B5BD7168BF4BFD7249F739B7C0073D722B24DA2D75B" +
         ":200120002682739273D402CCD71EB94DA9E249FF30334BFDD73385FEFCB0A6F82D222273C9" +
         ":20014000937397B6465246A6F0B6D5FF103B6AA6FA1F325C5289F473997C0038737386F65B" +
         ":20016000F6F6F6FAFEFC54A63042FC08FA07B649A6337A89739973D40237D71E86F4A99623" +
         ":200180002D74B9302DFD0752D71AADE2F4A69DB60D52065D0256302D86FF20A6967F0038D6" +
         ":2001A00096C2027FB986A9302D1B0BFF2032A9FF10C7FD090BD5D401C54DAD9A5D1D8A5DB6" +
         ":2001C00030C9D401C5D401C9BAD71A2DFC015DAD2D4DAAD5D401AAFB0D322D30A0D401AAE1" +
         ":2001E000FF413BA0FF1A33A01B9FFED40259302DD401AA3BA097BAAAD402544BFA0FAA97A0" +
         ":20020000BAF80AAFED1D8AF4AA9A2D74BA2F8F3A059A5D1D8A73D401AAC301FBC0012D9B77" +
         ":20022000BA8BAAD401AA1B5249F33223FB80321C9ABB8AABC001A0D72482F52D9275337F46" +
         ":20024000D549305949BA493055D405253055D401C5D402548AD402599A52D719F7337FF8A9" +
         ":2002600001F55DAD025DD5D401C9AD4DBA4D3055FB2F3266FB22D402F44BFB0D3A7029D780" +
         ":2002800018B8D402CCF821D402F4D71E89F7AA992D77BAD403159832A9F8BDA993B9D40214" +
         ":2002A000C5D728BA4DAAD40315F807D41009D402D5D71A975DD726B24DA2C0012820415425" +
         ":2002C00020A3D402F249FC803BC230F2D719F88073977373C8D71BFE3366D715AAF80DD497" +
         ":2002E0001009D71A8AFE32EF2A97C7F8FF30DF73F88AFF80BFD71B2DFC81FC803B665D9FD5" +
         ":20030000C01009D71BFA07FD08AA8A3297F820D402F42A300AD40254D71AADD404133B25B6" +
         ":20032000F82DD402F49773BAF80AD402551DD403E38AF6F930731D4DEDF12D2D3A2E1202CC" +
         ":20034000C201C2D402F4303ED72E389BFB103A5E8B52F0FF80335ED72E8B739B5DD5D72EB3" +
         ":20036000B80DA88B739B5D98BB88ABD5D401C59AFB80738A73D401C9AFD401C5128AF7AA7C" +
         ":20038000129AFB8077523B928AF1328F8FF6388FF6388FF6C7C419D5D4040ED401C5ED1D62" +
         ":2003A0008AF4739A745DD5D401C5F810AF4DB80DA80DFE5D2D0D7E5DD404223BC5ED1D88F8" +
         ":2003C000F47398745D2F8F1D3AB1D5D401C59A528AF1C2027F0DF373D404132D2DD40413CB" +
         ":2003E0001D97C89773AABAF811AFED8AF7522D9A773BF6BA02AA1D1D1DF07E73F07E738A23" +
         ":200400007ED404242F8FCA03EA1202FE3B21D71AAD3018EDF0FE3B211D97F77397775DFFDA" +
         ":2004200000D58AFEAA9A7EBAD5D718C202B14BFB0D3A2ED40598324BD4000C3346D71CB9FC" +
         ":200440004DA9D7175DD5D71EB94DA9C0027FD720BB4DABD40598324BD71C8973995D3042B2" +
         ":20046000D404FE3238D7288A739A5D304BD4048B42BA02AAD72682739273D405013A653023" +
         ":2004800088D4048B42B902A9C0012DD722121282FC02F32D3A9C927C00F3324B12D5D716F8" +
         ":2004A0003897FED71A97765D30B2F830ABD402549DBBD41006FA7F32B252FB7F32B2FB7576" +
         ":2004C000329EFB1932A1D71302F332D72D02F33ADD2B8BFF3033B2F830ABF80D38025BD736" +
         ":2004E000198BF73BECF807D402F40B384BFB0D3AB2D402D5D7188B5DF830ABC001C5D4013F" +
         ":20050000C58A529AF1C2027FD720BB4DABD40598C68DD5ED8AF5529A2D75E2F133124BFBD1" +
         ":200520000D3A1E300DD40528D401C54DB84DA84DB64DA68D52D719025DAD8AD5D72C8B7353" +
         ":200540009B5DD404FED72A8B739B73D404FE2B2BD72A8BF72D9B77337B4BBA4BAA3A629AF4" +
         ":20056000327BD40315F82DFB0DD402F4D4000C337B4BFB0D3A67D402D53050D72CBB4DAB88" +
         ":20058000D5D7268273925DD7182DCED728AA4D1212E2738A73C0012DD7274B5D1D4B73F1EF" +
         ":2005A0001DD5D4035ED404FEFCFF97AF33BA9BBD8BAD2F2F2F4DFB0D3AB42B2BD4035ED74E" +
         ":2005C000280BFB0D735D32D99A5D1D8A5D9BBA8BAA1F1F1F4AFB0D3AD3D72EBA4DAAD72413" +
         ":2005E0008AF7AA2D9A77BA1D8FF4BF8FFA80CEF8FF2D74E273B89F735282F598529275C36E" +
         ":20060000027E8F323052FE3B1ED72EBF4DAFE2F7A89F7C00B8485F1F1A9A3A1530309FAF35" +
         ":2006200098BFD724B84DA82AEF0828731A9A3A29D724124273025DD72EBA4DAAD728AFF172" +
         ":20064000324E8F5A1A4D5A1A4B5AFB0D3A47C002B5735297BA2D43D55D2D88FA0FF9605D85" +
         ":20066000FA08CEC412DDFC00376EFF003F6CD552F8C5A1F808B102D1D5243A912710E1596E" +
         ":20068000C32A562C8A474F54CF30D01011EB6C8C474F5355C230D01011E014168B4C45D489" +
         ":2006A000A080BD30D0E0131D8C50D283494ED4E16285BA3853385583A2216330D02083AC1F" +
         ":2006C000226284BBE1674A83DE2493E0231D9149C630D0311F30D084544845CE1C1D380BEE" +
         ":2006E0009B49CE835055D4A010E7243F209127E15981AC30D0131182AC4DE01D8A5245D482" +
         ":20070000835552CEE0151D85454EC4E02D875255CE1011380A844E45D72B9F4C4953D4E72C" +
         ":200720000A00010A7FFF6530D030CBE0240000000000000A801F2493231D845245CD1DA07D" +
         ":2007400080BD382A82AC620B2F85AD30E6176481AB30E685AB30E6185A93AD30E619543080" +
         ":20076000F585AA30F51A5A85AF30F51B542F88524E44A8311539448E555352A830D030CBC3" +
         ":2007800030CB311C2E2FA2122FC12F80A86530D00B80AC30D080A92F84BD09022F833CBECD" +
         ":2007A00074853CBD09032F84BC09012F853EBD09062F853EBC09052F80BE09042F19170A65" +
         ":2007C00000011809800980120A09291A0A1A85180813098012030102316A31751B1A193149" +
         ":1707E00075182F0B010501040B010701062F0B09060A00001C172F61" +
         ":20080000F810B4F8DFA48F739F738E739E738D739D738C739C738B739B738A739A7389734B" +
         ":200820009973887398738773977386739673857395737373837393738273927381739173CC" +
         ":2008400080739073F800B33F4BF9043E4FF93073933D55F9023C59F9107393C5F90173F859" +
         ":2008600001CCF8007393737C00737824F8CFA19354F80EA3A403732383FB053A75A1F80CA3" +
         ":20088000FC01B101A3F8FF5101FC01835191C209F8338014F8D054141414F8D554F8B0A30D" +
         ":2008A000D3F852D5F855D5F84ED523F8C05313131353F820A39153138153F826BE90BCF8A9" +
         ":2008C000EFACF80DD5E2227394738452E430009473F8C9A442734273F8BBA44254F8C5A417" +
         ":0E08E00082739273F8C554F80AB5F834A5D5A2" +
         ":1008EE00D39EF6AE2E43FF013AF48E32EE2330F253" +
         ":2008FE0093BCF8EFACF800AEAF37073F09F803FF013A0D8F3A1737191F371E1EF807300DDD" +
         ":20091E002E2E8EF901BEDC0C3F2C9EFAFEBEDC26D5FC073337FC0A3388FC009FD5F880384B" +
         ":20093E0083C8F800AFF880BFE38FC667803F4B374DDC02374D8FC66740E2E29EF6336237C1" +
         ":20095E00617BC87AC4C7E2E2E2C4C4DC071E9FF6BF3378F9803F57BF30597A32438FFE3B94" +
         ":1E097E00399FFF413B2FFF063337FEFEFEFEFC08FEAE8D7EAD9D7EBD8EFE3A8F303974" +
         ":20099C009EAE38D5453846389FADFB0A3ABEF85B30C09FF6F6F6F6FCF6C7FC07FFC6ADF8BE" +
         ":2009BC001BC8F80BAF8ECEDC177BDC07C4C4C4C4C4C42FF58D76ADCF7BC87AC48FFA0F3A4B" +
         ":2009DC00C68FFCFBAF3B9FFF1B329FF80033F59FFA0FFCF6C7FC07FFC6AD30C1F8FFA5F8C0" +
         ":2009FC0009B5D5FF01B3E56701F8FEA3D3F89CA3D30DD30AD34ED345D357D33FD320F83B4D" +
         ":200A1C00A3F84CFC0DA4D3FF0D3A1F84FF59C200B0FC0B3A09C000EDF809B3F89CA3D30DDE" +
         ":200A3C00D30AD32AF800BDADF83BA3D3FB2432F2FB05A8CEFB1E3A40D3FB523A65F8B8AA50" +
         ":200A5C00F810BAF828ADD33081FB1F3A40D33B69D3336CFB203AE79DBA8DAA8832D1F8009D" +
         ":200A7C00ADBDD3337E8DA89DB89FFB21C20BB0FB013A92D33086FB2D3AE7F89CA3D30A3FBD" +
         ":200A9C00E79ABFF8AEA3D38ABFF8AEA3D3D3204ABFF8AEA3D328883AB89832348AFA0F3AF4" +
         ":200ABC00C3D33BD30D3099F633AB30A9D33BC8D33BE78D5A1AD333CBFB0D3234FB2132C8D2" +
         ":200ADC00FB173AD1D3FB0D3AE03069F89CA3D30DD30AD33F3034D3FB52A8CEFB023A40D305" +
         ":200AFC0033FBFB0DCA0AE79DB08DA0F89CA3D30A883219F8C5A195FF03B1E57000F810B2D3" +
         ":200B1C00B3F8BFA2E280ADFA0FFEFCC1A30373F89D532303739553F0CE7B387AF8C073F052" +
         ":200B3C00BD227273F8F873F0F6F8A273F8C5A30373F8F873F8C0A2F0B09D5212F0A08D52DC" +
         ":200B5C001272B172A1606072B372A372B472A4606072B672A672B772A772B872A872B972D8" +
         ":200B7C00A972BA72AA72BB72AB72BC72AC72BD72AD72BE72AE72BFF0AFF8C0A272CE703822" +
         ":200B9C007115C830A8F8CAA242B502A5F8C4A202B2C010B8D3FB4D3ABABDADD333B7FB0D39" +
         ":200BBC00CA0AE79AB38AA39DBF8DAF933ACB8332E2239F3AD28F2F3AC7983AD988C20A345D" +
         ":200BDC004A5D1D2830D598B388A3C81A1D23933AE7833AE7ED983AF588C20A340A732A280D" +
         ":200BFC0030F1C20C06F6C67B387A88C63920FF01C63C20FF01C63D20FF01C63E20FF01C625" +
         ":050C1C003F20F801D5A6" +
         ":000C2101D2";
*/

      loadMemoryFromIntelHex (gnaMemoryRAM, sProgram);     // via simself.js

      return 0;   // 0 means we used loadMemoryFromIntelHex()
   }

   return;
} // load1802Program_TermInpOut


function load1802Program_Out9RandDigits (psMode)
{
   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Display Digits 1-9 Randomly on Terminal");
   }

   if (psMode == "load") {
      var sProgram =
         "0000: F8 40 A3 E3 A4 F8 08 73 13 66 23 F8 09 A5 F8 41\n" +
         "0010: A6 86 FA 0F 56 16 25 85 3A 11 F8 09 A5 6E FC 01\n" +
         "0020: F9 40 A4 04 32 1D FC 30 73 13 67 23 F8 20 73 13\n" +
         "0030: 67 23 90 54 25 85 3A 1D F8 0D 73 13 67 00 00 00\n" +
         "0040: 00 01 02 03 04 05 06 07 08 09\n";

      loadMemoryFromHex (gnaMemoryRAM, sProgram);     // via simself.js

      return 0;   // 0 means we used loadMemoryFromHex()
   }

/*
; Display Digits 1-9 Randomly
; Uses INP (and OUT) port 6 for Random # get (and max set)
; Max Random # defaults to 255 (maximum maximum); Min is always zero
; OUT 6 sets the maximum value to return (0 - n) : 1 >= n <= 255  (0 makes no sense, so 1 is used)
; INP 6 gets next random # in range
; Note that this routine runs until it "finds" all 9 digits, so it will execute the loop
;  many more times than 9, depending on how the random numbers come up -- not 'perfect', but it works


0000: F8 40 A3 E3 A4 F8 08 73 13 66 23 F8 09 A5 F8 41
0010: A6 86 FA 0F 56 16 25 85 3A 11 F8 09 A5 6E FC 01
0020: F9 40 A4 04 32 1D FC 30 73 13 67 23 F8 20 73 13
0030: 67 23 90 54 25 85 3A 1D F8 0D 73 13 67 00 00 00
0040: 00 01 02 03 04 05 06 07 08 09
; Note: Although 1-9 are preset above, they are initialized programmatically for program re-running


0000: F8 40    LDI 40   ; I/O buffer at 0040 AND array base pointer (array element zero unused)
0002: A3       PLO R3   ; R3 = 0040 -- I/O buffer (single byte)
0003: E3       SEX R3   ; point to buffer
0004: A4       PLO R4   ; R4 = 0040 (MUST be on nybble boundary as used here)
                        ; 'array' of "already-chosen" numbers (each value zeroed, as chosen, as a 'flag')
                        ; position zero is unused, so it is used for the single-byte I/O buffer

0005: F8 08    LDI 08   ; we want random numbers between 0 and 8 --> + 1 = 1 - 9
0007: 73       STXD     ; save max random # in buffer
0008: 13       INC R3   ;     fix buffer pointer
0009: 66       OUT 6    ; set max random #
000A: 23       DEC R3   ;     fix buffer pointer

000B: F8 09    LDI 09   ; we need to initialize the array of chosen numbers / 'flags' (zero = chosen)
000D: A5       PLO R5   ; R5 = counter = 9
000E: F8 41    LDI 41   ; start of array (at position 1 -- position 0 is unused in 'array'...
0010: A6       PLO R6   ; R6 = 0041          ...so used as the single-byte I/O buffer)

0011: 86       GLO R6   ; get value to store ("+40" -- double use) (init LOOP back address)
0012: FA 0F    ANI 0F   ; get digit value (works because 1 to 9 and nybble boundary)
0014: 56       STR R6   ; store value in 'array' (each array element = its index value)
0015: 16       INC R6   ; increment to next location
0016: 25       DEC R5   ; decrement counter
0017: 85       GLO R5   ; get counter
0018: 3A 11    BNZ 0011 ; loop until all 9 array locations hold their "index value" (1=1, 2=2, etc.)

001A: F8 09    LDI 09   ; we are going to choose 9 numbers
001C: A5       PLO R5   ; R5 = counter = 9

001D: 6E       INP 6    ; get random # between 0 and 8 (Main LOOP back address)
001E: FC 01    ADI 01   ; increment to get 1 - 9
0020: F9 40    ORI 40   ; get offset into 'array' (same address low as specified above! (40))
0022: A4       PLO R4   ; point to array element
0023: 04       LDN R4   ; get value to see if already chosen
0024: 32 1D    BZ 001D  ; if already chosen, get another random # (not concise, but works)

0026: FC 30    ADI 30   ; add 30h to turn into ASCII (30h - 39h = 48 - 57 = 0 - 9 ASCII)
0028: 73       STXD     ; store character in buffer
0029: 13       INC R3   ;     fix buffer pointer
002A: 67       OUT 7    ; output ASCII digit chosen to terminal
002B: 23       DEC R3   ;     fix buffer pointer

002C: F8 20    LDI 20   ; get an ASCII SPACE char
002E: 73       STXD     ; store character in buffer
002F: 13       INC R3   ;     fix buffer pointer
0030: 67       OUT 7    ; output ASCII SPACE to terminal
0031: 23       DEC R3   ;     fix buffer pointer

0032: 90       GHI R0   ; clear D accum
0033: 54       STR R4   ; store in array to "zero" the chosen number so won't be chosen again
0034: 25       DEC R5   ; decrement counter
0035: 85       GLO R5   ; get counter
0036: 3A 1D    BNZ 001D ; if not done, do another (until all 9 digits chosen and displayed)

0038: F8 0D    LDI 0D   ; get an ASCII CR (EOL/NewLine \r) char (can also use 0C = LF = \n)
003A: 73       STXD     ; store character in buffer
003B: 13       INC R3   ;     fix buffer pointer
003C: 67       OUT 7    ; output CR to terminal to advance to beginning of next line
003D: 00       IDL      ; HALT

0040: 00 01 02 03 04 05 06 07 08 09    ; MUST be program-initialized so program can be run more than once
; 40 = single-byte I/O buffer (unused 'array' value)
; 41-49 = 'array' of "already-chosen" values ('flags') initialized to 'index value' 1-9 by program
; Note: MUST be on nybble boundary for ease of programming implementation and correct operation


ORIGINAL program without self-initialization code so it could only be run once:

F8 40 A3 F8 30 A4 E3 F8 09 A5 F8 08 73 13 66 23 6E FC 01 F9 30 A4
04 32 10 FC 30 73 13 67 23 F8 20 73 13 67 23 90 54 25 85 3A 10 00
0030: 00 01 02 03 04 05 06 07 08 09 00 00 00 00 00 00 00

0000: F8 40    LDI 40   ; I/O buffer at 40
0002: A3       PLO R3   ; R3 = I/O buffer - single byte
0003: F8 30    LDI 30   ; array of chosen numbers
0005: A4       PLO R4   ; R4 = array base pointer at 30 (must be on nybble boundary as used here)
0006: E3       SEX R3   ; point to buffer
0007: F8 09    LDI 09   ; we are going to choose 9 numbers
0009: A5       PLO R5   ; R5 = counter = 9
000A: F8 08    LDI 08   ; we want random numbers between 0 and 8 -> + 1 = 1 - 9
000C: 73       STXD     ; save max random # in buffer
000D: 13       INC R3   ;     fix buffer pointer
000E: 66       OUT 6    ; set max random #
000F: 23       DEC R3   ;     fix buffer pointer

0010: 6E       INP 6    ; get random # between 0 and 8
0011: FC 01    ADI 01   ; increment to get 1 - 9
0013: F9 30    ORI 30   ; get offset into array
0015: A4       PLO R4   ; point to array element
0016: 04       LDN R4   ; get value to see if already chosen
0017: 32 10    BZ 0010  ; if chosen, get another random #

0019: FC 30    ADI 30   ; add 30h to turn into ASCII (30h - 39h = 48 - 57 = 0 - 9 ASCII)
001B: 73       STXD     ; store character in buffer
001C: 13       INC R3   ;     fix buffer pointer
001D: 67       OUT 7    ; output ASCII digit chosen to terminal
001E: 23       DEC R3   ;     fix buffer pointer
001F: F8 20    LDI 20   ; get an ASCII SPACE char
0021: 73       STXD     ; store character in buffer
0022: 13       INC R3   ;     fix buffer pointer
0023: 67       OUT 7    ; output ASCII digit chosen to terminal
0024: 23       DEC R3   ;     fix buffer pointer
0025: 90       GHI R0   ; clear D accum
0026: 54       STR R4   ; store in array to "zero" the chosen number so won't be picked again
0027: 25       DEC R5   ; decrement counter
0028: 85       GLO R5   ; get counter
0029: 3A 10    BNZ 0010 ; if not done, do another (until all 9 digits chosen)
002B: 00       IDL      ; HALT

0030: 00 01 02 03 04 05 06 07 08 09 ; array of "chosen" values ('flags')
; Note: location zero is unused but included for ease of programming implementation
*/

   return;
} // load1802Program_Out9RandDigits



function load1802Program_256RandomNumbersHex (psMode)
{
   psMode = psMode.toLowerCase();

   if (psMode == "desc") {
      return ("Display 256 Random Numbers in Hex on Terminal");
   }

   if (psMode == "load") {
      var sProgram =
         "0000: F8 41 A3 90 B3 A4 B5 F8  33 A5 D3 E5 B4 F6 F6 F6\n" +
         "0010: F6 FC F6 C7 FC 07 FF C6  55 67 25 94 FA 0F FC F6\n" +
         "0020: C7 FC 07 FF C6 55 67 25  F8 20 55 67 25 14 84 3A\n" +
         "0030: 0A 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00\n" +
         "0040: D0 93 BE F8 6C AE EE 0E  FE FE FE F3 5E F6 F6 F3\n" +
         "0050: AF 1E 0E 2E 5E 1E 1E 0E  2E 5E 1E 1E 0E 2E 5E 1E\n" +
         "0060: F6 F6 F6 F6 F6 F3 5E 8F  F3 5E 30 40 15 E5 B5 33\n";

      loadMemoryFromHex (gnaMemoryRAM, sProgram);     // via simself.js

      return 0;   // 0 means we used loadMemoryFromHex()
   }

/*
This program uses the Unsigned 8-Bit XOR-Shift PRNG Algorithm.

see: http://www.donnelly-house.net/programming/cdp1802/8bitPRNGtest.html

0000:  F8 41     LDI 41    ; get lo address of random number routine
0002:  A3        PLO R3    ; R3 = xx41
0003:  90        GHI R0    ; zero
0004:  B3        PHI R3    ; R3 = 0041
0005:  A4        PLO R4    ; R4.0 = counter for 256 random #'s
0006:  B5        PHI R5    ; R5 = 00xx
0007:  F8 33     LDI 33    ; 33 = address of single character 'output buffer'
0009:  A5        PLO R5    ; R5 = 0033
000A:  D3        SEP R3    ; get a random #
000B:  E5        SEX R5    ; RX = R5
000C:  B4        PHI R4    ; save value in R4.1
000D:  F6        SHR       ; get left nybble
000E:  F6        SHR       ;   by
000F:  F6        SHR       ;     shifting right
0010:  F6        SHR       ;       4 times
0011:  FC F6     ADI F6    ; convert to hex
0013:  C7        LSNF      ; if "A" or more, add 37
0014:  FC 07     ADI 07    ;
0016:  FF C6     SMI C6    ; else add 30
0018:  55        STR R5    ; store char in output buffer
0019:  67        OUT 7     ; output hex character to terminal
001A:  25        DEC R5    ; restore R5 after inc due to OUT
001B:  94        GHI R4    ; get random #
001C:  FA 0F     ANI 0F    ; mask out right nybble
001E:  FC F6     ADI F6    ; convert to hex
0020:  C7        LSNF      ; if "A" or more, add 37
0021:  FC 07     ADI 07    ;
0023:  FF C6     SMI C6    ; else add 30
0025:  55        STR R5    ; store char in output buffer
0026:  67        OUT 7     ; output hex character to terminal
0027:  25        DEC R5    ; restore R5 after inc due to OUT
0028:  F8 20     LDI 20    ; get a SPACE character
002A:  55        STR R5    ; store char in output buffer
002B:  67        OUT 7     ; output to terminal
002C:  25        DEC R5    ; restore R5 after inc due to OUT
002D:  14        INC R4    ; increment counter
002E:  84        GLO R4    ; get counter
002F:  3A 0A     BNZ 000A  ; if not 256 output, do another
0031:  00        IDL       ; stop

0040:  D0        SEP R0
0041:  93        GHI R3
0042:  BE        PHI RE
0043:  F8 6C     LDI 6C
0045:  AE        PLO RE
0046:  EE        SEX RE
0047:  0E        LDN RE
0048:  FE        SHL
0049:  FE        SHL
004A:  FE        SHL
004B:  F3        XOR
004C:  5E        STR RE
004D:  F6        SHR
004E:  F6        SHR
004F:  F3        XOR
0050:  AF        PLO RF
0051:  1E        INC RE
0052:  0E        LDN RE
0053:  2E        DEC RE
0054:  5E        STR RE
0055:  1E        INC RE
0056:  1E        INC RE
0057:  0E        LDN RE
0058:  2E        DEC RE
0059:  5E        STR RE
005A:  1E        INC RE
005B:  1E        INC RE
005C:  0E        LDN RE
005D:  2E        DEC RE
005E:  5E        STR RE
005F:  1E        INC RE
0060:  F6        SHR
0061:  F6        SHR
0062:  F6        SHR
0063:  F6        SHR
0064:  F6        SHR
0065:  F3        XOR
0066:  5E        STR RE
0067:  8F        GLO RF
0068:  F3        XOR
0069:  5E        STR RE
006A:  30 40     BR 0040
006C:  15        DB 15
006D:  E5        DB E5
006E:  B5        DB B5
006F:  33        DB 33


0000: F8 41 A3 90 B3 A4 B5 F8  33 A5 D3 E5 B4 F6 F6 F6
0010: F6 FC F6 C7 FC 07 FF C6  55 67 25 94 FA 0F FC F6
0020: C7 FC 07 FF C6 55 67 25  F8 20 55 67 25 14 84 3A
0030: 0A 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00

0040: D0 93 BE F8 6C AE EE 0E  FE FE FE F3 5E F6 F6 F3
0050: AF 1E 0E 2E 5E 1E 1E 0E  2E 5E 1E 1E 0E 2E 5E 1E
0060: F6 F6 F6 F6 F6 F3 5E 8F  F3 5E 30 40 15 E5 B5 33


First 256 random numbers in hex: (JS test program output versus this program's output)

JS:   A0 5B 43 C0 4E EF A5 50 63 D2 7A 9D FC A9 2C 45 5C 87 DC AC 3A AB 9D 66 B5 7F 14 57 4F EB 75 A2 9D 06 EC 75 1E 25 8B 65 B3 B8 5A 06 27 40 EA D6 C8 9E 0E 71 D8 AB CF 0E 10 DF 43 20 95 BF F7 D8 EC BD E4 FD 55 17 E2 F5 30 B5 7E 37 AA B5 1D B1 70 69 A2 90 58 73 EE FD 44 97 2A 3B 47 61 06 DD BB CD F0 CF B2 3B 56 CE E2 3E E0 76 BB 43 99 6A 12 5F 18 2C 8F 05 EB B3 7C 59 C4 E3 5F E8 32 F6 7F FE 73 27 80 89 5C 46 E4 12 81 EE 1C BE 10 A9 6F 31 84 59 49 DC 57 E0 E6 D2 00 D8 3D 6E 6D 70 93 8E 8E 46 4D 8E 4B 22 0F CE DF E7 8A 1F 31 D8 32 ED 7D 60 E9 4A F8 87 0A 16 20 B1 F8 70 5B 6E 5B 95 32 2A 88 BE 31 54 AC F4 64 AE 54 17 42 A9 65 E2 A3 7F 22 ED 7F DA E2 41 E5 EA 23 79 84 14 21 BD 35 AD 8B CF 73 84 67 FE 28 A4 E9 E3 96 37 BF 7F 53 FD AC 0F F6 E1 19 73 27 F5 17 C6 D8 94
1802: A0 5B 43 C0 4E EF A5 50 63 D2 7A 9D FC A9 2C 45 5C 87 DC AC 3A AB 9D 66 B5 7F 14 57 4F EB 75 A2 9D 06 EC 75 1E 25 8B 65 B3 B8 5A 06 27 40 EA D6 C8 9E 0E 71 D8 AB CF 0E 10 DF 43 20 95 BF F7 D8 EC BD E4 FD 55 17 E2 F5 30 B5 7E 37 AA B5 1D B1 70 69 A2 90 58 73 EE FD 44 97 2A 3B 47 61 06 DD BB CD F0 CF B2 3B 56 CE E2 3E E0 76 BB 43 99 6A 12 5F 18 2C 8F 05 EB B3 7C 59 C4 E3 5F E8 32 F6 7F FE 73 27 80 89 5C 46 E4 12 81 EE 1C BE 10 A9 6F 31 84 59 49 DC 57 E0 E6 D2 00 D8 3D 6E 6D 70 93 8E 8E 46 4D 8E 4B 22 0F CE DF E7 8A 1F 31 D8 32 ED 7D 60 E9 4A F8 87 0A 16 20 B1 F8 70 5B 6E 5B 95 32 2A 88 BE 31 54 AC F4 64 AE 54 17 42 A9 65 E2 A3 7F 22 ED 7F DA E2 41 E5 EA 23 79 84 14 21 BD 35 AD 8B CF 73 84 67 FE 28 A4 E9 E3 96 37 BF 7F 53 FD AC 0F F6 E1 19 73 27 F5 17 C6 D8 94

see: http://www.donnelly-house.net/programming/cdp1802/8bitPRNGtest.html
*/

   return;
} // load1802Program_Out9RandDigits
