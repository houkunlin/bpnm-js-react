import { Bpmn, BpmnInstance, getModule } from '@houkunlin/bpmn-js-react';
import React, { useCallback, useState } from 'react';

export default () => {
  const bpmnRef = React.useRef<BpmnInstance>(null);
  const [v, setV] = useState(0);
  const [f, setF] = useState(0);
  const [floatCanvas, setFloatCanvas] = useState(true);

  const request = useCallback(async () => {
    console.log('请求数据');
    return '';
  }, [f]);

  return (
    <>
      <button onClick={() => setFloatCanvas(false)}>工具栏在顶部</button>
      <button onClick={() => setFloatCanvas(true)}>工具栏在画布中</button>
      <button onClick={() => setV(v + 1)}>改变请求参数</button>
      <button onClick={() => setF(f + 1)}>改变请求方法</button>
      <Bpmn
        ref={bpmnRef}
        params={{ v }}
        request={request}
        style={{ height: '800px', width: '100%' }}
        toolBar={{ floatCanvas: floatCanvas }}
        onLoadSuccess={(data, bpmnViewer) => {
          getModule(bpmnViewer, 'keyboard').then((value) => {
            value.bind(document);
          });
        }}
      />
    </>
  );
};
