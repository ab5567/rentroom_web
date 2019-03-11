import { css } from 'styled-components';

export const headerHeight = 0;

export const appColor = '#4b74ff';

export const easing = 'cubic-bezier(0.35, 0.01, 0.77, 0.34);';

export default {
  breakpoints: [400, 768, 1024, 1280, 1920],
  palette: {
    primary: appColor,
    primaryDark: '#3152bf',
    second: '#333333',
    third: '#788998',
    dark: '#343434',
    light: '#9b9b9b',

  },
  button: {
    borderRadius: {
      xs: 4,
      lg: 28,
      xl: 32,
    },
    padding: {
      lg: [12, 28],
      xl: [14, 32],
    },
  },
};

export const media = {
  handheld: (...args) => css`
    @media(max-width: 575.98px) {
      ${css(...args)}
    }
  `,
  tablet: (...args) => css`
    @media(max-width: 991.98px)
      and (min-width: 576px) {
        ${css(...args)}
      }
  `,
  mobile: (...args) => css`
  @media(max-width: 767.98px) {
      ${css(...args)}
    }
  `
};
