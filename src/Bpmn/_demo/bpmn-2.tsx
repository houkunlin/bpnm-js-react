import React from "react";
import { BpmnInstance, BpmnView } from "@houkunlin/bpmn-js-react";

export default () => {
  const bpmnRef = React.useRef<BpmnInstance>(null);

  return (<>
    <BpmnView
      ref={bpmnRef}
      params={{}}
      request={async () => {
        console.log('请求数据')
        return '';
      }}
      style={{ height: '800px', width: '100%' }}
      toolBar={{
        createFile: false,
        consoleXml: false,
        saveXml: false,
        openFile: false,
      }}
    />
  </>)
}
