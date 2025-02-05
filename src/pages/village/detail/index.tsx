import React from "react";
import TopBar from "Components/topBar";
import Container from "Components/container";
import { useNavigate, useParams } from "react-router";
import Button from "Components/button";
import Location from "Assets/icons/location.svg";
import {
  Title,
  ActionContainer,
  Icon,
  Text,
  Logo,
  Label,
  Description,
  ContentContainer,
  ChipContainer,
  Background,
} from "./_detailStyle";
import { paths } from "Consts/path";
import { getUserById } from "Services/userServices";
import { useQuery } from "react-query";
function DetailVillage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useQuery<any>("villageById", () =>
    getUserById(id)
  );
  const {
    header,
    logo,
    nameVillage,
    province,
    district,
    description,
    benefit,
    whatsApp,
  } = data || {};
  const onClickHere = () => {
    window.open(`https://wa.me/+${whatsApp}`, "_blank");
  };
  console.log(data);

  if (isLoading) return <p>Sedang memuat data...</p>;

  return (
    <Container>
      <div style={{ position: "relative" }}>
        <Background src={header} alt="background" />
        <Logo mx={16} my={-40} src={logo} alt="logo" />
      </div>
      <ContentContainer>
        <Title> {nameVillage} </Title>
        <ActionContainer>
          <Description>
            <Icon src={Location} alt="loc" />
            {district}
          </Description>
        </ActionContainer>
        <div>
          <Text mb={16}>Tentang</Text>
          <Description>{description}</Description>
        </div>
        <Text>Potensi Desa</Text>
        <ChipContainer>
          <Label>{benefit}</Label>
        </ChipContainer>
      </ContentContainer>
      <Button size="l" fullWidth mt={12} type="submit" onClick={onClickHere}>
        Kontak Desa
      </Button>{" "}
    </Container>
  );
}

export default DetailVillage;
