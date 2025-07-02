import styled from 'styled-components'

export const CardContainer = styled.div`
  overflow: auto;
  width: 100%;
  white-space: nowrap;
`

export const Horizontal = styled.div`
  display: flex;
  gap: 16px;
    overflow-x: auto;
  scroll-behavior: smooth;
  -ms-overflow-style: none;  /* IE dan Edge lama */
  scrollbar-width: none;     /* Firefox */
  &::-webkit-scrollbar {
    display: none;            /* Chrome, Safari, Edge */
  }
  padding-bottom: 8px;
`

export const Title = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: black;
  margin: 24px 0 8px 0;
  color:"#1F2937");
`
