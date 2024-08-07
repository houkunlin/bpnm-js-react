// @ts-nocheck
import BaseViewer from 'bpmn-js/lib/BaseViewer';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
// 迷你图
// @ts-ignore
import minimapModule from 'diagram-js-minimap';
// @ts-ignore
import TokenSimulationModule from 'bpmn-js-token-simulation';
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
import EmbeddedComments from 'bpmn-js-embedded-comments';
// @ts-ignore
import { useDeepCompareEffect } from 'ahooks';
import camundaModdleDescriptors from 'camunda-bpmn-moddle/resources/camunda.json';
import classNames from 'classnames';
import { debounce, isNil, omit, pick } from 'lodash';
import { useImportXml, useMoveDiv } from '../utils';
import BpmnToolBar from './BpmnToolBar';
import {
  BpmnInstance,
  BpmnProps,
  BpmnPropsKeys,
  calcToolBarValue,
  getModule,
} from './commons';
import i18n from './i18n';

import './styles/bpmn.less';
import './styles/viewer-index.less';

const options = {
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
    CamundaExtensionModule,
    EmbeddedComments,
    TokenSimulationModule,
    i18n,
    minimapModule,
  ],
  // needed if you'd like to maintain camunda:XXX properties in the properties panel
  moddleExtensions: {
    camunda: camundaModdleDescriptors,
  },
};

function createBpmnModeler() {
  return new BpmnModeler({ ...options });
}

const Bpmn = forwardRef<
  BpmnInstance,
  BpmnProps & React.HTMLAttributes<HTMLDivElement>
>(function (props, ref) {
  const canvasDivRef = useRef<HTMLDivElement>(null);
  const dataOpenFileRef = useRef<HTMLInputElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [bpmnViewer] = useState<BaseViewer>(createBpmnModeler);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const separate = useMoveDiv({
    parentDivRef: fullscreenRef,
    onResize: (width) =>
      (propertiesPanelRef.current!.style.width = width + 'px'),
  });
  // console.log('bpmnViewer.getModules()', bpmnViewer.getModules());
  // console.log(bpmnViewer,)

  const { params, request, ...theProps } = pick(props, BpmnPropsKeys);
  const rest = omit(props, BpmnPropsKeys);

  const doImportXml = useImportXml(bpmnViewer, theProps);

  const bpmnInstance = useMemo(
    () => new BpmnInstance(bpmnViewer, dataOpenFileRef, doImportXml),
    [bpmnViewer],
  );

  useImperativeHandle(ref, () => bpmnInstance, [bpmnInstance]);

  const showProperties = useMemo(
    () => calcToolBarValue(theProps.toolBar?.properties),
    [theProps.toolBar?.properties],
  );

  useEffect(() => {
    console.log('BPMN Editor Powered by http://bpmn.io');
    props.onInit?.(bpmnViewer);
    bpmnViewer.attachTo(canvasDivRef.current!);
    const poweredBy =
      canvasDivRef.current!.getElementsByClassName('bjs-powered-by');
    if (poweredBy.length > 0) {
      const child = poweredBy[0] as HTMLElement;
      child.style.removeProperty('z-index');
    }
    if (propertiesPanelRef.current) {
      getModule(bpmnViewer, 'propertiesPanel').then((v) =>
        v.attachTo(propertiesPanelRef.current),
      );
      // bpmnViewer.on('propertiesPanel.attach', () => {
      //   // 如果存在URL传入到当前组件，则加载这个URL的BPMN文件
      // });
    }
    getModule(bpmnViewer, 'comments').then((comments) => {
      bpmnViewer.on('element.click', (e: any) => {
        if (`${e.element?.type}`.endsWith('Process')) {
          comments.collapseAll();
        }
      });
    });
    // 添加导入完成事件
    // bpmnViewer.on('import.done', (event: { error: any; warnings: any }) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const error = event.error;
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const warnings = event.warnings;
    //   // 画布自适应
    //   bpmnInstance.canvas().zoom('fit-viewport');
    // });

    // 添加事件，在画布有数据变动的时候触发
    bpmnViewer.on(
      'commandStack.changed',
      debounce(() => {}, 500),
    );

    const buttons = canvasDivRef.current!.getElementsByTagName('button');
    console.log(buttons);
    for (let button of buttons) {
      button.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          return false;
        },
        false,
      );
    }

    return () => {
      bpmnViewer.clear();
      // bpmnViewer.detach();
      bpmnViewer.destroy();
    };
  }, []);

  useDeepCompareEffect(() => {
    if (request) {
      request(params)
        .then(doImportXml)
        .catch((error) => theProps.onLoadError?.(error, bpmnViewer));
    } else {
      doImportXml();
    }
  }, [params, request, bpmnViewer]);

  return (
    <div
      {...rest}
      ref={fullscreenRef}
      onMouseMove={(e) => {
        separate.onMouseMove(e);
        rest.onMouseMove?.(e);
      }}
      onMouseUp={(e) => {
        separate.onMouseEnd(e);
        rest.onMouseUp?.(e);
      }}
      className={classNames('hkl-bpmn', rest.className)}
    >
      <div className={'hkl-bpmn-content'}>
        {/*画布：流程编辑器*/}
        <div className={'hkl-bpmn-content-left'}>
          <BpmnToolBar
            toolBar={theProps.toolBar}
            bpmnInstance={bpmnInstance}
            fullscreenRef={fullscreenRef}
          >
            <div className={'hkl-bpmn-content-canvas'} ref={canvasDivRef} />
          </BpmnToolBar>
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
            />
          </>
        )}
      </div>
      <input
        ref={dataOpenFileRef}
        type="file"
        accept=".bpmn, .xml"
        name="open"
        style={{ display: 'none' }}
        onChange={(event) => {
          const files = event.target.files;
          if (isNil(files)) {
            return;
          }
          if (files.length >= 1) {
            const reader = new FileReader();
            reader.onload = (e) => {
              bpmnInstance.importBpmnXml(e.target?.result as string);
            };
            reader.readAsText(files[0]);
          }
        }}
      />
    </div>
  );
});

Bpmn.displayName = 'Bpmn';

export default Bpmn;
