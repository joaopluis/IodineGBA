"use strict";
/*
 * This file is part of IodineGBA
 *
 * Copyright (C) 2012-2014 Grant Galitz
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */
function THUMBInstructionSet(CPUCore) {
    this.CPUCore = CPUCore;
    this.initialize();
}
THUMBInstructionSet.prototype.initialize = function () {
    this.wait = this.CPUCore.wait;
    this.registers = this.CPUCore.registers;
    this.CPSR = this.CPUCore.CPSR;
    this.fetch = 0;
    this.decode = 0;
    this.execute = 0;
    this.stackMemoryCache = new GameBoyAdvanceMemoryCache(this.CPUCore.memory);
    this.instructionMemoryCache = new GameBoyAdvanceTHUMBInstructionMemoryCache(this.CPUCore.memory);
    this.compileInstructionMap();
}
THUMBInstructionSet.prototype.executeIteration = function () {
    //Push the new fetch access:
    this.fetch = this.instructionMemoryCache.memoryReadFast16(this.readPC() >>> 0) | 0;
    //Execute Instruction:
    this.executeDecoded();
    //Update the pipelining state:
    this.execute = this.decode | 0;
    this.decode = this.fetch | 0;
}
THUMBInstructionSet.prototype.executeDecoded = function () {
    switch (this.instructionMap[this.execute >> 6] & 0x7F) {
        case 0:
            this.LSLimm();
            break;
        case 1:
            this.LSRimm();
            break;
        case 2:
            this.ASRimm();
            break;
        case 3:
            this.ADDreg();
            break;
        case 4:
            this.SUBreg();
            break;
        case 5:
            this.ADDimm3();
            break;
        case 6:
            this.SUBimm3();
            break;
        case 7:
            this.MOVimm8();
            break;
        case 8:
            this.CMPimm8();
            break;
        case 9:
            this.ADDimm8();
            break;
        case 10:
            this.SUBimm8();
            break;
        case 11:
            this.AND();
            break;
        case 12:
            this.EOR();
            break;
        case 13:
            this.LSL();
            break;
        case 14:
            this.LSR();
            break;
        case 15:
            this.ASR();
            break;
        case 16:
            this.ADC();
            break;
        case 17:
            this.SBC();
            break;
        case 18:
            this.ROR();
            break;
        case 19:
            this.TST();
            break;
        case 20:
            this.NEG();
            break;
        case 21:
            this.CMP();
            break;
        case 22:
            this.CMN();
            break;
        case 23:
            this.ORR();
            break;
        case 24:
            this.MUL();
            break;
        case 25:
            this.BIC();
            break;
        case 26:
            this.MVN();
            break;
        case 27:
            this.ADDH_LH();
            break;
        case 28:
            this.ADDH_HL();
            break;
        case 29:
            this.ADDH_HH();
            break;
        case 30:
            this.CMPH_LH();
            break;
        case 31:
            this.CMPH_HL();
            break;
        case 32:
            this.CMPH_HH();
            break;
        case 33:
            this.MOVH_LH();
            break;
        case 34:
            this.MOVH_HL();
            break;
        case 35:
            this.MOVH_HH();
            break;
        case 36:
            this.BX_L();
            break;
        case 37:
            this.BX_H();
            break;
        case 38:
            this.LDRPC();
            break;
        case 39:
            this.STRreg();
            break;
        case 40:
            this.STRHreg();
            break;
        case 41:
            this.STRBreg();
            break;
        case 42:
            this.LDRSBreg();
            break;
        case 43:
            this.LDRreg();
            break;
        case 44:
            this.LDRHreg();
            break;
        case 45:
            this.LDRBreg();
            break;
        case 46:
            this.LDRSHreg();
            break;
        case 47:
            this.STRimm5();
            break;
        case 48:
            this.LDRimm5();
            break;
        case 49:
            this.STRBimm5();
            break;
        case 50:
            this.LDRBimm5();
            break;
        case 51:
            this.STRHimm5();
            break;
        case 52:
            this.LDRHimm5();
            break;
        case 53:
            this.STRSP();
            break;
        case 54:
            this.LDRSP();
            break;
        case 55:
            this.ADDPC();
            break;
        case 56:
            this.ADDSP();
            break;
        case 57:
            this.ADDSPimm7();
            break;
        case 58:
            this.PUSH();
            break;
        case 59:
            this.PUSHlr();
            break;
        case 60:
            this.POP();
            break;
        case 61:
            this.POPpc();
            break;
        case 62:
            this.STMIA();
            break;
        case 63:
            this.LDMIA();
            break;
        case 64:
            this.BEQ();
            break;
        case 65:
            this.BNE();
            break;
        case 66:
            this.BCS();
            break;
        case 67:
            this.BCC();
            break;
        case 68:
            this.BMI();
            break;
        case 69:
            this.BPL();
            break;
        case 70:
            this.BVS();
            break;
        case 71:
            this.BVC();
            break;
        case 72:
            this.BHI();
            break;
        case 73:
            this.BLS();
            break;
        case 74:
            this.BGE();
            break;
        case 75:
            this.BLT();
            break;
        case 76:
            this.BGT();
            break;
        case 77:
            this.BLE();
            break;
        case 78:
            this.SWI();
            break;
        case 79:
            this.B();
            break;
        case 80:
            this.BLsetup();
            break;
        case 81:
            this.BLoff();
            break;
        case 82:
            this.UNDEFINED();
            break;
    }
}
THUMBInstructionSet.prototype.executeBubble = function () {
    //Push the new fetch access:
    this.fetch = this.instructionMemoryCache.memoryReadFast16(this.readPC() >>> 0) | 0;
    //Update the pipelining state:
    this.execute = this.decode | 0;
    this.decode = this.fetch | 0;
}
THUMBInstructionSet.prototype.incrementProgramCounter = function () {
    //Increment The Program Counter:
    this.registers[15] = ((this.registers[15] | 0) + 2) | 0;
}
THUMBInstructionSet.prototype.readLowRegister = function (address) {
    //Low register read:
    address = address | 0;
    return this.registers[address & 0x7] | 0;
}
THUMBInstructionSet.prototype.read0OffsetLowRegister = function () {
    //Low register read at 0 bit offset:
    return this.readLowRegister(this.execute | 0) | 0;
}
THUMBInstructionSet.prototype.read3OffsetLowRegister = function () {
    //Low register read at 3 bit offset:
    return this.readLowRegister(this.execute >> 3) | 0;
}
THUMBInstructionSet.prototype.read6OffsetLowRegister = function () {
    //Low register read at 6 bit offset:
    return this.readLowRegister(this.execute >> 6) | 0;
}
THUMBInstructionSet.prototype.read8OffsetLowRegister = function () {
    //Low register read at 8 bit offset:
    return this.readLowRegister(this.execute >> 8) | 0;
}
THUMBInstructionSet.prototype.readHighRegister = function (address) {
    //High register read:
    address = address | 0x8;
    return this.registers[address & 0xF] | 0;
}
THUMBInstructionSet.prototype.writeLowRegister = function (address, data) {
    //Low register write:
    address = address | 0;
    data = data | 0;
    this.registers[address & 0x7] = data | 0;
}
THUMBInstructionSet.prototype.write0OffsetLowRegister = function (data) {
    //Low register write at 0 bit offset:
    data = data | 0;
    this.writeLowRegister(this.execute | 0, data | 0);
}
THUMBInstructionSet.prototype.write8OffsetLowRegister = function (data) {
    //Low register write at 8 bit offset:
    data = data | 0;
    this.writeLowRegister(this.execute >> 8, data | 0);
}
THUMBInstructionSet.prototype.guardHighRegisterWrite = function (data) {
    data = data | 0;
    var address = 0x8 | (this.execute & 0x7);
    if ((address | 0) == 0xF) {
        //We performed a branch:
        this.CPUCore.branch(data & -2);
    }
    else {
        //Regular Data Write:
        this.registers[address & 0xF] = data | 0;
    }
}
THUMBInstructionSet.prototype.writeSP = function (data) {
    //Update the stack pointer:
    data = data | 0;
    this.registers[0xD] = data | 0;
}
THUMBInstructionSet.prototype.SPDecrementWord = function () {
    //Decrement the stack pointer by one word:
    this.registers[0xD] = ((this.registers[0xD] | 0) - 4) | 0;
}
THUMBInstructionSet.prototype.SPIncrementWord = function () {
    //Increment the stack pointer by one word:
    this.registers[0xD] = ((this.registers[0xD] | 0) + 4) | 0;
}
THUMBInstructionSet.prototype.writeLR = function (data) {
    //Update the link register:
    data = data | 0;
    this.registers[0xE] = data | 0;
}
THUMBInstructionSet.prototype.writePC = function (data) {
    data = data | 0;
    //We performed a branch:
    //Update the program counter to branch address:
    this.CPUCore.branch(data & -2);
}
THUMBInstructionSet.prototype.offsetPC = function () {
    //We performed a branch:
    //Update the program counter to branch address:
    this.CPUCore.branch(((this.readPC() | 0) + ((this.execute << 24) >> 23)) | 0);
}
THUMBInstructionSet.prototype.getLR = function () {
    //Read back the value for the LR register upon Exception:
    return ((this.readPC() | 0) - 2) | 0;
}
THUMBInstructionSet.prototype.getIRQLR = function () {
    //Read back the value for the LR register upon IRQ:
    return this.readPC() | 0;
}
THUMBInstructionSet.prototype.readSP = function () {
    //Read back the current SP:
    return this.registers[0xD] | 0;
}
THUMBInstructionSet.prototype.readLR = function () {
    //Read back the current LR:
    return this.registers[0xE] | 0;
}
THUMBInstructionSet.prototype.readPC = function () {
    //Read back the current PC:
    return this.registers[0xF] | 0;
}
THUMBInstructionSet.prototype.getCurrentFetchValue = function () {
    return this.fetch | (this.fetch << 16);
}
THUMBInstructionSet.prototype.LSLimm = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var offset = (this.execute >> 6) & 0x1F;
    if (offset > 0) {
        //CPSR Carry is set by the last bit shifted out:
        this.CPSR.setCarry((source << ((offset - 1) | 0)) < 0);
        //Perform shift:
        source <<= offset;
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(source | 0);
    this.CPSR.setZeroInt(source | 0);
    //Update destination register:
    this.write0OffsetLowRegister(source | 0);
}
THUMBInstructionSet.prototype.LSRimm = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var offset = (this.execute >> 6) & 0x1F;
    if (offset > 0) {
        //CPSR Carry is set by the last bit shifted out:
        this.CPSR.setCarry(((source >> ((offset - 1) | 0)) & 0x1) != 0);
        //Perform shift:
        source = (source >>> offset) | 0;
    }
    else {
        this.CPSR.setCarry(source < 0);
        source = 0;
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(source | 0);
    this.CPSR.setZeroInt(source | 0);
    //Update destination register:
    this.write0OffsetLowRegister(source | 0);
}
THUMBInstructionSet.prototype.ASRimm = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var offset = (this.execute >> 6) & 0x1F;
    if (offset > 0) {
        //CPSR Carry is set by the last bit shifted out:
        this.CPSR.setCarry(((source >> ((offset - 1) | 0)) & 0x1) != 0);
        //Perform shift:
        source >>= offset;
    }
    else {
        this.CPSR.setCarry(source < 0);
        source >>= 0x1F;
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(source | 0);
    this.CPSR.setZeroInt(source | 0);
    //Update destination register:
    this.write0OffsetLowRegister(source | 0);
}
THUMBInstructionSet.prototype.ADDreg = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = this.read6OffsetLowRegister() | 0;
    //Update destination register:
    this.write0OffsetLowRegister(this.CPSR.setADDFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.SUBreg = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = this.read6OffsetLowRegister() | 0;
    //Update destination register:
    this.write0OffsetLowRegister(this.CPSR.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.ADDimm3 = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = (this.execute >> 6) & 0x7;
    //Update destination register:
    this.write0OffsetLowRegister(this.CPSR.setADDFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.SUBimm3 = function () {
    var operand1 = this.read3OffsetLowRegister() | 0;
    var operand2 = (this.execute >> 6) & 0x7;
    //Update destination register:
    this.write0OffsetLowRegister(this.CPSR.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.MOVimm8 = function () {
    //Get the 8-bit value to move into the register:
    var result = this.execute & 0xFF;
    this.CPSR.setNegativeFalse();
    this.CPSR.setZeroInt(result | 0);
    //Update destination register:
    this.write8OffsetLowRegister(result | 0);
}
THUMBInstructionSet.prototype.CMPimm8 = function () {
    //Compare an 8-bit immediate value with a register:
    var operand1 = this.read8OffsetLowRegister() | 0;
    var operand2 = this.execute & 0xFF;
    this.CPSR.setCMPFlags(operand1 | 0, operand2 | 0);
}
THUMBInstructionSet.prototype.ADDimm8 = function () {
    //Add an 8-bit immediate value with a register:
    var operand1 = this.read8OffsetLowRegister() | 0;
    var operand2 = this.execute & 0xFF;
    this.write8OffsetLowRegister(this.CPSR.setADDFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.SUBimm8 = function () {
    //Subtract an 8-bit immediate value from a register:
    var operand1 = this.read8OffsetLowRegister() | 0;
    var operand2 = this.execute & 0xFF;
    this.write8OffsetLowRegister(this.CPSR.setSUBFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.AND = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    //Perform bitwise AND:
    var result = source & destination;
    this.CPSR.setNegativeInt(result | 0);
    this.CPSR.setZeroInt(result | 0);
    //Update destination register:
    this.write0OffsetLowRegister(result | 0);
}
THUMBInstructionSet.prototype.EOR = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    //Perform bitwise EOR:
    var result = source ^ destination;
    this.CPSR.setNegativeInt(result | 0);
    this.CPSR.setZeroInt(result | 0);
    //Update destination register:
    this.write0OffsetLowRegister(result | 0);
}
THUMBInstructionSet.prototype.LSL = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    //Check to see if we need to update CPSR:
    if (source > 0) {
        if (source < 0x20) {
            //Shift the register data left:
            this.CPSR.setCarry((destination << ((source - 1) | 0)) < 0);
            destination <<= source;
        }
        else if (source == 0x20) {
            //Shift bit 0 into carry:
            this.CPSR.setCarry((destination & 0x1) == 0x1);
            destination = 0;
        }
        else {
            //Everything Zero'd:
            this.CPSR.setCarryFalse();
            destination = 0;
        }
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(destination | 0);
    this.CPSR.setZeroInt(destination | 0);
    //Update destination register:
    this.write0OffsetLowRegister(destination | 0);
}
THUMBInstructionSet.prototype.LSR = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    //Check to see if we need to update CPSR:
    if (source > 0) {
        if (source < 0x20) {
            //Shift the register data right logically:
            this.CPSR.setCarry(((destination >> ((source - 1) | 0)) & 0x1) == 0x1);
            destination = (destination >>> source) | 0;
        }
        else if (source == 0x20) {
            //Shift bit 31 into carry:
            this.CPSR.setCarry(destination < 0);
            destination = 0;
        }
        else {
            //Everything Zero'd:
            this.CPSR.setCarryFalse();
            destination = 0;
        }
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(destination | 0);
    this.CPSR.setZeroInt(destination | 0);
    //Update destination register:
    this.write0OffsetLowRegister(destination | 0);
}
THUMBInstructionSet.prototype.ASR = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    //Check to see if we need to update CPSR:
    if (source > 0) {
        if (source < 0x20) {
            //Shift the register data right arithmetically:
            this.CPSR.setCarry(((destination >> ((source - 1) | 0)) & 0x1) == 0x1);
            destination >>= source;
        }
        else {
            //Set all bits with bit 31:
            this.CPSR.setCarry(destination < 0);
            destination >>= 0x1F;
        }
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(destination | 0);
    this.CPSR.setZeroInt(destination | 0);
    //Update destination register:
    this.write0OffsetLowRegister(destination | 0);
}
THUMBInstructionSet.prototype.ADC = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    //Update destination register:
    this.write0OffsetLowRegister(this.CPSR.setADCFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.SBC = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    //Update destination register:
    this.write0OffsetLowRegister(this.CPSR.setSBCFlags(operand1 | 0, operand2 | 0) | 0);
}
THUMBInstructionSet.prototype.ROR = function () {
    var source = this.read3OffsetLowRegister() & 0xFF;
    var destination = this.read0OffsetLowRegister() | 0;
    if (source > 0) {
        source &= 0x1F;
        if (source > 0) {
            //CPSR Carry is set by the last bit shifted out:
            this.CPSR.setCarry(((destination >>> ((source - 1) | 0)) & 0x1) != 0);
            //Perform rotate:
            destination = (destination << ((0x20 - source) | 0)) | (destination >>> (source | 0));
        }
        else {
            this.CPSR.setCarry(destination < 0);
        }
    }
    //Perform CPSR updates for N and Z (But not V):
    this.CPSR.setNegativeInt(destination | 0);
    this.CPSR.setZeroInt(destination | 0);
    //Update destination register:
    this.write0OffsetLowRegister(destination | 0);
}
THUMBInstructionSet.prototype.TST = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    //Perform bitwise AND:
    var result = source & destination;
    this.CPSR.setNegativeInt(result | 0);
    this.CPSR.setZeroInt(result | 0);
}
THUMBInstructionSet.prototype.NEG = function () {
    var source = this.read3OffsetLowRegister() | 0;
    this.CPSR.setOverflow((source ^ (-(source | 0))) == 0);
    //Perform Subtraction:
    source = (-(source | 0)) | 0;
    this.CPSR.setNegativeInt(source | 0);
    this.CPSR.setZeroInt(source | 0);
    //Update destination register:
    this.write0OffsetLowRegister(source | 0);
}
THUMBInstructionSet.prototype.CMP = function () {
    //Compare two registers:
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.CPSR.setCMPFlags(operand1 | 0, operand2 | 0);
}
THUMBInstructionSet.prototype.CMN = function () {
    //Compare two registers:
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.CPSR.setCMNFlags(operand1 | 0, operand2 | 0);
}
THUMBInstructionSet.prototype.ORR = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    //Perform bitwise OR:
    var result = source | destination;
    this.CPSR.setNegativeInt(result | 0);
    this.CPSR.setZeroInt(result | 0);
    //Update destination register:
    this.write0OffsetLowRegister(result | 0);
}
THUMBInstructionSet.prototype.MUL = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    //Perform MUL32:
    var result = this.CPUCore.performMUL32(source | 0, destination | 0, 0) | 0;
    this.CPSR.setCarryFalse();
    this.CPSR.setNegativeInt(result | 0);
    this.CPSR.setZeroInt(result | 0);
    //Update destination register:
    this.write0OffsetLowRegister(result | 0);
}
THUMBInstructionSet.prototype.BIC = function () {
    var source = this.read3OffsetLowRegister() | 0;
    var destination = this.read0OffsetLowRegister() | 0;
    //Perform bitwise AND with a bitwise NOT on source:
    var result = (~source) & destination;
    this.CPSR.setNegativeInt(result | 0);
    this.CPSR.setZeroInt(result | 0);
    //Update destination register:
    this.write0OffsetLowRegister(result | 0);
}
THUMBInstructionSet.prototype.MVN = function () {
    //Perform bitwise NOT on source:
    var source = ~this.read3OffsetLowRegister();
    this.CPSR.setNegativeInt(source | 0);
    this.CPSR.setZeroInt(source | 0);
    //Update destination register:
    this.write0OffsetLowRegister(source | 0);
}
THUMBInstructionSet.prototype.ADDH_LH = function () {
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    //Perform Addition:
    //Update destination register:
    this.write0OffsetLowRegister(((operand1 | 0) + (operand2 | 0)) | 0);
}
THUMBInstructionSet.prototype.ADDH_HL = function () {
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    //Perform Addition:
    //Update destination register:
    this.guardHighRegisterWrite(((operand1 | 0) + (operand2 | 0)) | 0);
}
THUMBInstructionSet.prototype.ADDH_HH = function () {
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    //Perform Addition:
    //Update destination register:
    this.guardHighRegisterWrite(((operand1 | 0) + (operand2 | 0)) | 0);
}
THUMBInstructionSet.prototype.CMPH_LH = function () {
    //Compare two registers:
    var operand1 = this.read0OffsetLowRegister() | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    this.CPSR.setCMPFlags(operand1 | 0, operand2 | 0);
}
THUMBInstructionSet.prototype.CMPH_HL = function () {
    //Compare two registers:
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.read3OffsetLowRegister() | 0;
    this.CPSR.setCMPFlags(operand1 | 0, operand2 | 0);
}
THUMBInstructionSet.prototype.CMPH_HH = function () {
    //Compare two registers:
    var operand1 = this.readHighRegister(this.execute | 0) | 0;
    var operand2 = this.readHighRegister(this.execute >> 3) | 0;
    this.CPSR.setCMPFlags(operand1 | 0, operand2 | 0);
}
THUMBInstructionSet.prototype.MOVH_LH = function () {
    //Move a register to another register:
    this.write0OffsetLowRegister(this.readHighRegister(this.execute >> 3) | 0);
}
THUMBInstructionSet.prototype.MOVH_HL = function () {
    //Move a register to another register:
    this.guardHighRegisterWrite(this.read3OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.MOVH_HH = function () {
    //Move a register to another register:
    this.guardHighRegisterWrite(this.readHighRegister(this.execute >> 3) | 0);
}
THUMBInstructionSet.prototype.BX_L = function () {
    //Branch & eXchange:
    var address = this.read3OffsetLowRegister() | 0;
    if ((address & 0x1) == 0) {
        //Enter ARM mode:
        this.CPUCore.enterARM();
        this.CPUCore.branch(address & -0x4);
    }
    else {
        //Stay in THUMB mode:
        this.CPUCore.branch(address & -0x2);
    }
}
THUMBInstructionSet.prototype.BX_H = function () {
    //Branch & eXchange:
    var address = this.readHighRegister(this.execute >> 3) | 0;
    if ((address & 0x1) == 0) {
        //Enter ARM mode:
        this.CPUCore.enterARM();
        this.CPUCore.branch(address & -0x4);
    }
    else {
        //Stay in THUMB mode:
        this.CPUCore.branch(address & -0x2);
    }
}
THUMBInstructionSet.prototype.LDRPC = function () {
    //PC-Relative Load
    var data = this.CPUCore.read32(((this.readPC() & -3) + ((this.execute & 0xFF) << 2)) | 0) | 0;
    this.write8OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.STRreg = function () {
    //Store Word From Register
    var address = ((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write32(address | 0, this.read0OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.STRHreg = function () {
    //Store Half-Word From Register
    var address = ((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write16(address | 0, this.read0OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.STRBreg = function () {
    //Store Byte From Register
    var address = ((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write8(address | 0, this.read0OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.LDRSBreg = function () {
    //Load Signed Byte Into Register
    var data = (this.CPUCore.read8(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) << 24) >> 24;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.LDRreg = function () {
    //Load Word Into Register
    var data = this.CPUCore.read32(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.LDRHreg = function () {
    //Load Half-Word Into Register
    var data = this.CPUCore.read16(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.LDRBreg = function () {
    //Load Byte Into Register
    var data = this.CPUCore.read8(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.LDRSHreg = function () {
    //Load Signed Half-Word Into Register
    var data = (this.CPUCore.read16(((this.read6OffsetLowRegister() | 0) + (this.read3OffsetLowRegister() | 0)) | 0) << 16) >> 16;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.STRimm5 = function () {
    //Store Word From Register
    var address = (((this.execute >> 4) & 0x7C) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write32(address | 0, this.read0OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.LDRimm5 = function () {
    //Load Word Into Register
    var data = this.CPUCore.read32((((this.execute >> 4) & 0x7C) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.STRBimm5 = function () {
    //Store Byte From Register
    var address = (((this.execute >> 6) & 0x1F) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write8(address | 0, this.read0OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.LDRBimm5 = function () {
    //Load Byte Into Register
    var data = this.CPUCore.read8((((this.execute >> 6) & 0x1F) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.STRHimm5 = function () {
    //Store Half-Word From Register
    var address = (((this.execute >> 5) & 0x3E) + (this.read3OffsetLowRegister() | 0)) | 0;
    this.CPUCore.write16(address | 0, this.read0OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.LDRHimm5 = function () {
    //Load Half-Word Into Register
    var data = this.CPUCore.read16((((this.execute >> 5) & 0x3E) + (this.read3OffsetLowRegister() | 0)) | 0) | 0;
    this.write0OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.STRSP = function () {
    //Store Word From Register
    var address = (((this.execute & 0xFF) << 2) + (this.readSP() | 0)) | 0;
    this.CPUCore.write32(address | 0, this.read8OffsetLowRegister() | 0);
}
THUMBInstructionSet.prototype.LDRSP = function () {
    //Load Word Into Register
    var data = this.CPUCore.read32((((this.execute & 0xFF) << 2) + (this.readSP() | 0)) | 0) | 0;
    this.write8OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.ADDPC = function () {
    //Add PC With Offset Into Register
    var data = ((this.readPC() & -3) + ((this.execute & 0xFF) << 2)) | 0;
    this.write8OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.ADDSP = function () {
    //Add SP With Offset Into Register
    var data = (((this.execute & 0xFF) << 2) + (this.readSP() | 0)) | 0;
    this.write8OffsetLowRegister(data | 0);
}
THUMBInstructionSet.prototype.ADDSPimm7 = function () {
    //Add Signed Offset Into SP
    if ((this.execute & 0x80) != 0) {
        this.writeSP(((this.readSP() | 0) - ((this.execute & 0x7F) << 2)) | 0);
    }
    else {
        this.writeSP(((this.readSP() | 0) + ((this.execute & 0x7F) << 2)) | 0);
    }
}
THUMBInstructionSet.prototype.PUSH = function () {
    //Only initialize the PUSH sequence if the register list is non-empty:
    if ((this.execute & 0xFF) > 0) {
        //Updating the address bus away from PC fetch:
        this.wait.NonSequentialBroadcast();
        //Push register(s) onto the stack:
        for (var rListPosition = 7; (rListPosition | 0) > -1; rListPosition = ((rListPosition | 0) - 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                //Push register onto the stack:
                this.SPDecrementWord();
                this.stackMemoryCache.memoryWrite32(this.readSP() >>> 0, this.readLowRegister(rListPosition | 0) | 0);
            }
        }
        //Updating the address bus back to PC fetch:
        this.wait.NonSequentialBroadcast();
    }
}
THUMBInstructionSet.prototype.PUSHlr = function () {
    //Updating the address bus away from PC fetch:
    this.wait.NonSequentialBroadcast();
    //Push link register onto the stack:
    this.SPDecrementWord();
    this.stackMemoryCache.memoryWrite32(this.readSP() >>> 0, this.readLR() | 0);
    //Push register(s) onto the stack:
    for (var rListPosition = 7; (rListPosition | 0) > -1; rListPosition = ((rListPosition | 0) - 1) | 0) {
        if ((this.execute & (1 << rListPosition)) != 0) {
            //Push register onto the stack:
            this.SPDecrementWord();
            this.stackMemoryCache.memoryWrite32(this.readSP() >>> 0, this.readLowRegister(rListPosition | 0) | 0);
        }
    }
    //Updating the address bus back to PC fetch:
    this.wait.NonSequentialBroadcast();
}
THUMBInstructionSet.prototype.POP = function () {
    //Only initialize the POP sequence if the register list is non-empty:
    if ((this.execute & 0xFF) > 0) {
        //Updating the address bus away from PC fetch:
        this.wait.NonSequentialBroadcast();
        //POP stack into register(s):
        for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                //POP stack into a register:
                this.writeLowRegister(rListPosition | 0, this.stackMemoryCache.memoryRead32(this.readSP() >>> 0) | 0);
                this.SPIncrementWord();
            }
        }
        //Updating the address bus back to PC fetch:
        this.wait.NonSequentialBroadcast();
    }
}
THUMBInstructionSet.prototype.POPpc = function () {
    //Updating the address bus away from PC fetch:
    this.wait.NonSequentialBroadcast();
    //POP stack into register(s):
    for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
        if ((this.execute & (1 << rListPosition)) != 0) {
            //POP stack into a register:
            this.writeLowRegister(rListPosition | 0, this.stackMemoryCache.memoryRead32(this.readSP() >>> 0) | 0);
            this.SPIncrementWord();
        }
    }
    //POP stack into the program counter (r15):
    this.writePC(this.stackMemoryCache.memoryRead32(this.readSP() >>> 0) | 0);
    this.SPIncrementWord();
    //Updating the address bus back to PC fetch:
    this.wait.NonSequentialBroadcast();
}
THUMBInstructionSet.prototype.STMIA = function () {
    //Only initialize the STMIA sequence if the register list is non-empty:
    if ((this.execute & 0xFF) > 0) {
        //Get the base address:
        var currentAddress = this.read8OffsetLowRegister() | 0;
        //Updating the address bus away from PC fetch:
        this.wait.NonSequentialBroadcast();
        //Push register(s) into memory:
        for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                //Push a register into memory:
                this.stackMemoryCache.memoryWrite32(currentAddress >>> 0, this.readLowRegister(rListPosition | 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        //Store the updated base address back into register:
        this.write8OffsetLowRegister(currentAddress | 0);
        //Updating the address bus back to PC fetch:
        this.wait.NonSequentialBroadcast();
    }
}
THUMBInstructionSet.prototype.LDMIA = function () {
    //Only initialize the LDMIA sequence if the register list is non-empty:
    if ((this.execute & 0xFF) > 0) {
        //Get the base address:
        var currentAddress = this.read8OffsetLowRegister() | 0;
        //Updating the address bus away from PC fetch:
        this.wait.NonSequentialBroadcast();
        //Load  register(s) from memory:
        for (var rListPosition = 0; (rListPosition | 0) < 8; rListPosition = ((rListPosition | 0) + 1) | 0) {
            if ((this.execute & (1 << rListPosition)) != 0) {
                //Load a register from memory:
                this.writeLowRegister(rListPosition | 0, this.stackMemoryCache.memoryRead32(currentAddress >>> 0) | 0);
                currentAddress = ((currentAddress | 0) + 4) | 0;
            }
        }
        //Store the updated base address back into register:
        this.write8OffsetLowRegister(currentAddress | 0);
        //Updating the address bus back to PC fetch:
        this.wait.NonSequentialBroadcast();
    }
}
THUMBInstructionSet.prototype.BEQ = function () {
    //Branch if EQual:
    if (this.CPSR.getZero()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BNE = function () {
    //Branch if Not Equal:
    if (!this.CPSR.getZero()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BCS = function () {
    //Branch if Carry Set:
    if (this.CPSR.getCarry()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BCC = function () {
    //Branch if Carry Clear:
    if (!this.CPSR.getCarry()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BMI = function () {
    //Branch if Negative Set:
    if (this.CPSR.getNegative()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BPL = function () {
    //Branch if Negative Clear:
    if (!this.CPSR.getNegative()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BVS = function () {
    //Branch if Overflow Set:
    if (this.CPSR.getOverflow()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BVC = function () {
    //Branch if Overflow Clear:
    if (!this.CPSR.getOverflow()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BHI = function () {
    //Branch if Carry & Non-Zero:
    if (this.CPSR.getCarry() && !this.CPSR.getZero()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BLS = function () {
    //Branch if Carry Clear or is Zero Set:
    if (!this.CPSR.getCarry() || this.CPSR.getZero()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BGE = function () {
    //Branch if Negative equal to Overflow
    if (this.CPSR.getNegative() == this.CPSR.getOverflow()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BLT = function () {
    //Branch if Negative NOT equal to Overflow
    if (this.CPSR.getNegative() != this.CPSR.getOverflow()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BGT = function () {
    //Branch if Zero Clear and Negative equal to Overflow
    if (!this.CPSR.getZero() && this.CPSR.getNegative() == this.CPSR.getOverflow()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.BLE = function () {
    //Branch if Zero Set or Negative NOT equal to Overflow
    if (this.CPSR.getZero() || this.CPSR.getNegative() != this.CPSR.getOverflow()) {
        this.offsetPC();
    }
}
THUMBInstructionSet.prototype.SWI = function () {
    //Software Interrupt:
    this.CPUCore.SWI();
}
THUMBInstructionSet.prototype.B = function () {
    //Unconditional Branch:
    //Update the program counter to branch address:
    this.CPUCore.branch(((this.readPC() | 0) + ((this.execute << 21) >> 20)) | 0);
}
THUMBInstructionSet.prototype.BLsetup = function () {
    //Brank with Link (High offset)
    //Update the link register to branch address:
    this.writeLR(((this.readPC() | 0) + (((this.execute & 0x7FF) << 21) >> 9)) | 0);
}
THUMBInstructionSet.prototype.BLoff = function () {
    //Brank with Link (Low offset)
    //Update the link register to branch address:
    this.writeLR(((this.readLR() | 0) + ((this.execute & 0x7FF) << 1)) | 0);
    //Copy LR to PC:
    var oldPC = this.readPC() | 0;
    //Flush Pipeline & Block PC Increment:
    this.CPUCore.branch(this.readLR() & -0x2);
    //Set bit 0 of LR high:
    this.writeLR(((oldPC | 0) - 0x2) | 0x1);
}
THUMBInstructionSet.prototype.UNDEFINED = function () {
    //Undefined Exception:
    this.CPUCore.UNDEFINED();
}
THUMBInstructionSet.prototype.compileInstructionMap = function () {
    var instructionMap = [];
    function generateLowMap(instruction) {
        for (var index = 0; index < 0x20; ++index) {
            instructionMap.push(instruction);
        }
    }
    function generateLowMap2(instruction) {
        for (var index = 0; index < 0x8; ++index) {
            instructionMap.push(instruction);
        }
    }
    function generateLowMap3(instruction) {
        for (var index = 0; index < 0x4; ++index) {
            instructionMap.push(instruction);
        }
    }
    function generateLowMap4(instruction1, instruction2, instruction3, instruction4) {
        instructionMap.push(instruction1);
        instructionMap.push(instruction2);
        instructionMap.push(instruction3);
        instructionMap.push(instruction4);
    }
    //0-7
    generateLowMap(0);
    //8-F
    generateLowMap(1);
    //10-17
    generateLowMap(2);
    //18-19
    generateLowMap2(3);
    //1A-1B
    generateLowMap2(4);
    //1C-1D
    generateLowMap2(5);
    //1E-1F
    generateLowMap2(6);
    //20-27
    generateLowMap(7);
    //28-2F
    generateLowMap(8);
    //30-37
    generateLowMap(9);
    //38-3F
    generateLowMap(10);
    //40
    generateLowMap4(11, 12, 13, 14);
    //41
    generateLowMap4(15, 16, 17, 18);
    //42
    generateLowMap4(19, 20, 21, 22);
    //43
    generateLowMap4(23, 24, 25, 26);
    //44
    generateLowMap4(82, 27, 28, 29);
    //45
    generateLowMap4(82, 30, 31, 32);
    //46
    generateLowMap4(82, 33, 34, 35);
    //47
    generateLowMap4(36, 37, 82, 82);
    //48-4F
    generateLowMap(38);
    //50-51
    generateLowMap2(39);
    //52-53
    generateLowMap2(40);
    //54-55
    generateLowMap2(41);
    //56-57
    generateLowMap2(42);
    //58-59
    generateLowMap2(43);
    //5A-5B
    generateLowMap2(44);
    //5C-5D
    generateLowMap2(45);
    //5E-5F
    generateLowMap2(46);
    //60-67
    generateLowMap(47);
    //68-6F
    generateLowMap(48);
    //70-77
    generateLowMap(49);
    //78-7F
    generateLowMap(50);
    //80-87
    generateLowMap(51);
    //88-8F
    generateLowMap(52);
    //90-97
    generateLowMap(53);
    //98-9F
    generateLowMap(54);
    //A0-A7
    generateLowMap(55);
    //A8-AF
    generateLowMap(56);
    //B0
    generateLowMap3(57);
    //B1
    generateLowMap3(82);
    //B2
    generateLowMap3(82);
    //B3
    generateLowMap3(82);
    //B4
    generateLowMap3(58);
    //B5
    generateLowMap3(59);
    //B6
    generateLowMap3(82);
    //B7
    generateLowMap3(82);
    //B8
    generateLowMap3(82);
    //B9
    generateLowMap3(82);
    //BA
    generateLowMap3(82);
    //BB
    generateLowMap3(82);
    //BC
    generateLowMap3(60);
    //BD
    generateLowMap3(61);
    //BE
    generateLowMap3(82);
    //BF
    generateLowMap3(82);
    //C0-C7
    generateLowMap(62);
    //C8-CF
    generateLowMap(63);
    //D0
    generateLowMap3(64);
    //D1
    generateLowMap3(65);
    //D2
    generateLowMap3(66);
    //D3
    generateLowMap3(67);
    //D4
    generateLowMap3(68);
    //D5
    generateLowMap3(69);
    //D6
    generateLowMap3(70);
    //D7
    generateLowMap3(71);
    //D8
    generateLowMap3(72);
    //D9
    generateLowMap3(73);
    //DA
    generateLowMap3(74);
    //DB
    generateLowMap3(75);
    //DC
    generateLowMap3(76);
    //DD
    generateLowMap3(77);
    //DE
    generateLowMap3(82);
    //DF
    generateLowMap3(78);
    //E0-E7
    generateLowMap(79);
    //E8-EF
    generateLowMap(82);
    //F0-F7
    generateLowMap(80);
    //F8-FF
    generateLowMap(81);
    //Copy to typed array buffer:
    this.instructionMap = getUint8Array(1024);
    for (var copyTo = 0; copyTo < 1024; ++copyTo) {
        this.instructionMap[copyTo] = instructionMap[copyTo] | 0;
    }
}