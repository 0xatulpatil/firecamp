import _cleanDeep from 'clean-deep';
import _cloneDeep from 'lodash/cloneDeep';
import equal from 'react-fast-compare';
import { _array, _object } from '@firecamp/utils';
import { ERequestTypes, ISocketIO } from '@firecamp/types';
import { normalizeRequest } from '../../services/request.service';
import {
  EReqChangeRootKeys,
  EReqChangeMetaKeys,
  EReqChangeUrlKeys,
} from '../../types';
import { TStoreSlice } from '../store.type';

interface IRequestChangeState {
  url?: EReqChangeUrlKeys[];
  __meta?: EReqChangeMetaKeys[];
  __root?: EReqChangeRootKeys[];
}
interface IRequestChangeStateSlice {
  requestChangeState?: IRequestChangeState;
  equalityChecker: (request: Partial<ISocketIO>) => void;
  preparePayloadForSaveRequest: () => ISocketIO;
  preparePayloadForUpdateRequest: () => Partial<ISocketIO>;
  /**
   * dispose request change state
   * 1. set originalRequest to the current state.request
   * 2. initialise the rcs state
   */
  disposeRCS: () => void;
}

//@note; always use _cloneDeep at its usage other wise it's value will be manipulated at global scope reference
const initialSliceState = {
  requestChangeState: {
    url: [],
    __meta: [],
    __root: [],
  },
};

const createRequestChangeStateSlice: TStoreSlice<IRequestChangeStateSlice> = (
  set,
  get
) => ({
  requestChangeState: _cloneDeep(initialSliceState.requestChangeState),
  equalityChecker: (request: Partial<ISocketIO>) => {
    const state = get();
    const {
      originalRequest: _request,
      requestChangeState: _rcs,
      runtime: { isRequestSaved },
    } = state;
    if (!isRequestSaved) return;

    for (let key in request) {
      switch (key) {
        case EReqChangeRootKeys.config:
        case EReqChangeRootKeys.headers:
        case EReqChangeRootKeys.listeners:
          if (!equal(_request[key], request[key])) {
            if (!_rcs.__root.includes(key)) _rcs.__root.push(key);
          } else {
            _rcs.__root = _array.without(
              _rcs.__root,
              key
            ) as EReqChangeRootKeys[];
          }
          break;
        case 'url':
        case '__meta':
          Object.keys(request[key]).forEach((k) => {
            if (!equal(_request[key][k], request[key][k])) {
              if (!_rcs[key].includes(k)) _rcs[key].push(k);
            } else {
              _rcs[key] = _array.without(_rcs[key], k);
            }
          });
          break;
      }
    }
    console.log(_rcs);
    const hasChange = !_object.isEmpty(_cleanDeep(_cloneDeep(_rcs)));
    state.context.tab.changeMeta(state.runtime.tabId, {
      hasChange,
    });
  },
  preparePayloadForSaveRequest: () => {
    const state = get();
    const _sr = normalizeRequest(state.request);
    console.log(_sr);
    return _sr;
  },
  preparePayloadForUpdateRequest: () => {
    const state = get();
    const { request, requestChangeState: _rcs } = state;
    const _request = normalizeRequest(request);
    let _ur: Partial<ISocketIO> = {};

    for (let key in _rcs) {
      switch (key) {
        case '__root':
          _ur = { ..._ur, ..._object.pick(_request, _rcs[key]) };
          break;
        case 'url':
          //@ts-ignore url will have only updated key
          _ur.url = _object.pick(_request[key], _rcs[key]);
          break;
        case '__meta':
          //@ts-ignore TODO: manage types here
          _ur.__meta = _object.pick(_request[key], _rcs[key]);
          break;
      }
    }
    if (_object.isEmpty(_ur)) return null; //if request has no change then return null as update payload
    //@ts-ignore
    _ur.__meta = {
      type: ERequestTypes.SocketIO,
    };
    _ur.__ref = {
      id: _request.__ref.id,
      collectionId: _request.__ref.collectionId,
    };
    //@ts-ignore
    _ur.__changes = { ..._rcs };
    console.log(_ur);
    return _ur;
  },
  disposeRCS: () => {
    set((s) => ({
      originalRequest: _cloneDeep(s.request),
      requestChangeState: _cloneDeep(initialSliceState.requestChangeState),
    }));
  },
});

export { createRequestChangeStateSlice, IRequestChangeStateSlice };
