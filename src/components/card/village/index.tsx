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

import badge1 from "@public/icons/badge-1.svg";
import locationIcon from "@public/icons/location.svg";

type CardVillageProps = {
  provinsi?: string;
  kabupatenKota?: string;
  logo: string;
  header?: string;
  id: string;
  namaDesa: string;
  onClick: () => void;
};

function CardVillage(props: CardVillageProps) {
  const { provinsi, kabupatenKota, logo, header, namaDesa, onClick } = props;

  return (
    <Container onClick={onClick}>
      <Background src={header} alt="background" />
      <CardContent>
        <Logo src={logo} alt={logo} />
        <ContBadge>
          {" "}
          <img src={badge1} alt="badge" />{" "}
        </ContBadge>
        <Title>{namaDesa}</Title>
        <Description>0 Inovasi diterapkan</Description>
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
