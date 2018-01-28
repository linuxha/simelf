/*
   1802 Disassembler Routines
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

// globals

var gsaDisAsmRegN = new Array (16);       // 3, 6, 7, 12 (C), 15 (F) unused
gsaDisAsmRegN[0]  = "LDN";
gsaDisAsmRegN[1]  = "INC";
gsaDisAsmRegN[2]  = "DEC";
gsaDisAsmRegN[4]  = "LDA";
gsaDisAsmRegN[5]  = "STR";
gsaDisAsmRegN[8]  = "GLO";
gsaDisAsmRegN[9]  = "GHI";
gsaDisAsmRegN[10] = "PLO";
gsaDisAsmRegN[11] = "PHI";
gsaDisAsmRegN[13] = "SEP";
gsaDisAsmRegN[14] = "SEX";

var gsaDisAsmBRshort = new Array (16);    // short / page branch (3x)
gsaDisAsmBRshort[0]  = "BR";
gsaDisAsmBRshort[1]  = "BQ";
gsaDisAsmBRshort[2]  = "BZ";
gsaDisAsmBRshort[3]  = "BDF";
gsaDisAsmBRshort[4]  = "B1";
gsaDisAsmBRshort[5]  = "B2";
gsaDisAsmBRshort[6]  = "B3";
gsaDisAsmBRshort[7]  = "B4";
gsaDisAsmBRshort[8]  = "NBR";    // SKP
gsaDisAsmBRshort[9]  = "BNQ";
gsaDisAsmBRshort[10] = "BNZ";
gsaDisAsmBRshort[11] = "BNF";
gsaDisAsmBRshort[12] = "BN1";
gsaDisAsmBRshort[13] = "BN2";
gsaDisAsmBRshort[14] = "BN3";
gsaDisAsmBRshort[15] = "BN4";

var gsaDisAsmALUCtrl7 = new Array (16);   // ALU and Control (7x) -- Arithmetic and Logic
gsaDisAsmALUCtrl7[0]  = "RET";
gsaDisAsmALUCtrl7[1]  = "DIS";
gsaDisAsmALUCtrl7[2]  = "LDXA";
gsaDisAsmALUCtrl7[3]  = "STXD";
gsaDisAsmALUCtrl7[4]  = "ADC";
gsaDisAsmALUCtrl7[5]  = "SDB";
gsaDisAsmALUCtrl7[6]  = "SHRC";  // RSHR
gsaDisAsmALUCtrl7[7]  = "SMB";
gsaDisAsmALUCtrl7[8]  = "SAV";
gsaDisAsmALUCtrl7[9]  = "MARK";
gsaDisAsmALUCtrl7[10] = "REQ";
gsaDisAsmALUCtrl7[11] = "SEQ";
gsaDisAsmALUCtrl7[12] = "ADCI";
gsaDisAsmALUCtrl7[13] = "SDBI";
gsaDisAsmALUCtrl7[14] = "SHLC";  // RSHL
gsaDisAsmALUCtrl7[15] = "SMBI";

var gsaDisAsmBRlong = new Array (16);     // long branch and skip (Cx)
gsaDisAsmBRlong[0]  = "LBR";
gsaDisAsmBRlong[1]  = "LBQ";
gsaDisAsmBRlong[2]  = "LBZ";
gsaDisAsmBRlong[3]  = "LBDF";
gsaDisAsmBRlong[4]  = "NOP";
gsaDisAsmBRlong[5]  = "LSNQ";
gsaDisAsmBRlong[6]  = "LSNZ";
gsaDisAsmBRlong[7]  = "LSNF";
gsaDisAsmBRlong[8]  = "NLBR";    // LSKP
gsaDisAsmBRlong[9]  = "LBNQ";
gsaDisAsmBRlong[10] = "LBNZ";
gsaDisAsmBRlong[11] = "LBNF";
gsaDisAsmBRlong[12] = "LSIE";
gsaDisAsmBRlong[13] = "LSQ";
gsaDisAsmBRlong[14] = "LSZ";
gsaDisAsmBRlong[15] = "LSDF";

var gsaDisAsmALUCtrlF = new Array (16);   // ALU and Control (Fx) -- Arithmetic and Logic
gsaDisAsmALUCtrlF[0]  = "LDX";
gsaDisAsmALUCtrlF[1]  = "OR";
gsaDisAsmALUCtrlF[2]  = "AND";
gsaDisAsmALUCtrlF[3]  = "XOR";
gsaDisAsmALUCtrlF[4]  = "ADD";
gsaDisAsmALUCtrlF[5]  = "SD";
gsaDisAsmALUCtrlF[6]  = "SHR";
gsaDisAsmALUCtrlF[7]  = "SM";
gsaDisAsmALUCtrlF[8]  = "LDI";
gsaDisAsmALUCtrlF[9]  = "ORI";
gsaDisAsmALUCtrlF[10] = "ANI";
gsaDisAsmALUCtrlF[11] = "XRI";
gsaDisAsmALUCtrlF[12] = "ADI";
gsaDisAsmALUCtrlF[13] = "SDI";
gsaDisAsmALUCtrlF[14] = "SHL";
gsaDisAsmALUCtrlF[15] = "SMI";


//General Functions


function disAssemble (pnOpCode, pnData1, pnData2, pnAddress, pb2ByteAddr)
{
/*
   Returns an array of the disassembly text and the number of bytes used.
   Pass in three bytes in case they are needed.
   pnAddress is the adress of the opcode.
   If it is passed as -1, page addresses are shown as two-digit hex addresses.
   Otherwise page addresses are displayed as 4-digit hex addresses.
   The page boundary for branches is based on the passed-in address (+1)
   and the special case of the page address being in the next page because
   the branch byte is in the next page is correctly identified.
*/

   var nIb4OpcodeHi = (pnOpCode & 0xF0) >> 4;
   var nNb4OpcodeLo = pnOpCode & 0x0F;
   var sDisAsm;
   var nBytes;
   var sHexLo;
   var sHexHi;

   switch (nIb4OpcodeHi) {

   case 0:  // LDN (no LDN R0)
   case 1:  // INC
   case 2:  // DEC
   case 4:  // LDA
   case 5:  // STR
   case 8:  // GLO
   case 9:  // GHI
   case 10: // A  PLO
   case 11: // B  PHI
   case 13: // D  SEP
   case 14: // E  SEX

      if (pnOpCode == 0) {
         sDisAsm = "IDL";

      } else {
         sHexLo = gcHEX_CHARS.substr (nNb4OpcodeLo, 1);

         sDisAsm = gsaDisAsmRegN[nIb4OpcodeHi] + " R" + sHexLo;
      }

      nBytes = 1;

      break;

   case 3:  // short / page branch (3x)

      sDisAsm = gsaDisAsmBRshort[nNb4OpcodeLo];

      if (nNb4OpcodeLo == 8) {   // NBR / SKP
         nBytes = 1;

      } else {
         sHexLo = decToHex2 (pnData1);

         if (pnAddress < 0  ||  pb2ByteAddr) {
            sHexHi = "";

         } else {
            sHexHi = decToHex4 (pnAddress + 1);    // use data byte #1 address for correct paging
            sHexHi = sHexHi.substr (0, 2);
         }

         sDisAsm += " " + sHexHi + sHexLo;
         nBytes = 2;
      }

      break;

   case 6:  // IRX, OUT & INP (6x)

      if (nNb4OpcodeLo == 0) {
         sDisAsm = "IRX";

      } else {
         if (nNb4OpcodeLo > 0  &&  nNb4OpcodeLo < 8) {
            sDisAsm = "OUT " + gcHEX_CHARS.substr (nNb4OpcodeLo, 1);

         } else {
            if (nNb4OpcodeLo > 8  &&  nNb4OpcodeLo < 16) {
               sDisAsm = "INP " + gcHEX_CHARS.substr (nNb4OpcodeLo - 8, 1);

            } else {
               sDisAsm = "???";     // 68 = undefined opcode instruction
            }
         }
      }

      nBytes = 1;

      break;

   case 7:  // ALU and Control (7x) -- Arithmetic and Logic

      sDisAsm = gsaDisAsmALUCtrl7[nNb4OpcodeLo];
      nBytes = 1;

      if (nNb4OpcodeLo == 12  ||  nNb4OpcodeLo == 13  ||  nNb4OpcodeLo == 15) {   // Immediates
         sDisAsm += " " + decToHex2 (pnData1);
         nBytes = 2;
      }

      break;

   case 12: // C -- long branch and skip (Cx)

      sDisAsm = gsaDisAsmBRlong[nNb4OpcodeLo];
      nBytes = 1;

      if ((nNb4OpcodeLo >= 0  &&  nNb4OpcodeLo <= 3)  ||  (nNb4OpcodeLo >= 9  &&  nNb4OpcodeLo <= 11)) {
         sDisAsm += " " + decToHex4 (pnData1 * 256 + pnData2);
         nBytes = 3;
      }

      break;

   case 15: // F -- ALU and Control (Fx) -- Arithmetic and Logic

      sDisAsm = gsaDisAsmALUCtrlF[nNb4OpcodeLo];
      nBytes = 1;

      if (nNb4OpcodeLo >= 8  &&  nNb4OpcodeLo != 14) {   // Immediates
         sDisAsm += " " + decToHex2 (pnData1);
         nBytes = 2;
      }

      break;

   } // switch

   var aDisAsm = new Array (2);
   aDisAsm[0] = sDisAsm;
   aDisAsm[1] = nBytes;

   return aDisAsm;
} // disAssemble



