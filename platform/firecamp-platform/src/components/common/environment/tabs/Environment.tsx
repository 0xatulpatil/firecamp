import { memo, useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';
import _cloneDeep from 'lodash/cloneDeep';
import _cleanDeep from 'clean-deep';
import {
  RootContainer,
  Container,
  Column,
  Row,
  EnvironmentTable,
  Loader,
} from '@firecamp/ui-kit';
import { _array, _object } from '@firecamp/utils';
import { IEnv } from '@firecamp/types';

const EnvironmentTab = ({ tab, platformContext }) => {
  const originalEnv = useRef(tab.entity);
  const [env, setEnv] = useState<IEnv>({ ...tab.entity });
  const [isFetchingEnv, setIsFetchingEnvFlag] = useState(false);

  const onChangeVariables = (vars) => {
    const newEnv = {
      ...env,
      variables: vars,
    };
    setEnv(newEnv);

    if (!isEqual(originalEnv.current, newEnv)) {
      console.log(originalEnv.current, newEnv, 'both are not equals...');
    }
  };

  useEffect(() => {
    const _fetch = async () => {
      try {
        const envId = tab.entity?.__ref?.id;
        setIsFetchingEnvFlag(true);
        try {
          await platformContext.environment
            .fetch(envId)
            .then((env) => {
              originalEnv.current = env;
              setEnv(env);
            })
            .finally(() => {
              setIsFetchingEnvFlag(false);
            });
        } catch (e) {
          console.error(e, 'fetch rest request');
          throw e;
        }
      } catch (e) {
        console.error(e);
      }
    };
    _fetch();
  }, []);

  if (isFetchingEnv === true) return <Loader />;
  return (
    <RootContainer className="h-full w-full">
      <Container className="h-full with-divider">
        <Container.Body>
          <Row flex={1} overflow="auto" className="with-divider h-full">
            <Column>
              <EnvironmentTable
                rows={env.variables}
                onChange={onChangeVariables}
              />
            </Column>
          </Row>
        </Container.Body>
      </Container>
    </RootContainer>
  );
};

export default memo(EnvironmentTab, (p, n) => !isEqual(p, n));
