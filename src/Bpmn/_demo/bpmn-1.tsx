import React from "react";
import { Bpmn, BpmnInstance } from "@houkunlin/bpmn-js-react";

export default () => {
  const bpmnRef = React.useRef<BpmnInstance>(null);

  return (<>
    <Bpmn
      ref={bpmnRef}
      params={{}}
      request={async () => {
        console.log('请求数据')
        return '';
      }}
      style={{ height: '800px', width: '100%' }}
    />
  </>)
}
