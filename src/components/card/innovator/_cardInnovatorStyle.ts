import styled from 'styled-components'

export const Container = styled.div`
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 120px;
  overflow: hidden;
  cursor: pointer;
`

export const Background = styled.img`
  height: 64px;
  width: 100%;
  object-fit: cover;
`
export const Logo = styled.img`
  height: 50px;
  width: 50px;
  border-radius: 50%;
  object-fit: cover;
  position: absolute;
  top: -30px;
`

export const CardContent = styled.div`
  padding: 32px 8px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
`

export const Title = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: black;
  white-space: nowrap;
  overflow: hidden;            
  text-overflow: ellipsis;         
`

export const Description = styled.p`
  font-size: 10px;
  font-weight: 400;
  color: #4b5563;
`
