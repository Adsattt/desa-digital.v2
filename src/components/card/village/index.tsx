import { Flex } from "@chakra-ui/react";
import {
  Container,
  Background,
  CardContent,
  Title,
  ContBadge,
  Description,
  Logo,
  Location,
} from "./_cardVillageStyle";

import defaultHeader from "@public/images/default-header.svg";
import defaultLogo from "@public/images/default-logo.svg";
import badge1 from "@public/icons/badge-1.svg";
import badge2 from "@public/icons/badge-2.svg";
import badge3 from "@public/icons/badge-3.svg";
import locationIcon from "@public/icons/location.svg";

type CardVillageProps = {
  provinsi?: string;
  kabupatenKota?: string;
  logo: string;
  header?: string;
  id: string;
  namaDesa: string;
  onClick: () => void;
  ranking?: number;
  jumlahInovasiDiterapkan?: number
  isHome: boolean
};

function CardVillage(props: CardVillageProps) {
  const { provinsi, kabupatenKota, logo, header, namaDesa, onClick, ranking, jumlahInovasiDiterapkan, isHome } = props;

  return (
    <Container onClick={onClick} isHome={isHome}>
      <Background src={header} alt="background" />
      <CardContent>
        <Logo src={logo} alt={logo} />
        <ContBadge>
          {ranking == 1 && <img src={badge1} alt="badge" />}
          {ranking == 2 && <img src={badge2} alt="badge" />}
          {ranking == 3 && <img src={badge3} alt="badge" />}
        </ContBadge>
        <Title>{namaDesa}</Title>
        <Description>{jumlahInovasiDiterapkan} Inovasi diterapkan</Description>
        <Flex direction="column" marginTop="auto">
        <Location>
          <img src={locationIcon} alt="loc" />
          <Description>
            {kabupatenKota}, {provinsi}{" "}
          </Description>{" "}
        </Location>
        </Flex>
      </CardContent>
    </Container>
  );
}

export default CardVillage;
