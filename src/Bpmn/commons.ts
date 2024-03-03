import React from "react";
import BaseViewer, { ImportXMLResult, SaveXMLOptions } from "bpmn-js/lib/BaseViewer";
import { buildUrlData, download } from "@houkunlin/bpmn-js-react/utils";
import { isNil } from "lodash";

export class BpmnInstance {
  readonly bpmnViewer: BaseViewer;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly importXmlFunc: (xml: string) => Promise<ImportXMLResult>;

  constructor(bpmnViewer: BaseViewer, inputRef: React.RefObject<HTMLInputElement>, importXmlFunc: (xml: string) => Promise<ImportXMLResult>) {
    this.bpmnViewer = bpmnViewer;
    this.inputRef = inputRef;
    this.importXmlFunc = importXmlFunc;
  }

  getProcessName() {
    const rootElement = (this.bpmnViewer.get('canvas') as any).getRootElement();
    return rootElement?.businessObject?.name || 'diagram';
  }

  saveBpmnXml(options: SaveXMLOptions = { format: true }) {
    this.bpmnViewer.saveXML(options).then(({ xml }) => {
      download(this.getProcessName() + '.bpmn20.xml', buildUrlData(xml ?? ''));
    });
  }

  saveBpmnSvg() {
    this.bpmnViewer.saveSVG().then(({ svg }) => {
      const urlData = buildUrlData(svg);
      download(this.getProcessName() + '.svg', urlData);
    })
  }

  consoleBpmnXml(options: SaveXMLOptions = { format: true }) {
    this.bpmnViewer.saveXML(options).then(({ xml }) => console.log(xml));
  }

  openBpmnFile() {
    this.inputRef.current?.click();
  }

  importBpmnFile(xml: string) {
    return this.importXmlFunc(xml);
  }

  on(events: string | string[], callback: any, that?: any): any {
    return this.bpmnViewer.on(events, callback, that);
  }

  get(name: string) {
    return this.bpmnViewer.get(name) as any;
  }

  canvas() {
    return this.bpmnViewer.get('canvas') as any;
  }

  zoomScroll() {
    return this.bpmnViewer.get('zoomScroll') as any;
  }

  propertiesPanel() {
    return this.bpmnViewer.get('propertiesPanel') as any;
  }
}

export type BpmnPropsToolBar = {
  openFile?: boolean;
  createFile?: boolean;
  saveXml?: boolean;
  saveSvg?: boolean;
  consoleXml?: boolean;
  fullscreen?: boolean;
  reset?: boolean;
  fit?: boolean;
  zoomIn?: boolean;
  zoomOut?: boolean;
  properties?: boolean;

  // zoom?: boolean;
  // scroll?: boolean;
  // undo?: boolean;
  // redo?: boolean;
  // clear?: boolean;
  // fitViewport?: boolean;
  // open?: boolean;
  // print?: boolean;
  // selection?: boolean;
  // lasso?: boolean;
  // move?: boolean;
  // pan?: boolean;
}

export function calcToolBarValue(value?: boolean) {
  return (value === undefined || value === null) || value;
}

export function getDefaultToolBar(toolBar?: BpmnPropsToolBar) {
  const defValue: Required<BpmnPropsToolBar> = {
    consoleXml: true,
    createFile: true,
    fit: true,
    fullscreen: true,
    openFile: true,
    saveSvg: true,
    saveXml: true,
    zoomIn: true,
    zoomOut: true,
    reset: true,
    properties: true,

  };
  if (!isNil(toolBar)) {
    // eslint-disable-next-line guard-for-in
    for (let toolBarKey in toolBar) {
      // @ts-ignore
      defValue[toolBarKey] = calcToolBarValue(toolBar[toolBarKey]);
    }
  }
  return defValue;
}

export type BpmnProps = {
  params?: Record<any, any>;
  request?: (params?: Record<any, any>) => Promise<Awaited<string>>;
  onInit?: (bpmnViewer: BaseViewer) => void;
  onLoadError?: (error: any, bpmnViewer: BaseViewer) => void;
  onLoadSuccess?: (data: ImportXMLResult, bpmnViewer: BaseViewer) => void;
  toolBar?: BpmnPropsToolBar;
};

export const BpmnPropsKeys = ['params', 'request', 'onInit', 'onLoadError', 'onLoadSuccess', 'toolBar'];
