import React from 'react';
import styled from 'styled-components';

const Prompt = styled.div`
  position: absolute;
  right: 7px;
  top: 0;
`;

const CodeSandboxPrompt = React.memo(() => <Prompt>If you're in CodeSandbox, first "Open in New Window" ⬆️</Prompt>);

export default CodeSandboxPrompt;
