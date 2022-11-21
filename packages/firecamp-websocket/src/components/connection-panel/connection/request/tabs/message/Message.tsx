import { useState } from 'react';
import { RootContainer } from '@firecamp/ui-kit';
import shallow from 'zustand/shallow';

import MessagePlayground from './MessagePlayground';
import { EMessagePayloadTypes } from '../../../../../../types';

import {
  useWebsocketStore,
  // initialPlaygroundMessage,
} from '../../../../../../store';

const messageTypes = [
  {
    id: EMessagePayloadTypes.text,
    name: 'Text',
  },
  {
    id: EMessagePayloadTypes.json,
    name: 'JSON',
  },
  {
    id: EMessagePayloadTypes.file,
    name: 'File',
  },
  {
    id: EMessagePayloadTypes.arraybuffer,
    name: 'Array buffer',
  },
  {
    id: EMessagePayloadTypes.arraybufferview,
    name: 'Array buffer view',
  },
  {
    id: 'noBody',
    name: 'No body',
  },
];

const envelopeList = [
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
];

const Message = ({ tabData = {} }) => {
  let tabId = 123;

  let { meta } = useWebsocketStore(
    (s: any) => ({
      meta: s.request.meta,
    }),
    shallow
  );

  let [selectedMessageId] = useState('');

  return (
    <RootContainer className="h-full">
      <MessagePlayground
        messageTypes={messageTypes}
        envelopeList={envelopeList}
        meta={meta}
        tabData={{ id: tabId }}
        selectedMessageId={selectedMessageId}
      />
    </RootContainer>
  );
};
export default Message;
