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
function GameBoyAdvanceDMA2(dma) {
    this.DMACore = dma;
    this.initialize();
}
GameBoyAdvanceDMA2.prototype.DMA_ENABLE_TYPE = [            //DMA Channel 2 Mapping:
    0x1,
    0x2,
    0x4,
    0x10
];
GameBoyAdvanceDMA2.prototype.DMA_REQUEST_TYPE = {
    IMMEDIATE:      0x1,
    V_BLANK:        0x2,
    H_BLANK:        0x4,
    FIFO_B:         0x10
}
GameBoyAdvanceDMA2.prototype.initialize = function () {
    this.enabled = 0;
    this.pending = 0;
    this.source = 0;
    this.sourceShadow = 0;
    this.destination = 0;
    this.destinationShadow = 0;
    this.wordCount = 0;
    this.wordCountShadow = 0;
    this.irqFlagging = 0;
    this.dmaType = 0;
    this.is32Bit = 0;
    this.repeat = 0;
    this.sourceControl = 0;
    this.destinationControl = 0;
    this.IOCore = this.DMACore.IOCore;
    this.memory = this.IOCore.memory;
    this.gfx = this.IOCore.gfx;
    this.irq = this.IOCore.irq;
    this.sound = this.IOCore.sound;
    this.wait = this.IOCore.wait;
}
GameBoyAdvanceDMA2.prototype.writeDMASource0 = function (data) {
    data = data | 0;
    this.source = this.source & 0xFFFFFF00;
    this.source = this.source | data;
}
GameBoyAdvanceDMA2.prototype.writeDMASource1 = function (data) {
    data = data | 0;
    this.source = this.source & 0xFFFF00FF;
    this.source = this.source | (data << 8);
}
GameBoyAdvanceDMA2.prototype.writeDMASource2 = function (data) {
    data = data | 0;
    this.source = this.source & 0xFF00FFFF;
    this.source = this.source | (data << 16);
}
GameBoyAdvanceDMA2.prototype.writeDMASource3 = function (data) {
    data = data & 0xF;
    this.source = this.source & 0xFFFFFF;
    this.source = this.source | (data << 24);
}
GameBoyAdvanceDMA2.prototype.writeDMADestination0 = function (data) {
    data = data | 0;
    this.destination = this.destination & 0xFFFFFF00;
    this.destination = this.destination | data;
}
GameBoyAdvanceDMA2.prototype.writeDMADestination1 = function (data) {
    data = data | 0;
    this.destination = this.destination & 0xFFFF00FF;
    this.destination = this.destination | (data << 8);
}
GameBoyAdvanceDMA2.prototype.writeDMADestination2 = function (data) {
    data = data | 0;
    this.destination = this.destination & 0xFF00FFFF;
    this.destination = this.destination | (data << 16);
}
GameBoyAdvanceDMA2.prototype.writeDMADestination3 = function (data) {
    data = data & 0x7;
    this.destination = this.destination & 0xFFFFFF;
    this.destination = this.destination | (data << 24);
}
GameBoyAdvanceDMA2.prototype.writeDMAWordCount0 = function (data) {
    data = data | 0;
    this.wordCount = this.wordCount & 0x3F00;
    this.wordCount = this.wordCount | data;
}
GameBoyAdvanceDMA2.prototype.writeDMAWordCount1 = function (data) {
    data = data & 0x3F;
    this.wordCount = this.wordCount & 0xFF;
    this.wordCount = this.wordCount | (data << 8);
}
GameBoyAdvanceDMA2.prototype.writeDMAControl0 = function (data) {
    data = data | 0;
    this.destinationControl = (data >> 5) & 0x3;
    this.sourceControl = this.sourceControl & 0x2;
    this.sourceControl = this.sourceControl | ((data >> 7) & 0x1);
}
GameBoyAdvanceDMA2.prototype.readDMAControl0 = function () {
    return ((this.sourceControl & 0x1) << 7) | (this.destinationControl << 5);
}
GameBoyAdvanceDMA2.prototype.writeDMAControl1 = function (data) {
    data = data | 0;
    this.sourceControl = (this.sourceControl & 0x1) | ((data & 0x1) << 1);
    this.repeat = data & 0x2;
    this.is32Bit = data & 0x4;
    this.dmaType = (data >> 4) & 0x3;
    this.irqFlagging = data & 0x40;
    if ((data | 0) > 0x7F) {
        if ((this.enabled | 0) == 0) {
            this.enabled = this.DMA_ENABLE_TYPE[this.dmaType | 0] | 0;
            this.enableDMAChannel();
        }
        /*
         DMA seems to not allow changing its type while it's running.
         Some games rely on this to not have broken audio (kirby's nightmare in dreamland).
         */
    }
    else {
        this.enabled = 0;
        //this.pending = 0;
        //Assert the FIFO B DMA request signal:
        //this.sound.checkFIFOBPendingSignal();
        this.DMACore.update();
    }
}
GameBoyAdvanceDMA2.prototype.readDMAControl1 = function () {
    return ((((this.enabled | 0) > 0) ? 0x80 : 0) |
            this.irqFlagging |
            (this.dmaType << 4) |
            this.is32Bit |
            this.repeat |
            (this.sourceControl >> 1));
}
GameBoyAdvanceDMA2.prototype.requestDMA = function (DMAType) {
    DMAType = DMAType | 0;
    if ((this.enabled & DMAType) > 0) {
        this.pending = DMAType | 0;
        this.DMACore.update();
    }
}
GameBoyAdvanceDMA2.prototype.enableDMAChannel = function () {
    if ((this.enabled | 0) == (this.DMA_REQUEST_TYPE.FIFO_B | 0)) {
        //Assert the FIFO B DMA request signal:
        this.sound.checkFIFOBPendingSignal();
        //Direct Sound DMA Hardwired To Wordcount Of 4:
        this.wordCountShadow = 0x4;
    }
    else {
        if ((this.enabled | 0) == (this.DMA_REQUEST_TYPE.IMMEDIATE | 0)) {
            //Flag immediate DMA transfers for processing now:
            this.pending = this.DMA_REQUEST_TYPE.IMMEDIATE | 0;
        }
        //Shadow copy the word count:
        this.wordCountShadow = this.wordCount | 0;
        //Shadow copy the destination address:
        this.destinationShadow = this.destination | 0;
    }
    //Shadow copy the source address:
    this.sourceShadow = this.source | 0;
    //Run some DMA channel activity checks:
    this.DMACore.update();
}
GameBoyAdvanceDMA2.prototype.handleDMACopy = function () {
    //Get the source addess:
    var source = this.sourceShadow | 0;
    //Transfer Data:
    if ((this.enabled | 0) == (this.DMA_REQUEST_TYPE.FIFO_B | 0)) {
        //32-bit Transfer:
        this.copySound(source | 0);
    }
    else {
        //Get the destination address:
        var destination = this.destinationShadow | 0;
        if ((this.is32Bit | 0) == 4) {
            //32-bit Transfer:
            this.copy32(source | 0, destination | 0);
        }
        else {
            //16-bit Transfer:
            this.copy16(source | 0, destination | 0);
        }
    }
}
GameBoyAdvanceDMA2.prototype.copy16 = function (source, destination) {
    source = source | 0;
    destination = destination | 0;
    var data = this.memory.memoryRead16(source | 0) | 0;
    this.memory.memoryWriteDMA16(destination | 0, data | 0);
    this.decrementWordCount(source | 0, destination | 0, 2);
    this.DMACore.updateFetch(data | (data << 16));
}
GameBoyAdvanceDMA2.prototype.copy32 = function (source, destination) {
    source = source | 0;
    destination = destination | 0;
    var data = this.memory.memoryRead32(source | 0) | 0;
    this.memory.memoryWriteDMA32(destination | 0, data | 0);
    this.decrementWordCount(source | 0, destination | 0, 4);
    this.DMACore.updateFetch(data | 0);
}
GameBoyAdvanceDMA2.prototype.copySound = function (source) {
    source = source | 0;
    var data = this.memory.memoryRead32(source | 0) | 0;
    this.wait.singleClock();
    this.IOCore.updateTimerClocking();
    this.sound.writeFIFOB32(data | 0);
    this.soundDMAUpdate(source | 0);
    this.DMACore.updateFetch(data | 0);
}
GameBoyAdvanceDMA2.prototype.decrementWordCount = function (source, destination, transferred) {
    source = source | 0;
    destination = destination | 0;
    transferred = transferred | 0;
    //Decrement the word count:
    var wordCountShadow = ((this.wordCountShadow | 0) - 1) & 0x3FFF;
    if ((wordCountShadow | 0) == 0) {
        //DMA transfer ended, handle accordingly:
        wordCountShadow = this.finalizeDMA(source | 0, destination | 0, transferred | 0) | 0;
    }
    else {
        //Update addresses:
        this.incrementDMAAddresses(source | 0, destination | 0, transferred | 0);
    }
    //Save the new word count:
    this.wordCountShadow = wordCountShadow | 0;
}
GameBoyAdvanceDMA2.prototype.soundDMAUpdate = function (source) {
    source = source | 0;
    //Decrement the word count:
    this.wordCountShadow = ((this.wordCountShadow | 0) - 1) & 0x3FFF;
    if ((this.wordCountShadow | 0) == 0) {
        //DMA transfer ended, handle accordingly:
        //Reset pending requests:
        this.pending = 0;
        //Check Repeat Status:
        if ((this.repeat | 0) == 0) {
            //Disable the enable bit:
            this.enabled = 0;
        }
        else {
            //Repeating the dma:
            //Direct Sound DMA Hardwired To Wordcount Of 4:
            this.wordCountShadow = 0x4;
        }
        //Assert the FIFO B DMA request signal:
        this.sound.checkFIFOBPendingSignal();
        //Run the DMA channel checks:
        this.DMACore.update();
        //Check to see if we should flag for IRQ:
        this.checkIRQTrigger();
    }
    //Update source address:
    switch (this.sourceControl | 0) {
        case 0:    //Increment
        case 3:    //Forbidden (VBA has it increment)
            this.sourceShadow = ((source | 0) + 4) | 0;
            break;
        case 1:
            this.sourceShadow = ((source | 0) - 4) | 0;
    }
}
GameBoyAdvanceDMA2.prototype.finalizeDMA = function (source, destination, transferred) {
    source = source | 0;
    destination = destination | 0;
    transferred = transferred | 0;
    var wordCountShadow = 0;
    //Reset pending requests:
    this.pending = 0;
    //Check Repeat Status:
    if ((this.repeat | 0) == 0 || (this.enabled | 0) == (this.DMA_REQUEST_TYPE.IMMEDIATE | 0)) {
        //Disable the enable bit:
        this.enabled = 0;
    }
    else {
        //Repeating the dma:
        //Reload word count:
        wordCountShadow = this.wordCount | 0;
    }
    //Assert the FIFO B DMA request signal:
    this.sound.checkFIFOBPendingSignal();
    //Run the DMA channel checks:
    this.DMACore.update();
    //Check to see if we should flag for IRQ:
    this.checkIRQTrigger();
    //Update addresses:
    this.finalDMAAddresses(source | 0, destination | 0, transferred | 0);
    return wordCountShadow | 0;
}
GameBoyAdvanceDMA2.prototype.checkIRQTrigger = function () {
    if ((this.irqFlagging | 0) == 0x40) {
        this.irq.requestIRQ(0x400);
    }
}
GameBoyAdvanceDMA2.prototype.finalDMAAddresses = function (source, destination, transferred) {
    source = source | 0;
    destination = destination | 0;
    transferred = transferred | 0;
    //Update source address:
    switch (this.sourceControl | 0) {
        case 0:    //Increment
        case 3:    //Forbidden (VBA has it increment)
            this.sourceShadow = ((source | 0) + (transferred | 0)) | 0;
            break;
        case 1:    //Decrement
            this.sourceShadow = ((source | 0) - (transferred | 0)) | 0;
    }
    //Update destination address:
    switch (this.destinationControl | 0) {
        case 0:    //Increment
            this.destinationShadow = ((destination | 0) + (transferred | 0)) | 0;
            break;
        case 1:    //Decrement
            this.destinationShadow = ((destination | 0) - (transferred | 0)) | 0;
            break;
        case 3:    //Reload
            this.destinationShadow = this.destination | 0;
    }
}
GameBoyAdvanceDMA2.prototype.incrementDMAAddresses = function (source, destination, transferred) {
    source = source | 0;
    destination = destination | 0;
    transferred = transferred | 0;
    //Update source address:
    switch (this.sourceControl | 0) {
        case 0:    //Increment
        case 3:    //Forbidden (VBA has it increment)
            this.sourceShadow = ((source | 0) + (transferred | 0)) | 0;
            break;
        case 1:
            this.sourceShadow = ((source | 0) - (transferred | 0)) | 0;
    }
    //Update destination address:
    switch (this.destinationControl | 0) {
        case 0:    //Increment
        case 3:    //Increment
            this.destinationShadow = ((destination | 0) + (transferred | 0)) | 0;
            break;
        case 1:    //Decrement
            this.destinationShadow = ((destination | 0) - (transferred | 0)) | 0;
    }
}
GameBoyAdvanceDMA2.prototype.nextEventTime = function () {
    var clocks = -1;
    switch (this.enabled | 0) {
            //V_BLANK
        case 0x2:
            clocks = this.gfx.nextVBlankEventTime() | 0;
            break;
            //H_BLANK:
        case 0x4:
            clocks = this.gfx.nextHBlankDMAEventTime() | 0;
            break;
            //FIFO_B:
        case 0x10:
            clocks = this.sound.nextFIFOBEventTime() | 0;
    }
    return clocks | 0;
}
GameBoyAdvanceDMA2.prototype.nextIRQEventTime = function () {
    var clocks = -1;
    if ((this.irqFlagging | 0) == 0x40) {
        clocks = this.nextEventTime() | 0;
    }
    return clocks | 0;
}