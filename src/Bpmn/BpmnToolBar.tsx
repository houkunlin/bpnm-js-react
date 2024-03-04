import {
  AimOutlined,
  CodeOutlined,
  CompressOutlined,
  DownloadOutlined,
  FileAddOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import {
  BpmnInstance,
  BpmnPropsToolBar,
  getDefaultToolBar,
} from '@houkunlin/bpmn-js-react';
import { useFullscreen } from 'ahooks';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { EmptyBpmnXmlDiagram } from '../utils';
import './styles/viewer-toolbar.less';

function BpmnToolBar(props: {
  toolBar?: BpmnPropsToolBar;
  bpmnInstance: BpmnInstance;
  fullscreenRef: React.RefObject<HTMLDivElement>;
  children?: React.JSX.Element;
}) {
  const [isFullscreen, { enterFullscreen, exitFullscreen }] = useFullscreen(
    props.fullscreenRef,
  );
  const toolBar = useMemo(
    () => getDefaultToolBar(props.toolBar),
    [props.toolBar],
  );
  const { bpmnInstance } = props;

  const rightBottom = useMemo(() => {
    const items = [];
    if (toolBar.fullscreen) {
      items.push(
        <button title={isFullscreen ? '退出全屏' : '全屏'}>
          {!isFullscreen && <FullscreenOutlined onClick={enterFullscreen} />}
          {isFullscreen && <FullscreenExitOutlined onClick={exitFullscreen} />}
        </button>,
      );
      items.push(<hr />);
    }
    if (toolBar.fit) {
      items.push(
        <button title="适合大小">
          <CompressOutlined
            onClick={() => bpmnInstance.canvas().zoom('fit-viewport')}
          />
        </button>,
      );
      items.push(<hr />);
    }
    if (toolBar.reset) {
      items.push(
        <button title="重置">
          <AimOutlined onClick={() => bpmnInstance.zoomScroll().reset()} />
        </button>,
      );
      items.push(<hr />);
    }
    if (toolBar.zoomIn) {
      items.push(
        <button title="放大">
          <ZoomInOutlined
            onClick={() => bpmnInstance.zoomScroll().stepZoom(1)}
          />
        </button>,
      );
      items.push(<hr />);
    }
    if (toolBar.zoomOut) {
      items.push(
        <button title="缩小">
          <ZoomOutOutlined
            onClick={() => bpmnInstance.zoomScroll().stepZoom(-1)}
          />
        </button>,
      );
      items.push(<hr />);
    }
    return items.splice(0, items.length - 1);
  }, [toolBar, isFullscreen]);
  const leftBottom = useMemo(() => {
    const items = [];
    if (toolBar.openFile) {
      items.push(
        <button title="打开 BPMN 2.0 文件">
          <FolderOpenOutlined onClick={() => bpmnInstance.openBpmnFile()} />
        </button>,
      );
    }
    if (toolBar.createFile) {
      items.push(
        <button title="创建空 BPMN 2.0 模型">
          <FileAddOutlined
            onClick={() => bpmnInstance.importBpmnFile(EmptyBpmnXmlDiagram)}
          />
        </button>,
      );
    }
    if (toolBar.saveXml) {
      items.push(
        <button title="保存 BPMN 2.0 文件">
          <DownloadOutlined onClick={() => bpmnInstance.saveBpmnXml()} />
        </button>,
      );
    }
    if (toolBar.saveSvg) {
      items.push(
        <button title="保存 SVG 图像">
          <FileImageOutlined onClick={() => bpmnInstance.saveBpmnSvg()} />
        </button>,
      );
    }
    if (toolBar.consoleXml) {
      items.push(
        <button title="打印到控制台">
          <CodeOutlined onClick={() => bpmnInstance.consoleBpmnXml()} />
        </button>,
      );
    }
    return items;
  }, [toolBar]);

  const toolBarElem = useMemo(
    () => (
      <div
        className={classNames('hkl-bpmn-content-control', {
          'control-default': !toolBar.floatCanvas,
        })}
      >
        {leftBottom.length > 0 && (
          <div className={classNames({ 'io-horizontal': toolBar.floatCanvas })}>
            <ul className="io-control io-control-list">
              {leftBottom.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {rightBottom.length > 0 && (
          <div className={classNames({ 'io-vertical': toolBar.floatCanvas })}>
            <ul className="io-control io-control-list">
              {rightBottom.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
    [toolBar, leftBottom, rightBottom],
  );

  return (
    <>
      {!toolBar.floatCanvas && <>{toolBarElem}</>}
      <div
        style={{ height: toolBar.floatCanvas ? '100%' : 'calc( 100% - 38px)' }}
      >
        {props.children}
      </div>
      {toolBar.floatCanvas && <>{toolBarElem}</>}
    </>
  );
}

export default BpmnToolBar;
