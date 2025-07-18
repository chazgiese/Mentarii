"use strict";
/// <reference types="@figma/plugin-typings" />
figma.showUI(__html__, { width: 400, height: 300 });
figma.ui.onmessage = (msg) => {
    if (msg.type === 'hello') {
        figma.notify('Hello from the UI!');
    }
};
