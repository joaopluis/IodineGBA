"use strict";
/*
 * This file is part of IodineGBA
 *
 * Copyright (C) 2012-2013 Grant Galitz
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
var Iodine = null;
var Blitter = null;
var Mixer = null;
var MixerInput = null;
var timerID = null;
window.onload = function () {
    //Initialize Iodine:
    Iodine = new GameBoyAdvanceEmulator();
    //Initialize the graphics:
    registerBlitterHandler();
    //Initialize the audio:
    registerAudioHandler();
    //Register the save handler callbacks:
    registerSaveHandlers();
    //Hook the GUI controls.
    registerGUIEvents();
}
function registerBlitterHandler() {
    Blitter = new GlueCodeGfx();
    Blitter.attachCanvas(document.getElementById("emulator_target"));
    Iodine.attachGraphicsFrameHandler(function (buffer) {Blitter.copyBuffer(buffer);});
}
function registerAudioHandler() {
    Mixer = new GlueCodeMixer();
    MixerInput = new GlueCodeMixerInput(Mixer);
    Iodine.attachAudioHandler(MixerInput);
    Iodine.enableAudio();
}
function registerGUIEvents() {
    addEvent("keydown", document, keyDown);
    addEvent("keyup", document, keyUpPreprocess);
    addEvent("change", document.getElementById("rom_load"), fileLoadROM);
    addEvent("change", document.getElementById("bios_load"), fileLoadBIOS);
    addEvent("click", document.getElementById("play"), function (e) {
        Iodine.play();
        this.style.display = "none";
        document.getElementById("pause").style.display = "inline";
        e.preventDefault();
    });
    addEvent("click", document.getElementById("pause"), function (e) {
        Iodine.pause();
        this.style.display = "none";
        document.getElementById("play").style.display = "inline";
        e.preventDefault();
    });
    addEvent("click", document.getElementById("restart"), function (e) {
        Iodine.restart();
        e.preventDefault();
    });
    document.getElementById("sound").checked = true;
    addEvent("click", document.getElementById("sound"), function () {
        if (this.checked) {
            Iodine.enableAudio();
        }
        else {
            Iodine.disableAudio();
        }
    });
    document.getElementById("skip_boot").checked = false;
    addEvent("click", document.getElementById("skip_boot"), function () {
             if (this.checked) {
                Iodine.enableSkipBootROM();
             }
             else {
                Iodine.disableSkipBootROM();
             }
    });
    document.getElementById("toggleSmoothScaling").checked = true;
    addEvent("click", document.getElementById("toggleSmoothScaling"), function () {
             if (Blitter) {
                Blitter.setSmoothScaling(this.checked);
             }
    });
    document.getElementById("toggleDynamicSpeed").checked = true;
    addEvent("click", document.getElementById("toggleDynamicSpeed"), function () {
             if (this.checked) {
                Iodine.enableDynamicSpeed();
             }
             else {
                Iodine.disableDynamicSpeed();
             }
    });
    addEvent("change", document.getElementById("import"), function (e) {
             if (typeof this.files != "undefined") {
                try {
                    if (this.files.length >= 1) {
                        writeRedTemporaryText("Reading the local file \"" + this.files[0].name + "\" for importing.");
                        try {
                            //Gecko 1.9.2+ (Standard Method)
                            var binaryHandle = new FileReader();
                            binaryHandle.onload = function () {
                                if (this.readyState == 2) {
                                    writeRedTemporaryText("file imported.");
                                    try {
                                        import_save(this.result);
                                    }
                                    catch (error) {
                                        writeRedTemporaryText(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
                                    }
                                }
                                else {
                                    writeRedTemporaryText("importing file, please wait...");
                                }
                            }
                            binaryHandle.readAsBinaryString(this.files[this.files.length - 1]);
                        }
                        catch (error) {
                            //Gecko 1.9.0, 1.9.1 (Non-Standard Method)
                            var romImageString = this.files[this.files.length - 1].getAsBinary();
                            try {
                                import_save(romImageString);
                            }
                            catch (error) {
                                writeRedTemporaryText(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
                            }
                        }
                    }
                    else {
                        writeRedTemporaryText("Incorrect number of files selected for local loading.");
                    }
                }
                catch (error) {
                    writeRedTemporaryText("Could not load in a locally stored ROM file.");
                }
             }
             else {
                writeRedTemporaryText("could not find the handle on the file to open.");
             }
             e.preventDefault();
    });
    addEvent("click", document.getElementById("export"), refreshStorageListing);
    addEvent("unload", window, ExportSave);
    Iodine.attachSpeedHandler(function (speed) {
        var speedDOM = document.getElementById("speed");
        speedDOM.textContent = "Speed: " + speed;
    });
    //buttons mouse events
    addEvent("mousedown", document.getElementById("buttonUp"), function () { Iodine.keyDown('up'); });
    addEvent("mouseup", document.getElementById("buttonUp"), function () { Iodine.keyUp('up'); });
    addEvent("mousedown", document.getElementById("buttonDown"), function () { Iodine.keyDown('down'); });
    addEvent("mouseup", document.getElementById("buttonDown"), function () { Iodine.keyUp('down'); });
    addEvent("mousedown", document.getElementById("buttonLeft"), function () { Iodine.keyDown('left'); });
    addEvent("mouseup", document.getElementById("buttonLeft"), function () { Iodine.keyUp('left'); });
    addEvent("mousedown", document.getElementById("buttonRight"), function () { Iodine.keyDown('right'); });
    addEvent("mouseup", document.getElementById("buttonRight"), function () { Iodine.keyUp('right'); });
    addEvent("mousedown", document.getElementById("buttonA"), function () { Iodine.keyDown('a'); });
    addEvent("mouseup", document.getElementById("buttonA"), function () { Iodine.keyUp('a'); });
    addEvent("mousedown", document.getElementById("buttonB"), function () { Iodine.keyDown('b'); });
    addEvent("mouseup", document.getElementById("buttonB"), function () { Iodine.keyUp('b'); });
    addEvent("mousedown", document.getElementById("buttonStart"), function () { Iodine.keyDown('start'); });
    addEvent("mouseup", document.getElementById("buttonStart"), function () { Iodine.keyUp('start'); });
    addEvent("mousedown", document.getElementById("buttonSelect"), function () { Iodine.keyDown('select'); });
    addEvent("mouseup", document.getElementById("buttonSelect"), function () { Iodine.keyUp('select'); });
    addEvent("mousedown", document.getElementById("buttonL"), function () { Iodine.keyDown('l'); });
    addEvent("mouseup", document.getElementById("buttonL"), function () { Iodine.keyUp('l'); });
    addEvent("mousedown", document.getElementById("buttonR"), function () { Iodine.keyDown('r'); });
    addEvent("mouseup", document.getElementById("buttonR"), function () { Iodine.keyUp('r'); });
    //buttons touch events
    addEvent("touchstart", document.getElementById("buttonUp"), function () { Iodine.keyDown('up'); });
    addEvent("touchleave", document.getElementById("buttonUp"), function () { Iodine.keyUp('up'); });
    addEvent("touchstart", document.getElementById("buttonDown"), function () { Iodine.keyDown('down'); });
    addEvent("touchleave", document.getElementById("buttonDown"), function () { Iodine.keyUp('down'); });
    addEvent("touchstart", document.getElementById("buttonLeft"), function () { Iodine.keyDown('left'); });
    addEvent("touchleave", document.getElementById("buttonLeft"), function () { Iodine.keyUp('left'); });
    addEvent("touchstart", document.getElementById("buttonRight"), function () { Iodine.keyDown('right'); });
    addEvent("touchleave", document.getElementById("buttonRight"), function () { Iodine.keyUp('right'); });
    addEvent("touchstart", document.getElementById("buttonA"), function () { Iodine.keyDown('a'); });
    addEvent("touchleave", document.getElementById("buttonA"), function () { Iodine.keyUp('a'); });
    addEvent("touchstart", document.getElementById("buttonB"), function () { Iodine.keyDown('b'); });
    addEvent("touchleave", document.getElementById("buttonB"), function () { Iodine.keyUp('b'); });
    addEvent("touchstart", document.getElementById("buttonStart"), function () { Iodine.keyDown('start'); });
    addEvent("touchleave", document.getElementById("buttonStart"), function () { Iodine.keyUp('start'); });
    addEvent("touchstart", document.getElementById("buttonSelect"), function () { Iodine.keyDown('select'); });
    addEvent("touchleave", document.getElementById("buttonSelect"), function () { Iodine.keyUp('select'); });
    addEvent("touchstart", document.getElementById("buttonL"), function () { Iodine.keyDown('l'); });
    addEvent("touchleave", document.getElementById("buttonL"), function () { Iodine.keyUp('l'); });
    addEvent("touchstart", document.getElementById("buttonR"), function () { Iodine.keyDown('r'); });
    addEvent("touchleave", document.getElementById("buttonR"), function () { Iodine.keyUp('r'); });
    //setInterval(ExportSave, 60000); //Do periodic saves.
}
function resetPlayButton() {
    document.getElementById("pause").style.display = "none";
    document.getElementById("play").style.display = "inline";
}
function lowerVolume() {
    Iodine.incrementVolume(-0.04);
}
function raiseVolume() {
    Iodine.incrementVolume(0.04);
}
function writeRedTemporaryText(textString) {
    if (timerID) {
        clearTimeout(timerID);
    }
    document.getElementById("tempMessage").style.display = "block";
    document.getElementById("tempMessage").textContent = textString;
    timerID = setTimeout(clearTempString, 5000);
}
function clearTempString() {
    document.getElementById("tempMessage").style.display = "none";
}
//Some wrappers and extensions for non-DOM3 browsers:
function addEvent(sEvent, oElement, fListener) {
    try {    
        oElement.addEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.attachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}
function removeEvent(sEvent, oElement, fListener) {
    try {    
        oElement.removeEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.detachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}