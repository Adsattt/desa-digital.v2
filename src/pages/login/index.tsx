import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import TopBar from "Components/topBar";
import { paths } from "Consts/path";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FIREBASE_ERRORS } from "../../../src/firebase/errors";
import { auth, firestore } from "../../firebase/clientApp";
import {
  Action,
  ActionContainer,
  Background,
  Container,
  Description,
  Label,
  Title,
} from "./_loginStyle";
import { toast } from "react-toastify";
const Login: React.FC = () => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [signInWithEmailAndPassword, user, loading, userError] =
    useSignInWithEmailAndPassword(auth);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const onShowPassword = () => setShow(!show);

  const onChange = ({ target }: { target: HTMLInputElement }) => {
    setLoginForm((prev) => ({ ...prev, [target.name]: target.value }));
    if (error) setError("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) setError("");

    // Form validation
    if (!loginForm.email.includes("@")) return setError("Email tidak valid");
    if (loginForm.password.length < 6)
      return setError("Kata sandi minimal 6 karakter");

    try {
      await signInWithEmailAndPassword(loginForm.email, loginForm.password);

      if (auth.currentUser) {
        const userRef = doc(firestore, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        console.log("user snap", userDoc.data());
        if (userDoc.exists()) {
          const userRole = userDoc.data()?.role;
        if (userRole === "admin") {
          navigate(paths.ADMIN_PAGE);
          console.log("user snap admin", userDoc.data().role);
        } else if (userRole === "ministry") {
          navigate(paths.DASHBOARD_MINISTRY_HOME);
          console.log("user snap ministry", userDoc.data().role);
        } else {
          console.log("User snap bukan admin/ministry: ", userDoc.data().role);
          navigate(paths.LANDING_PAGE);
        }
          toast.success("Berhasil Masuk", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } 
      }
    } catch (error) {
      console.log("Error getting user role:", error);
    }
  };

  return (
    <>
      <TopBar title="" onBack={() => navigate(-1)} />
      <Background>
        <Container>
          <Title>Halo!</Title>
          <Description>Silahkan masukkan akun</Description>

          <form onSubmit={onSubmit}>
            <Text fontSize="10pt" mt="12px">
              Email
            </Text>
            <Input
              name="email"
              type="email"
              onChange={onChange}
              required
              placeholder="Email"
              mt="4px"
              fontSize="10pt"
            />
            <Text fontSize="10pt" mt="12px">
              Kata sandi
            </Text>

            <InputGroup mt="4px" alignItems="center">
              <Input
                name="password"
                type={show ? "text" : "password"}
                onChange={onChange}
                required
                placeholder="Kata sandi"
                fontSize="10pt"
              />
              <InputRightElement onClick={onShowPassword} cursor="pointer">
                {show ? <FaEyeSlash /> : <FaEye />}
              </InputRightElement>
            </InputGroup>
            {(error || userError) && (
              <Text textAlign="center" color="red" fontSize="10pt" mt={2}>
                {error ||
                  FIREBASE_ERRORS[
                    userError?.message as keyof typeof FIREBASE_ERRORS
                  ]}
              </Text>
            )}

            <Button
              mt={4}
              type="submit"
              alignItems="center"
              width="100%"
              isLoading={loading}
            >
              Masuk
            </Button>
          </form>

          <ActionContainer mt={20}>
            <Label>Lupa kata sandi?</Label>
            <Action onClick={() => navigate(paths.EMAIL_RESET_PASSWORD_PAGE)}>
              Klik disini
            </Action>
          </ActionContainer>

          <ActionContainer mt={4}>
            <Label>Belum memiliki akun?</Label>
            <Action onClick={() => navigate(paths.REGISTER_PAGE)}>
              Registrasi
            </Action>
          </ActionContainer>
        </Container>
      </Background>
    </>
  );
};

export default Login;
