import {
    KlaimContainer,
    Date,
    Title,
    Description,
} from "./_cardKlaim";

import KlaimBadge from "../klaimbadge";
import { Flex } from "@chakra-ui/react";

type CardKlaimProps = {
    description: string;
    title: string;
    date: string;
    onClick?:() => void
    klaimbadge:  'menunggu' | 'terverifikasi' | 'ditolak'; 
};

function CardKlaim(props: CardKlaimProps) {
    const {
        onClick,
        description,
        title,
        date,
        klaimbadge,
      } = props;
      return (
        <KlaimContainer onClick={onClick}>
            <Flex direction={'row'} justify={'space-between'}>
            <Title>{title}</Title>
            <KlaimBadge condition={klaimbadge}></KlaimBadge>
            </Flex>
            <Description>{description}</Description>
            <Date>{date}</Date>
        </KlaimContainer>
      );
    }
    
    export default CardKlaim;