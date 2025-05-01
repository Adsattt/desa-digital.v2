import styled from "styled-components";
import { marginStyle } from "Consts/sizing";


export const Label = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
  ${marginStyle}
`;

export const NavbarButton = styled.div`
  display: flex;
  width: 100%
  max-width: 360px;
  max-height: 100px;
  height: 100%;
  padding: 12px 16px;
  position: sticky;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background: var(--Monochrome-White, #FFF);

  /* Shadow - nav */
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.06), 0px -4px 6px 0px rgba(0, 0, 0, 0.10);
`;