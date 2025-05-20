import TopBar from "Components/topBar";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const InovationForm: React.FC = () => {
  const { control } = useForm({
    defaultValues: {
      namaInovasi: "",
      tahunDibuat: "",
      deskripsi: "",
      desaMenerapkan: "",
    },
  });
  const navigate = useNavigate();
  return (
    <>
      <TopBar title="Tambah Inovasi" onBack={() => navigate(-1)} />
    </>
  );
};
export default InovationForm;
