import React, { useEffect, useState } from "react";
import { paths } from "Consts/path";
import TopBar from "Components/topBar";
import Container from "Components/container";
import CardCategory from "Components/card/category";
import { useNavigate, useParams, generatePath } from "react-router-dom";
import CardInnovation from "Components/card/innovation";
import { useQuery } from "react-query";
import { getCategories } from "Services/categoryServices";
import Loading from "Components/loading";
import Skeleton from "react-loading-skeleton";
import {
  Container as CategoryContainer,
  DetailContainer,
} from "./_innovationStyle";
import { getDocuments, getDocumentById } from "../../firebase/inovationTable";
import { DocumentData } from "firebase/firestore";

function Detail() {
  const navigate = useNavigate();
  const { category } = useParams();

  const [data, setData] = useState<DocumentData[]>([]);
  const [innovators, setInnovators] = useState<Record<string, DocumentData>>(
    {}
  );
  const [loadingInnovators, setLoadingInnovators] = useState<boolean>(true);

  useEffect(() => {
    getDocuments("innovations")
      .then((detailInovasi) => {
        setData(detailInovasi);
      })
      .catch((error) => {
        // Handle error here
        console.error("Error fetching innovation details:", error);
      });
  }, []);

  useEffect(() => {
    const fetchInnovators = async () => {
      setLoadingInnovators(true);
      const innovatorData: Record<string, DocumentData> = {};
      for (const item of data) {
        if (item.innovatorId) {
          const detailInnovator = await getDocumentById(
            "innovators",
            item.innovatorId
          );
          innovatorData[item.innovatorId] = detailInnovator;
        }
      }
      setInnovators(innovatorData);
      setLoadingInnovators(false);
    };

    if (data.length > 0) {
      fetchInnovators();
    }
  }, [data]);

  const innovationByCategory = data.filter(
    (item) => item.kategori === category
  );

  if (innovationByCategory.length === 0) return <p>Inovasi tidak ditemukan</p>;

  return (
    <DetailContainer>
      {innovationByCategory.map((item, idx) => (
        <CardInnovation
          key={idx}
          {...item}
          innovatorLogo={
            loadingInnovators ? (
              <Skeleton circle width={50} height={50} />
            ) : (
              innovators[item.innovatorId]?.logo || (
                <img src="path/to/placeholder-image.png" alt="Placeholder" />
              )
            )
          }
          innovatorName={
            loadingInnovators ? (
              <Skeleton width={100} />
            ) : (
              innovators[item.innovatorId]?.namaInovator || "Unknown Innovator"
            )
          }
          onClick={() =>
            navigate(
              generatePath(paths.DETAIL_INNOVATION_PAGE, { id: item.id })
            )
          }
        />
      ))}
    </DetailContainer>
  );
}

type ListProps = {
  data: any;
  isFetched: boolean;
  isLoading: boolean;
};

function List(props: ListProps) {
  const { data, isFetched, isLoading } = props;

  const navigate = useNavigate();
  const [menu, setMenu] = useState<any[]>([]);

  const handleClick = (category: string) => {
    const path = generatePath(paths.INNOVATION_CATEGORY_PAGE, {
      category: category,
    });
    navigate(path);
  };

  useEffect(() => {
    if (isFetched) {
      const temp = [...(data?.slice(0, data?.length - 1) || [])];
      setMenu(temp);
    }
  }, [isFetched]);

  return (
    <React.Fragment>
      {isLoading && <Loading />}
      {isFetched &&
        menu.map((item: any, idx: number) => (
          <CardCategory
            {...item}
            key={idx}
            onClick={() => handleClick(item.title)}
          />
        ))}
    </React.Fragment>
  );
}

function Innovation() {
  const navigate = useNavigate();
  const { category } = useParams();

  const { data, isFetched, isLoading } = useQuery("category", getCategories);
  const title = isFetched
    ? data?.find((item: any) => item.title === category)?.title
    : "Kategori Inovasi";

  const listProps = {
    data,
    isFetched,
    isLoading,
  };

  return (
    <Container page>
      <TopBar title={title || "Kategori Inovasi"} onBack={() => navigate(-1)} />
      <CategoryContainer>
        {category && <Detail />}
        {!category && <List {...listProps} />}
      </CategoryContainer>
    </Container>
  );
}

export default Innovation;
