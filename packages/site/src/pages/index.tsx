import { useContext } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  addMember,
  connectSnap,
  createGroup,
  getIdentityCommitment,
  getKey,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
  updatePrivSeed,
  voteInGroup,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  addMemberCard,
  JoinGroupButton,
  VoteButton,
  CreateGroupButton,
  CardWrapper,
  Title,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 1.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 1.2rem;
  text-align: right;
`;

const Span = styled.span`
  //color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  var SEED = 'identity'
  const GROUP_ID_DEFAULT_1 = 23
  const GROUP_ID_DEFAULT_2 = GROUP_ID_DEFAULT_1 + 1
  var PROPOSOAL_MSG = ""

  const handleSeedChange = async (e) => {
    SEED = e.target.value
    console.log("...... handleSeedChange new seed : ", SEED)
  }

  var CREATE_GROUP_NAME = ''
  const handleGroupNameChange = async (e) => {
    CREATE_GROUP_NAME = e.target.value
    console.log("...... handleGroupNameChange new name : ", CREATE_GROUP_NAME)
  }

  return (
    <Container>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        <CardWrapper fullWidth={false} disabled={false}>
          {/* seed : <input type="text" name="seed" onChange={handleSeedChange}></input> */}
          <input type="submit" value="export seed" onClick={() => updatePrivSeed(SEED)}></input>
        </CardWrapper>

        <CardWrapper fullWidth={false} disabled={false}>
          name : <input type="text" name="group name" onChange={handleGroupNameChange}></input>
          <input type="submit" value="Create Group" onClick={() => createGroup(CREATE_GROUP_NAME)}></input>
        </CardWrapper>

        <CardWrapper fullWidth={false} disabled={false}>
          <input type="radio" id="basketball" name="group name"  onClick={() => {}}></input>
          <label for="basketball"> basketball</label><br></br>
          <input type="radio" id="football" name="group name" onClick={() => {}}></input>
          <label for="football"> football</label><br></br>
          <button onClick={() => addMember(1)}> Join Group V2</button>
        </CardWrapper>

        <CardWrapper fullWidth={false} disabled={false}>
          <Title> World Cup 2022</Title>
          <input type="radio" name="proposal2"  onClick={() => {PROPOSOAL_MSG = "Brazil"}}></input>
          <label for="Brazil"> Brazil  (60%, 3/5)</label><br></br>
          <input type="radio" name="proposal2"  onClick={() => {PROPOSOAL_MSG = "France"}}></input>
          <label for="France"> France</label><br></br>
          <input type="radio" name="proposal2"  onClick={() => {PROPOSOAL_MSG = "Other"}}></input>
          <label for="Other"> Other</label><br></br>
          <button onClick={() => voteInGroup(1, PROPOSOAL_MSG)}> Vote</button>
        </CardWrapper>

      </CardContainer>
    </Container>
  );
};

export default Index;
