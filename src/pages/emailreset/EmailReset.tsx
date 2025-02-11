import React, { useEffect, useState } from "react";
import { Input, Button, Text, Flex, Box } from "@chakra-ui/react";
import { Background, Container, Title, Description } from "./_EmailResetStyle";
import { useNavigate } from "react-router-dom";
import { paths } from "Consts/path";
import { auth } from "../../firebase/clientApp";
import {
  useAuthState,
  useSendPasswordResetEmail,
} from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import { ArrowBackIcon } from "@chakra-ui/icons";
import TopBar from "Components/topBar";


// Definisikan tipe untuk data formulir

const EmailReset: React.FC = () => {
  // const [error, setError] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(auth);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
      console.log("Email berhasil dikirim", email);
      //   navigate(paths.LOGIN_PAGE);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User sudah login:", user);
    }
  }, [user]);

  return (
    <Box>
      <TopBar title="" onBack={() => navigate(-1)} />
      <Background>
        <Container>
          {/* <ArrowBackIcon /> */}
          <Title>Lupa Kata Sandi</Title>
          <Description>
            Masukkan email akun Anda untuk kami kirimkan tautan reset password.
          </Description>
          {success ? (
            <Text textAlign="start" color="green" fontSize="10pt" mt="4px">
              Kode berhasil dikirim. Silahkan cek email Anda
            </Text>
          ) : (
            <>
              <form onSubmit={onSubmit}>
                <Text fontSize="10pt" mt="12px">
                  Email
                </Text>
                <Input
                  type="email"
                  placeholder="Email"
                  mt="4px"
                  fontSize="10pt"
                  onChange={(event) => setEmail(event.target.value)}
                />
                {/* Error tambahan */}
                {error && (
                  <Text textAlign="left" color="red" fontSize="10pt" mt="4px">
                    {error?.message}
                  </Text>
                )}
                <Flex direction="column" gap={1}>
                  <Button mt={3} fontSize="14px" type="submit" width="100%" isLoading={loading}>
                    Kirim Email
                  </Button>
                </Flex>
              </form>
            </>
          )}
        </Container>
      </Background>
    </Box>
  );
};

export default EmailReset;