/*
00 IDL

   0N LDN
   1N INC
   2N DEC

30 BR
31 BQ
32 BZ
33 BDF
34 B1
35 B2
36 B3
37 B4
38 NBR
39 BNQ
3A BNZ
3B BNF
3C BN1
3D BN2
3E BN3
3F BN4

   4N LDA
   5N STR

60 IRX
68 ???
6P 1-7=OUT, 9-F=INP

70 RET
71 DIS
72 LDXA
73 STXD
74 ADC
75 SDB
76 SHRC
77 SMB
78 SAV
79 MARK
7A REQ
7B SEQ
7C ADCI
7D SDBI
7E SHLC
7F SMBI

   8N GLO
   9N GHI
   AN PLO
   BN PHI

C0 LBR
C1 LBQ
C2 LBZ
C3 LBDF
C4 NOP
C5 LSNQ
C6 LSNZ
C7 LSNF
C8 NLBR
C9 LBNQ
CA LBNZ
CB LBNF
CC LSIE
CD LSQ
CE LSZ
CF LSDF

   DN SEP
   EN SEX

F0 LDX
F1 OR
F2 AND
F3 XOR
F4 ADD
F5 SD
F6 SHR
F7 SM
F8 LDI
F9 ORI
FA ANI
FB XRI
FC ADI
FD SDI
FE SHL
FF SMI
*/
