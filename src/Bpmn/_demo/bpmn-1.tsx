import { Bpmn, BpmnInstance } from '@houkunlin/bpmn-js-react';
import React, { useState } from 'react';

export default () => {
  const bpmnRef = React.useRef<BpmnInstance>(null);
  const [floatCanvas, setFloatCanvas] = useState(true);

  return (
    <>
      <button onClick={() => setFloatCanvas(false)}>工具栏在顶部</button>
      <button onClick={() => setFloatCanvas(true)}>工具栏在画布中</button>
      <Bpmn
        ref={bpmnRef}
        params={{}}
        request={async () => {
          console.log('请求数据');
          return '';
        }}
        style={{ height: '800px', width: '100%' }}
        toolBar={{ floatCanvas: floatCanvas }}
      />
    </>
  );
};
