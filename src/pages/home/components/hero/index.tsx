import { Background, Container, Title, Description } from "./_heroStyle";

type HeroProps = {
  description: string | undefined;
  text: string | undefined;
  customTitle?: string; // Tambahkan prop opsional untuk custom title
  isAdmin?: boolean;
  isInnovator?: boolean;
  isVillage?: boolean;
};


const Hero: React.FC<HeroProps> = ({ 
  description, 
  text, 
  customTitle, 
  isAdmin = false, 
  isInnovator = false, 
  isVillage = false 
}) => {
  return (
    <Background isAdmin={isAdmin} isInnovator={isInnovator} isVillage={isVillage}>
      <Container>
        <Title color="#1A202C">{customTitle || "Selamat Datang di"}</Title>
        <Description color="#1A202C">
          {description} <br /> {text}
        </Description>
      </Container>
    </Background>
  );
};


export default Hero;
