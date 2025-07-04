import styled from 'styled-components'

export const mapBoxStyle = {
    // p: 4,
    borderRadius: "15",
    boxShadow: "lg",
    m: 4,
    h: "200px"
};
  
export const headerTextStyle = {
    fontSize: "16",
    fontWeight: "bold",
};

export const MapContainerWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #F9FFFD;
  margin-bottom: 10px;
`;

export const StyledMapBox = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const StyledLegendOnMap = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  text-align: center;
  font-size: 0.75rem;
  z-index: 1000;
  user-select: none;

  .gradient-bar {
    height: 10px;
    border-radius: 10px;
    background: linear-gradient(to right, #c8e6c9, #2e7d32);
    border: 1px solid #ccc;
  }

  .labels {
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    color: #4a5568; /* gray.700 */
    font-weight: 500;
  }
`;