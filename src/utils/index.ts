import React, { useEffect, useState } from "react";
import { useMemoizedFn, useMouse } from "ahooks";

export const buildUrlData = (rawData: string) => {
  const encodedData = encodeURIComponent(rawData);
  return `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`;
};
// 下载保存图像文件
export const download = (filename: string, urlData: string) => {
  const link = document.createElement('a');
  link.setAttribute('href', urlData);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function useMoveDiv(props: {
  minWidth?: number;
  parentDivRef: React.RefObject<HTMLDivElement>;
  onResize?: (width: number) => void;
}) {
  const minWidth = props?.minWidth ?? 260;
  // [鼠标按下时的坐标X位置，鼠标按下时的宽度]
  const [start, setStart] = useState<number[]>([-1, minWidth]);
  const [width, setWidth] = useState<number>(minWidth);
  const mouse = useMouse(props.parentDivRef);

  useEffect(() => {
    if (start[0] >= 0) {
      // 之所以要 (* -1) 是因为要向左拉动改变宽度
      // 结果 = 鼠标按下时的宽度 + ( 当前鼠标坐标X位置 - 鼠标按下时的坐标X位置 ) * -1
      let newWidth = start[1] + (mouse.clientX - start[0]) * -1;
      // 限制最大宽度只能为编辑器宽度的一半
      if (newWidth > mouse.elementW / 2) {
        newWidth = mouse.elementW / 2;
      }
      const calcWidth = newWidth < minWidth ? minWidth : newWidth;
      props.onResize?.(calcWidth);
      setWidth(calcWidth);
    }
  }, [start, mouse]);
  const onMouseStart = useMemoizedFn((e) => {
    e.preventDefault();
    e.stopPropagation();
    setStart([mouse.clientX, width]);
    // console.log('按下鼠标', mouse.clientX)
  });
  const onMouseEnd = useMemoizedFn((e) => {
    e.preventDefault();
    e.stopPropagation();
    setStart([-1]);
    // console.log('抬起鼠标', mouse.clientX)
  });

  return {
    width,
    onMouseStart,
    onMouseEnd
  }
}

export const EmptyBpmnXmlDiagram = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:modeler="http://camunda.org/schema/modeler/1.0" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.0.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.17.0">
  <bpmn:process id="Process_1" name="New Process Name" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="79" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="185" y="122" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`
