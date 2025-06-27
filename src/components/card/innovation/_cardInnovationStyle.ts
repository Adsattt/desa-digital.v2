import styled from 'styled-components'

export const Container = styled.div`
  border: 1px solid #e5e7eb;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-width: 146px;
  max-width: 146px;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
`

export const Background = styled.img`
  height: 100px;
  width: 100%;
  object-fit: cover;
`

export const Content = styled.div`
  padding: 8px;
`

export const Title = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: black;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const Category = styled.p`
  font-size: 10px;
  font-weight: 400;
  color: #374151;
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
`

export const Description = styled.p`
  font-size: 10px;
  font-weight: 400;
  color: #9ca3af;
  text-overflow: ellipsis;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3; /* Limit the content to three lines */
  -webkit-box-orient: vertical;
`

export const Icon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
`
export const Company = styled.p`
  font-size: 10px;
  font-weight: 600;
  color: #4b5563;
`

export const Applied = styled.p`
  margin-top: 8px;
  font-size: 10px;
  font-weight: 400;
  color: #4b5563;
`
export const CompanyContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 4px;
  gap: 8px;
`
export const InnovatorName = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #4B5563; // Adjust color as needed
  margin-left: 2px;
  align-self: center; // Adjust alignment as needed
`;