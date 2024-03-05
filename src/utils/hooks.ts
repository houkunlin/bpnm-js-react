import {
  BpmnProps,
  getModule,
  initBpmnViewerEmptyDiagram,
} from '@houkunlin/bpmn-js-react';
import { useLatest, useMemoizedFn } from 'ahooks';
import BaseViewer, { ImportXMLResult } from 'bpmn-js/lib/BaseViewer';
import { isNil } from 'lodash';
import React, { useEffect } from 'react';

export function useMoveDiv(props: {
  minWidth?: number;
  parentDivRef: React.RefObject<HTMLDivElement>;
  onResize?: (width: number) => void;
}) {
  const minWidth = props?.minWidth ?? 260;
  // [鼠标按下时的坐标X位置，鼠标按下时的宽度]
  const start = useLatest<boolean>(false);

  useEffect(() => {
    props.onResize?.(minWidth);
  }, []);

  const onMouseStart = useMemoizedFn((e) => {
    e.preventDefault();
    e.stopPropagation();
    start.current = true;
    // console.log('按下鼠标', v.current)
  });
  const onMouseMove = useMemoizedFn((e) => {
    if (start.current) {
      const parentDiv = props.parentDivRef.current!;
      const parentWidth = parentDiv.clientWidth;
      // 结果 = 父容器宽度 - ( 当前鼠标屏幕坐标X位置 - 父容器屏幕坐标X位置 ) - 4个分隔符像素
      let newWidth = parentWidth - (e.clientX - parentDiv.offsetLeft) - 4;
      // 限制最大宽度只能为编辑器宽度的一半
      if (newWidth > parentWidth / 2) {
        newWidth = parentWidth / 2;
      }
      const calcWidth = newWidth < minWidth ? minWidth : newWidth;
      // console.log('移动鼠标', calcWidth, newWidth);
      props.onResize?.(calcWidth);
    }
  });
  const onMouseEnd = useMemoizedFn(() => {
    start.current = false;
    // console.log('抬起鼠标', v.current)
  });

  return {
    onMouseStart,
    onMouseMove,
    onMouseEnd,
  };
}

export function useImportXml(bpmnViewer: BaseViewer, opts: BpmnProps) {
  return useMemoizedFn(
    async (xml?: string | null): Promise<ImportXMLResult> => {
      try {
        if (isNil(xml) || xml.trim().length === 0) {
          initBpmnViewerEmptyDiagram(bpmnViewer);
          opts.onLoadError?.(new Error('xml格式不正确'), bpmnViewer);
          return { warnings: ['xml格式不正确, 导入默认的流程图'] };
        }
        if (xml.startsWith('<xml') || xml.startsWith('<?xml ')) {
          const value = await bpmnViewer.importXML(xml);
          getModule(bpmnViewer, 'canvas').then((v) =>
            v.zoom('fit-viewport', 'auto'),
          );
          opts.onLoadSuccess?.(value, bpmnViewer);
          return value;
        }
      } catch (error) {
        initBpmnViewerEmptyDiagram(bpmnViewer);
        opts.onLoadError?.(error, bpmnViewer);
      }
      return { warnings: ['导入失败'] };
    },
  );
}
