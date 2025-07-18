/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 400, height: 500 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-rectangle') {
    const rect = figma.createRectangle();
    rect.x = 150;
    rect.y = 150;
    rect.resize(100, 100);
    figma.currentPage.appendChild(rect);
    figma.notify('Rectangle created!');
  }
  
  if (msg.type === 'create-circle') {
    const circle = figma.createEllipse();
    circle.x = 300;
    circle.y = 150;
    circle.resize(100, 100);
    figma.currentPage.appendChild(circle);
    figma.notify('Circle created!');
  }
  
  if (msg.type === 'create-text') {
    const text = figma.createText();
    text.x = 150;
    text.y = 300;
    text.characters = "Hello from Figma Plugin!";
    figma.currentPage.appendChild(text);
    figma.notify('Text created!');
  }
}; 