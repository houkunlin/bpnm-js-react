// @ts-nocheck
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import BaseViewer, { ImportXMLResult } from "bpmn-js/lib/BaseViewer";
import BpmnModeler from "bpmn-js/lib/Modeler";
// 迷你图
// @ts-ignore
import minimapModule from 'diagram-js-minimap';
// 属性面板模块
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
// 属性面板模块提供者
// @ts-ignore
import CamundaExtensionModule from 'bpmn-moddle';
// @ts-ignore
import camundaModdleDescriptors from 'camunda-bpmn-moddle/resources/camunda.json';
import { useMemoizedFn } from "ahooks";
import i18n from "./i18n";
import { debounce, isNil, omit, pick } from "lodash";
import classNames from "classnames";
import { EmptyBpmnXmlDiagram, useMoveDiv } from "../utils";
import { BpmnInstance, BpmnProps, BpmnPropsKeys, calcToolBarValue } from "./commons";
import BpmnToolBar from "./BpmnToolBar";

import './styles/bpmn.less';
import './styles/viewer-index.less';

const options = {
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
    CamundaExtensionModule,
    i18n,
    minimapModule,
  ],
  // needed if you'd like to maintain camunda:XXX properties in the properties panel
  moddleExtensions: {
    camunda: camundaModdleDescriptors,
  },
};

function createBpmnModeler() {
  return new BpmnModeler({ ...options, keyboard: { bindTo: document } });
}

const Bpmn = forwardRef<BpmnInstance, BpmnProps & React.HTMLAttributes<HTMLDivElement>>(function (props, ref) {
  const canvasDivRef = useRef<HTMLDivElement>(null);
  const dataOpenFileRef = useRef<HTMLInputElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [bpmnViewer] = useState<BaseViewer>(createBpmnModeler);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const separate = useMoveDiv({
    parentDivRef: fullscreenRef,
    // onResize: width => propertiesPanelRef.current!.style.width = width + 'px',
    // onResize: width => console.log(width, 'px'),
  });
  // console.log('bpmnViewer.getModules()', bpmnViewer.getModules());
  // console.log(bpmnViewer,)

  const { params, request, ...theProps } = pick(props, BpmnPropsKeys);
  const rest = omit(props, BpmnPropsKeys);

  const doImportXml = useMemoizedFn(async (xml: string): Promise<ImportXMLResult> => {
    try {
      if (xml.startsWith('<xml') || xml.startsWith('<?xml ')) {
        const value = await bpmnViewer.importXML(xml);
        (bpmnViewer.get('canvas') as any).zoom('fit-viewport');
        theProps.onLoadSuccess?.(value, bpmnViewer);
        return value;
      }
      bpmnViewer.importXML(EmptyBpmnXmlDiagram);
      theProps.onLoadError?.(new Error('xml格式不正确'), bpmnViewer);
    } catch (error) {
      bpmnViewer.importXML(EmptyBpmnXmlDiagram);
      theProps.onLoadError?.(error, bpmnViewer);
    }
    return { warnings: ['导入失败'] };
  });

  const bpmnInstance = useMemo(() => new BpmnInstance(bpmnViewer, dataOpenFileRef, doImportXml), [bpmnViewer]);

  useImperativeHandle(ref, () => bpmnInstance, [bpmnInstance]);

  const showProperties = useMemo(() => calcToolBarValue(theProps.toolBar?.properties), [theProps.toolBar?.properties])

  useEffect(() => {
    console.log('BPMN Editor Powered by http://bpmn.io');
    props.onInit?.(bpmnViewer);
    bpmnViewer.attachTo(canvasDivRef.current!);
    const poweredBy = canvasDivRef.current!.getElementsByClassName('bjs-powered-by');
    if (poweredBy.length > 0) {
      const child = poweredBy[0] as HTMLElement;
      child.style.removeProperty('z-index');
    }
    if (propertiesPanelRef.current) {
      (bpmnViewer.get('propertiesPanel') as any).attachTo(propertiesPanelRef.current);
      // bpmnViewer.on('propertiesPanel.attach', () => {
      //   // 如果存在URL传入到当前组件，则加载这个URL的BPMN文件
      // });
    }
    // 添加导入完成事件
    // bpmnViewer.on('import.done', (event: { error: any; warnings: any }) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const error = event.error;
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const warnings = event.warnings;
    //   // 画布自适应
    //   bpmnInstance.canvas().zoom('fit-viewport');
    // });

    const exportArtifacts = debounce(() => {
    }, 500);
    // 添加事件，在画布有数据变动的时候触发
    bpmnViewer.on('commandStack.changed', exportArtifacts);

    return () => {
      bpmnViewer.clear();
      // bpmnViewer.detach();
      bpmnViewer.destroy();
    };
  }, []);

  useEffect(() => {
    if (request) {
      request(params)
        .then(doImportXml)
        .catch(error => theProps.onLoadError?.(error, bpmnViewer));
    } else {
      doImportXml(EmptyBpmnXmlDiagram);
    }
  }, [params, request, bpmnViewer]);

  useEffect(() => {
    const element = document.getElementById('root');
    if (isNil(element) || isNil(element.children[0])) {
      return;
    }
    const child = element.children[0] as HTMLDivElement;
    child.style.height = '100%';
    return () => {
      child.style.removeProperty('height');
    };
  }, []);

  return <div
    {...rest}
    ref={fullscreenRef}
    className={classNames('hkl-bpmn', rest.className)}
  >
    <div className={'hkl-bpmn-content'}>
      {/*画布：流程编辑器*/}
      <div className={'hkl-bpmn-content-left'}>
        <div className={'hkl-bpmn-content-canvas'} ref={canvasDivRef} />
        <BpmnToolBar toolBar={theProps.toolBar} bpmnInstance={bpmnInstance} fullscreenRef={fullscreenRef} />
      </div>
      {showProperties && (
        <>
          {/*宽度拖动线*/}
          <div
            className={'hkl-bpmn-left-right-line'}
            onMouseDown={separate.onMouseStart}
            onMouseUp={separate.onMouseEnd}
          />
          {/*面板：右侧属性面板*/}
          <div
            ref={propertiesPanelRef}
            className={'hkl-bpmn-content-properties-panel-parent'}
            style={{ width: separate.width }}
          />
        </>
      )}
    </div>
    <input
      ref={dataOpenFileRef}
      type="file"
      accept=".bpnm, .xml"
      name="open"
      style={{ display: 'none' }}
      onChange={event => {
        const files = event.target.files;
        if (isNil(files)) {
          return;
        }
        if (files.length >= 1) {
          const reader = new FileReader();
          reader.onload = (e) => {
            bpmnInstance.importBpmnFile(e.target?.result as string);
          };
          reader.readAsText(files[0]);
        }
      }}
    />
  </div>
});

Bpmn.displayName = "Bpmn";

export default Bpmn;
