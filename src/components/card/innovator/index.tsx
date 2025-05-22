import {
  Container,
  Background,
  CardContent,
  Title,
  Description,
  Logo,
  ContBadge,
} from "./_cardInnovatorStyle";

import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";
import badge1 from "@public/icons/badge-1.svg";
import badge2 from "@public/icons/badge-2.svg";
import badge3 from "@public/icons/badge-3.svg";
import {Flex} from "@chakra-ui/react";


type CardInnovatorProps = {
  id: string;
  header: string;
  logo: string;
  namaInovator: string;
  jumlahDesaDampingan: number
  jumlahInovasi: number
  onClick: () => void;
  ranking?: number;
};

function CardInnovator(props: CardInnovatorProps) {
  const {
    header,
    logo,
    namaInovator,
    onClick,
    jumlahDesaDampingan,
    jumlahInovasi,
    ranking
  } = props;

  return (
    <Container onClick={onClick}>
      <Background src={header || defaultHeader} alt={namaInovator} />
      <CardContent>
        <Logo src={logo || defaultLogo} alt={logo} />
        <ContBadge>
          {ranking == 1 && <img src={badge1} alt="badge" />}
          {ranking == 2 && <img src={badge2} alt="badge" />}
          {ranking == 3 && <img src={badge3} alt="badge" />}
        </ContBadge>
        <Title>{namaInovator}</Title>
        <Flex direction="column" marginTop="auto">
          <Description>{jumlahDesaDampingan} Desa Dampingan</Description>
          <Description>{jumlahInovasi} Inovasi</Description>
        </Flex>
      </CardContent>
    </Container>
  );
}

export default CardInnovator;
