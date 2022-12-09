import React from 'react';
import styled from 'styled-components';

import { REACT_GRAY } from '../../constants';
import CodeSandboxPrompt from '../CodeSandboxPrompt';

// =============================================================================
// Styled Components
// =============================================================================

const StyledMain = styled.main`
  position: relative;
  padding: 20px;
  height: 100vh;
  background-color: ${REACT_GRAY};
`;

// =============================================================================
// Main Component
// =============================================================================

// TODO: @PHANTOM-TEAM: Let's improve this UI
const NoProvider = () => {
  return (
    <StyledMain>
      <CodeSandboxPrompt />
      <h2>Could not find a provider</h2>
    </StyledMain>
  );
};

export default NoProvider;
