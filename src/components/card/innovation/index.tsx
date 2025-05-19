import React from "react";
import {
  Applied,
  Background,
  Category,
  CompanyContainer,
  Container,
  Content,
  Description,
  Icon,
  InnovatorName,
  Title,
} from "./_cardInnovationStyle";

import defaultLogo from "@public/images/default-header.svg";

type CardInnovationProps = {
  images?: string[];
  namaInovasi?: string;
  kategori?: string;
  deskripsi?: string;
  tahunDibuat?: string;
  innovatorLogo?: string | React.ReactNode;
  innovatorName?: string | React.ReactNode;
  onClick?: () => void;
};

function CardInnovation(props: CardInnovationProps) {
  const { images, namaInovasi, kategori, deskripsi, tahunDibuat, innovatorLogo, innovatorName, onClick } = props;

  return (
    <Container onClick={onClick}>
      <Background src={images ? images[0] : defaultLogo} alt={namaInovasi} />
      <Content>
        <Title>{namaInovasi}</Title>
        <Category>{kategori}</Category>
        <Description>{deskripsi}</Description>
        <CompanyContainer>
          {typeof innovatorLogo === "string" ? (
            <Icon src={innovatorLogo} alt={namaInovasi} />
          ) : (
            <>{innovatorLogo}</>
          )}
          {typeof innovatorName === "string" ? (
            <InnovatorName>{innovatorName}</InnovatorName>
          ) : (
            <div>{innovatorName}</div>
          )}
        </CompanyContainer>
        <Applied>Sejak {tahunDibuat || "-"}</Applied>
      </Content>
    </Container>
  );
}

export default CardInnovation;