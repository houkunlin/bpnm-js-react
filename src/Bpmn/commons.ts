import {
  buildUrlData,
  download,
  EmptyBpmnXmlDiagram,
} from '@houkunlin/bpmn-js-react/utils';
import BaseViewer, {
  ImportXMLResult,
  SaveXMLOptions,
} from 'bpmn-js/lib/BaseViewer';
import { isNil } from 'lodash';
import React from 'react';

export { default as BaseViewer } from 'bpmn-js/lib/BaseViewer';
export type { ImportXMLResult, SaveXMLOptions } from 'bpmn-js/lib/BaseViewer';

export function getModule<T = any>(bpmnViewer: BaseViewer, moduleName: string) {
  const promise = new Promise<T>((resolve, reject) => {
    try {
      const module = bpmnViewer.get(moduleName);
      resolve(module as T);
    } catch (e) {
      reject(e);
    }
  });
  // promise.catch(e => {
  //   console.error('get module error -->', e);
  // });
  return promise;
}

export class BpmnInstance {
  readonly bpmnViewer: BaseViewer;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly importXmlFunc: (xml?: string | null) => Promise<ImportXMLResult>;

  constructor(
    bpmnViewer: BaseViewer,
    inputRef: React.RefObject<HTMLInputElement>,
    importXmlFunc: (xml?: string | null) => Promise<ImportXMLResult>,
  ) {
    this.bpmnViewer = bpmnViewer;
    this.inputRef = inputRef;
    this.importXmlFunc = importXmlFunc;
  }

  getProcessName() {
    const rootElement = this.canvas().getRootElement();
    return rootElement?.businessObject?.name || 'diagram';
  }

  getBpmnXml(options: SaveXMLOptions = { format: true }) {
    return this.bpmnViewer.saveXML(options).then(({ xml }) => xml ?? '');
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
    });
  }

  consoleBpmnXml(options: SaveXMLOptions = { format: true }) {
    this.bpmnViewer.saveXML(options).then(({ xml }) => console.log(xml));
  }

  openBpmnFile() {
    this.inputRef.current?.click();
  }

  createBpmnXml() {
    return this.importXmlFunc();
  }

  importBpmnXml(xml?: string | null) {
    return this.importXmlFunc(xml);
  }

  on(events: string | string[], callback: any, that?: any): any {
    return this.bpmnViewer.on(events, callback, that);
  }

  get<T = any>(name: string) {
    try {
      return this.bpmnViewer.get(name) as T;
    } catch (e) {}
    return undefined;
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

  getModule<T = any>(moduleName: string) {
    return getModule<T>(this.bpmnViewer, moduleName);
  }
}

export function initBpmnViewerEmptyDiagram(bpmnViewer: BaseViewer) {
  bpmnViewer.importXML(EmptyBpmnXmlDiagram).then(() => {
    getModule(bpmnViewer, 'canvas').then((v) => v.zoom('fit-viewport', 'auto'));
  });
}

export type BpmnPropsToolBar = {
  /* 浮动在画布上 */
  floatCanvas?: boolean;
  /* 打开文件导入模型 */
  openFile?: boolean;
  /* 创建空模型 */
  createFile?: boolean;
  /* 保存xml文件 */
  saveXml?: boolean;
  /* 保存 SVG 文件 */
  saveSvg?: boolean;
  /* 控制台打印 */
  consoleXml?: boolean;
  /* 切换全屏 */
  fullscreen?: boolean;
  /* 重置画布 */
  reset?: boolean;
  /* 重置画布 */
  fit?: boolean;
  /* 画布放大 */
  zoomIn?: boolean;
  /* 画布缩小 */
  zoomOut?: boolean;
  /* 展示属性面板 */
  properties?: boolean;
  /* 流程模拟仿真 */
  simulation?: boolean;

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
};

export function calcToolBarValue(value?: boolean) {
  return value === undefined || value === null || value;
}

export function getDefaultToolBar(toolBar?: BpmnPropsToolBar) {
  const defValue: Required<BpmnPropsToolBar> = {
    floatCanvas: true,
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
    simulation: true,
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

export const BpmnPropsKeys = [
  'params',
  'request',
  'onInit',
  'onLoadError',
  'onLoadSuccess',
  'toolBar',
];
