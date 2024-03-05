import BaseViewer from 'bpmn-js/lib/BaseViewer';
import BpmnModeler from 'bpmn-js/lib/Viewer';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
// @ts-ignore
import EmbeddedComments from 'bpmn-js-embedded-comments';
import classNames from 'classnames';
import { debounce, isNil, omit, pick } from 'lodash';
import { useImportXml } from '../utils';
import BpmnToolBar from './BpmnToolBar';
import { BpmnInstance, BpmnProps, BpmnPropsKeys } from './commons';

import './styles/bpmn.less';
import './styles/viewer-index.less';

// 禁止画布使用鼠标滚轮上下滚动画布流程图影响页面滚动效果
if (ZoomScrollModule && ZoomScrollModule.zoomScroll) {
  const zoomScroll = ZoomScrollModule.zoomScroll as any;
  zoomScroll[1].prototype._handleWheel = () => {};
}
const options = {
  additionalModules: [
    ModelingModule,
    MoveCanvasModule,
    ZoomScrollModule,
    EmbeddedComments,
  ],
};

function createBpmnModeler() {
  return new BpmnModeler({ ...options, keyboard: { bindTo: window } });
}

const Bpmn = forwardRef<
  BpmnInstance,
  BpmnProps & React.HTMLAttributes<HTMLDivElement>
>(function (props, ref) {
  const canvasDivRef = useRef<HTMLDivElement>(null);
  const dataOpenFileRef = useRef<HTMLInputElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [bpmnViewer] = useState<BaseViewer>(createBpmnModeler);
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
    // 添加导入完成事件
    // bpmnViewer.on('import.done', (event: { error: any; warnings: any }) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const error = event.error;
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const warnings = event.warnings;
    //   // 画布自适应
    //   bpmnInstance.canvas().zoom('fit-viewport');
    // });

    const exportArtifacts = debounce(() => {}, 500);
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
        .catch((error) => theProps.onLoadError?.(error, bpmnViewer));
    } else {
      doImportXml();
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

  return (
    <div
      {...rest}
      ref={fullscreenRef}
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
            <div
              className={'hkl-bpmn-content-canvas readonly-commons'}
              ref={canvasDivRef}
            />
          </BpmnToolBar>
        </div>
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
