import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { appColor } from 'modules/theme';

const GlobalStyle = createGlobalStyle`

  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  @import url('https://use.fontawesome.com/releases/v5.1.0/css/all.css');
  
  
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  html {
    font-size: 87.5%;
    -webkit-font-smoothing: antialiased;
    height: 100%;

    @media(max-width: 575.98px) {
      font-size: 75%;
    }

    @media(max-width: 991.98px) and (min-width: 576px) {
      font-size: 80%;
    }
  }

  body {
    font-family: Avenir;
    font-size: 16px; /* stylelint-disable unit-blacklist */
    margin: 0;
    min-height: 100vh;
    padding: 0;
    color: #333333;
  }

  img {
    height: auto;
    max-width: 100%;
  }

  a {
    color: ${appColor};
    text-decoration: none;

    &.disabled {
      pointer-events: none;
    }
  }

  button {
    appearance: none;
    background-color: transparent;
    border: 0;
    cursor: pointer;
    display: inline-block;
    font-family: inherit;
    line-height: 1;
    padding: 0;
  }
`;

export default () => <GlobalStyle />;
