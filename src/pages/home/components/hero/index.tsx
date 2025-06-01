import { Background, Container, Title, Description } from "./_heroStyle";

type HeroProps = {
  description: string | undefined;
  text: string | undefined;
  customTitle?: string;
  isAdmin?: boolean;
  isInnovator?: boolean;
  isVillage?: boolean;
  minHeight?: number;
  gapSize?: number;
};


const Hero: React.FC<HeroProps> = ({ 
  description, 
  text, 
  customTitle, 
  gapSize,
  minHeight,
  isAdmin = false, 
  isInnovator = false, 
  isVillage = false 
}) => {
  return (
    <Background 
      isAdmin={isAdmin} 
      isInnovator={isInnovator} 
      isVillage={isVillage} 
      minHeight={minHeight}
    >
        <Container gapSize={gapSize} >
          <Title color="#1A202C">{customTitle || "Selamat Datang di"}</Title>
          <Description color="#1A202C">
            {description} <br /> {text}
          </Description>
        </Container>
    </Background>
  );
};


export default Hero;
