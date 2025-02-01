import React, { useEffect, useState } from "react";
import { Input, Button, Text, Flex } from "@chakra-ui/react";
import { Background, Container, Title, Description } from "./_EmailResetStyle";
import { useNavigate } from "react-router-dom";
import { paths } from "Consts/path";
import { auth } from "../../firebase/clientApp";
import {
  useAuthState,
  useSendPasswordResetEmail,
} from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import TopBar from "Components/topBar/index";

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
    <Background>
      <TopBar title="" onBack={() => navigate(-1)} />
        <Container>
          <Title>Lupa Kata Sandi</Title>
          <Description>
            Masukkan email yang akan kami kirimkan kode untuk reset password.
          </Description>
          {success ? (
            <Text textAlign="center" color="green" fontSize="10pt" mt="4px">
              Email berhasil dikirim
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
                  onChange={(event) => setEmail(event.target.value)}
                />
                {/* Error tambahan */}
                {error && (
                  <Text textAlign="left" color="red" fontSize="10pt" mt="4px">
                    {error?.message}
                  </Text>
                )}
                <Flex direction="column" gap={1}>
                  <Button mt={3} type="submit" width="100%" isLoading={loading}>
                    Kirim Email
                  </Button>
                  <Text
                    textAlign="center"
                    fontSize="14px"
                    fontWeight="700"
                    color="gray.500"
                  >
                    Atau
                  </Text>
                  <Button
                    variant="link"
                    color="brand.100"
                    fontWeight="400"
                    onClick={() => navigate(paths.LOGIN_PAGE)}
                  >
                    Kembali ke login
                  </Button>
                </Flex>
              </form>
            </>
          )}
        </Container>
    </Background>
  );
};

export default EmailReset;
